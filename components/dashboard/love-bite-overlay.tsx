'use client';

import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoveBiteOverlayProps {
    isActive: boolean;
}

interface HeartPosition {
    id: string;
    left: string;
    bottom: string;
    delay: string;
    size: string;
    opacity: number;
}

export function LoveBiteOverlay({ isActive }: LoveBiteOverlayProps) {
    const [hearts, setHearts] = useState<HeartPosition[]>([]);

    useEffect(() => {
        if (isActive) {
            const newHearts: HeartPosition[] = [];
            const numberOfHearts = 10; // Consistent count for performance

            for (let i = 0; i < numberOfHearts; i++) {
                const left = `${Math.random() * 90 + 5}%`; // 5% to 95% across the width
                const bottom = `${Math.random() * 20 + 5}%`; // 5% to 25% from bottom
                const delay = `${Math.random() * 0.5}s`; // 0 to 0.5s delay
                const size = `${0.8 + Math.random() * 1.5}rem`; // Varied sizes
                const opacity = 0.4 + Math.random() * 0.6; // 0.4 to 1.0 opacity

                newHearts.push({
                    id: `heart-${i}-${Date.now()}`,
                    left,
                    bottom,
                    delay,
                    size,
                    opacity,
                });
            }
            setHearts(newHearts);
        } else {
            setHearts([]); // Clear hearts when not active
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden h-full w-full">
            {/* Elegant vignette background - subtle to avoid harsh lines */}
            <div className="absolute inset-0 bg-gradient-to-t from-accent-pink/20 to-transparent pointer-events-none opacity-50" />

            {/* Randomly popping hearts using absolute positioning relative to window */}
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-bounce"
                    style={{
                        left: heart.left,
                        bottom: heart.bottom,
                        animationDelay: heart.delay,
                        opacity: heart.opacity
                    }}
                >
                    <Heart
                        style={{ width: heart.size, height: heart.size }}
                        className="text-accent-pink fill-accent-pink drop-shadow-[0_0_15px_rgba(233,75,127,0.5)]"
                    />
                </div>
            ))}
        </div>
    );
}
