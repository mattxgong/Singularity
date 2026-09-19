'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  phase: number
  speed: number
}

const MAX_STARS = 240
const MAX_PIXEL_RATIO = 2

function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.45 + Math.random() * 0.9,
    opacity: 0.18 + Math.random() * 0.42,
    phase: Math.random() * Math.PI * 2,
    speed: 0.00015 + Math.random() * 0.0002,
  }))
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let stars: Star[] = []
    let frame: number | null = null
    let isIntersecting = true
    let isVisible = document.visibilityState === 'visible'
    let width = 0
    let height = 0
    let starColor = ''

    const updateColor = () => {
      starColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent')
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      stars = createStars(Math.min(MAX_STARS, Math.ceil((width * height) / 20000)))
    }

    const draw = (time: number) => {
      frame = null
      context.clearRect(0, 0, width, height)
      context.fillStyle = starColor

      for (const star of stars) {
        const pulse = 0.72 + Math.sin(star.phase + time * star.speed) * 0.28
        context.globalAlpha = star.opacity * pulse
        const diameter = star.radius * 2
        context.fillRect(star.x * width, star.y * height, diameter, diameter)
      }

      context.globalAlpha = 1
      schedule()
    }

    const schedule = () => {
      if (frame === null && isVisible && isIntersecting) frame = requestAnimationFrame(draw)
    }

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
    }

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible'
      if (isVisible) schedule()
      else stop()
    }

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting
      if (isIntersecting) schedule()
      else stop()
    })

    const themeObserver = new MutationObserver(updateColor)

    updateColor()
    resize()
    observer.observe(canvas)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    schedule()

    return () => {
      stop()
      observer.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-50"
    />
  )
}
