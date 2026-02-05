'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Camera,
  RefreshCw,
  Wand2,
  ImageIcon,
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
import { GeneratedImage } from '@/components/generation/GeneratedImage'
import { useImageGeneration } from '@/hooks/use-generation'

const IMAGE_MODELS = [
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI' },
  { id: 'seedream-4.5', name: 'Seedream 4.5', provider: 'ByteDance', badge: 'new' },
  { id: 'flux-2', name: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new' },
  { id: 'imagen-4', name: 'Imagen 4', provider: 'Google' },
  { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney' },
  { id: 'ideogram-3', name: 'Ideogram 3', provider: 'Ideogram' },
  { id: 'recraft-v3', name: 'Recraft V3', provider: 'Recraft' },
  { id: 'flux-kontext-pro', name: 'FLUX Kontext Pro', provider: 'Black Forest Labs' },
]

const THEMES = [
  { id: 'aesthetic', label: 'Aesthetic', emoji: '' },
  { id: 'minimal', label: 'Minimal', emoji: '' },
  { id: 'bold', label: 'Bold', emoji: '' },
  { id: 'vintage', label: 'Vintage', emoji: '' },
  { id: 'neon', label: 'Neon', emoji: '' },
]

const CONTENT_TYPES = [
  { id: 'feed-post', label: 'Feed Post', aspectRatio: '1:1' },
  { id: 'story', label: 'Story', aspectRatio: '9:16' },
  { id: 'carousel', label: 'Carousel', aspectRatio: '4:3' },
  { id: 'reel-cover', label: 'Reel Cover', aspectRatio: '3:4' },
]

const IMAGE_COUNTS = [4, 6, 8]

interface GeneratedImageData {
  id: string
  src: string
  prompt: string
}

function getBadgeVariant(badge?: string): 'new' | 'top' | 'best' | 'neon' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

export default function InstadumpPage() {
  const [caption, setCaption] = useState('')
  const [theme, setTheme] = useState('aesthetic')
  const [contentType, setContentType] = useState('feed-post')
  const [numImages, setNumImages] = useState(4)
  const [model, setModel] = useState('gpt-image-1.5')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([])

  const imageGeneration = useImageGeneration()

  const selectedContentType = CONTENT_TYPES.find((ct) => ct.id === contentType)
  const selectedTheme = THEMES.find((t) => t.id === theme)

  const handleGenerate = async () => {
    if (!caption.trim()) {
      toast.error('Please enter a caption or description')
      return
    }

    const contentLabel = selectedContentType?.label || 'Feed Post'
    const themeLabel = selectedTheme?.label || 'Aesthetic'
    const aspectRatio = selectedContentType?.aspectRatio || '1:1'

    const fullPrompt = `${caption}, ${themeLabel} style, Instagram ${contentLabel}, social media photography, curated aesthetic, high quality`

    try {
      const result = await imageGeneration.mutateAsync({
        model,
        prompt: fullPrompt,
        aspectRatio,
        numImages,
      })

      if (result?.images) {
        const newImages: GeneratedImageData[] = result.images.map(
          (img: { id: string; src?: string; url?: string }) => ({
            id: img.id || `insta_${Date.now()}_${Math.random()}`,
            src: img.src || img.url || '',
            prompt: caption,
          })
        )
        setGeneratedImages((prev) => [...newImages, ...prev])
        toast.success(`Generated ${newImages.length} image(s)!`)
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
              <Camera className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Instadump</h2>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <Button
                    key={t.id}
                    variant={theme === t.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      theme === t.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setTheme(t.id)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <Button
                    key={ct.id}
                    variant={contentType === ct.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      contentType === ct.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setContentType(ct.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{ct.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {ct.aspectRatio}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Caption / Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption / Description</label>
              <Textarea
                placeholder="Describe the vibe... e.g., Cozy coffee shop morning, golden hour, warm tones, latte art close-up"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Number of Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Images</label>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_COUNTS.map((count) => (
                  <Button
                    key={count}
                    variant={numImages === count ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      numImages === count ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setNumImages(count)}
                  >
                    {count}
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
                  {IMAGE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {m.provider}
                          </span>
                        </div>
                        {m.badge && (
                          <Badge
                            variant={getBadgeVariant(m.badge)}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {m.badge.toUpperCase()}
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
            disabled={!caption.trim() || imageGeneration.isPending}
          >
            {imageGeneration.isPending ? (
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
        </div>
      </div>

      {/* Right Panel - Instagram Grid */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Instagram Grid</h2>
                <p className="text-sm text-muted-foreground">
                  Your curated photo dump will appear here
                </p>
              </div>
              {generatedImages.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {/* Instagram-style Grid */}
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 max-w-2xl mx-auto">
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GeneratedImage image={image} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Wand2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Pick a theme, enter a caption, and generate your Instagram-ready photo dump
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
