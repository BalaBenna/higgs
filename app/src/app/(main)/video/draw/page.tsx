'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Pencil,
  Video,
  RefreshCw,
  Download,
  Eraser,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useVideoGeneration } from '@/hooks/use-generation'
import { useUpload } from '@/hooks/use-upload'

const VIDEO_MODELS = [
  { id: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', quality: 'High' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', quality: 'High' },
  { id: 'hailuo-o2', name: 'Minimax Hailuo O2', provider: 'MiniMax', quality: 'High' },
]

const PEN_COLORS = [
  { id: 'black', color: '#000000', label: 'Black' },
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'green', color: '#22c55e', label: 'Green' },
]

const DURATIONS = [
  { id: '5', label: '5 seconds' },
  { id: '10', label: '10 seconds' },
]

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
}

export default function DrawToVideoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-2.6')
  const [duration, setDuration] = useState('5')
  const [penColor, setPenColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])

  const videoGeneration = useVideoGeneration()
  const uploader = useUpload()

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    isDrawingRef.current = true
    const pos = getCanvasPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [getCanvasPos])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const pos = getCanvasPos(e)
    ctx.strokeStyle = penColor
    ctx.lineWidth = lineWidth
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [getCanvasPos, penColor, lineWidth])

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the animation you want')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )
      if (!blob) {
        toast.error('Failed to capture drawing')
        return
      }

      const file = new File([blob], 'drawing.png', { type: 'image/png' })

      // Upload the drawing first
      const uploadResult = await uploader.upload(file)
      if (!uploadResult) {
        toast.error('Failed to upload drawing')
        return
      }

      const result = await videoGeneration.mutateAsync({
        model,
        prompt: `Animate this drawing into a video: ${prompt}`,
        duration: parseInt(duration),
        sourceImage: file,
      })

      if (result) {
        const selectedModel = VIDEO_MODELS.find((m) => m.id === model)
        const newVideo: GeneratedVideoData = {
          id: result.id || `draw_${Date.now()}`,
          url: result.url || '',
          prompt,
          duration: `${duration}s`,
          model: selectedModel?.name || model,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Video generated from drawing!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Draw to Video</h2>
            </div>

            {/* Drawing Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Drawing Canvas</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={clearCanvas}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair"
                  style={{ height: '220px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>

            {/* Pen Colors */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pen Color</label>
              <div className="flex gap-2">
                {PEN_COLORS.map((pen) => (
                  <button
                    key={pen.id}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      penColor === pen.color
                        ? 'border-neon scale-110'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: pen.color }}
                    onClick={() => setPenColor(pen.color)}
                    title={pen.label}
                  />
                ))}
                <button
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    penColor === '#ffffff'
                      ? 'border-neon scale-110'
                      : 'border-border hover:border-muted-foreground'
                  } bg-white`}
                  onClick={() => setPenColor('#ffffff')}
                  title="Eraser"
                >
                  <Eraser className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Line Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Width</label>
                <Badge variant="secondary">{lineWidth}px</Badge>
              </div>
              <Slider
                value={[lineWidth]}
                onValueChange={([v]) => setLineWidth(v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Animation Description</label>
              <Textarea
                placeholder="Describe how the drawing should animate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d.id}
                    variant={duration === d.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={duration === d.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setDuration(d.id)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <div>
                          <span>{m.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {m.provider}
                          </span>
                        </div>
                        {m.quality && (
                          <Badge variant="secondary" className="text-[10px]">
                            {m.quality}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!prompt.trim() || videoGeneration.isPending || uploader.isUploading}
          >
            {videoGeneration.isPending || uploader.isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {uploader.isUploading ? 'Uploading...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~2-5 minutes generation time
          </p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Generated Videos</h2>
                <p className="text-sm text-muted-foreground">
                  Your drawing animations will appear here
                </p>
              </div>
            </div>

            {generatedVideos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {generatedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="space-y-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50">
                      {video.url ? (
                        <video
                          src={video.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.model}
                        </Badge>
                        <Badge className="bg-black/70 text-white text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                      {video.url && (
                        <a href={video.url} download>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.prompt}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Pencil className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Draw something on the canvas, describe the animation, and generate a video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
