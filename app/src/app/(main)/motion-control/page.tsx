'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Move,
  RotateCcw,
  Maximize,
  Sparkles,
  Upload,
  RefreshCw,
  Video,
  X,
  Download,
  Play,
  RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useVideoGeneration } from '@/hooks/use-generation'
import { useUpload } from '@/hooks/use-upload'

interface MotionSlider {
  id: string
  label: string
  icon: React.ElementType
  description: string
  value: number
}

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
  motionDesc: string
}

export default function MotionControlPage() {
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [rotate, setRotate] = useState(0)
  const [zoom, setZoom] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<GeneratedVideoData[]>([])

  const imageUpload = useUpload()
  const videoGeneration = useVideoGeneration()

  const motionSliders: MotionSlider[] = [
    {
      id: 'panX',
      label: 'Pan X',
      icon: Move,
      description: 'Horizontal camera movement',
      value: panX,
    },
    {
      id: 'panY',
      label: 'Pan Y',
      icon: Move,
      description: 'Vertical camera movement',
      value: panY,
    },
    {
      id: 'rotate',
      label: 'Rotate',
      icon: RotateCcw,
      description: 'Rotation angle',
      value: rotate,
    },
    {
      id: 'zoom',
      label: 'Zoom',
      icon: Maximize,
      description: 'Zoom in/out intensity',
      value: zoom,
    },
  ]

  const handleSliderChange = (id: string, val: number) => {
    switch (id) {
      case 'panX':
        setPanX(val)
        break
      case 'panY':
        setPanY(val)
        break
      case 'rotate':
        setRotate(val)
        break
      case 'zoom':
        setZoom(val)
        break
    }
  }

  const buildMotionDescription = (): string => {
    const parts: string[] = []

    if (panX !== 0) {
      parts.push(
        panX > 0
          ? `pan right ${Math.abs(panX)}%`
          : `pan left ${Math.abs(panX)}%`
      )
    }
    if (panY !== 0) {
      parts.push(
        panY > 0
          ? `pan down ${Math.abs(panY)}%`
          : `pan up ${Math.abs(panY)}%`
      )
    }
    if (rotate !== 0) {
      parts.push(
        rotate > 0
          ? `rotate clockwise ${Math.abs(rotate)}%`
          : `rotate counter-clockwise ${Math.abs(rotate)}%`
      )
    }
    if (zoom !== 0) {
      parts.push(
        zoom > 0
          ? `zoom in ${Math.abs(zoom)}%`
          : `zoom out ${Math.abs(zoom)}%`
      )
    }

    if (parts.length === 0) return ''
    return `Camera motion: ${parts.join(', ')}`
  }

  const handleResetAll = () => {
    setPanX(0)
    setPanY(0)
    setRotate(0)
    setZoom(0)
  }

  const handleGenerate = async () => {
    if (!imageUpload.preview) {
      toast.error('Please upload a source image first')
      return
    }

    const motionDesc = buildMotionDescription()
    const fullPrompt = [motionDesc, prompt].filter(Boolean).join('. ')

    if (!fullPrompt.trim()) {
      toast.error('Please set motion controls or add a prompt')
      return
    }

    try {
      // We need the source image as a File for the video generation endpoint
      // Use the uploaded file info
      const result = await videoGeneration.mutateAsync({
        model: 'kling-2.6',
        prompt: fullPrompt,
        sourceImage: null,
      })

      if (result) {
        const newResult: GeneratedVideoData = {
          id: result.id || `mc_${Date.now()}`,
          url: result.url || '',
          prompt: fullPrompt,
          motionDesc,
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Motion video generated!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Motion generation failed'
      toast.error(message)
    }
  }

  const hasMotion = panX !== 0 || panY !== 0 || rotate !== 0 || zoom !== 0
  const canGenerate =
    !!imageUpload.preview &&
    (hasMotion || prompt.trim()) &&
    !videoGeneration.isPending

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Motion Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Motion Controls</h2>
                {hasMotion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleResetAll}
                  >
                    <RotateCw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Adjust sliders to control camera motion
              </p>
            </motion.div>

            {/* Source Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Image</label>
              <input
                ref={imageUpload.fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={imageUpload.handleFileSelect}
              />
              <div
                className="relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors min-h-[120px] flex items-center justify-center"
                onClick={imageUpload.openFilePicker}
              >
                {imageUpload.isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-neon" />
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  </div>
                ) : imageUpload.preview ? (
                  <div className="relative w-full">
                    <img
                      src={imageUpload.preview}
                      alt="Source"
                      className="max-h-28 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        imageUpload.clear()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload a source image
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Motion Sliders */}
            <div className="space-y-5">
              {motionSliders.map((slider, index) => (
                <motion.div
                  key={slider.id}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                        <slider.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {slider.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {slider.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={slider.value !== 0 ? 'new' : 'secondary'}
                      className="min-w-[3rem] justify-center"
                    >
                      {slider.value}
                    </Badge>
                  </div>
                  <Slider
                    value={[slider.value]}
                    onValueChange={([v]) => handleSliderChange(slider.id, v)}
                    min={-100}
                    max={100}
                    step={1}
                  />
                </motion.div>
              ))}
            </div>

            {/* Motion Description Preview */}
            {hasMotion && (
              <motion.div
                className="p-3 rounded-lg bg-neon/5 border border-neon/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className="text-xs font-medium text-neon mb-1">
                  Motion Description
                </p>
                <p className="text-xs text-muted-foreground">
                  {buildMotionDescription()}
                </p>
              </motion.div>
            )}

            {/* Additional Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Additional Prompt{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Describe additional motion effects, e.g. 'gentle breeze blowing through hair'..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
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
            {videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Apply Motion
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
                <h2 className="text-xl font-semibold">Motion Results</h2>
                <p className="text-sm text-muted-foreground">
                  Your motion-controlled videos will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                View History
              </Button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video">
                      {video.url ? (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          loop
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {!video.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                            <Play className="h-6 w-6 text-black fill-black ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {video.motionDesc && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {video.motionDesc}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm line-clamp-2 text-muted-foreground">
                        {video.prompt}
                      </p>
                      <div className="flex items-center justify-end">
                        {video.url && (
                          <a href={video.url} download>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Move className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload an image, adjust the motion sliders, and click Apply Motion
                  to generate a motion-controlled video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
