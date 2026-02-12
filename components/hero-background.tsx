'use client';

import React, { memo, useId } from 'react';

type Props = {
  className?: string;
};

const HeroBackground = memo(function HeroBackground({ className = '' }: Props) {
  const uid = useId().replace(/:/g, '-');
  const g1 = `gradientHeart1-${uid}`;
  const g2 = `gradientHeart2-${uid}`;
  const g3 = `gradientHeart3-${uid}`;
  const g4 = `gradientHeart4-${uid}`;
  const g5 = `gradientHeart5-${uid}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      {/* Primary Heart */}
      <svg
        className="absolute top-[10%] left-[5%] w-16 h-16 sm:w-20 sm:h-20 opacity-40 animate-float will-change-transform transition-opacity duration-700"
        viewBox="0 0 24 24"
        fill={`url(#${g1})`}
        style={{ animationDelay: '0s' }}
      >
        <defs>
          <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Counterweight Heart */}
      <svg
        className="absolute top-[15%] right-[8%] w-20 h-20 sm:w-24 sm:h-24 opacity-30 animate-float will-change-transform transition-opacity duration-700"
        viewBox="0 0 24 24"
        fill={`url(#${g2})`}
        style={{ animationDelay: '1s' }}
      >
        <defs>
          <linearGradient id={g2} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Lower Floating Heart (Hidden on small phones to reduce overdraw) */}
      <svg
        className="absolute bottom-[20%] left-[15%] w-14 h-14 sm:w-16 sm:h-16 opacity-0 sm:opacity-25 animate-float will-change-transform transition-opacity duration-700"
        viewBox="0 0 24 24"
        fill={`url(#${g3})`}
        style={{ animationDelay: '2s' }}
      >
        <defs>
          <linearGradient id={g3} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Right Side Background Accent */}
      <svg
        className="absolute bottom-[25%] right-[20%] w-16 h-16 sm:w-20 sm:h-20 opacity-35 animate-float will-change-transform transition-opacity duration-700"
        viewBox="0 0 24 24"
        fill={`url(#${g4})`}
        style={{ animationDelay: '0.5s' }}
      >
        <defs>
          <linearGradient id={g4} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Distant Small Heart */}
      <svg
        className="absolute top-[40%] right-[10%] w-10 h-10 sm:w-14 sm:h-14 opacity-20 animate-float will-change-transform transition-opacity duration-700"
        viewBox="0 0 24 24"
        fill={`url(#${g5})`}
        style={{ animationDelay: '1.5s' }}
      >
        <defs>
          <linearGradient id={g5} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </div>
  );
});

export default HeroBackground;
