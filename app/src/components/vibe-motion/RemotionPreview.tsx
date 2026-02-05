'use client'

import { useState, useEffect, useCallback, Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { compileCode } from '@/lib/remotion/compiler'
import { RefreshCw, AlertTriangle } from 'lucide-react'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  { ssr: false }
)

interface RemotionPreviewProps {
  code: string
  durationInSeconds: number
  isGenerating: boolean
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
}: RemotionPreviewProps) {
  const [compiledComponent, setCompiledComponent] = useState<React.FC | null>(null)
  const [compilationError, setCompilationError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)

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

  // Loading / generating state
  if (!code && isGenerating) {
    return (
      <div className="aspect-video w-full rounded-xl bg-card border border-border flex items-center justify-center">
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
      <div className="aspect-video w-full rounded-xl bg-card border border-red-500/30 flex items-center justify-center p-6">
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
      <div className="aspect-video w-full rounded-xl bg-card border border-border flex items-center justify-center">
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
    <div className="w-full rounded-xl overflow-hidden border border-border bg-black">
      <PlayerErrorBoundary onError={setCompilationError}>
        {Player && (
          <Player
            component={compiledComponent}
            compositionWidth={1920}
            compositionHeight={1080}
            durationInFrames={durationInFrames}
            fps={fps}
            controls
            loop
            style={{ width: '100%' }}
            inputProps={{}}
          />
        )}
      </PlayerErrorBoundary>
    </div>
  )
}
