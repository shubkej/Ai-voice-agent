import React from 'react';
import { Bot, Radio, Globe, Trash2, Volume2, VolumeX, PhoneCall } from 'lucide-react';
import { CallState } from '../types';

interface NavbarProps {
  callState: CallState;
  isMuted: boolean;
  onToggleMute: () => void;
  onClearChat: () => void;
  isServerless?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  callState,
  isMuted,
  onToggleMute,
  onClearChat,
  isServerless,
}) => {
  const isCallActive = callState === 'connected' || callState === 'speaking' || callState === 'listening';

  return (
    <header className="w-full bg-[#070b16]/90 border-b border-slate-800/70 text-slate-100 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Bot className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans leading-none">
                Ganesh Enterprises
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Adesh AI
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-wider mt-0.5">
              Industrial Voice Assistant
            </p>
          </div>
        </div>

        {/* Right Controls: Languages, Status & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>English • हिंदी • Hinglish</span>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isCallActive
                  ? 'bg-cyan-400 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-slate-300 text-[11px]">
              {isCallActive ? 'Live Voice' : 'Ready'}
            </span>
          </div>

          {/* Mute Toggle (if call is active) */}
          {isCallActive && (
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          )}

          {/* Clear conversation */}
          <button
            onClick={onClearChat}
            title="Clear conversation"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
