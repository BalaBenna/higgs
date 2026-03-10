'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Brush,
  Eraser,
  Sparkles,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  X,
  ArrowLeftRight,
  Trash2,
  PaintBucket,
  Droplets,
  Circle,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HistoryDialog } from '@/components/generation/HistoryDialog'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

interface InpaintResult {
  id: string
  src: string
  prompt: string
}

export default function InpaintPage() {
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush')
  const [brushSize, setBrushSize] = useState(20)
  const [brushOpacity, setBrushOpacity] = useState(50)
  const [brushHardness, setBrushHardness] = useState(100)
  const [brushColor, setBrushColor] = useState('#ff0000')
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<InpaintResult[]>([])
  const [selectedResult, setSelectedResult] = useState<InpaintResult | null>(null)
  const [zoom, setZoom] = useState(100)
  const [historyOpen, setHistoryOpen] = useState(false)

  // Canvas refs for mask drawing
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Offscreen canvas for smooth semi-transparent strokes
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const savedCanvasState = useRef<ImageData | null>(null)

  // Undo/redo stacks store canvas image data
  const undoStack = useRef<ImageData[]>([])
  const redoStack = useRef<ImageData[]>([])

  // Track image dimensions for canvas sizing
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const imageUpload = useUpload()
  const maskUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  // Init canvas when image loads
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const w = img.naturalWidth
    const h = img.naturalHeight

    // Constrain to max 500px display
    const scale = Math.min(500 / w, 500 / h, 1)
    const dw = Math.round(w * scale)
    const dh = Math.round(h * scale)

    canvas.width = dw
    canvas.height = dh
    setImgSize({ w: dw, h: dh })

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, dw, dh)
      undoStack.current = []
      redoStack.current = []
    }
  }, [])

  // Re-init canvas when image preview changes
  useEffect(() => {
    if (imageUpload.preview) {
      const img = new window.Image()
      img.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = imageUpload.preview!
        }
        // Delay to ensure img element rendered
        requestAnimationFrame(initCanvas)
      }
      img.src = imageUpload.preview
    }
  }, [imageUpload.preview, initCanvas])

  const saveToUndoStack = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    // Limit stack size
    if (undoStack.current.length > 50) undoStack.current.shift()
    redoStack.current = []
  }, [])

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || undoStack.current.length === 0) return
    // Save current state to redo
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    const prev = undoStack.current.pop()!
    ctx.putImageData(prev, 0, 0)
  }, [])

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || redoStack.current.length === 0) return
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    const next = redoStack.current.pop()!
    ctx.putImageData(next, 0, 0)
  }, [])

  const clearMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    saveToUndoStack()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [saveToUndoStack])

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const fillMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    saveToUndoStack()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = hexToRgba(brushColor, brushOpacity / 100)
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [saveToUndoStack, brushColor, brushOpacity])

  const invertMask = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    saveToUndoStack()
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    // For each pixel: if transparent → fill with color, if filled → make transparent
    const r = parseInt(brushColor.slice(1, 3), 16)
    const g = parseInt(brushColor.slice(3, 5), 16)
    const b = parseInt(brushColor.slice(5, 7), 16)
    const a = Math.round(brushOpacity * 2.55)
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        data[i + 3] = 0
      } else {
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = a
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [saveToUndoStack, brushColor, brushOpacity])

  // Draw a segment on the offscreen canvas (full opacity, no overlap issues)
  const drawStrokeSegment = (x: number, y: number, fromX?: number, fromY?: number) => {
    const offscreen = offscreenCanvasRef.current
    if (!offscreen) return
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'source-over'

    // Draw with full opacity on offscreen — opacity is applied during compositing
    if (activeTool === 'brush') {
      ctx.strokeStyle = brushColor
      if (brushHardness < 100) {
        ctx.shadowBlur = ((100 - brushHardness) / 100) * brushSize
        ctx.shadowColor = brushColor
      } else {
        ctx.shadowBlur = 0
      }
    } else {
      ctx.strokeStyle = '#ffffff'
      ctx.shadowBlur = 0
    }

    ctx.beginPath()
    if (fromX !== undefined && fromY !== undefined) {
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(x, y)
    } else {
      // Single dot
      ctx.moveTo(x, y)
      ctx.lineTo(x + 0.1, y)
    }
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Composite the offscreen stroke onto the main canvas with proper opacity
  const compositeStroke = () => {
    const canvas = canvasRef.current
    const offscreen = offscreenCanvasRef.current
    if (!canvas || !offscreen || !savedCanvasState.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Restore main canvas to the state before the stroke began
    ctx.putImageData(savedCanvasState.current, 0, 0)

    if (activeTool === 'brush') {
      ctx.globalAlpha = brushOpacity / 100
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(offscreen, 0, 0)
      ctx.globalAlpha = 1
    } else {
      // Eraser: use offscreen as erase mask
      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(offscreen, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    isDrawing.current = true
    saveToUndoStack()

    // Save current canvas state before this stroke
    savedCanvasState.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Create/reset offscreen canvas
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas')
    }
    offscreenCanvasRef.current.width = canvas.width
    offscreenCanvasRef.current.height = canvas.height

    const pos = getCanvasPos(e)
    lastPos.current = pos
    drawStrokeSegment(pos.x, pos.y)
    compositeStroke()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const pos = getCanvasPos(e)
    const prev = lastPos.current
    drawStrokeSegment(pos.x, pos.y, prev?.x, prev?.y)
    compositeStroke()
    lastPos.current = pos
  }

  const handleMouseUp = () => {
    isDrawing.current = false
    lastPos.current = null
    savedCanvasState.current = null
  }

  // Upload the mask as a separate image file
  const uploadMaskImage = async (): Promise<string | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Check if there's any mask data drawn
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let hasMask = false
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) {
        hasMask = true
        break
      }
    }
    if (!hasMask) return null

    // Get original image dimensions so the mask matches
    const img = imgRef.current
    const origW = img?.naturalWidth || canvas.width
    const origH = img?.naturalHeight || canvas.height

    // Create a small mask at canvas resolution first (white where painted, black elsewhere)
    const smallMask = document.createElement('canvas')
    smallMask.width = canvas.width
    smallMask.height = canvas.height
    const smallCtx = smallMask.getContext('2d')
    if (!smallCtx) return null

    smallCtx.fillStyle = 'black'
    smallCtx.fillRect(0, 0, smallMask.width, smallMask.height)

    const maskData = smallCtx.getImageData(0, 0, smallMask.width, smallMask.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        maskData.data[i] = 255
        maskData.data[i + 1] = 255
        maskData.data[i + 2] = 255
        maskData.data[i + 3] = 255
      }
    }
    smallCtx.putImageData(maskData, 0, 0)

    // Scale mask up to match original image dimensions
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = origW
    maskCanvas.height = origH
    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) return null

    maskCtx.imageSmoothingEnabled = false
    maskCtx.drawImage(smallMask, 0, 0, origW, origH)

    // Convert to blob and upload
    return new Promise<string | null>((resolve) => {
      maskCanvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        const file = new File([blob], 'mask.png', { type: 'image/png' })
        const result = await maskUpload.upload(file)
        resolve(result?.url || null)
      }, 'image/png')
    })
  }

  const handleGenerate = async () => {
    if (!imageUpload.filename) {
      toast.error('Please upload an image first')
      return
    }

    if (!prompt.trim()) {
      toast.error('Please describe what to inpaint')
      return
    }

    try {
      // Upload mask if user has drawn one
      const maskFilename = await uploadMaskImage()

      const inputImages = [imageUpload.url!]
      if (maskFilename) {
        inputImages.push(maskFilename)
      }

      const result = await featureGeneration.mutateAsync({
        featureType: 'inpaint',
        inputImages,
        prompt,
        params: {
          brush_size: brushSize,
          has_mask: !!maskFilename,
        },
      })

      if (result) {
        const newResult: InpaintResult = {
          id: result.id || `inp_${Date.now()}`,
          src: result.url || result.src || '',
          prompt,
        }
        setResults((prev) => [newResult, ...prev])
        setSelectedResult(newResult)
        toast.success('Inpainting completed!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Inpainting failed'
      toast.error(message)
    }
  }

  const canGenerate =
    !!imageUpload.filename &&
    !!prompt.trim() &&
    !featureGeneration.isPending

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Tools */}
      <div className="w-72 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4">Inpainting Tools</h2>

              {/* Image Upload */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Source Image</label>
                <input
                  ref={imageUpload.fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={imageUpload.handleFileSelect}
                />
                {!imageUpload.preview ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${imageUpload.isDragging
                      ? 'border-neon bg-neon/10'
                      : 'border-border hover:border-neon/50'
                      }`}
                    onClick={imageUpload.openFilePicker}
                    {...imageUpload.dropZoneProps}
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Drop image here or click to upload
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imageUpload.preview}
                      alt="Source"
                      className="w-full rounded-lg object-contain max-h-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={imageUpload.clear}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Badge variant="new" className="absolute bottom-1 left-1 text-[10px]">
                      Uploaded
                    </Badge>
                  </div>
                )}
              </div>

              {/* Brush Tools */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={activeTool === 'brush' ? 'secondary' : 'outline'}
                    size="sm"
                    className={`flex-1 gap-2 ${activeTool === 'brush' ? 'border-neon/50 bg-neon/10' : ''
                      }`}
                    onClick={() => setActiveTool('brush')}
                  >
                    <Brush className="h-4 w-4" />
                    Brush
                  </Button>
                  <Button
                    variant={activeTool === 'eraser' ? 'secondary' : 'outline'}
                    size="sm"
                    className={`flex-1 gap-2 ${activeTool === 'eraser' ? 'border-neon/50 bg-neon/10' : ''
                      }`}
                    onClick={() => setActiveTool('eraser')}
                  >
                    <Eraser className="h-4 w-4" />
                    Eraser
                  </Button>
                </div>

                {/* Brush Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Brush Size</label>
                    <Badge variant="secondary">{brushSize}px</Badge>
                  </div>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([v]) => setBrushSize(v)}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Brush Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5" />
                      Opacity
                    </label>
                    <Badge variant="secondary">{brushOpacity}%</Badge>
                  </div>
                  <Slider
                    value={[brushOpacity]}
                    onValueChange={([v]) => setBrushOpacity(v)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Brush Hardness */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Circle className="h-3.5 w-3.5" />
                      Hardness
                    </label>
                    <Badge variant="secondary">{brushHardness}%</Badge>
                  </div>
                  <Slider
                    value={[brushHardness]}
                    onValueChange={([v]) => setBrushHardness(v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Mask Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mask Color</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {['#ff0000', '#00ff00', '#0066ff', '#ff00ff', '#ffaa00', '#ffffff'].map((c) => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${brushColor === c
                              ? 'border-foreground scale-110 ring-1 ring-foreground/30'
                              : 'border-border hover:border-foreground/50'
                            }`}
                          style={{ backgroundColor: c }}
                          onClick={() => setBrushColor(c)}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-border bg-transparent"
                      title="Custom color"
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                {imageUpload.preview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Actions</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs px-2"
                        onClick={fillMask}
                        title="Fill entire image with mask"
                      >
                        <PaintBucket className="h-3.5 w-3.5" />
                        Fill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs px-2"
                        onClick={invertMask}
                        title="Invert the mask"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        Invert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs px-2"
                        onClick={clearMask}
                        title="Clear all mask"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Replacement Prompt</label>
                  <Textarea
                    placeholder="Describe what should replace the masked area..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="neon"
            className="w-full gap-2"
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {featureGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Inpainting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Inpaint
              </>
            )}
          </Button>
          <HistoryDialog
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            featureType="inpaint"
            title="Inpaint History"
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(400, z + 25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {imageUpload.preview && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={imageUpload.openFilePicker}
              >
                <Upload className="h-3 w-3" />
                Replace Image
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-background p-8 overflow-auto">
          {imageUpload.preview ? (
            <div className="flex gap-6 items-start">
              {/* Original Image with mask overlay */}
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary" className="mb-1">
                  Original — Paint mask on areas to edit
                </Badge>
                <motion.div
                  className="relative rounded-xl overflow-hidden border border-border shadow-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                  <img
                    ref={imgRef}
                    src={imageUpload.preview}
                    alt="Source image"
                    className="block max-w-[500px] max-h-[500px] object-contain select-none pointer-events-none"
                    onLoad={initCanvas}
                    draggable={false}
                  />
                  {/* Mask drawing canvas overlaid on top */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      cursor: activeTool === 'brush'
                        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${Math.max(4, brushSize)}' height='${Math.max(4, brushSize)}' viewBox='0 0 ${Math.max(4, brushSize)} ${Math.max(4, brushSize)}'%3E%3Ccircle cx='${Math.max(4, brushSize) / 2}' cy='${Math.max(4, brushSize) / 2}' r='${Math.max(4, brushSize) / 2 - 1}' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E") ${Math.max(4, brushSize) / 2} ${Math.max(4, brushSize) / 2}, crosshair`
                        : 'crosshair',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </motion.div>
              </div>

              {/* Arrow between images */}
              {selectedResult && (
                <div className="flex items-center pt-20">
                  <ArrowLeftRight className="h-6 w-6 text-neon" />
                </div>
              )}

              {/* Result Image */}
              {selectedResult && (
                <div className="flex flex-col items-center gap-2">
                  <Badge variant="new" className="mb-1">Result</Badge>
                  <motion.div
                    className="relative rounded-xl overflow-hidden border border-neon/30 shadow-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  >
                    <Image
                      src={selectedResult.src}
                      alt={selectedResult.prompt}
                      width={500}
                      height={500}
                      className="max-w-[500px] max-h-[500px] object-contain"
                      unoptimized
                    />
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${imageUpload.isDragging
                ? 'border-neon bg-neon/10'
                : 'border-border hover:border-neon/50'
                }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={imageUpload.openFilePicker}
              {...imageUpload.dropZoneProps}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload an image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drop image here or click to start inpainting
              </p>
              <Button variant="outline">Select Image</Button>
            </motion.div>
          )}
        </div>

        {/* Results strip at bottom */}
        {results.length > 0 && (
          <div className="border-t border-border p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Session Results</h3>
              <Badge variant="secondary">{results.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${selectedResult?.id === result.id
                    ? 'border-neon'
                    : 'border-border hover:border-neon/50'
                    }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <Image
                    src={result.src}
                    alt={result.prompt}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
