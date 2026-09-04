import { Phone, ShieldCheck, Cog, Radio, PhoneCall } from 'lucide-react';
import { CallState } from '../types';

interface HeaderProps {
  callState: CallState;
  activeTab: 'call' | 'catalog' | 'crm' | 'demoInfo';
  setActiveTab: (tab: 'call' | 'catalog' | 'crm' | 'demoInfo') => void;
  leadCount: number;
}

export function Header({ callState, activeTab, setActiveTab, leadCount }: HeaderProps) {
  const isCallActive = callState === 'connected' || callState === 'speaking' || callState === 'listening';

  return (
    <header className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5">
          {/* Brand Identity with Bold Typography */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-sm bg-orange-600/15 border-2 border-orange-500 flex items-center justify-center text-orange-500 shrink-0 shadow-lg shadow-orange-950/50">
              <Cog className="w-6 h-6 sm:w-7 sm:h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-orange-500 uppercase italic font-display leading-none">
                  Ganesh Enterprises
                </h1>
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase px-2 py-0.5 rounded-sm bg-orange-500 text-black tracking-wider">
                  Industrial Supplier
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-zinc-400 tracking-widest uppercase mt-1">
                Machinery • Tooling • On-Site Demo Trials • 24/7 Service Hotline
              </p>
            </div>
          </div>

          {/* Rep & Telemetry Block */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-right hidden md:block">
              <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">
                AI Voice Agent
              </div>
              <div className="text-sm font-black tracking-tight text-zinc-100 uppercase italic font-display">
                ADESH <span className="text-orange-500">•</span> SALES & TECHNICAL SUPPORT
              </div>
            </div>

            {/* Voice Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <Radio className={`w-3.5 h-3.5 ${isCallActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline text-zinc-400">Gateway:</span>
              <strong className={isCallActive ? 'text-emerald-400 font-bold' : 'text-zinc-300 font-medium'}>
                {isCallActive ? 'LIVE' : 'STANDBY'}
              </strong>
            </div>

            {/* Direct Hotline */}
            <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-wider">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>+91 (020) 2448-8000</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Industrial Brutalist Styling */}
        <div className="flex space-x-1 border-t border-zinc-800/80 pt-1 -mb-px overflow-x-auto text-xs sm:text-sm font-mono tracking-wider uppercase">
          <button
            id="tab-voice-call"
            onClick={() => setActiveTab('call')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'call'
                ? 'border-orange-500 text-orange-500 font-black italic bg-orange-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            Voice Console (Adesh)
            {isCallActive && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-sm font-mono font-black">
                ACTIVE
              </span>
            )}
          </button>

          <button
            id="tab-machinery-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-orange-500 text-orange-500 font-black italic bg-orange-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Machinery & Hardware Catalog
          </button>

          <button
            id="tab-demo-program"
            onClick={() => setActiveTab('demoInfo')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'demoInfo'
                ? 'border-orange-500 text-orange-500 font-black italic bg-orange-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            Trial Demo Package
          </button>

          <button
            id="tab-crm-leads"
            onClick={() => setActiveTab('crm')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'crm'
                ? 'border-orange-500 text-orange-500 font-black italic bg-orange-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Quotes & Service Logs
            {leadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-sm bg-zinc-800 text-orange-400 font-mono font-bold border border-zinc-700">
                {leadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
