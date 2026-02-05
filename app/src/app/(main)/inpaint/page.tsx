'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

interface InpaintResult {
  id: string
  src: string
  prompt: string
}

export default function InpaintPage() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [brushSize, setBrushSize] = useState(20)
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<InpaintResult[]>([])
  const [selectedResult, setSelectedResult] = useState<InpaintResult | null>(null)
  const [zoom, setZoom] = useState(100)

  const imageUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

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
      const result = await featureGeneration.mutateAsync({
        featureType: 'inpaint',
        inputImages: [imageUpload.filename],
        prompt,
        params: {
          brush_size: brushSize,
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
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors"
                    onClick={imageUpload.openFilePicker}
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload image to edit
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
                    variant={tool === 'brush' ? 'secondary' : 'outline'}
                    size="sm"
                    className={`flex-1 gap-2 ${
                      tool === 'brush' ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => setTool('brush')}
                  >
                    <Brush className="h-4 w-4" />
                    Brush
                  </Button>
                  <Button
                    variant={tool === 'eraser' ? 'secondary' : 'outline'}
                    size="sm"
                    className={`flex-1 gap-2 ${
                      tool === 'eraser' ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => setTool('eraser')}
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
        <div className="p-4 border-t border-border">
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
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
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

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-background p-8 overflow-auto">
          {imageUpload.preview ? (
            <div className="flex gap-6 items-start">
              {/* Original Image */}
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary" className="mb-1">Original</Badge>
                <motion.div
                  className="relative rounded-xl overflow-hidden border border-border shadow-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                  <img
                    src={imageUpload.preview}
                    alt="Source image"
                    className="max-w-[500px] max-h-[500px] object-contain"
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
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={imageUpload.openFilePicker}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload an image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select an image to start inpainting
              </p>
              <Button variant="outline">Select Image</Button>
            </motion.div>
          )}
        </div>

        {/* Results strip at bottom */}
        {results.length > 0 && (
          <div className="border-t border-border p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">History</h3>
              <Badge variant="secondary">{results.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedResult?.id === result.id
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
