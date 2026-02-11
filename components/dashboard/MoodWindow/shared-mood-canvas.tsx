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

/**
 * Advanced Emotion Visualizer with Love Bite & Celebration
 * Renders animated characters with celebration hearts and kissing animations
 */
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

  const moodMatches = userMood === partnerMood
  const userColor = MOOD_COLORS[userMood]
  const partnerColor = MOOD_COLORS[partnerMood]
  const sharedMessage = MOOD_MESSAGES[moodMatches ? userMood : 'calm']

  // Generate celebration hearts when moods just matched
  useEffect(() => {
    if (moodMatches && !lastMoodMatchRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        // Create celebration hearts
        for (let i = 0; i < 8; i++) {
          heartsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            life: 0,
            maxLife: 60,
          })
        }
      }
    }
    lastMoodMatchRef.current = moodMatches
  }, [moodMatches])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return

    canvas.width = rect.width
    canvas.height = rect.height
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas (transparent for glass theme)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = timeRef.current * 0.016
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Calculate responsive scale based on height
      const baseScale = (canvas.height / 400) * 1.2

      // Draw emotional characters - Increased spacing for better aesthetics
      const horizontalOffset = canvas.width * 0.29

      ///increase the gap

      drawEmotionalCharacter(
        ctx,
        centerX - horizontalOffset,
        centerY,
        userMood,
        userColor,
        userIntensity,
        time,
        userSendingKiss,
        'user',
        baseScale
      )

      drawEmotionalCharacter(
        ctx,
        centerX + horizontalOffset,
        centerY,
        partnerMood,
        partnerColor,
        partnerIntensity,
        time,
        partnerSendingKiss,
        'partner',
        baseScale
      )

      // Draw connection line when moods align
      if (moodMatches) {
        drawHeartConnection(ctx, centerX - horizontalOffset, centerY, centerX + horizontalOffset, centerY, userColor, time)
      }

      // Draw kissing animation with emotion transfer when love bite is sent
      if (userSendingKiss || partnerSendingKiss) {
        drawKissingAnimation(
          ctx,
          centerX - horizontalOffset,
          centerY,
          centerX + horizontalOffset,
          centerY,
          time,
          userSendingKiss,
        )
      }

      // Update and draw floating celebration hearts
      heartsRef.current = heartsRef.current.filter((heart) => {
        heart.life += 1
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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [userMood, partnerMood, userIntensity, partnerIntensity, moodMatches, userColor, partnerColor, reducedMotion, userSendingKiss, partnerSendingKiss])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        display: 'block',
      }}
    />
  )
}

function drawEmotionalCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  mood: MoodType,
  color: { primary: string; secondary: string },
  intensity: number,
  time: number,
  isSendingKiss: boolean,
  side: 'user' | 'partner',
  baseScale: number = 1
) {
  ctx.save()
  ctx.translate(x, y)

  const scale = (0.8 + (intensity / 5) * 0.4) * baseScale

  // Draw mouth adjustment for kissing
  if (isSendingKiss) {
    // Mouth will be drawn in kissing position
  }

  switch (mood) {
    case 'love': {
      drawLoveCharacter(ctx, scale, intensity, time, color, isSendingKiss, side)
      break
    }
    case 'happy': {
      drawHappyCharacter(ctx, scale, intensity, time, color, isSendingKiss, side)
      break
    }
    case 'calm': {
      drawCalmCharacter(ctx, scale, intensity, time, color, isSendingKiss, side)
      break
    }
    case 'sad': {
      drawSadCharacter(ctx, scale, intensity, time, color, isSendingKiss, side)
      break
    }
    case 'angry': {
      drawAngryCharacter(ctx, scale, intensity, time, color, isSendingKiss, side)
      break
    }
  }

  ctx.restore()
}

function drawLoveCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  intensity: number,
  time: number,
  color: { primary: string; secondary: string },
  isSendingKiss: boolean,
  side: 'user' | 'partner',
) {
  ctx.strokeStyle = color.primary
  ctx.fillStyle = color.primary
  ctx.lineWidth = 3.5 * scale

  // Head with glow
  ctx.shadowColor = color.primary
  ctx.shadowBlur = 15 * scale
  ctx.beginPath()
  ctx.arc(0, -28 * scale, 14 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowColor = 'transparent'

  // Heart icon in head - pulsing
  const heartPulse = Math.sin(time * 2.5) * 0.5 + 1.2
  ctx.fillStyle = color.primary
  ctx.font = `bold ${20 * scale * heartPulse}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♥', 0, -28 * scale)

  // Mouth - smile or kiss lips
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3 * scale
  if (isSendingKiss) {
    // Kiss mouth - small puckered lips
    ctx.fillStyle = color.primary
    ctx.beginPath()
    ctx.arc(0, -16 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Smile
    ctx.beginPath()
    ctx.arc(0, -18 * scale, 6 * scale, 0, Math.PI)
    ctx.stroke()
  }

  // Arms reaching out or pulling in for kiss
  let armAngle = Math.sin(time * 1.5) * 0.4
  let armLift = Math.sin(time * 1.5) * 4

  if (isSendingKiss) {
    armAngle = side === 'user' ? 0.6 : -0.6
    armLift = Math.sin(time * 3) * 2
  }

  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3.5 * scale
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(-14 * scale, -10 * scale)
  ctx.lineTo(-28 * scale - Math.cos(armAngle) * 12 * scale, -6 * scale + Math.sin(armAngle) * 10 * scale + armLift)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(14 * scale, -10 * scale)
  ctx.lineTo(28 * scale + Math.cos(armAngle) * 12 * scale, -6 * scale + Math.sin(armAngle) * 10 * scale + armLift)
  ctx.stroke()

  // Body
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-8 * scale, 24 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(8 * scale, 24 * scale)
  ctx.stroke()

  // Legs
  ctx.beginPath()
  ctx.moveTo(-8 * scale, 24 * scale)
  ctx.lineTo(-8 * scale, 38 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(8 * scale, 24 * scale)
  ctx.lineTo(8 * scale, 38 * scale)
  ctx.stroke()
}

function drawHappyCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  intensity: number,
  time: number,
  color: { primary: string; secondary: string },
  isSendingKiss: boolean,
  side: 'user' | 'partner',
) {
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3.5 * scale

  const jumpHeight = Math.sin(time * 2.2) * 16 * scale * intensity
  const jumpY = Math.max(0, jumpHeight)

  // Head with glow
  ctx.shadowColor = color.primary
  ctx.shadowBlur = 15 * scale
  ctx.beginPath()
  ctx.arc(0, -28 * scale + jumpY, 14 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowColor = 'transparent'

  // Star/spark icon in head - radiating
  ctx.fillStyle = color.primary
  ctx.font = `bold ${24 * scale}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', 0, -28 * scale + jumpY)

  // Big smile
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3 * scale
  ctx.beginPath()
  ctx.arc(0, -16 * scale + jumpY, 8 * scale, 0, Math.PI)
  ctx.stroke()

  // Arms up in celebration
  const armHeight = Math.sin(time * 2.8) * 14 * scale * intensity
  ctx.lineWidth = 3.5 * scale
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(-14 * scale, -8 * scale + jumpY)
  ctx.lineTo(-26 * scale, -32 * scale + jumpY - Math.abs(armHeight))
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(14 * scale, -8 * scale + jumpY)
  ctx.lineTo(26 * scale, -32 * scale + jumpY - Math.abs(armHeight))
  ctx.stroke()

  // Body
  ctx.lineWidth = 3.5 * scale
  ctx.beginPath()
  ctx.moveTo(0, jumpY)
  ctx.lineTo(-9 * scale, 22 * scale + jumpY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, jumpY)
  ctx.lineTo(9 * scale, 22 * scale + jumpY)
  ctx.stroke()

  // Legs
  ctx.beginPath()
  ctx.moveTo(-9 * scale, 22 * scale + jumpY)
  ctx.lineTo(-9 * scale, 36 * scale + jumpY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(9 * scale, 22 * scale + jumpY)
  ctx.lineTo(9 * scale, 36 * scale + jumpY)
  ctx.stroke()
}

function drawCalmCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  intensity: number,
  time: number,
  color: { primary: string; secondary: string },
  isSendingKiss: boolean,
  side: 'user' | 'partner',
) {
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3.5 * scale
  ctx.lineCap = 'round'

  const sway = Math.sin(time * 0.7) * 4 * scale
  const headTilt = Math.sin(time * 0.8) * 0.1

  // Head with glow
  ctx.save()
  ctx.rotate(headTilt)
  ctx.shadowColor = color.primary
  ctx.shadowBlur = 12 * scale
  ctx.beginPath()
  ctx.arc(0, -28 * scale, 14 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowColor = 'transparent'
  ctx.restore()

  // Circle/zen icon in head - peaceful
  ctx.fillStyle = color.primary
  ctx.font = `bold ${22 * scale}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.rotate(headTilt)
  ctx.fillText('◎', 0, -28 * scale)
  ctx.restore()

  // Serene smile
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3 * scale
  ctx.beginPath()
  ctx.arc(0, -16 * scale, 6 * scale, 0, Math.PI)
  ctx.stroke()

  // Relaxed body with gentle sway
  ctx.lineWidth = 3.5 * scale
  ctx.beginPath()
  ctx.moveTo(sway, 0)
  ctx.lineTo(sway - 8 * scale, 24 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(sway, 0)
  ctx.lineTo(sway + 8 * scale, 24 * scale)
  ctx.stroke()

  // Relaxed arms at sides
  ctx.beginPath()
  ctx.moveTo(-14 * scale, -6 * scale)
  ctx.lineTo(-18 * scale + sway, 10 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(14 * scale, -6 * scale)
  ctx.lineTo(18 * scale + sway, 10 * scale)
  ctx.stroke()

  // Legs
  ctx.beginPath()
  ctx.moveTo(sway - 8 * scale, 24 * scale)
  ctx.lineTo(sway - 8 * scale, 38 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(sway + 8 * scale, 24 * scale)
  ctx.lineTo(sway + 8 * scale, 38 * scale)
  ctx.stroke()
}

function drawSadCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  intensity: number,
  time: number,
  color: { primary: string; secondary: string },
  isSendingKiss: boolean,
  side: 'user' | 'partner',
) {
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3.5 * scale

  // Head down and sad
  ctx.shadowColor = color.primary
  ctx.shadowBlur = 12 * scale
  ctx.beginPath()
  ctx.arc(0, -22 * scale, 14 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowColor = 'transparent'

  // Tear drop icon in head - emotional
  ctx.fillStyle = color.primary
  ctx.font = `bold ${26 * scale}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('◇', 0, -22 * scale)

  // Sad frown
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3 * scale
  ctx.beginPath()
  ctx.arc(0, -12 * scale, 6 * scale, Math.PI, 0)
  ctx.stroke()

  // Teardrops - falling with gravity
  const tearDrop = Math.sin(time * 1.8) * 5 * scale + Math.max(0, Math.sin(time * 0.9) * 3 * scale)
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 2.5 * scale
  ctx.beginPath()
  ctx.moveTo(-6 * scale, -8 * scale)
  ctx.lineTo(-6 * scale, -8 * scale + 12 * scale + tearDrop)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(6 * scale, -8 * scale)
  ctx.lineTo(6 * scale, -8 * scale + 12 * scale + tearDrop)
  ctx.stroke()

  // Slumped body - drooping
  const slump = Math.sin(time * 0.6) * 3
  ctx.lineWidth = 3.5 * scale
  ctx.beginPath()
  ctx.moveTo(slump, 0)
  ctx.lineTo(slump - 7 * scale, 24 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(slump, 0)
  ctx.lineTo(slump + 7 * scale, 24 * scale)
  ctx.stroke()

  // Arms down and inward - protecting
  ctx.beginPath()
  ctx.moveTo(-14 * scale, -4 * scale)
  ctx.lineTo(-16 * scale, 14 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(14 * scale, -4 * scale)
  ctx.lineTo(16 * scale, 14 * scale)
  ctx.stroke()

  // Legs
  ctx.beginPath()
  ctx.moveTo(slump - 7 * scale, 24 * scale)
  ctx.lineTo(slump - 7 * scale, 38 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(slump + 7 * scale, 24 * scale)
  ctx.lineTo(slump + 7 * scale, 38 * scale)
  ctx.stroke()
}

function drawAngryCharacter(
  ctx: CanvasRenderingContext2D,
  scale: number,
  intensity: number,
  time: number,
  color: { primary: string; secondary: string },
  isSendingKiss: boolean,
  side: 'user' | 'partner',
) {
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 4 * scale
  ctx.lineCap = 'round'

  const headShake = Math.sin(time * 3.5) * 2.5 * scale * intensity

  // Head - tense and glowing
  ctx.shadowColor = color.primary
  ctx.shadowBlur = 18 * scale
  ctx.beginPath()
  ctx.arc(headShake, -28 * scale, 14 * scale, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowColor = 'transparent'

  // Lightning bolt / energy icon in head
  ctx.fillStyle = color.primary
  ctx.font = `bold ${28 * scale}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚡', headShake, -28 * scale)

  // Angry frown - sharp
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 3 * scale
  ctx.beginPath()
  ctx.arc(headShake, -14 * scale, 6 * scale, Math.PI, 0)
  ctx.stroke()

  // Tense body - rigid
  ctx.lineWidth = 4 * scale
  ctx.beginPath()
  ctx.moveTo(headShake, 0)
  ctx.lineTo(headShake - 9 * scale, 22 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(headShake, 0)
  ctx.lineTo(headShake + 9 * scale, 22 * scale)
  ctx.stroke()

  // Fists clenched with tension
  const fistTense = Math.sin(time * 3.8) * 4 * scale * intensity
  ctx.beginPath()
  ctx.moveTo(-16 * scale + headShake, -8 * scale)
  ctx.lineTo(-28 * scale + headShake - fistTense, 6 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(16 * scale + headShake, -8 * scale)
  ctx.lineTo(28 * scale + headShake + fistTense, 6 * scale)
  ctx.stroke()

  // Fist circles - clenched
  ctx.beginPath()
  ctx.arc(-28 * scale + headShake - fistTense, 6 * scale, 4 * scale, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(28 * scale + headShake + fistTense, 6 * scale, 4 * scale, 0, Math.PI * 2)
  ctx.stroke()

  // Legs - grounded stance
  ctx.beginPath()
  ctx.moveTo(headShake - 9 * scale, 22 * scale)
  ctx.lineTo(headShake - 9 * scale, 36 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(headShake + 9 * scale, 22 * scale)
  ctx.lineTo(headShake + 9 * scale, 36 * scale)
  ctx.stroke()
}

function drawHeartConnection(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: { primary: string; secondary: string },
  time: number,
) {
  ctx.strokeStyle = color.primary
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6 + Math.sin(time * 2) * 0.2

  const steps = 30
  const baseY = (y1 + y2) / 2
  const wave = Math.sin(time * 2) * 8

  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const px = x1 + ((x2 - x1) / steps) * i
    const py = baseY + Math.sin((i / steps) * Math.PI * 4 + time * 2.5) * 6 + wave
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  ctx.globalAlpha = 1.0
}

function drawCelebrationHeart(
  ctx: CanvasRenderingContext2D,
  heart: FloatingHeart,
  color: { primary: string; secondary: string },
) {
  const opacity = 1 - heart.life / heart.maxLife
  ctx.globalAlpha = opacity

  // Floating heart animation
  const floatY = Math.sin(heart.life * 0.1) * 5
  const scale = opacity * 0.8 + 0.2

  ctx.fillStyle = color.primary
  ctx.font = `bold ${14 * scale}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♥', heart.x, heart.y + floatY)

  ctx.globalAlpha = 1.0
}

function drawKissingAnimation(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  time: number,
  userSendingKiss: boolean,
) {
  // Determine direction and color of energy flow
  const sourceX = userSendingKiss ? x1 : x2
  const sourceY = userSendingKiss ? y1 : y2
  const targetX = userSendingKiss ? x2 : x1
  const targetY = userSendingKiss ? y2 : y1
  const sourceColor = userSendingKiss ? '#E94B7F' : '#6BA896'
  const targetColor = userSendingKiss ? '#6BA896' : '#E94B7F'

  // Draw multiple streams of energy particles flowing from sender to receiver
  const streamCount = 5
  const particlesPerStream = 12

  for (let stream = 0; stream < streamCount; stream++) {
    const streamOffset = (stream / streamCount) * 0.3 - 0.15
    const streamStartY = sourceY + streamOffset * 40

    for (let i = 0; i < particlesPerStream; i++) {
      const progress = ((time * 70 + i * (120 / particlesPerStream)) % 120) / 120
      if (progress > 1) continue

      // Calculate particle position along the path
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress
      const x = sourceX + (targetX - sourceX) * easeProgress
      const y = streamStartY + (targetY - streamStartY) * easeProgress

      // Particle grows then shrinks
      const sizeProgress = Math.sin(progress * Math.PI)
      const size = 8 * sizeProgress + 3

      // Color transitions from source to target
      const colorLerp = progress
      const r1 = parseInt(sourceColor.substring(1, 3), 16)
      const g1 = parseInt(sourceColor.substring(3, 5), 16)
      const b1 = parseInt(sourceColor.substring(5, 7), 16)

      const r2 = parseInt(targetColor.substring(1, 3), 16)
      const g2 = parseInt(targetColor.substring(3, 5), 16)
      const b2 = parseInt(targetColor.substring(5, 7), 16)

      const r = Math.floor(r1 + (r2 - r1) * colorLerp)
      const g = Math.floor(g1 + (g2 - g1) * colorLerp)
      const b = Math.floor(b1 + (b2 - b1) * colorLerp)
      const particleColor = `rgb(${r}, ${g}, ${b})`

      // Draw glowing particle with halo
      ctx.shadowColor = particleColor
      ctx.shadowBlur = 25
      ctx.globalAlpha = (1 - progress) * 0.9
      ctx.fillStyle = particleColor
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()

      // Bright inner core
      ctx.shadowBlur = 0
      ctx.globalAlpha = (1 - progress) * 0.6
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  // Draw the kiss mark at meeting point - stays bright and visible
  const meetingX = (sourceX + targetX) / 2
  const meetingY = (sourceY + targetY) / 2

  // Central heart stays bright and visible throughout
  ctx.globalAlpha = 0.95
  ctx.shadowColor = sourceColor
  ctx.shadowBlur = 40
  ctx.fillStyle = sourceColor
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♥', meetingX, meetingY)

  // Extra outer glow for center heart
  ctx.shadowBlur = 60
  ctx.globalAlpha = 0.6
  ctx.fillText('♥', meetingX, meetingY)

  // Radiate glowing hearts outward from the kiss point - very long duration
  const heartCount = 8
  const maxDistance = 500 // Hearts expand far off screen
  const expansionTime = 500 // Very long expansion - stays visible much longer
  // DO NOT use modulo - let animation play once and stay visible
  let progress = Math.min(time / expansionTime, 1.0) // Clamp to 1.0 so it stops expanding

  for (let i = 0; i < heartCount; i++) {
    const angle = (i / heartCount) * Math.PI * 2
    // Smooth cubic easing for expansion
    const easeProgress = progress * progress * (3 - 2 * progress) // Smoothstep
    const distance = easeProgress * maxDistance

    const heartX = meetingX + Math.cos(angle) * distance
    const heartY = meetingY + Math.sin(angle) * distance

    // Heart size much larger and grows more as it expands
    const heartSize = 28 + easeProgress * 20

    // Very delayed fade-out: stays fully visible for 80% of animation
    const fadeStart = 0.8 // Start fading at 80% of animation
    const fadeOpacity = progress > fadeStart ? Math.max(0, (1 - progress) / (1 - fadeStart)) : 1

    // Glow halo effect - larger and more vibrant
    ctx.globalAlpha = fadeOpacity * 0.9
    ctx.shadowColor = sourceColor
    ctx.shadowBlur = 30 + easeProgress * 25
    ctx.fillStyle = sourceColor
    ctx.font = `bold ${heartSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♥', heartX, heartY)

    // Strong outer glow
    ctx.shadowBlur = 50 + easeProgress * 30
    ctx.globalAlpha = fadeOpacity * 0.5
    ctx.fillText('♥', heartX, heartY)

    // Extra outer glow layer for more prominence
    ctx.shadowBlur = 70 + easeProgress * 40
    ctx.globalAlpha = fadeOpacity * 0.25
    ctx.fillText('♥', heartX, heartY)
  }

  ctx.globalAlpha = 1.0
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}
