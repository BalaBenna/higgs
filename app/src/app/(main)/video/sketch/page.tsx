'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  PenTool,
  Video,
  Upload,
  RefreshCw,
  Download,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

const VIDEO_MODELS = [
  { id: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', quality: 'High' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', quality: 'High' },
  { id: 'hailuo-o2', name: 'Minimax Hailuo O2', provider: 'MiniMax', quality: 'High' },
]

const STYLES = [
  { id: 'realistic', label: 'Realistic' },
  { id: 'anime', label: 'Anime' },
  { id: '3d', label: '3D' },
  { id: 'watercolor', label: 'Watercolor' },
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
  style: string
}

export default function SketchToVideoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('realistic')
  const [model, setModel] = useState('kling-2.6')
  const [duration, setDuration] = useState('5')
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])

  const videoGeneration = useVideoGeneration()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSourceImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setSourceImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSourceImage(null)
    setSourceImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe what the video should show')
      return
    }
    if (!sourceImage) {
      toast.error('Please upload a sketch image')
      return
    }

    const selectedStyle = STYLES.find((s) => s.id === style)?.label || style
    const prompt = `Transform this ${selectedStyle.toLowerCase()} sketch into a video: ${description}`

    try {
      const result = await videoGeneration.mutateAsync({
        model,
        prompt,
        duration: parseInt(duration),
        sourceImage,
      })

      if (result) {
        const selectedModel = VIDEO_MODELS.find((m) => m.id === model)
        const newVideo: GeneratedVideoData = {
          id: result.id || `sketch_${Date.now()}`,
          url: result.url || '',
          prompt: description,
          duration: `${duration}s`,
          model: selectedModel?.name || model,
          style: selectedStyle,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Video generated from sketch!')
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
              <PenTool className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Sketch to Video</h2>
            </div>

            {/* Sketch Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sketch Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-neon/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {sourceImagePreview ? (
                  <div className="relative">
                    <img
                      src={sourceImagePreview}
                      alt="Sketch preview"
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload sketch or drawing</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what the video should show..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <Button
                    key={s.id}
                    variant={style === s.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={style === s.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setStyle(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
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
            disabled={!description.trim() || !sourceImage || videoGeneration.isPending}
          >
            {videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
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
                  Your sketch-to-video results will appear here
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
                        <Badge variant="neon" className="text-xs">
                          {video.style}
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
                  <PenTool className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload a sketch, choose a style, and transform it into a video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
