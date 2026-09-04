import React from 'react';
import { Navbar } from './components/Navbar';
import { VoiceOrbVisualizer } from './components/VoiceOrbVisualizer';
import { ChatArea } from './components/ChatArea';
import { useVoiceCall } from './hooks/useVoiceCall';

export default function App() {
  const {
    callState,
    isMuted,
    transcripts,
    micLevel,
    aiLevel,
    errorMessage,
    isServerless,
    liveSubtitle,
    speakAdeshResponse,
    startCall,
    endCall,
    toggleMute,
    sendTextMessage,
    clearTranscript,
  } = useVoiceCall();

  const isCallActive = callState === 'connected' || callState === 'speaking' || callState === 'listening';

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* 1. Sleek Minimal Navbar */}
      <Navbar
        callState={callState}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onClearChat={clearTranscript}
        isServerless={isServerless}
      />

      {/* 2. Main Stage: Voice Agent Visualizer + Chat Area */}
      <main className="flex-1 min-h-0 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch justify-center">
        {/* Left Column: Glowing Celestial Voice Orb & Controls (Matching attached image) */}
        <section className="lg:w-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b1224]/80 to-[#070b16]/90 border border-slate-800/70 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle cosmic background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          {/* Error notification if any */}
          {errorMessage && (
            <div className="w-full mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-center">
              {errorMessage}
            </div>
          )}

          {/* The Circular Voice Orb Visualizer with dynamic subtitle & status */}
          <VoiceOrbVisualizer
            callState={callState}
            micLevel={micLevel}
            aiLevel={aiLevel}
            liveSubtitle={liveSubtitle}
            isMuted={isMuted}
            onToggleMic={toggleMute}
            onStartCall={startCall}
            onEndCall={endCall}
          />
        </section>

        {/* Right Column: Clean Chat Conversation Stream & Input Area */}
        <section className="lg:w-1/2 flex flex-col min-h-0 h-full">
          <ChatArea
            transcripts={transcripts}
            isCallActive={isCallActive}
            onSendMessage={sendTextMessage}
            onStartCall={startCall}
            onSpeakText={speakAdeshResponse}
          />
        </section>
      </main>
    </div>
  );
}
