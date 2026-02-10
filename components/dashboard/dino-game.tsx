'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DinoGame() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const dinoRef = useRef<HTMLDivElement>(null);
    const cactusRef = useRef<HTMLDivElement>(null);
    const [isJumping, setIsJumping] = useState(false);

    // Game Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && !gameOver) {
            interval = setInterval(() => {
                setScore((s) => s + 1);
            }, 100);
        }

        return () => clearInterval(interval);
    }, [isPlaying, gameOver]);

    // Collision Detection
    useEffect(() => {
        let animationFrameId: number;

        const checkCollision = () => {
            if (!dinoRef.current || !cactusRef.current) return;

            const dinoTop = parseInt(window.getComputedStyle(dinoRef.current).getPropertyValue('top'));
            const cactusLeft = parseInt(window.getComputedStyle(cactusRef.current).getPropertyValue('left'));

            // Simple collision logic
            // Dino is usually at top: 150px (ground is at 200px or similar container height)
            // Jump moves it up (smaller top value)

            // Adjust these values based on the CSS styling below
            if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
                handleGameOver();
            }

            if (isPlaying && !gameOver) {
                animationFrameId = requestAnimationFrame(checkCollision);
            }
        };

        if (isPlaying && !gameOver) {
            animationFrameId = requestAnimationFrame(checkCollision);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, gameOver]);

    const handleJump = useCallback(() => {
        if (!isJumping && isPlaying && !gameOver) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 500); // Jump duration matches CSS animation
        }
    }, [isJumping, isPlaying, gameOver]);

    const handleStart = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
    };

    const handleGameOver = () => {
        setIsPlaying(false);
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (gameOver) {
                    handleStart();
                } else {
                    handleJump();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump, gameOver]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm border border-white/5 relative select-none">

            {/* Score HUD */}
            <div className="absolute top-6 right-6 flex gap-6 z-10">
                <div className="text-right">
                    <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Score</p>
                    <p className="text-2xl font-black text-white oldstyle-nums tabular-nums font-mono">{score.toString().padStart(5, '0')}</p>
                </div>
                {highScore > 0 && (
                    <div className="text-right">
                        <p className="text-[10px] uppercase text-accent-pink/60 tracking-widest font-bold flex items-center justify-end gap-1">
                            HI <Trophy className="w-3 h-3" />
                        </p>
                        <p className="text-xl font-bold text-accent-pink oldstyle-nums tabular-nums font-mono">{highScore.toString().padStart(5, '0')}</p>
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div
                className="relative w-full max-w-2xl h-[200px] border-b border-white/20 overflow-hidden cursor-pointer"
                onClick={() => {
                    if (gameOver) handleStart();
                    else handleJump();
                }}
            >
                {/* Instructions / Start Screen */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]">
                        <Button onClick={(e) => { e.stopPropagation(); handleStart(); }} className="bg-accent-pink hover:bg-accent-pink/80 text-white font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95">
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            START GAME
                        </Button>
                        <p className="mt-4 text-xs text-white/40 uppercase tracking-widest animate-pulse">Press Space or Tap to Jump</p>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
                        <p className="text-3xl font-black text-white mb-2 tracking-tighter">GAME OVER</p>
                        <p className="text-sm text-white/60 mb-6 font-mono">Score: {score}</p>
                        <Button onClick={(e) => { e.stopPropagation(); handleStart(); }} variant="outline" className="border-white/20 text-black hover:bg-white/30 gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Dino */}
                <div
                    ref={dinoRef}
                    className={`absolute left-10 w-10 h-10 transition-transform ${isJumping ? 'animate-jump' : ''}`}
                    style={{ top: '160px' }} // Base position
                >
                    {/* Simple CSS Dino Shape */}
                    <div className="w-full h-full relative">
                        <div className="absolute bottom-0 left-2 w-6 h-8 bg-white rounded-sm"></div>
                        <div className="absolute top-0 left-5 w-5 h-4 bg-white rounded-sm"></div>
                        {/* Eye */}
                        <div className="absolute top-1 left-7 w-1 h-1 bg-black rounded-full"></div>
                        {/* Arm */}
                        <div className="absolute top-4 left-6 w-2 h-1 bg-white"></div>
                    </div>
                </div>

                {/* Obstacle (Cactus) */}
                <div
                    ref={cactusRef}
                    className={`absolute bottom-0 w-6 h-10 ${isPlaying ? 'animate-slide' : ''}`}
                    style={{ left: '100%' }} // Start off-screen
                >
                    <div className="w-full h-full bg-red-500 rounded-t-lg relative">
                        <div className="absolute top-3 -left-2 w-2 h-3 bg-red-500 rounded-l-md" />
                        <div className="absolute top-2 -right-2 w-2 h-3 bg-red-500 rounded-r-md" />
                    </div>
                </div>

                {/* Ground details */}
                <div className="absolute bottom-0 w-full h-px bg-white/20"></div>

                {/* Decoration: Clouds */}
                <div className="absolute top-4 left-1/4 w-12 h-4 bg-white/5 rounded-full blur-[1px] animate-float-slow" />
                <div className="absolute top-8 left-3/4 w-8 h-3 bg-white/5 rounded-full blur-[1px] animate-float-slower" />

            </div>

            <style jsx global>{`
                @keyframes jump {
                    0% { top: 160px; }
                    30% { top: 80px; }
                    70% { top: 80px; }
                    100% { top: 160px; }
                }
                .animate-jump {
                    animation: jump 0.5s linear;
                }
                @keyframes slide {
                    0% { left: 100%; }
                    100% { left: -20px; }
                }
                .animate-slide {
                    animation: slide 1.5s infinite linear;
                }
                @keyframes float-slow {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(20px); }
                    100% { transform: translateX(0); }
                }
                .animate-float-slow {
                     animation: float-slow 8s infinite ease-in-out;
                }
                 .animate-float-slower {
                     animation: float-slow 12s infinite ease-in-out reverse;
                }
            `}</style>
        </div>
    );
}
