'use client'

import React, { useState, useCallback } from 'react'
import { SharedMoodCanvas } from './shared-mood-canvas'
import { MOOD_COLORS, MOOD_LABELS } from './types'
import { Heart } from 'lucide-react'
import type { MoodType } from './types'

interface MoodWindowProps {
  userMood: {
    mood: MoodType
    intensity: number
    dailyLoveCount?: number
  }
  partnerMood: {
    mood: MoodType
    intensity: number
    dailyLoveCount?: number
  }
  userName?: string
  partnerName?: string
  onSendLoveBite?: () => void
  onMoodChange?: (mood: MoodType) => void
  userSendingKiss?: boolean
  partnerSendingKiss?: boolean
}

/**
 * MoodWindow Component - Futuristic TV Display
 *
 * A full-screen emotional visualization panel with animated stick figures
 * displaying mood states directly in their character design. Shows distinct
 * emotional expressions and connection patterns between two partners.
 */
export function MoodWindow({
  userMood,
  partnerMood,
  userName = 'You',
  partnerName = 'Partner',
  onSendLoveBite,
  onMoodChange,
  userSendingKiss: externalUserKiss,
  partnerSendingKiss: externalPartnerKiss,
}: MoodWindowProps) {
  const [internalUserKiss, setInternalUserKiss] = useState(false)
  const [internalPartnerKiss, setInternalPartnerKiss] = useState(false)

  const userSendingKiss = externalUserKiss ?? internalUserKiss
  const partnerSendingKiss = externalPartnerKiss ?? internalPartnerKiss

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const handleUserKiss = useCallback(() => {
    if (onSendLoveBite) {
      onSendLoveBite()
    } else {
      setInternalUserKiss(true)
      setTimeout(() => setInternalUserKiss(false), 800)
    }
  }, [onSendLoveBite])

  const handlePartnerKiss = useCallback(() => {
    setInternalPartnerKiss(true)
    setTimeout(() => setInternalPartnerKiss(false), 800)
  }, [])

  return (
    <div className="w-full flex flex-col gap-6 ">
      {/* HD Premium TV Display - Clean 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-[6px] border-[#1e1a2b] shadow-[0_10px_50px_rgba(0,0,0,0.5)] ">

        {/* Sleek Glossy Bezel Accent */}
        <div className="absolute inset-0 border border-white/10 rounded-[1.2rem] pointer-events-none z-10" />

        {/* Ultra-Clear Screen Content */}
        <div className="absolute inset-0 overflow-hidden bg-[#0a0510]">
          {/* Subtle Premium Gradient Glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top right, rgba(233, 75, 127, 0.2), transparent 60%), radial-gradient(circle at bottom left, rgba(107, 168, 150, 0.1), transparent 60%)'
            }}
          />

          {/* Main content - Canvas (HD Clarity) */}
          <div className="absolute inset-0 w-full h-full">
            <SharedMoodCanvas
              userMood={userMood.mood}
              partnerMood={partnerMood.mood}
              userIntensity={userMood.intensity}
              partnerIntensity={partnerMood.intensity}
              reducedMotion={prefersReducedMotion}
              userSendingKiss={userSendingKiss}
              partnerSendingKiss={partnerSendingKiss}
            />
          </div>
        </div>

        {/* Minimalist Status LEDs */}
        <div className="absolute top-5 right-6 flex gap-2 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 opacity-50" />
        </div>

        {/* Futuristic HUD - Tucked tightly into corner */}
        <div className="absolute bottom-4 right-4 z-30 flex flex-col scale-[0.9] items-end pointer-events-none group origin-bottom-right">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl overflow-hidden relative">
            {/* HUD Scanning Line Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/5 to-transparent h-[200%] -translate-y-full group-hover:animate-[scan_3s_linear_infinite]" />

            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">Love Logs</span>
              <div className="flex items-center gap-3">
                {/* Sent Counter (Partner's Received) */}
                <div className="flex flex-col items-end">
                  <span className="text-[6px] font-bold text-teal-400/50 uppercase leading-none">Sent</span>
                  <span className="text-sm font-black text-teal-400 tabular-nums">
                    {partnerMood.dailyLoveCount?.toString().padStart(3, '0') || '000'}
                  </span>
                </div>

                <div className="w-px h-4 bg-white/10" />

                {/* Received Counter (User's Received) */}
                <div className="flex flex-col items-end">
                  <span className="text-[6px] font-bold text-rose-500/50 uppercase leading-none">Received</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-rose-500 tracking-tighter drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] tabular-nums leading-none">
                      {userMood.dailyLoveCount?.toString().padStart(3, '0') || '000'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-white/10 mx-0.5" />

            <Heart className={`w-4 h-4 text-rose-500 ${partnerSendingKiss ? 'animate-ping' : ''}`} />
          </div>

          {/* Connection Level Bar - Visualizing incoming energy */}
          <div className="flex gap-1 pr-0.5 opacity-60">
            {[...Array(12)].map((_, i) => {
              const count = userMood.dailyLoveCount || 0;
              const isActive = i < (count % 12) || (count >= 12);
              return (
                <div
                  key={i}
                  className={`w-0.5 lg:w-1 h-2 rounded-full transition-all duration-700 ${isActive
                    ? 'bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.6)]'
                    : 'bg-white/5'
                    }`}
                  style={{
                    height: `${4 + Math.sin(i * 0.5) * 3}px`,
                    opacity: isActive ? 0.3 + (i / 12) * 0.7 : 0.1
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Interaction Controls - Unified Single Row */}
      <div className="flex flex-wrap gap-4 justify-center items-center p-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">

        {/* Mood Selector Group */}
        <div className="flex flex-wrap gap-2 pr-4 border-r border-white/10">
          {(Object.keys(MOOD_COLORS) as MoodType[]).map((moodType) => {
            const isSelected = userMood.mood === moodType;
            const colors = MOOD_COLORS[moodType];

            return (
              <button
                key={moodType}
                onClick={() => onMoodChange?.(moodType)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${isSelected
                  ? 'scale-105 shadow-lg'
                  : 'opacity-100 hover:opacity-100'
                  }`}
                style={{
                  backgroundColor: isSelected ? `${colors.primary}15` : 'rgba(226, 226, 226, 0.14)',
                  border: `2px solid ${isSelected ? colors.primary : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isSelected ? `0 0 15px ${colors.glow}` : 'none'
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
                <span
                  className="font-bold text-[9px] tracking-widest uppercase"
                  style={{ color: isSelected ? colors.primary : 'rgba(255,255,255,0.7)' }}
                >
                  {MOOD_LABELS[moodType]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex gap-4 pl-2">
          <button
            onClick={handleUserKiss}
            disabled={userSendingKiss}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${userSendingKiss
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
              : 'bg-rose-500/10 text-red-500 border border-rose-500/30 hover:bg-rose-500/20'
              }`}
          >
            <span className="text-sm text-red-500">♥</span>
            {userSendingKiss ? 'Sending...' : 'Love Bite'}
          </button>

          <button
            onClick={handlePartnerKiss}
            disabled={partnerSendingKiss}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${partnerSendingKiss
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/40'
              : 'bg-white/5 text-teal-200 border border-white/10 hover:bg-teal-500/20'
              }`}
          >
            <span className="text-sm">♥</span>
            {partnerSendingKiss ? 'Received' : 'Kiss'}
          </button>
        </div>
      </div>
    </div>
  )
}

