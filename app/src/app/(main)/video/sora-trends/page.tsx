'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  RefreshCw,
  Video,
  Play,
  Download,
  ArrowLeft,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useVideoGeneration } from '@/hooks/use-generation'

const VIDEO_MODELS = [
  { id: 'sora-2', name: 'Sora 2', provider: 'OpenAI', quality: 'High' },
  { id: 'kling-v2.6-replicate', name: 'Kling v2.6', provider: 'Kuaishou', quality: 'High' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', quality: 'High' },
  { id: 'hailuo-o2', name: 'Minimax Hailuo O2', provider: 'MiniMax', quality: 'High' },
]

const TRENDING_PROMPTS = [
  {
    id: 'cat-catwalk',
    title: 'Cat on the Catwalk',
    prompt: 'A cat wearing a tiny suit walking on a catwalk, fashion show lighting, audience in background, slow motion, cinematic',
    description: 'A fashionable feline struts with confidence',
    tags: ['funny', 'animals', 'fashion'],
  },
  {
    id: 'water-crystal',
    title: 'Crystal Water Drop',
    prompt: 'Hyperrealistic water droplet forming into a crystal, macro photography, studio lighting, slow motion capture, mesmerizing transformation',
    description: 'Mesmerizing water-to-crystal transformation',
    tags: ['abstract', 'macro', 'satisfying'],
  },
  {
    id: 'desert-bloom',
    title: 'Desert Bloom',
    prompt: 'Time-lapse of a flower blooming in a desert, golden sand dunes background, dramatic sky, natural light, life emerging from barren landscape',
    description: 'Life blooming against all odds in the desert',
    tags: ['nature', 'timelapse', 'cinematic'],
  },
  {
    id: 'neon-city',
    title: 'Neon City Flight',
    prompt: 'Aerial shot of neon city at night with flying cars, cyberpunk aesthetic, rain-slicked streets below, holographic billboards, futuristic metropolis',
    description: 'A cyberpunk metropolis from above',
    tags: ['scifi', 'cyberpunk', 'aerial'],
  },
  {
    id: 'mars-guitar',
    title: 'Mars Guitar Solo',
    prompt: 'Astronaut playing guitar on Mars, red planet surface, Earth visible in sky, cinematic wide shot, dramatic lighting, peaceful solitude in space',
    description: 'An astronaut jams out on the Red Planet',
    tags: ['space', 'music', 'cinematic'],
  },
  {
    id: 'underwater-library',
    title: 'Underwater Library',
    prompt: 'An ancient library submerged underwater, fish swimming between bookshelves, sunlight filtering through water, magical glowing books, serene atmosphere',
    description: 'A magical submerged world of books',
    tags: ['fantasy', 'underwater', 'magical'],
  },
  {
    id: 'cloud-kitchen',
    title: 'Cloud Kitchen',
    prompt: 'A master chef cooking in a kitchen floating on clouds, ingredients floating in mid-air, sunset background, whimsical and dreamlike, steam rising into sky',
    description: 'Culinary art above the clouds',
    tags: ['surreal', 'cooking', 'dreamy'],
  },
  {
    id: 'origami-city',
    title: 'Origami City',
    prompt: 'A bustling city made entirely of colorful origami paper, paper cars driving, paper people walking, gentle wind causing subtle movements, stop motion style',
    description: 'A miniature paper world comes alive',
    tags: ['stop-motion', 'creative', 'colorful'],
  },
  {
    id: 'aurora-dance',
    title: 'Aurora Dance',
    prompt: 'A ballet dancer performing under the Northern Lights in Iceland, flowing dress matching aurora colors, frozen lake reflection, ethereal and graceful',
    description: 'Ballet beneath the Northern Lights',
    tags: ['dance', 'nature', 'ethereal'],
  },
  {
    id: 'time-portal',
    title: 'Time Portal',
    prompt: 'A glowing portal opens in a modern living room, dinosaurs visible on the other side, warm lamplight contrasting with prehistoric jungle, cinematic reveal',
    description: 'When a portal to prehistory opens at home',
    tags: ['scifi', 'surreal', 'cinematic'],
  },
  {
    id: 'paint-splash',
    title: 'Paint Splash Portrait',
    prompt: 'A face emerging from splashes of colorful paint in slow motion, each color representing a different emotion, abstract expressionist style, ultra detailed',
    description: 'Emotions explode in color',
    tags: ['abstract', 'art', 'slowmo'],
  },
  {
    id: 'miniature-train',
    title: 'Miniature Train World',
    prompt: 'A tiny train traveling through a world made of everyday objects, pencils as trees, books as mountains, tilt-shift photography effect, magical and whimsical',
    description: 'A tiny train in a world of objects',
    tags: ['miniature', 'creative', 'whimsical'],
  },
]

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
  title: string
}

export default function SoraTrendsPage() {
  const [selectedTrend, setSelectedTrend] = useState<typeof TRENDING_PROMPTS[0] | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [model, setModel] = useState('sora-2')
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])

  const videoGeneration = useVideoGeneration()

  const handleSelectTrend = (trend: typeof TRENDING_PROMPTS[0]) => {
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
        duration: 5,
        aspectRatio: '16:9',
      })

      if (result) {
        const newVideo: GeneratedVideoData = {
          id: result.id || `trend_${Date.now()}`,
          url: result.url || '',
          prompt,
          duration: '5s',
          model: VIDEO_MODELS.find((m) => m.id === model)?.name || model,
          title: selectedTrend?.title || 'Custom Prompt',
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Trending video generated successfully!')
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
              <TrendingUp className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Sora Trends</h2>
            </div>

            {selectedTrend && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={handleBackToGallery}
              >
                <ArrowLeft className="h-3 w-3" />
                Back to gallery
              </Button>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedTrend ? selectedTrend.title : 'Prompt'}
              </label>
              <Textarea
                placeholder="Select a trending prompt from the gallery, or write your own..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              {selectedTrend && (
                <div className="flex flex-wrap gap-1">
                  {selectedTrend.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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

            {/* Generated Results in sidebar */}
            {generatedVideos.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Recent Generations</label>
                <div className="space-y-2">
                  {generatedVideos.slice(0, 3).map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg border border-border/50 bg-card p-2"
                    >
                      <p className="text-xs font-medium truncate">{video.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {video.model}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {video.duration}
                        </Badge>
                      </div>
                    </div>
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
                Generate
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~2-5 minutes generation time
          </p>
        </div>
      </div>

      {/* Right Panel - Trend Gallery or Generated Videos */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {generatedVideos.length > 0 && selectedTrend
                    ? 'Generated Videos'
                    : 'Trending Prompts'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {generatedVideos.length > 0 && selectedTrend
                    ? 'Your generated trending videos'
                    : 'Click a trend to start generating'}
                </p>
              </div>
              {generatedVideos.length > 0 && (
                <Badge variant="secondary">
                  {generatedVideos.length} video{generatedVideos.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Generated Videos Section */}
            {generatedVideos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                  Generated Videos
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {generatedVideos.map((video, index) => (
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                            <Play className="h-6 w-6 text-black fill-black ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                          {video.duration}
                        </Badge>
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-medium">{video.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{video.prompt}</p>
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
                  transition={{ delay: index * 0.05 }}
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
                      <CardTitle className="text-sm">{trend.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {trend.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {trend.prompt}
                      </p>
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
