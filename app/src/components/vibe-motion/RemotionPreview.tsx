'use client'

import { useState, useEffect, useCallback, useRef, Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { compileCode } from '@/lib/remotion/compiler'
import { RefreshCw, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { PlayerRef } from '@remotion/player'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  { ssr: false }
)

interface RemotionPreviewProps {
  code: string
  durationInSeconds: number
  isGenerating: boolean
  width?: number
  height?: number
}

// Error boundary for runtime React errors in the Player
class PlayerErrorBoundary extends Component<
  { children: ReactNode; onError: (error: string) => void },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode; onError: (error: string) => void }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message)
  }

  componentDidUpdate(prevProps: { children: ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: '' })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-red-950/20 p-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-400 mb-2">Runtime Error</p>
            <p className="text-xs text-red-300/70 font-mono break-all">
              {this.state.error}
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function RemotionPreview({
  code,
  durationInSeconds,
  isGenerating,
  width = 1920,
  height = 1080,
}: RemotionPreviewProps) {
  const [compiledComponent, setCompiledComponent] = useState<React.FC | null>(null)
  const [compilationError, setCompilationError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const playerRef = useRef<PlayerRef>(null)

  const compile = useCallback(async (rawCode: string) => {
    if (!rawCode.trim()) {
      setCompiledComponent(null)
      setCompilationError(null)
      return
    }
    setIsCompiling(true)
    const result = await compileCode(rawCode)
    setCompiledComponent(() => result.Component)
    setCompilationError(result.error)
    setIsCompiling(false)
  }, [])

  useEffect(() => {
    // Debounce compilation during streaming — compile when code stops changing
    const timer = setTimeout(() => {
      compile(code)
    }, 300)
    return () => clearTimeout(timer)
  }, [code, compile])

  const fps = 30
  const effectiveDuration = durationInSeconds > 0 ? durationInSeconds : 10
  const durationInFrames = Math.max(1, effectiveDuration * fps)

  const handleDownload = useCallback(async () => {
    const player = playerRef.current
    if (!player || !code.trim()) return

    setIsDownloading(true)
    try {
      // Find the canvas inside the player container
      const playerContainer = (player as unknown as { getContainerNode: () => HTMLDivElement | null }).getContainerNode?.()
      const canvas = playerContainer?.querySelector('canvas')

      if (canvas) {
        // Canvas-based recording
        const stream = canvas.captureStream(fps)
        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 8_000_000,
        })
        const chunks: Blob[] = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data)
        }

        const recordingDone = new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            resolve(new Blob(chunks, { type: 'video/webm' }))
          }
        })

        // Seek to beginning and play
        player.seekTo(0)
        player.play()
        recorder.start()

        // Wait for playback to finish
        await new Promise<void>((resolve) => {
          const checkEnd = setInterval(() => {
            const frame = player.getCurrentFrame()
            if (frame >= durationInFrames - 1) {
              clearInterval(checkEnd)
              resolve()
            }
          }, 100)
        })

        recorder.stop()
        player.pause()

        const blob = await recordingDone
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `motion-${width}x${height}-${Date.now()}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Video downloaded as WebM')
      } else {
        // Fallback: try server-side rendering
        const response = await fetch('/api/render-motion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, width, height, fps, durationInFrames }),
        })

        if (!response.ok) {
          let errorMsg = 'Download not available'
          try {
            const data = await response.json()
            errorMsg = data.error || errorMsg
          } catch {
            errorMsg = await response.text()
          }
          throw new Error(errorMsg)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `motion-${width}x${height}-${Date.now()}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Video downloaded successfully')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed'
      toast.error(message)
    } finally {
      setIsDownloading(false)
    }
  }, [code, width, height, fps, durationInFrames])

  // Loading / generating state
  if (!code && isGenerating) {
    return (
      <div
        className="w-full rounded-xl bg-card border border-border flex items-center justify-center"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-neon mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Generating motion graphics...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!code && !isGenerating) {
    return null
  }

  // Compilation error
  if (compilationError) {
    return (
      <div
        className="w-full rounded-xl bg-card border border-red-500/30 flex items-center justify-center p-6"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <div className="text-center max-w-lg">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-400 mb-2">Compilation Error</p>
          <p className="text-xs text-muted-foreground font-mono break-all whitespace-pre-wrap">
            {compilationError}
          </p>
        </div>
      </div>
    )
  }

  // Still compiling
  if (isCompiling || !compiledComponent) {
    return (
      <div
        className="w-full rounded-xl bg-card border border-border flex items-center justify-center"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <div className="text-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {isGenerating ? 'Compiling preview...' : 'Compiling...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="w-full rounded-xl overflow-hidden border border-border bg-black">
        <PlayerErrorBoundary onError={setCompilationError}>
          {Player && (
            <Player
              ref={playerRef}
              component={compiledComponent}
              compositionWidth={width}
              compositionHeight={height}
              durationInFrames={durationInFrames}
              fps={fps}
              controls
              loop
              style={{ width: '100%', aspectRatio: `${width}/${height}` }}
              inputProps={{}}
            />
          )}
        </PlayerErrorBoundary>
      </div>
      {compiledComponent !== null && !isGenerating && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download Video
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
