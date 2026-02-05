'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Factory,
  RefreshCw,
  Video,
  Play,
  Download,
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

const UGC_STYLES = [
  { id: 'testimonial', label: 'Testimonial', desc: 'Customer review style' },
  { id: 'unboxing', label: 'Unboxing', desc: 'Product reveal' },
  { id: 'tutorial', label: 'Tutorial', desc: 'How-to content' },
  { id: 'review', label: 'Review', desc: 'Honest product review' },
  { id: 'lifestyle', label: 'Lifestyle', desc: 'Day-in-the-life' },
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
  ugcStyle: string
}

export default function UGCFactoryPage() {
  const [script, setScript] = useState('')
  const [ugcStyle, setUgcStyle] = useState('testimonial')
  const [duration, setDuration] = useState('5')
  const [model, setModel] = useState('kling-2.6')
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])

  const videoGeneration = useVideoGeneration()

  const selectedUgcStyle = UGC_STYLES.find((s) => s.id === ugcStyle)

  const handleGenerate = async () => {
    if (!script.trim()) {
      toast.error('Please enter a script or description')
      return
    }

    const ugcLabel = selectedUgcStyle?.label || 'Testimonial'
    const fullPrompt = `User-generated content style ${ugcLabel} video: ${script}. Authentic, casual filming style, smartphone camera quality, natural lighting, genuine and relatable`

    try {
      const result = await videoGeneration.mutateAsync({
        model,
        prompt: fullPrompt,
        duration: parseInt(duration),
        aspectRatio: '9:16',
      })

      if (result) {
        const newVideo: GeneratedVideoData = {
          id: result.id || `ugc_${Date.now()}`,
          url: result.url || '',
          prompt: script,
          duration: `${duration}s`,
          model: VIDEO_MODELS.find((m) => m.id === model)?.name || model,
          ugcStyle: ugcLabel,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('UGC video generated successfully!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed'
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
              <Factory className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">UGC Factory</h2>
            </div>

            {/* Script / Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Script / Description</label>
              <Textarea
                placeholder="Write your UGC script... e.g., Someone excitedly opening a package, showing off a new skincare product, applying it, and reacting to how smooth their skin feels"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-[140px] resize-none"
              />
            </div>

            {/* UGC Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">UGC Style</label>
              <div className="space-y-2">
                {UGC_STYLES.map((s) => (
                  <Button
                    key={s.id}
                    variant={ugcStyle === s.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${
                      ugcStyle === s.id ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => setUgcStyle(s.id)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.desc}
                      </span>
                    </div>
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
                    className={
                      duration === d.id ? 'border-neon/50 bg-neon/10' : ''
                    }
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
                        <Badge variant="secondary" className="text-[10px]">
                          {m.quality}
                        </Badge>
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
            disabled={!script.trim() || videoGeneration.isPending}
          >
            {videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate UGC
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~2-5 minutes generation time
          </p>
        </div>
      </div>

      {/* Right Panel - Generated Videos */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Generated UGC</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated UGC videos will appear here
                </p>
              </div>
              {generatedVideos.length > 0 && (
                <Badge variant="secondary">
                  {generatedVideos.length} video{generatedVideos.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Generated Videos */}
            {generatedVideos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {generatedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-[9/16] max-h-[400px]">
                      {video.url ? (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseLeave={(e) => {
                            const el = e.target as HTMLVideoElement
                            el.pause()
                            el.currentTime = 0
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                          <Play className="h-6 w-6 text-black fill-black ml-1" />
                        </div>
                      </div>
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className="bg-black/70 text-white text-xs">
                          {video.ugcStyle}
                        </Badge>
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                        {video.duration}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm line-clamp-2">{video.prompt}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {video.model}
                        </Badge>
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
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No UGC videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Write a script, pick a UGC style, and generate your
                  authentic content
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
