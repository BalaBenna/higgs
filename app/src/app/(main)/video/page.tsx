'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Video,
  Settings2,
  Upload,
  Play,
  Download,
  RefreshCw,
  ChevronDown,
  ImageIcon,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const VIDEO_MODELS = [
  { id: 'higgsfield-dop', name: 'Higgsfield DOP', provider: 'Higgsfield', isComingSoon: true },
  { id: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', quality: 'High', toolId: 'generate_video_by_kling_v2_jaaz' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra', toolId: 'generate_video_by_veo3_fast_jaaz' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', quality: 'High', toolId: 'generate_video_by_seedance_v1_jaaz' },
  { id: 'hailuo-o2', name: 'Minimax Hailuo O2', provider: 'MiniMax', quality: 'High', toolId: 'generate_video_by_hailuo_02_jaaz' },
  { id: 'grok-imagine', name: 'Grok Imagine', provider: 'xAI', badge: 'new', isComingSoon: true },
  { id: 'kling-motion-control', name: 'Kling Motion Control', provider: 'Kuaishou', badge: 'new', isComingSoon: true },
  { id: 'sora-2', name: 'Sora 2', provider: 'OpenAI', isComingSoon: true },
  { id: 'wan-2.6', name: 'Wan 2.6', provider: 'Alibaba', isComingSoon: true },
  { id: 'kling-avatars-2.0', name: 'Kling Avatars 2.0', provider: 'Kuaishou', isComingSoon: true },
]

const DURATIONS = [
  { id: '5', label: '5 seconds' },
  { id: '10', label: '10 seconds' },
]

const RESOLUTIONS = [
  { id: '480p', label: '480p', desc: 'Fast' },
  { id: '720p', label: '720p', desc: 'Balanced' },
  { id: '1080p', label: '1080p', desc: 'High Quality' },
]

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9', desc: 'Landscape' },
  { id: '9:16', label: '9:16', desc: 'Portrait' },
  { id: '1:1', label: '1:1', desc: 'Square' },
]

const MOCK_VIDEOS = [
  {
    id: '1',
    thumbnail: 'https://picsum.photos/seed/vid1/400/225',
    prompt: 'A sunset over the ocean with waves crashing',
    duration: '5s',
    model: 'Kling 2.6',
  },
  {
    id: '2',
    thumbnail: 'https://picsum.photos/seed/vid2/400/225',
    prompt: 'A butterfly emerging from its cocoon',
    duration: '10s',
    model: 'Veo 3.1',
  },
]

function getBadgeVariant(badge?: string): 'new' | 'top' | 'best' | 'neon' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

function VideoPageContent() {
  const searchParams = useSearchParams()
  const modelParam = searchParams.get('model')

  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-2.6')
  const [duration, setDuration] = useState('5')
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [motionStrength, setMotionStrength] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (modelParam) {
      const foundModel = VIDEO_MODELS.find((m) => m.id === modelParam)
      if (foundModel) {
        if (foundModel.isComingSoon) {
          toast.info(`${foundModel.name} is coming soon!`)
        } else {
          setModel(modelParam)
        }
      }
    }
  }, [modelParam])

  const handleGenerate = () => {
    if (!prompt.trim()) return

    const selectedModel = VIDEO_MODELS.find((m) => m.id === model)
    if (selectedModel?.isComingSoon) {
      toast.info(`${selectedModel.name} is coming soon!`)
      return
    }

    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 5000)
  }

  const selectedModel = VIDEO_MODELS.find((m) => m.id === model)

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Mode Toggle */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'image')}>
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1 gap-2">
                  <Video className="h-4 w-4" />
                  Text to Video
                </TabsTrigger>
                <TabsTrigger value="image" className="flex-1 gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image to Video
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Image Upload (for Image to Video mode) */}
            {mode === 'image' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Image</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-neon/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop an image here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {mode === 'text' ? 'Prompt' : 'Motion Description'}
              </label>
              <Textarea
                placeholder={
                  mode === 'text'
                    ? 'Describe the video you want to create...'
                    : 'Describe how the image should move...'
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
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
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      disabled={m.isComingSoon}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className={m.isComingSoon ? 'text-muted-foreground' : ''}>
                          <span>{m.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {m.provider}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {m.quality && (
                            <Badge variant="secondary" className="text-[10px]">
                              {m.quality}
                            </Badge>
                          )}
                          {m.badge && (
                            <Badge
                              variant={getBadgeVariant(m.badge)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {m.badge.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel?.isComingSoon && (
                <p className="text-xs text-muted-foreground">
                  This model is coming soon
                </p>
              )}
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

            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {RESOLUTIONS.map((r) => (
                  <Button
                    key={r.id}
                    variant={resolution === r.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      resolution === r.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setResolution(r.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span>{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {r.desc}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <Button
                    key={a.id}
                    variant={aspectRatio === a.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      aspectRatio === a.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setAspectRatio(a.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span>{a.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {a.desc}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Advanced Settings
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <motion.div
                className="space-y-4 pt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {/* Motion Strength */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Motion Strength</label>
                    <Badge variant="secondary">{motionStrength}</Badge>
                  </div>
                  <Slider
                    value={[motionStrength]}
                    onValueChange={([v]) => setMotionStrength(v)}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values create more dynamic movement
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
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

      {/* Right Panel - Generated Videos */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Generated Videos</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated videos will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                View History
              </Button>
            </div>

            {/* Generated Videos Grid */}
            {MOCK_VIDEOS.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {MOCK_VIDEOS.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail}
                        alt={video.prompt}
                        className="w-full h-full object-cover"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                          <Play className="h-6 w-6 text-black fill-black ml-1" />
                        </div>
                      </div>
                      {/* Duration badge */}
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
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
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
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter a prompt and click Generate to create your first
                  AI-generated video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">Loading...</div>}>
      <VideoPageContent />
    </Suspense>
  )
}
