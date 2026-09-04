import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Radio } from 'lucide-react';
import { CallState } from '../types';

interface VoiceOrbVisualizerProps {
  callState: CallState;
  micLevel: number;
  aiLevel: number;
  liveSubtitle: string;
  isMuted: boolean;
  onToggleMic: () => void;
  onStartCall: (prompt?: string) => void;
  onEndCall: () => void;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  callState,
  micLevel,
  aiLevel,
  liveSubtitle,
  isMuted,
  onToggleMic,
  onStartCall,
  onEndCall,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const isCallActive = callState === 'connected' || callState === 'speaking' || callState === 'listening';
  const isSpeaking = callState === 'speaking';
  const isListening = callState === 'listening';

  // Draw the celestial orb with glowing cyan rim and wavy particle frequency field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = 300);
    let height = (canvas.height = 300);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 115;

      phaseRef.current += 0.04;
      const phase = phaseRef.current;

      // Audio intensity multiplier
      const energy = isSpeaking 
        ? Math.max(0.35, aiLevel * 1.5) 
        : (isListening && !isMuted ? Math.max(0.2, micLevel * 2) : 0.15);

      // 1. Draw outer ambient atmospheric glow
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.7,
        centerX,
        centerY,
        radius * 1.3
      );
      ambientGlow.addColorStop(0, 'rgba(0, 210, 255, 0.15)');
      ambientGlow.addColorStop(0.5, 'rgba(0, 180, 255, 0.08)');
      ambientGlow.addColorStop(1, 'rgba(0, 120, 255, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Clip inside sphere to draw internal cosmic depth and particle wave
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Sphere base gradient (deep space navy/indigo)
      const sphereBg = ctx.createRadialGradient(
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      sphereBg.addColorStop(0, '#0f172a');
      sphereBg.addColorStop(0.6, '#0b1120');
      sphereBg.addColorStop(1, '#050814');
      ctx.fillStyle = sphereBg;
      ctx.fillRect(0, 0, width, height);

      // Inner cyan perimeter haze
      const innerRim = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.75,
        centerX,
        centerY,
        radius
      );
      innerRim.addColorStop(0, 'rgba(0, 229, 255, 0)');
      innerRim.addColorStop(0.85, 'rgba(0, 229, 255, 0.12)');
      innerRim.addColorStop(1, 'rgba(0, 240, 255, 0.45)');
      ctx.fillStyle = innerRim;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Sinuous Particle Wave (like the screenshot: cyan, purple & magenta dots)
      const numParticles = 120;
      const waveSpread = radius * 2.2;
      const startX = centerX - waveSpread / 2;

      for (let i = 0; i < numParticles; i++) {
        const progress = i / numParticles;
        const x = startX + progress * waveSpread;

        // Multi-frequency harmonic wave formula
        const freq1 = Math.sin(progress * 7 + phase) * 22 * energy;
        const freq2 = Math.cos(progress * 13 - phase * 1.4) * 14 * energy;
        const freq3 = Math.sin(progress * 19 + phase * 0.8) * 8 * energy;
        const baseY = centerY + (freq1 + freq2 + freq3);

        // Vertical particle jitter/scatter to create particle cloud
        const scatter = Math.sin(i * 99 + phase * 2) * (12 * energy + 4);
        const y = baseY + scatter;

        // Particle size & alpha
        const size = (Math.sin(i * 12 + phase) * 0.5 + 1) * 2;
        const alpha = Math.min(1, Math.max(0.2, Math.sin(progress * Math.PI) * (0.5 + energy * 0.6)));

        // Color transition: Cyan -> Violet -> Magenta -> Purple -> Cyan
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        if (progress < 0.3) {
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        } else if (progress < 0.7) {
          // Violet/Magenta in the middle
          ctx.fillStyle = `rgba(217, 70, 239, ${alpha})`;
        } else {
          // Electric purple/blue on the right
          ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        }
        ctx.fill();

        // Connect nearby points with faint neon lines for fluid wave effect
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, baseY);
          ctx.lineTo(x + 5, baseY + (Math.cos(i + phase) * 4));
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Secondary fine luminous stream
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const p = i / 60;
        const x = startX + p * waveSpread;
        const y = centerY + Math.sin(p * 9 + phase * 1.3) * (18 * energy + 3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(192, 132, 252, ${0.3 + energy * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // 4. Draw outer crisp cyan glowing ring (The glowing circular boundary)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 22;
      ctx.stroke();

      // Subtle secondary outer pulse ring
      if (isCallActive) {
        ctx.beginPath();
        const pulseOffset = (Math.sin(phase * 2) * 0.5 + 0.5) * 6;
        ctx.arc(centerX, centerY, radius + pulseOffset, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.25 + energy * 0.3})`;
        ctx.stroke();
      }
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [callState, aiLevel, micLevel, isSpeaking, isListening, isMuted, isCallActive]);

  // Determine status display label
  const getStatusText = () => {
    if (callState === 'speaking') return 'Speaking...';
    if (callState === 'listening') return isMuted ? 'Muted' : 'Listening...';
    if (callState === 'connecting') return 'Connecting...';
    if (callState === 'interrupted') return 'Interrupted...';
    if (isCallActive) return 'Connected';
    return 'Tap Mic to Start';
  };

  // Click microphone action
  const handleMicClick = () => {
    if (!isCallActive) {
      onStartCall();
    } else {
      onToggleMic();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* 1. Luminous Circular Voice Orb with Particle Wave */}
      <div className="relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] drop-shadow-[0_0_40px_rgba(0,229,255,0.3)] transition-transform duration-300"
        />

        {/* Ambient status indicator badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-purple-400 animate-ping'
                : isListening
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span>{isSpeaking ? 'Adesh' : isListening ? 'Live' : 'Standby'}</span>
        </div>
      </div>

      {/* 2. Subtitle: Real-time Spoken Text (Matches the cyan text in image) */}
      <div className="mt-5 min-h-[32px] flex items-center justify-center max-w-md px-4 text-center">
        <p className="text-cyan-300 font-mono text-sm sm:text-base tracking-wide drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-200">
          {liveSubtitle || (isCallActive ? "What's the price of VMC-850..." : "Ask Adesh about machinery, quotes, or demos...")}
        </p>
      </div>

      {/* 3. Status Text (Matches 'Listening...' in high-tech typeface in image) */}
      <div className="mt-3">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-slate-100 font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {getStatusText()}
        </h2>
      </div>

      {/* 4. Glowing Microphone Button (Matches the cyan glowing mic in image) */}
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="relative group">
          {/* Animated pulse halo when listening or speaking */}
          {isListening && !isMuted && (
            <div className="absolute -inset-2 rounded-full bg-cyan-500/30 blur-md animate-pulse" />
          )}
          {isSpeaking && (
            <div className="absolute -inset-2 rounded-full bg-purple-500/30 blur-md animate-pulse" />
          )}

          <button
            id="btn-voice-mic-main"
            onClick={handleMicClick}
            aria-label={isCallActive ? (isMuted ? 'Unmute microphone' : 'Mute microphone') : 'Start voice call'}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
              isCallActive
                ? isMuted
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-400 shadow-amber-500/30'
                  : 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(0,229,255,0.6)] hover:bg-cyan-500/30'
                : 'bg-slate-900 border-2 border-cyan-500/40 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            ) : (
              <Mic className={`w-6 h-6 sm:w-7 sm:h-7 ${isListening ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} />
            )}
          </button>
        </div>

        {/* Small control pills */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          {isCallActive ? (
            <>
              <button
                onClick={onEndCall}
                className="px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer text-[11px]"
              >
                End Call
              </button>
              <button
                onClick={onToggleMic}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer text-[11px]"
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">
              Click to talk in Hindi, English or Hinglish
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
