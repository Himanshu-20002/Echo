'use client';

import { Heart } from 'lucide-react';

interface LoveBiteOverlayProps {
    isActive: boolean;
}

export function LoveBiteOverlay({ isActive }: LoveBiteOverlayProps) {
    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-accent-pink/30 animate-pulse mix-blend-overlay backdrop-blur-[2px]" />
            <div className="relative animate-bounce duration-1000">
                <Heart className="w-64 h-64 text-accent-pink fill-accent-pink animate-ping absolute opacity-50" />
                <Heart className="w-64 h-64 text-accent-pink fill-accent-pink relative z-10 drop-shadow-[0_0_50px_rgba(236,72,153,1)]" />
            </div>
        </div>
    );
}
