'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightDirectionSphereProps {
  azimuth: number
  elevation: number
  onChange: (azimuth: number, elevation: number) => void
  size?: number
}

// 3D point projected to 2D via Y then X rotation
function project(
  x: number,
  y: number,
  z: number,
  rotY: number,
  rotX: number
): { sx: number; sy: number; z: number } {
  // Rotate around Y axis (azimuth)
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)
  const x1 = x * cosY + z * sinY
  const z1 = -x * sinY + z * cosY

  // Rotate around X axis (elevation)
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)
  const y2 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX

  return { sx: x1, sy: -y2, z: z2 }
}

// Normalize rotation: keep azimuth in [0,360), allow elevation to wrap over poles
function normalizeRotation(az: number, el: number): { azimuth: number; elevation: number } {
  // Wrap elevation into [-180, 180)
  el = ((el % 360) + 540) % 360 - 180

  // If elevation is outside [-90, 90], we've gone over a pole
  if (el > 90) {
    el = 180 - el
    az += 180
  } else if (el < -90) {
    el = -180 - el
    az += 180
  }

  az = ((az % 360) + 360) % 360
  return { azimuth: Math.round(az * 10) / 10, elevation: Math.round(el * 10) / 10 }
}

function drawSphere3D(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  azimuth: number,
  elevation: number,
  dpr: number,
  isActive: boolean
) {
  const cx = width / 2
  const cy = height / 2
  const R = Math.min(width, height) / 2 - 24 * dpr

  ctx.clearRect(0, 0, width, height)

  const rotY = (azimuth * Math.PI) / 180
  const rotX = (elevation * Math.PI) / 180

  // Draw a 3D ring on the sphere with depth-based alpha
  function drawRing(
    ringFn: (t: number) => { x: number; y: number; z: number },
    segments: number,
    baseAlpha: number,
    lineWidth: number
  ) {
    const points: { sx: number; sy: number; z: number }[] = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2
      const { x, y, z } = ringFn(t)
      points.push(project(x, y, z, rotY, rotX))
    }

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const avgZ = (p0.z + p1.z) / 2
      // Smooth fade: front=full, back=dim
      const depthFade = 0.25 + 0.75 * Math.max(0, Math.min(1, (avgZ + 0.3) / 1.3))
      const alpha = baseAlpha * depthFade
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(cx + p0.sx * R, cy + p0.sy * R)
      ctx.lineTo(cx + p1.sx * R, cy + p1.sy * R)
      ctx.stroke()
    }
  }

  const segments = 64

  // Latitude lines
  for (const latDeg of [-60, -30, 0, 30, 60]) {
    const latRad = (latDeg * Math.PI) / 180
    const r = Math.cos(latRad)
    const h = Math.sin(latRad)
    const isEquator = latDeg === 0
    drawRing(
      (t) => ({ x: r * Math.cos(t), y: h, z: r * Math.sin(t) }),
      segments,
      isEquator ? 0.18 : 0.09,
      (isEquator ? 1.2 : 0.8) * dpr
    )
  }

  // Longitude lines
  for (let i = 0; i < 8; i++) {
    const lng = (i / 8) * Math.PI * 2
    drawRing(
      (t) => ({
        x: Math.cos(t) * Math.cos(lng),
        y: Math.sin(t),
        z: Math.cos(t) * Math.sin(lng),
      }),
      segments,
      0.09,
      0.8 * dpr
    )
  }

  // Outer circle
  ctx.strokeStyle = isActive ? 'rgba(200,255,0,0.35)' : 'rgba(255,255,255,0.18)'
  ctx.lineWidth = (isActive ? 2 : 1.5) * dpr
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.stroke()

  // Light dot — the "front" of the rotated sphere (0,0,1) after rotation
  const lightProj = project(0, 0, 1, rotY, rotX)
  const lightX = cx + lightProj.sx * R
  const lightY = cy + lightProj.sy * R
  const lightOnFront = lightProj.z > 0

  // Only draw beam and light if the light is on the visible side
  if (lightOnFront) {
    // Light beam
    const gradient = ctx.createLinearGradient(lightX, lightY, cx, cy)
    gradient.addColorStop(0, 'rgba(200,255,0,0.6)')
    gradient.addColorStop(0.5, 'rgba(200,255,0,0.12)')
    gradient.addColorStop(1, 'rgba(200,255,0,0)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3 * dpr
    ctx.beginPath()
    ctx.moveTo(lightX, lightY)
    ctx.lineTo(cx, cy)
    ctx.stroke()

    // Beam cone
    const beamSpread = 10 * dpr
    const dx = cx - lightX
    const dy = cy - lightY
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 0) {
      const nx = -dy / len
      const ny = dx / len
      const coneGradient = ctx.createLinearGradient(lightX, lightY, cx, cy)
      coneGradient.addColorStop(0, 'rgba(200,255,0,0.3)')
      coneGradient.addColorStop(1, 'rgba(200,255,0,0)')
      ctx.fillStyle = coneGradient
      ctx.beginPath()
      ctx.moveTo(lightX, lightY)
      ctx.lineTo(cx + nx * beamSpread, cy + ny * beamSpread)
      ctx.lineTo(cx - nx * beamSpread, cy - ny * beamSpread)
      ctx.closePath()
      ctx.fill()
    }

    // Glow
    const glowGradient = ctx.createRadialGradient(
      lightX, lightY, 0,
      lightX, lightY, 20 * dpr
    )
    glowGradient.addColorStop(0, 'rgba(200,255,0,0.5)')
    glowGradient.addColorStop(1, 'rgba(200,255,0,0)')
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(lightX, lightY, 20 * dpr, 0, Math.PI * 2)
    ctx.fill()

    // Light dot
    ctx.fillStyle = '#c8ff00'
    ctx.shadowColor = '#c8ff00'
    ctx.shadowBlur = 14 * dpr
    ctx.beginPath()
    ctx.arc(lightX, lightY, 5 * dpr, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  } else {
    // Light is on the back — show a dim indicator on the edge
    // Project to the sphere edge in the direction of the light
    const edgeLen = Math.sqrt(lightProj.sx * lightProj.sx + lightProj.sy * lightProj.sy)
    if (edgeLen > 0) {
      const edgeX = cx + (lightProj.sx / edgeLen) * R
      const edgeY = cy + (lightProj.sy / edgeLen) * R
      const glowGradient = ctx.createRadialGradient(
        edgeX, edgeY, 0,
        edgeX, edgeY, 14 * dpr
      )
      glowGradient.addColorStop(0, 'rgba(200,255,0,0.2)')
      glowGradient.addColorStop(1, 'rgba(200,255,0,0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(edgeX, edgeY, 14 * dpr, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(200,255,0,0.35)'
      ctx.beginPath()
      ctx.arc(edgeX, edgeY, 3 * dpr, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Center dot
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.arc(cx, cy, 2.5 * dpr, 0, Math.PI * 2)
  ctx.fill()
}

export function LightDirectionSphere({
  azimuth,
  elevation,
  onChange,
  size = 200,
}: LightDirectionSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  // Use raw (unclamped) angles for smooth continuous dragging
  const rawAz = useRef(azimuth)
  const rawEl = useRef(elevation)

  // Sync refs when props change externally (e.g. quick-select buttons)
  useEffect(() => {
    if (!isDragging.current) {
      rawAz.current = azimuth
      rawEl.current = elevation
    }
  }, [azimuth, elevation])

  // Set canvas size only when size prop changes
  const dprRef = useRef(1)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
  }, [size])

  // Draw sphere (separate from sizing to avoid flicker on hover)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawSphere3D(ctx, canvas.width, canvas.height, azimuth, elevation, dprRef.current, hovering || dragging)
  }, [azimuth, elevation, size, hovering, dragging])

  const applyDelta = useCallback(
    (dx: number, dy: number) => {
      const sensitivity = 0.7
      rawAz.current += dx * sensitivity
      rawEl.current -= dy * sensitivity
      const { azimuth: az, elevation: el } = normalizeRotation(rawAz.current, rawEl.current)
      // Sync raw refs to normalized values to prevent drift
      rawAz.current = az
      rawEl.current = el
      onChange(az, el)
    },
    [onChange]
  )

  // Mouse
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true
      setDragging(true)
      lastPointer.current = { x: e.clientX, y: e.clientY }
    },
    []
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }
      applyDelta(dx, dy)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      setDragging(false)
      setHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [applyDelta])

  // Touch
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      isDragging.current = true
      setDragging(true)
      lastPointer.current = { x: touch.clientX, y: touch.clientY }
    },
    []
  )

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - lastPointer.current.x
      const dy = touch.clientY - lastPointer.current.y
      lastPointer.current = { x: touch.clientX, y: touch.clientY }
      applyDelta(dx, dy)
    }

    const handleTouchEnd = () => {
      isDragging.current = false
      setDragging(false)
    }

    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [applyDelta])

  const nudge = (dAz: number, dEl: number) => {
    const { azimuth: az, elevation: el } = normalizeRotation(azimuth + dAz, elevation + dEl)
    rawAz.current = az
    rawEl.current = el
    onChange(az, el)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size + 48, height: size + 48 }}>
        {/* Chevron buttons */}
        <button
          className="absolute left-1/2 -translate-x-1/2 top-0 p-1 text-white/30 hover:text-white/60 transition-colors"
          onClick={() => nudge(0, 15)}
          aria-label="Move light up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          className="absolute left-1/2 -translate-x-1/2 bottom-0 p-1 text-white/30 hover:text-white/60 transition-colors"
          onClick={() => nudge(0, -15)}
          aria-label="Move light down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          className="absolute top-1/2 -translate-y-1/2 left-0 p-1 text-white/30 hover:text-white/60 transition-colors"
          onClick={() => nudge(-15, 0)}
          aria-label="Move light left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          className="absolute top-1/2 -translate-y-1/2 right-0 p-1 text-white/30 hover:text-white/60 transition-colors"
          onClick={() => nudge(15, 0)}
          aria-label="Move light right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow duration-200 ${
            dragging
              ? 'cursor-grabbing shadow-[0_0_20px_rgba(200,255,0,0.15)]'
              : hovering
                ? 'cursor-grab shadow-[0_0_12px_rgba(200,255,0,0.08)]'
                : 'cursor-grab'
          }`}
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => { if (!isDragging.current) setHovering(true) }}
          onMouseLeave={() => { if (!isDragging.current) setHovering(false) }}
          onTouchStart={handleTouchStart}
        />
      </div>
      <p className="text-[11px] text-white/40 select-none">
        Drag to rotate light direction
      </p>
    </div>
  )
}
