import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { TranscriptItem } from '../types';

interface ChatAreaProps {
  transcripts: TranscriptItem[];
  isCallActive: boolean;
  onSendMessage: (text: string) => void;
  onStartCall: (prompt?: string) => void;
  onSpeakText?: (text: string) => void;
}

const SAMPLE_PROMPTS = [
  "What is the price of VMC-850?",
  "Book an on-site demo trial",
  "Emergency machine breakdown repair",
  "नमस्ते, मशीनरी की जानकारी चाहिए",
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  transcripts,
  isCallActive,
  onSendMessage,
  onStartCall,
  onSpeakText,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcripts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (!isCallActive) {
      onStartCall(text);
    } else {
      onSendMessage(text);
    }
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    if (!isCallActive) {
      onStartCall(prompt);
    } else {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 max-h-[calc(100vh-120px)] bg-[#080d1a]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Chat Transcript
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {transcripts.filter((t) => t.speaker !== 'system').length} Messages
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {transcripts.map((t) => {
          if (t.speaker === 'system') {
            return (
              <div key={t.id} className="flex justify-center my-2">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800/70">
                  {t.text}
                </span>
              </div>
            );
          }

          const isAdesh = t.speaker === 'adesh';

          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 ${isAdesh ? 'justify-start' : 'justify-end'}`}
            >
              {isAdesh && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isAdesh
                  ? 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-sm'
                  : 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-sm'
                  }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono mb-1 text-slate-400">
                  <span className={isAdesh ? 'text-cyan-400 font-semibold' : 'text-slate-300 font-semibold'}>
                    {isAdesh ? 'Adesh' : 'You'}
                  </span>
                  <span>{t.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap font-sans text-[13px] sm:text-sm">{t.text}</p>

                {/* Voice Replay button for Adesh messages */}
                {isAdesh && onSpeakText && (
                  <button
                    onClick={() => onSpeakText(t.text)}
                    className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Play audio response"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay Voice</span>
                  </button>
                )}
              </div>

              {!isAdesh && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts chips */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-800/50 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick:
          </span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message in English, Hindi, or Hinglish..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.25)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
