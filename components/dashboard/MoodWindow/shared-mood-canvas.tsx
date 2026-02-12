'use client'

import React, { useEffect, useRef } from 'react'
import type { MoodType } from './types'
import { MOOD_COLORS, MOOD_MESSAGES } from './types'

interface SharedMoodCanvasProps {
  userMood: MoodType
  partnerMood: MoodType
  userIntensity: number
  partnerIntensity: number
  reducedMotion: boolean
  userSendingKiss?: boolean
  partnerSendingKiss?: boolean
}

interface FloatingHeart {
  x: number
  y: number
  life: number
  maxLife: number
}

export function SharedMoodCanvas({
  userMood,
  partnerMood,
  userIntensity,
  partnerIntensity,
  reducedMotion,
  userSendingKiss = false,
  partnerSendingKiss = false,
}: SharedMoodCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const heartsRef = useRef<FloatingHeart[]>([])
  const lastMoodMatchRef = useRef(false)
  const kissStartTimeRef = useRef<number | null>(null)
  const cinematicReachRef = useRef(0)

  const moodMatches = userMood === partnerMood
  const userColor = MOOD_COLORS[userMood]
  const partnerColor = MOOD_COLORS[partnerMood]

  // Generate celebration hearts when moods just matched
  useEffect(() => {
    if (moodMatches && !lastMoodMatchRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        for (let i = 0; i < 10; i++) {
          heartsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            life: 0,
            maxLife: 100 + Math.random() * 50,
          })
        }
      }
    }
    lastMoodMatchRef.current = moodMatches
  }, [moodMatches])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        canvas.width = entry.contentRect.width
        canvas.height = entry.contentRect.height
      }
    })

    if (canvas.parentElement) {
      observer.observe(canvas.parentElement)
    }

    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const animate = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d', { alpha: true })
      if (!canvas || !ctx) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = timeRef.current * 0.016
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseScale = (canvas.height / 400) * 1.2
      const horizontalOffset = canvas.width * 0.29

      // Cinematic "Reach & Look" - move closer and tilt towards each other during Love Bite
      const isKissing = userSendingKiss || partnerSendingKiss;
      if (isKissing && kissStartTimeRef.current === null) kissStartTimeRef.current = timeRef.current;
      else if (!isKissing) kissStartTimeRef.current = null;

      // Smooth interpolation - fixes the 'teleportation' bug
      const targetReach = isKissing ? 1 : 0;
      cinematicReachRef.current += (targetReach - cinematicReachRef.current) * 0.06;

      const ease = cinematicReachRef.current * (2 - cinematicReachRef.current);
      const approach = ease * (canvas.width * 0.12);
      const lookTilt = ease * 0.25;

      // Physics - smoother, slower movement
      const userFX = Math.cos(time * 0.5) * 10 * baseScale + approach
      const userFY = Math.sin(time * 0.6) * 14 * baseScale
      const userRot = (Math.sin(time * 0.4) * 0.12) + lookTilt

      const partFX = Math.cos(time * 0.3 + 2) * 10 * baseScale - approach
      const partFY = Math.sin(time * 0.7 + 1) * 14 * baseScale
      const partRot = (Math.cos(time * 0.35 + 0.5) * 0.12) - lookTilt

      // Render loop optimization: Group by character
      drawEmotionalCharacter(ctx, centerX - horizontalOffset + userFX, centerY + userFY, userMood, userColor, userIntensity, time, userSendingKiss, baseScale, userRot)
      drawMoodEmotes(ctx, centerX - horizontalOffset + userFX, centerY + userFY, userMood, userColor, time, baseScale, userSendingKiss)

      drawEmotionalCharacter(ctx, centerX + horizontalOffset + partFX, centerY + partFY, partnerMood, partnerColor, partnerIntensity, time, partnerSendingKiss, baseScale, partRot)
      drawMoodEmotes(ctx, centerX + horizontalOffset + partFX, centerY + partFY, partnerMood, partnerColor, time + 2, baseScale, partnerSendingKiss)

      if (moodMatches) {
        drawHeartConnection(ctx, centerX - horizontalOffset + userFX, centerY + userFY, centerX + horizontalOffset + partFX, centerY + partFY, userColor, time)
      }

      // Celebration hearts - optimized count
      if (moodMatches && heartsRef.current.length < 25 && timeRef.current % 15 === 0) {
        heartsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          life: 0,
          maxLife: 120 + Math.random() * 60,
        })
      }

      // Kiss animation
      if (isKissing) {
        const kissElapsed = (timeRef.current - (kissStartTimeRef.current || timeRef.current)) * 0.016
        drawKissingAnimation(ctx, centerX - horizontalOffset + userFX, centerY + userFY, centerX + horizontalOffset + partFX, centerY + partFY, kissElapsed, userSendingKiss)
      }

      // Update hearts - slow and smooth normally, energetic during Love Bite
      const heartLifeSpeed = (userSendingKiss || partnerSendingKiss) ? 1.7 : 0.7;
      heartsRef.current = heartsRef.current.filter((heart) => {
        heart.life += heartLifeSpeed
        if (moodMatches && heart.life >= heart.maxLife) {
          heart.life = 0
          heart.x = Math.random() * canvas.width
          heart.y = Math.random() * canvas.height
        }
        if (heart.life < heart.maxLife) {
          drawCelebrationHeart(ctx, heart, userColor)
          return true
        }
        return false
      })

      timeRef.current += 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [userMood, partnerMood, userIntensity, partnerIntensity, moodMatches, userColor, partnerColor, reducedMotion, userSendingKiss, partnerSendingKiss])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

/** 
 * OPTIMIZED RENDERING FUNCTIONS
 * Goal: Minimize ctx calls, remove shadowBlur, use simple paths
 */

function drawEmotionalCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, mood: MoodType, color: { primary: string }, intensity: number, time: number, isKiss: boolean, baseScale: number, rotation: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  const scale = (0.8 + (intensity / 5) * 0.4) * baseScale

  ctx.strokeStyle = color.primary
  ctx.fillStyle = color.primary
  ctx.lineWidth = 3 * scale
  ctx.lineCap = 'round'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  switch (mood) {
    case 'love': drawLove(ctx, scale, time, isKiss); break
    case 'happy': drawHappy(ctx, scale, intensity, time); break
    case 'calm': drawCalm(ctx, scale, time); break
    case 'sad': drawSad(ctx, scale, time); break
    case 'angry': drawAngry(ctx, scale, intensity, time); break
  }
  ctx.restore()
}

function drawLove(ctx: CanvasRenderingContext2D, scale: number, time: number, isKiss: boolean) {
  // Head
  ctx.beginPath(); ctx.arc(0, -28 * scale, 14 * scale, 0, 6.28); ctx.stroke()

  // Face heart - Positioned higher as per user preference
  const hS = 1.1 + Math.sin(time * 2) * 0.15
  ctx.font = `bold ${20 * scale * hS}px Arial`
  ctx.fillText('♥', 0, -28 * scale - 15)
  // Mouth
  if (isKiss) { ctx.beginPath(); ctx.arc(0, -16 * scale, 4 * scale, 0, 6.28); ctx.fill() }
  else { ctx.beginPath(); ctx.arc(0, -18 * scale, 7 * scale, 0, Math.PI); ctx.stroke() }
  // Stick arms
  const s = Math.sin(time * 1) * 2; const r = isKiss ? 1.3 : 1
  ctx.beginPath(); ctx.moveTo(-14 * scale, -10 * scale); ctx.lineTo(-28 * scale * r, -6 * scale + s); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14 * scale, -10 * scale); ctx.lineTo(28 * scale * r, -6 * scale + s); ctx.stroke()
  // Body & Legs
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8 * scale, 24 * scale); ctx.lineTo(-8 * scale, 38 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8 * scale, 24 * scale); ctx.lineTo(8 * scale, 38 * scale); ctx.stroke()
}

function drawHappy(ctx: CanvasRenderingContext2D, scale: number, intensity: number, time: number) {
  const jumpY = Math.min(0, Math.sin(time * 6.5) * 22 * scale * intensity)
  ctx.beginPath(); ctx.arc(0, -28 * scale + jumpY, 14 * scale, 0, 6.28); ctx.stroke()
  ctx.font = `bold ${24 * scale}px Arial`
  ctx.fillText('✦', 0, -28 * scale + jumpY)
  ctx.beginPath(); ctx.arc(0, -16 * scale + jumpY, 8 * scale, 0, Math.PI); ctx.stroke()
  const aH = Math.sin(time * 2.8) * 14 * scale * intensity
  ctx.beginPath(); ctx.moveTo(-14 * scale, -8 * scale + jumpY); ctx.lineTo(-26 * scale, -32 * scale + jumpY - Math.abs(aH)); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14 * scale, -8 * scale + jumpY); ctx.lineTo(26 * scale, -32 * scale + jumpY - Math.abs(aH)); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, jumpY); ctx.lineTo(-9 * scale, 22 * scale); ctx.lineTo(-9 * scale, 36 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, jumpY); ctx.lineTo(9 * scale, 22 * scale); ctx.lineTo(9 * scale, 36 * scale); ctx.stroke()
}

function drawCalm(ctx: CanvasRenderingContext2D, scale: number, time: number) {
  const breath = Math.sin(time * 0.4) * 0.05 + 1; const sc = scale * breath; const sway = Math.sin(time * 0.25) * 15 * sc
  ctx.globalAlpha = (2 - ((time * 0.5) % 2)) * 0.1
  ctx.beginPath(); ctx.arc(0, 0, (40 + ((time * 0.5) % 2) * 60) * sc, 0, 6.28); ctx.stroke(); ctx.globalAlpha = 1
  ctx.beginPath(); ctx.arc(sway * 0.2, -28 * sc, 14 * sc, 0, 6.28); ctx.stroke()
  ctx.font = `bold ${24 * sc}px Arial`
  ctx.fillText('◎', sway * 0.2, -28 * sc)
  ctx.beginPath(); ctx.arc(sway * 0.2, -18 * sc, 5 * sc, 0, Math.PI); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(sway, 12 * sc, sway, 20 * sc, 0, 38 * sc); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-14 * sc, -8 * sc); ctx.lineTo(-24 * sc + sway * 0.5, 5 * sc); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14 * sc, -8 * sc); ctx.lineTo(24 * sc + sway * 0.5, 5 * sc); ctx.stroke()
}

function drawSad(ctx: CanvasRenderingContext2D, scale: number, time: number) {
  const sway = Math.sin(time * 0.8) * 2 * scale
  ctx.beginPath(); ctx.arc(sway, -22 * scale, 14 * scale, 0, 6.28); ctx.stroke()
  ctx.font = `bold ${26 * scale}px Arial`
  ctx.fillText('◇', sway, -22 * scale)
  ctx.beginPath(); ctx.arc(sway, -12 * scale, 6 * scale, Math.PI, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8 * scale, 24 * scale); ctx.lineTo(-8 * scale, 38 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8 * scale, 24 * scale); ctx.lineTo(8 * scale, 38 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-14 * scale, -4 * scale); ctx.lineTo(-18 * scale, 12 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(14 * scale, -4 * scale); ctx.lineTo(18 * scale, 12 * scale); ctx.stroke()
}

function drawAngry(ctx: CanvasRenderingContext2D, scale: number, intensity: number, time: number) {
  const shake = Math.sin(time * 12) * 3.5 * scale * intensity
  ctx.beginPath(); ctx.arc(shake, -28 * scale, 14 * scale, 0, 6.28); ctx.stroke()
  ctx.font = `bold ${28 * scale}px Arial`
  ctx.fillText('⚡', shake, -28 * scale)
  ctx.beginPath(); ctx.arc(shake, -14 * scale, 6 * scale, Math.PI, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(shake, 0); ctx.lineTo(shake - 9 * scale, 22 * scale); ctx.lineTo(shake - 9 * scale, 36 * scale); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(shake, 0); ctx.lineTo(shake + 9 * scale, 22 * scale); ctx.lineTo(shake + 9 * scale, 36 * scale); ctx.stroke()
  const f = Math.sin(time * 3.8) * 4 * scale * intensity
  ctx.beginPath(); ctx.moveTo(-16 * scale + shake, -8 * scale); ctx.lineTo(-28 * scale + shake - f, 6 * scale); ctx.arc(-28 * scale + shake - f, 6 * scale, 4 * scale, 0, 6.28); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(16 * scale + shake, -8 * scale); ctx.lineTo(28 * scale + shake + f, 6 * scale); ctx.arc(28 * scale + shake + f, 6 * scale, 4 * scale, 0, 6.28); ctx.stroke()
}

function drawMoodEmotes(ctx: CanvasRenderingContext2D, x: number, y: number, mood: MoodType, color: { primary: string }, time: number, baseScale: number, isKiss: boolean) {
  const dict: Record<string, string[]> = {
    love: ['♥', '♡', '♡'], happy: ['⭐', '✨', '☀'], calm: ['🫧', '❄', '☽'],
    sad: ['💧', '☁', '🌧'], angry: ['⚡', '💢', '🔥']
  }
  const em = dict[mood] || ['✨']
  const spd = isKiss ? 2.8 : 1
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color.primary; ctx.textAlign = 'center'
  em.forEach((s, i) => {
    const a = time * spd + i * (6.28 / em.length); const r = (65 * baseScale) + Math.sin(time * 3 + i) * 12
    const sc = (0.6 + Math.sin(time * 5 + i) * 0.2) * baseScale
    ctx.globalAlpha = 0.4 + Math.sin(time * 1.5 + i) * 0.1
    ctx.font = `${20 * sc}px Arial`; ctx.fillText(s, Math.cos(a) * r, Math.sin(a) * r)
  })
  ctx.restore()
}

function drawHeartConnection(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: { primary: string }, time: number) {
  ctx.globalAlpha = 0.5; ctx.strokeStyle = color.primary; ctx.lineWidth = 2; ctx.beginPath()
  const bY = (y1 + y2) / 2; const w = Math.sin(time * 2) * 8
  for (let i = 0; i <= 20; i++) {
    const px = x1 + ((x2 - x1) / 20) * i
    const py = bY + Math.sin((i / 20) * 12.56 + time * 2.5) * 6 + w
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.stroke(); ctx.globalAlpha = 1
}

function drawCelebrationHeart(ctx: CanvasRenderingContext2D, h: FloatingHeart, color: { primary: string }) {
  const op = h.life < 20 ? h.life / 20 : (h.maxLife - h.life < 20 ? (h.maxLife - h.life) / 20 : 1)
  ctx.globalAlpha = op * 0.4; ctx.fillStyle = color.primary; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'
  // Slower, smoother floating frequencies
  ctx.fillText('♥', h.x + Math.cos(h.life * 0.02) * 4, h.y + Math.sin(h.life * 0.025) * 8); ctx.globalAlpha = 1
}

function drawKissingAnimation(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, el: number, isU: boolean) {
  const sX = isU ? x1 : x2; const sY = isU ? y1 : y2; const tX = isU ? x2 : x1; const tY = isU ? y2 : y1
  const color = isU ? '#E94B7F' : '#6BA896'

  // Energy Beam Particles
  for (let s = 0; s < 2; s++) {
    const sOff = (s / 2) * 40 - 20; const sY_ = sY + sOff
    for (let i = 0; i < 6; i++) {
      const p = ((el * 400 + i * 20) % 120) / 120; if (p > 1) continue
      const eP = Math.pow(p, 1.2); const x = sX + (tX - sX) * eP; const y = sY_ + (tY - sY_) * eP
      const sz = 2 + Math.sin(p * 3.14) * 4
      ctx.globalAlpha = (1 - p) * 0.8; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, sz, 0, 6.28); ctx.fill()
      ctx.globalAlpha = (1 - p); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, sz * 0.4, 0, 6.28); ctx.fill()
    }
  }

  const mX = (sX + tX) / 2; const mY = (sY + tY) / 2; const hP = 1 + Math.sin(el * 15) * 0.2

  // RADIATING BURST (8 Hearts expanding from center)
  const burstP = (el * 0.5) % 1; // Animation cycle
  const burstRadius = burstP * 210;
  const burstAlpha = (1 - burstP) * 0.5;
  ctx.globalAlpha = burstAlpha;
  ctx.font = `24px Arial`;
  ctx.fillStyle = color;
  for (let j = 0; j < 8; j++) {
    const angle = (j / 8) * 6.28 + (el * 0.5);
    ctx.fillText('♥', mX + Math.cos(angle) * burstRadius, mY + Math.sin(angle) * burstRadius);
  }

  // Central Heart
  ctx.globalAlpha = 0.8; ctx.fillStyle = color; ctx.font = `bold ${28 * hP}px Arial`; ctx.fillText('♥', mX, mY); ctx.globalAlpha = 1
}
