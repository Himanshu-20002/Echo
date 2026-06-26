'use client';

import React, { useEffect, useState } from 'react';
import { AssistantStatus } from '@/hooks/use-voice-assistant';

interface AudioVisualizerProps {
  status: AssistantStatus;
  compact?: boolean;
}

export function AudioVisualizer({ status, compact = false }: AudioVisualizerProps) {
  const [waves, setWaves] = useState<number[]>([1, 1, 1, 1, 1]);

  // Simulate audio level heights when speaking
  useEffect(() => {
    if (status !== 'speaking') {
      setWaves([1, 1, 1, 1, 1]);
      return;
    }

    const interval = setInterval(() => {
      setWaves(
        Array.from({ length: 9 }, () => Math.random() * 0.8 + 0.2)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'from-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]';
      case 'thinking':
        return 'from-purple-500 to-pink-500 animate-spin shadow-[0_0_30px_rgba(168,85,247,0.5)]';
      case 'speaking':
        return 'from-rose-500 to-amber-500 shadow-[0_0_30px_rgba(244,63,94,0.5)]';
      case 'idle':
        return 'from-teal-500 to-emerald-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]';
      case 'disconnected':
      default:
        return 'from-gray-600 to-gray-500 shadow-none';
    }
  };

  const outerSize = compact ? 'w-40 h-40' : 'w-64 h-64';
  const orbSize = compact ? 'w-28 h-28' : 'w-48 h-48';

  return (
    <div className={`flex flex-col items-center justify-center relative ${compact ? 'py-2' : 'py-10'}`}>
      <div className={`relative flex items-center justify-center ${outerSize}`}>
        {/* Glow Effects / Pulsing Waves in background */}
        {status === 'listening' && (
          <>
            <div className={`absolute rounded-full border border-blue-500/20 animate-ping opacity-60 ${compact ? 'w-44 h-44' : 'w-72 h-72'}`} />
            <div className={`absolute rounded-full border border-cyan-500/10 animate-ping [animation-delay:0.5s] opacity-40 ${compact ? 'w-48 h-48' : 'w-80 h-80'}`} />
          </>
        )}
        
        {status === 'speaking' && (
          <>
            <div className={`absolute rounded-full bg-rose-500/5 animate-pulse ${compact ? 'w-44 h-44' : 'w-72 h-72'}`} />
            <div className={`absolute rounded-full border border-rose-500/10 animate-ping [animation-delay:0.3s] opacity-30 ${compact ? 'w-48 h-48' : 'w-80 h-80'}`} />
          </>
        )}

        {status === 'thinking' && (
          <div className={`absolute rounded-full border-2 border-dashed border-purple-500/30 animate-spin [animation-duration:10s] ${compact ? 'w-44 h-44' : 'w-72 h-72'}`} />
        )}

        {/* Center Orb */}
        <div
          className={`rounded-full bg-gradient-to-tr transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-1 z-10 ${orbSize} ${getStatusColor()}`}
        >
          <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center overflow-hidden">
            {status === 'speaking' ? (
              // Audio Waveform
              <div className={`flex items-center justify-center gap-1.5 px-4 ${compact ? 'h-10 w-24' : 'h-16 w-32'}`}>
                {waves.slice(0, compact ? 5 : 9).map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full transition-all duration-150"
                    style={{
                      height: `${height * 100}%`,
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </div>
            ) : status === 'thinking' ? (
              // Orbital Thinking Ring
              <div className="flex items-center justify-center">
                <div className={`border-4 border-purple-500 border-t-transparent rounded-full animate-spin ${compact ? 'w-8 h-8' : 'w-10 h-10'}`} />
              </div>
            ) : status === 'listening' ? (
              // Mic Wave Pulse
              <div className="flex items-center justify-center">
                <div className={`bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}>
                  <div className={`bg-blue-500 rounded-full ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
              </div>
            ) : (
              // Idle Breath
              <div className={`rounded-full transition-all duration-1000 ${
                compact ? 'w-6 h-6' : 'w-8 h-8'
              } ${
                status === 'disconnected' ? 'bg-gray-600' : 'bg-teal-500/70 animate-pulse'
              }`} />
            )}
          </div>
        </div>
      </div>

      {/* Status Text Indicator */}
      {!compact && (
        <div className="mt-6 text-center">
          <span className="text-sm font-semibold tracking-wider uppercase opacity-80 transition-all duration-300">
            {status === 'disconnected' && 'Offline'}
            {status === 'idle' && 'Echo is listening'}
            {status === 'listening' && 'Listening to you...'}
            {status === 'thinking' && 'Thinking...'}
            {status === 'speaking' && 'Echo is speaking'}
          </span>
        </div>
      )}
    </div>
  );
}
