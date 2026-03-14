'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  RefreshCw,
  Video,
  Play,
  Download,
  ArrowLeft,
  Clock,
  RatioIcon,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useVideoGeneration } from '@/hooks/use-generation'

const VIDEO_MODELS = [
  { id: 'sora-2', name: 'Sora 2', provider: 'OpenAI', quality: 'High' },
  {
    id: 'kling-v2.6-replicate',
    name: 'Kling v2.6',
    provider: 'Kuaishou',
    quality: 'High',
  },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'ByteDance',
    quality: 'High',
  },
  {
    id: 'hailuo-o2',
    name: 'Minimax Hailuo O2',
    provider: 'MiniMax',
    quality: 'High',
  },
]

const DURATION_OPTIONS = [
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
  { value: 20, label: '20s' },
]

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
]

const TRENDING_PROMPTS = [
  {
    id: 'cat-catwalk',
    title: 'Cat on the Catwalk',
    prompt:
      'A cat wearing a tiny suit walking on a catwalk, fashion show lighting, audience in background, slow motion, cinematic',
    description: 'A fashionable feline struts with confidence',
    tags: ['funny', 'animals', 'fashion'],
    emoji: '🐱',
  },
  {
    id: 'water-crystal',
    title: 'Crystal Water Drop',
    prompt:
      'Hyperrealistic water droplet forming into a crystal, macro photography, studio lighting, slow motion capture, mesmerizing transformation',
    description: 'Mesmerizing water-to-crystal transformation',
    tags: ['abstract', 'macro', 'satisfying'],
    emoji: '💎',
  },
  {
    id: 'desert-bloom',
    title: 'Desert Bloom',
    prompt:
      'Time-lapse of a flower blooming in a desert, golden sand dunes background, dramatic sky, natural light, life emerging from barren landscape',
    description: 'Life blooming against all odds in the desert',
    tags: ['nature', 'timelapse', 'cinematic'],
    emoji: '🌺',
  },
  {
    id: 'neon-city',
    title: 'Neon City Flight',
    prompt:
      'Aerial shot of neon city at night with flying cars, cyberpunk aesthetic, rain-slicked streets below, holographic billboards, futuristic metropolis',
    description: 'A cyberpunk metropolis from above',
    tags: ['scifi', 'cyberpunk', 'aerial'],
    emoji: '🏙️',
  },
  {
    id: 'mars-guitar',
    title: 'Mars Guitar Solo',
    prompt:
      'Astronaut playing guitar on Mars, red planet surface, Earth visible in sky, cinematic wide shot, dramatic lighting, peaceful solitude in space',
    description: 'An astronaut jams out on the Red Planet',
    tags: ['space', 'music', 'cinematic'],
    emoji: '🎸',
  },
  {
    id: 'underwater-library',
    title: 'Underwater Library',
    prompt:
      'An ancient library submerged underwater, fish swimming between bookshelves, sunlight filtering through water, magical glowing books, serene atmosphere',
    description: 'A magical submerged world of books',
    tags: ['fantasy', 'underwater', 'magical'],
    emoji: '📚',
  },
  {
    id: 'cloud-kitchen',
    title: 'Cloud Kitchen',
    prompt:
      'A master chef cooking in a kitchen floating on clouds, ingredients floating in mid-air, sunset background, whimsical and dreamlike, steam rising into sky',
    description: 'Culinary art above the clouds',
    tags: ['surreal', 'cooking', 'dreamy'],
    emoji: '☁️',
  },
  {
    id: 'origami-city',
    title: 'Origami City',
    prompt:
      'A bustling city made entirely of colorful origami paper, paper cars driving, paper people walking, gentle wind causing subtle movements, stop motion style',
    description: 'A miniature paper world comes alive',
    tags: ['stop-motion', 'creative', 'colorful'],
    emoji: '🏗️',
  },
  {
    id: 'aurora-dance',
    title: 'Aurora Dance',
    prompt:
      'A ballet dancer performing under the Northern Lights in Iceland, flowing dress matching aurora colors, frozen lake reflection, ethereal and graceful',
    description: 'Ballet beneath the Northern Lights',
    tags: ['dance', 'nature', 'ethereal'],
    emoji: '💃',
  },
  {
    id: 'time-portal',
    title: 'Time Portal',
    prompt:
      'A glowing portal opens in a modern living room, dinosaurs visible on the other side, warm lamplight contrasting with prehistoric jungle, cinematic reveal',
    description: 'When a portal to prehistory opens at home',
    tags: ['scifi', 'surreal', 'cinematic'],
    emoji: '🌀',
  },
  {
    id: 'paint-splash',
    title: 'Paint Splash Portrait',
    prompt:
      'A face emerging from splashes of colorful paint in slow motion, each color representing a different emotion, abstract expressionist style, ultra detailed',
    description: 'Emotions explode in color',
    tags: ['abstract', 'art', 'slowmo'],
    emoji: '🎨',
  },
  {
    id: 'miniature-train',
    title: 'Miniature Train World',
    prompt:
      'A tiny train traveling through a world made of everyday objects, pencils as trees, books as mountains, tilt-shift photography effect, magical and whimsical',
    description: 'A tiny train in a world of objects',
    tags: ['miniature', 'creative', 'whimsical'],
    emoji: '🚂',
  },
]

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
  title: string
  aspectRatio: string
}

export default function SoraTrendsPage() {
  const [selectedTrend, setSelectedTrend] = useState<
    (typeof TRENDING_PROMPTS)[0] | null
  >(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [model, setModel] = useState('sora-2')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])
  const [playingVideo, setPlayingVideo] = useState<GeneratedVideoData | null>(null)

  const videoGeneration = useVideoGeneration()

  const handleSelectTrend = (trend: (typeof TRENDING_PROMPTS)[0]) => {
    setSelectedTrend(trend)
    setCustomPrompt(trend.prompt)
  }

  const handleBackToGallery = () => {
    setSelectedTrend(null)
    setCustomPrompt('')
  }

  const handleGenerate = async () => {
    const prompt = customPrompt.trim()
    if (!prompt) {
      toast.error('Please enter or select a prompt')
      return
    }

    try {
      const result = await videoGeneration.mutateAsync({
        model,
        prompt,
        duration,
        aspectRatio,
      })

      if (result) {
        const newVideo: GeneratedVideoData = {
          id: result.id || `trend_${Date.now()}`,
          url: result.url || '',
          prompt,
          duration: `${duration}s`,
          model: VIDEO_MODELS.find((m) => m.id === model)?.name || model,
          title: selectedTrend?.title || 'Custom Prompt',
          aspectRatio,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Video generated!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Video generation failed'
      toast.error(message)
    }
  }

  const handleQuickGenerate = async (trend: (typeof TRENDING_PROMPTS)[0]) => {
    setSelectedTrend(trend)
    setCustomPrompt(trend.prompt)

    try {
      const result = await videoGeneration.mutateAsync({
        model,
        prompt: trend.prompt,
        duration,
        aspectRatio,
      })

      if (result) {
        const newVideo: GeneratedVideoData = {
          id: result.id || `trend_${Date.now()}`,
          url: result.url || '',
          prompt: trend.prompt,
          duration: `${duration}s`,
          model: VIDEO_MODELS.find((m) => m.id === model)?.name || model,
          title: trend.title,
          aspectRatio,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Video generated!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Video generation failed'
      toast.error(message)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-neon" />
              </div>
              <h2 className="text-sm font-semibold">Sora 2 Trends</h2>
            </div>

            {selectedTrend && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={handleBackToGallery}
              >
                <ArrowLeft className="h-3 w-3" />
                Back to gallery
              </Button>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                {selectedTrend ? selectedTrend.title : 'Prompt'}
              </label>
              <Textarea
                placeholder="Select a trending prompt or write your own..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px] resize-none bg-white/[0.03] border-white/[0.06] text-sm placeholder:text-white/25"
              />
              {selectedTrend && (
                <div className="flex flex-wrap gap-1">
                  {selectedTrend.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                Model
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.provider}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(Number(v))}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={String(d.value)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider flex items-center gap-1">
                  <RatioIcon className="h-3 w-3" />
                  Ratio
                </label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ar) => (
                      <SelectItem key={ar.value} value={ar.value}>
                        {ar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recent Generations */}
            {generatedVideos.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  Recent ({generatedVideos.length})
                </label>
                <div className="space-y-2">
                  {generatedVideos.slice(0, 4).map((video) => (
                    <button
                      key={video.id}
                      className="w-full rounded-lg border border-border/50 bg-card p-2 text-left hover:border-neon/30 transition-colors"
                      onClick={() => video.url && setPlayingVideo(video)}
                    >
                      <div className="flex items-center gap-2">
                        {video.url ? (
                          <div className="w-12 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Video className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {video.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0"
                            >
                              {video.model}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0"
                            >
                              {video.duration}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
            disabled={!customPrompt.trim() || videoGeneration.isPending}
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
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            {VIDEO_MODELS.find((m) => m.id === model)?.name} &middot; {duration}s
            &middot; {aspectRatio}
          </p>
        </div>
      </div>

      {/* Right Panel - Gallery */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedTrend ? selectedTrend.title : 'Trending Prompts'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTrend
                    ? selectedTrend.description
                    : 'Click a trend to customize, or generate directly'}
                </p>
              </div>
              {generatedVideos.length > 0 && (
                <Badge variant="secondary">
                  {generatedVideos.length} video
                  {generatedVideos.length !== 1 ? 's' : ''} generated
                </Badge>
              )}
            </div>

            {/* Generated Videos */}
            {generatedVideos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                  Your Videos
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {generatedVideos.map((video, index) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      index={index}
                      onPlay={() => setPlayingVideo(video)}
                    />
                  ))}
                </div>
                <div className="border-b border-border mb-6" />
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                  Browse More Trends
                </h3>
              </div>
            )}

            {/* Trending Prompts Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {TRENDING_PROMPTS.map((trend, index) => (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:border-neon/50 hover:shadow-lg hover:shadow-neon/5 ${
                      selectedTrend?.id === trend.id
                        ? 'border-neon/70 bg-neon/5'
                        : ''
                    }`}
                    onClick={() => handleSelectTrend(trend)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{trend.emoji}</span>
                          {trend.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {trend.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {trend.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {trend.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-neon hover:text-neon hover:bg-neon/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuickGenerate(trend)
                          }}
                          disabled={videoGeneration.isPending}
                        >
                          {videoGeneration.isPending &&
                          selectedTrend?.id === trend.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl overflow-hidden bg-card border border-border/50 shadow-2xl">
                <div className="relative">
                  {playingVideo.url ? (
                    <video
                      src={playingVideo.url}
                      className="w-full"
                      controls
                      autoPlay
                      style={{
                        aspectRatio:
                          playingVideo.aspectRatio === '9:16'
                            ? '9/16'
                            : playingVideo.aspectRatio === '1:1'
                              ? '1/1'
                              : '16/9',
                        maxHeight: '70vh',
                      }}
                    />
                  ) : (
                    <div
                      className="w-full bg-muted flex items-center justify-center"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{playingVideo.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {playingVideo.prompt}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {playingVideo.model}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {playingVideo.duration}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {playingVideo.aspectRatio}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {playingVideo.url && (
                      <a href={playingVideo.url} download>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayingVideo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: GeneratedVideoData
  index: number
  onPlay: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-neon/30 transition-colors"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
    >
      <div
        className="relative cursor-pointer"
        style={{
          aspectRatio:
            video.aspectRatio === '9:16'
              ? '9/16'
              : video.aspectRatio === '1:1'
                ? '1/1'
                : '16/9',
        }}
        onClick={onPlay}
      >
        {video.url ? (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={() => videoRef.current?.play()}
            onMouseLeave={() => {
              if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </div>
        </div>
        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px]">
          {video.duration}
        </Badge>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium">{video.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{video.prompt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px]">
              {video.model}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {video.aspectRatio}
            </Badge>
          </div>
          {video.url && (
            <a href={video.url} download onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                <Download className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
