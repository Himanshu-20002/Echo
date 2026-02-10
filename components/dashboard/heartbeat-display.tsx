'use client';

import { useEffect, useState } from 'react';

interface HeartbeatDisplayProps {
  bpm: number;
  status: string;
  partnerName: string;
}

export function HeartbeatDisplay({ bpm, status, partnerName }: HeartbeatDisplayProps) {
  const [heartPoints, setHeartPoints] = useState<number[]>([50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartPoints((prev) => {
        const newPoints = [...prev, Math.random() * 60 + 20];
        return newPoints.slice(-60); // Keep last 60 points
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // SVG path generator for heartbeat wave
  const pathData = heartPoints
    .map((point, idx) => `${(idx * 6)},${100 - point}`)
    .join(' L ');

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* BPM Display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-widest">
            {partnerName}'s Heartbeat
          </p>
          <p className="text-white/40 text-[9px] mt-1">{status}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-accent-pink">{bpm}</p>
          <p className="text-[9px] text-white/60 font-bold tracking-[0.2em]">BPM</p>
        </div>
      </div>

      {/* Heartbeat Wave Animation */}
      <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10 flex items-center">
        <svg
          viewBox="0 0 360 100"
          className="w-full h-16"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 60, 120, 180, 240, 300, 360].map((x) => (
            <line
              key={`x-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={100}
              stroke="rgba(236, 72, 153, 0.1)"
              strokeWidth="0.5"
            />
          ))}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={`y-${y}`}
              x1={0}
              y1={y}
              x2={360}
              y2={y}
              stroke="rgba(236, 72, 153, 0.1)"
              strokeWidth="0.5"
            />
          ))}

          {/* Heartbeat line */}
          {pathData && (
            <polyline
              points={pathData}
              points={`0,50 L ${pathData}`}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <p className="text-[9px] text-white/60">Live Sync</p>
        </div>
        <p className="text-[10px] font-bold text-accent-pink">Connected</p>
      </div>
    </div>
  );
}
