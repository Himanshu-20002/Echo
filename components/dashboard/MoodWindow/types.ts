/**
 * MoodWindow Type Definitions
 *
 * Defines the mood states and related types for the emotional visualization system.
 */

import { MoodType } from '@/lib/types'

export type { MoodType }

export interface MoodState {
  mood: MoodType
  intensity: number // 1-5 scale
}

export interface MoodAnimationConfig {
  duration: number
  delay: number
  easing: string
}

export const MOOD_COLORS: Record<MoodType, { primary: string; secondary: string; glow: string }> = {
  love: {
    primary: '#E94B7F', // Deep Rose
    secondary: '#D4A574', // Gold Accent
    glow: 'rgba(233, 75, 127, 0.5)',
  },
  happy: {
    primary: '#F0D547', // Golden Yellow
    secondary: '#FFD700', // Deep Gold
    glow: 'rgba(240, 213, 71, 0.5)',
  },
  sad: {
    primary: '#5B8DBE', // Deep Purple-Blue
    secondary: '#8BA8D1', // Soft Purple
    glow: 'rgba(91, 141, 190, 0.4)',
  },
  angry: {
    primary: '#E63946', // Deep Red
    secondary: '#A4161A', // Darker Red
    glow: 'rgba(230, 57, 70, 0.5)',
  },
  calm: {
    primary: '#6BA896', // Deep Teal
    secondary: '#9DD4C5', // Soft Teal
    glow: 'rgba(107, 168, 150, 0.4)',
  },
}

export const MOOD_LABELS: Record<MoodType, string> = {
  love: 'Love',
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  calm: 'Calm',
}

export const MOOD_MESSAGES: Record<MoodType, string> = {
  love: 'Hearts entwined',
  happy: 'Energy aligned',
  sad: 'Healing together',
  angry: 'Boundaries set',
  calm: 'In sync',
}
