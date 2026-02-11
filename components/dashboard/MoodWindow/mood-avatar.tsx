'use client'

import React from 'react'
import type { MoodType } from './types'
import { MOOD_COLORS, MOOD_LABELS } from './types'

interface MoodAvatarProps {
  mood: MoodType
  intensity: number
  label: string
  position: 'left' | 'right'
  reducedMotion: boolean
}

/**
 * Advanced MoodAvatar Component
 *
 * Displays premium futuristic mood visualization with distinct patterns
 * for each emotional state. Features sophisticated animations and luxury aesthetic.
 */
export function MoodAvatar({
  mood,
  intensity,
  label,
  position,
  reducedMotion,
}: MoodAvatarProps) {
  const moodColor = MOOD_COLORS[mood]
  const moodLabel = MOOD_LABELS[mood]
  const animationDuration = reducedMotion ? '0s' : `${4 - intensity * 0.4}s`

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Futuristic Avatar Container */}
      <div className="relative h-32 w-32 sm:h-40 sm:w-40">
        {/* Outer rings - mood-specific patterns */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${moodColor.primary}, ${moodColor.secondary}, ${moodColor.primary})`,
            animation: reducedMotion ? 'none' : `spin-outer ${animationDuration * 2} linear infinite`,
            opacity: 0.3,
          }}
        />

        {/* Middle ring - intensity indicator */}
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background: `conic-gradient(from 90deg, transparent, ${moodColor.primary}, transparent)`,
            animation: reducedMotion ? 'none' : `spin-middle ${animationDuration * 1.5} linear infinite reverse`,
            opacity: (intensity / 5) * 0.6,
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: `radial-gradient(circle, ${moodColor.primary}40 0%, transparent 70%)`,
            filter: 'blur(12px)',
          }}
        />

        {/* Core avatar with mood-specific icon */}
        <div
          className="absolute inset-8 flex items-center justify-center rounded-full sm:inset-10"
          style={{
            background: `linear-gradient(135deg, ${moodColor.primary}20, ${moodColor.secondary}20)`,
            border: `2px solid ${moodColor.primary}60`,
            boxShadow: `0 0 30px ${moodColor.glow}, inset 0 0 20px ${moodColor.glow}`,
            animation: reducedMotion ? 'none' : `pulse-core ${animationDuration} ease-in-out infinite`,
            animationDelay: position === 'left' ? '0s' : '0.2s',
          }}
        >
          <span className="text-4xl sm:text-6xl" aria-hidden="true">
            {getMoodIcon(mood)}
          </span>
        </div>

        {/* Intensity bars */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '3px',
                height: intensity > i ? '16px' : '8px',
                backgroundColor: intensity > i ? moodColor.primary : `${moodColor.primary}40`,
                borderRadius: '2px',
                transform: `rotate(${(i * 72) - 90}deg) translateY(-54px)`,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Status Information */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-semibold text-foreground text-sm sm:text-base">{label}</p>
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{
            color: moodColor.primary,
            textShadow: `0 0 10px ${moodColor.primary}40`,
          }}
        >
          {moodLabel}
        </p>
        <div className="flex items-center gap-1">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: moodColor.primary,
              boxShadow: `0 0 8px ${moodColor.primary}`,
            }}
          />
          <p className="text-xs text-muted-foreground">
            Level {intensity}/5
          </p>
        </div>
      </div>

      {/* Global animations */}
      <style>{`
        @keyframes spin-outer {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-middle {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes pulse-core {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Get icon representation for each mood with futuristic aesthetic
 */
function getMoodIcon(mood: MoodType): string {
  const iconMap: Record<MoodType, string> = {
    love: '💫',
    happy: '⚡',
    sad: '🌙',
    angry: '◆',
    calm: '◉',
  }
  return iconMap[mood]
}
