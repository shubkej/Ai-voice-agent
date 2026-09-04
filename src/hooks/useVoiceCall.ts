import { useState, useRef, useEffect, useCallback } from 'react';
import { CallState, TranscriptItem, ActivityLog } from '../types';
import { 
  downsampleBuffer, 
  floatTo16BitPCM, 
  arrayBufferToBase64, 
  LiveAudioPlayer 
} from '../utils/audio';

export function useVoiceCall(onLeadUpdated?: () => void) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'system-ready',
      speaker: 'system',
      text: 'Ganesh Enterprises Hotline Connected • Speak in English, Hindi (हिंदी), or Hinglish.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'adesh-greeting-initial',
      speaker: 'adesh',
      text: 'Hello, I am Adesh from Ganesh Enterprises, how can I help you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isServerless, setIsServerless] = useState<boolean>(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [aiLevel, setAiLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveSubtitle, setLiveSubtitle] = useState<string>("What's the price of VMC-850...");

  // References for audio, recognition & connection
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  isMutedRef.current = isMuted;

  // Speak Adesh's response aloud via Web Speech API
  const speakAdeshResponse = useCallback((text: string, onDone?: () => void) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const hasHindi = /[\u0900-\u097F]/.test(text);
      utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setCallState('speaking');
        setAiLevel(0.85);
      };
      utterance.onend = () => {
        setCallState('listening');
        setAiLevel(0);
        onDone?.();
      };
      utterance.onerror = () => {
        setCallState('listening');
        setAiLevel(0);
        onDone?.();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setCallState('listening');
      onDone?.();
    }
  }, []);

  // Initialize player
  useEffect(() => {
    playerRef.current = new LiveAudioPlayer((isSpeaking) => {
      if (isConnectedRef.current) {
        setCallState(isSpeaking ? 'speaking' : 'listening');
        setAiLevel(isSpeaking ? 0.75 : 0);
      }
    });

    return () => {
      playerRef.current?.close();
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (callState === 'connected' || callState === 'speaking' || callState === 'listening') {
      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [callState]);

  // Clean up audio inputs
  const cleanupAudioInput = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicLevel(0);
  }, []);

  // End active call
  const endCall = useCallback(() => {
    isConnectedRef.current = false;
    setCallState('ended');
    cleanupAudioInput();
    playerRef.current?.stopAll();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setTranscripts((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        speaker: 'system',
        text: 'Call concluded. Thank you for connecting with Ganesh Enterprises.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setTimeout(() => {
      setCallState('idle');
      setDuration(0);
    }, 1800);
  }, [cleanupAudioInput]);

  // Handle interruption
  const interrupt = useCallback(() => {
    playerRef.current?.stopAll();
    setCallState('listening');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: '[Caller interrupted Adesh]',
        })
      );
    }
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) setMicLevel(0);
      return next;
    });
  }, []);

  // Start Call via WebSocket to Gemini Live
  const startCall = useCallback(async (customPrompt?: string) => {
    try {
      setErrorMessage(null);
      setCallState('connecting');
      playerRef.current?.stopAll();
      setDuration(0);

      // Acquire microphone
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      } catch (err) {
        console.warn('Microphone permission not granted or device unavailable:', err);
        // We will continue so user can still test with text prompts!
      }

      // Establish WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Ganesh Enterprises Voice Server');
        isConnectedRef.current = true;
        setCallState('connected');

        // Add greeting prompt to trigger Adesh's official opening
        if (customPrompt) {
          ws.send(JSON.stringify({ type: 'text', text: customPrompt }));
          setTranscripts((prev) => [
            ...prev,
            {
              id: `user-${Date.now()}`,
              speaker: 'caller',
              text: customPrompt,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          ws.send(JSON.stringify({ type: 'start_call' }));
        }

        // Set up Web Audio microphone streaming
        if (stream) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          // 4096 buffer size gives smooth streaming without stutter
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current) return;
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);

            // Calculate instantaneous volume level for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setMicLevel(Math.min(1, rms * 5));

            // Resample to 16kHz if browser audio context runs at 44.1k/48k
            const resampled = downsampleBuffer(inputData, audioCtx.sampleRate, 16000);
            const pcm16 = floatTo16BitPCM(resampled);
            const base64 = arrayBufferToBase64(pcm16);

            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                audio: base64,
              })
            );
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'audio' && msg.audio) {
            playerRef.current?.playChunk(msg.audio);
          }

          if (msg.type === 'interrupted') {
            playerRef.current?.stopAll();
            setCallState('listening');
          }

          if (msg.type === 'transcript_model' && msg.text) {
            setLiveSubtitle(msg.text);
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              // Live transcription arrives in chunks; keep one bubble per response.
              if (last && last.speaker === 'adesh') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: `${last.text} ${msg.text}`.trim() },
                ];
              }
              return [
                ...prev,
                {
                  id: `model-${Date.now()}-${Math.random()}`,
                  speaker: 'adesh',
                  text: msg.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }

          if (msg.type === 'transcript_user' && msg.text) {
            setLiveSubtitle(msg.text);
            setTranscripts((prev) => [
              ...prev,
              {
                id: `user-${Date.now()}-${Math.random()}`,
                speaker: 'caller',
                text: msg.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }

          if (msg.type === 'tool_executed') {
            console.log('Tool Executed by Adesh:', msg);
            let actionType: ActivityLog['type'] = 'info';
            let title = 'Action Logged';

            if (msg.tool === 'createQuotation') {
              actionType = 'quote';
              title = `Quotation Request Created (${msg.result.quoteId || 'Generated'})`;
            } else if (msg.tool === 'bookDemoTrial') {
              actionType = 'demo';
              title = `On-Site Trial Demo Booked (${msg.result.demoId || 'Confirmed'})`;
            } else if (msg.tool === 'scheduleServiceVisit') {
              actionType = 'service';
              title = `Technician Service Scheduled (${msg.result.ticketId || 'Dispatched'})`;
            }

            const newActivity: ActivityLog = {
              id: `act-${Date.now()}`,
              type: actionType,
              title,
              details: msg.result.message || JSON.stringify(msg.args),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setActivities((prev) => [newActivity, ...prev]);

            setTranscripts((prev) => [
              ...prev,
              {
                id: `tool-${Date.now()}`,
                speaker: 'system',
                text: `[CRM Event] ${title}: ${msg.result.message}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);

            onLeadUpdated?.();
          }

          if (msg.type === 'error') {
            setErrorMessage(msg.message);
            setCallState('error');
          }
        } catch (e) {
          console.error('Error handling server message:', e);
        }
      };

      ws.onerror = () => {
        console.warn('Live WebSocket gateway unavailable on this host (Vercel serverless). Activating serverless voice mode.');
        setIsServerless(true);
        isConnectedRef.current = true;
        setCallState('connected');
        setErrorMessage(null);

        // Announce opening greeting aloud
        if (customPrompt) {
          sendTextMessage(customPrompt);
        } else {
          speakAdeshResponse('Hello, I am Adesh from Ganesh Enterprises, how can I help you?');
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (isConnectedRef.current && !isServerless) {
          endCall();
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to initiate call: ${msg}`);
      setCallState('error');
    }
  }, [cleanupAudioInput, endCall, isServerless, speakAdeshResponse]);

  // Send a text message to the live session or fallback endpoint
  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setLiveSubtitle(text);

    // Append to transcript
    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        speaker: 'caller',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text }));
    } else {
      // If on serverless/Vercel or WebSocket closed, call /api/chat
      try {
        setCallState('speaking');
        setAiLevel(0.4);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        const reply = data.reply || 'Understood! I have logged that request for your facility.';
        setLiveSubtitle(reply);

        setTranscripts((prev) => [
          ...prev,
          {
            id: `adesh-${Date.now()}`,
            speaker: 'adesh',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (data.toolResult) {
          const newAct: ActivityLog = {
            id: `act-${Date.now()}`,
            type: data.toolResult.tool === 'createQuotation' ? 'quote' : data.toolResult.tool === 'bookDemoTrial' ? 'demo' : 'service',
            title: `Action Logged (${data.toolResult.tool})`,
            details: data.toolResult.result?.message || 'Logged in CRM',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setActivities((prev) => [newAct, ...prev]);
          onLeadUpdated?.();
        }

        speakAdeshResponse(reply);
      } catch (err) {
        console.error('Chat fallback error:', err);
        setCallState('idle');
        setAiLevel(0);
      }
    }
  }, [onLeadUpdated, speakAdeshResponse]);

  const clearTranscript = useCallback(() => {
    setLiveSubtitle("What's the price of VMC-850...");
    setTranscripts([
      {
        id: `sys-${Date.now()}`,
        speaker: 'system',
        text: 'Transcript cleared • Ganesh Enterprises Hotline Ready',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `adesh-${Date.now()}`,
        speaker: 'adesh',
        text: 'Hello, I am Adesh from Ganesh Enterprises, how can I help you?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  return {
    callState,
    isMuted,
    duration,
    transcripts,
    activities,
    micLevel,
    aiLevel,
    errorMessage,
    isServerless,
    liveSubtitle,
    setLiveSubtitle,
    speakAdeshResponse,
    startCall,
    endCall,
    toggleMute,
    interrupt,
    sendTextMessage,
    clearTranscript,
  };
}
