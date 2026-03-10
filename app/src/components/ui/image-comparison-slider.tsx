'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageComparisonSliderProps {
    beforeSrc: string
    afterSrc: string
    beforeLabel?: string
    afterLabel?: string
    className?: string
}

export function ImageComparisonSlider({
    beforeSrc,
    afterSrc,
    beforeLabel = 'Original',
    afterLabel = 'Upscaled',
    className,
}: ImageComparisonSliderProps) {
    const [position, setPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const updatePosition = useCallback((clientX: number) => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const x = clientX - rect.left
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setPosition(pct)
    }, [])

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            setIsDragging(true)
            updatePosition(e.clientX)
        },
        [updatePosition]
    )

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            setIsDragging(true)
            updatePosition(e.touches[0].clientX)
        },
        [updatePosition]
    )

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX)
        const handleTouchMove = (e: TouchEvent) => updatePosition(e.touches[0].clientX)
        const handleEnd = () => setIsDragging(false)

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleEnd)
        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('touchend', handleEnd)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleEnd)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [isDragging, updatePosition])

    if (!beforeSrc || !afterSrc) return null

    const content = (
        <div
            ref={containerRef}
            className={cn(
                'relative select-none overflow-hidden rounded-xl border border-border bg-card cursor-col-resize',
                isFullscreen ? 'w-full h-full rounded-none border-0' : 'aspect-video',
                className
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* After image (full, behind) */}
            <img
                src={afterSrc}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                draggable={false}
            />

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeLabel}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    draggable={false}
                />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
                {/* Handle circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center pointer-events-none">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 10L3 7M3 7L6 4M3 7H9M14 10L17 7M17 7L14 4M17 7H11M14 16L17 13M17 13L14 10M3 13L6 16M6 16L3 13M3 10L6 13"
                            stroke="#333"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                    {beforeLabel}
                </span>
            </div>
            <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                    {afterLabel}
                </span>
            </div>

            {/* Fullscreen toggle */}
            {!isFullscreen && (
                <button
                    type="button"
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-sm flex items-center gap-1.5 hover:bg-black/80 transition-colors cursor-pointer"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsFullscreen(true)
                    }}
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Fullscreen
                </button>
            )}
        </div>
    )

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                onClick={(e) => {
                    if (e.target === e.currentTarget) setIsFullscreen(false)
                }}
            >
                <button
                    type="button"
                    className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                    onClick={() => setIsFullscreen(false)}
                >
                    Close
                </button>
                {content}
            </div>
        )
    }

    return content
}
