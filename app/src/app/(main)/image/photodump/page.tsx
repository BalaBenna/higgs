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

const STYLE_PRESETS = [
  { id: 'film', label: 'Film' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'street', label: 'Street' },
  { id: 'nature', label: 'Nature' },
  { id: 'studio', label: 'Studio' },
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

export default function PhotodumpPage() {
  const [mood, setMood] = useState('')
  const [style, setStyle] = useState('film')
  const [numImages, setNumImages] = useState(4)
  const [model, setModel] = useState('gpt-image-1.5')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([])

  const imageGeneration = useImageGeneration()

  const selectedStyle = STYLE_PRESETS.find((s) => s.id === style)

  const handleGenerate = async () => {
    if (!mood.trim()) {
      toast.error('Please enter a mood description')
      return
    }

    const styleLabel = selectedStyle?.label || 'Film'
    const fullPrompt = `${mood}, ${styleLabel} photography style, professional photo, high quality, editorial`

    try {
      const result = await imageGeneration.mutateAsync({
        model,
        prompt: fullPrompt,
        aspectRatio: '1:1',
        numImages,
      })

      if (result?.images) {
        const newImages: GeneratedImageData[] = result.images.map(
          (img: { id: string; src?: string; url?: string }) => ({
            id: img.id || `photo_${Date.now()}_${Math.random()}`,
            src: img.src || img.url || '',
            prompt: mood,
          })
        )
        setGeneratedImages((prev) => [...newImages, ...prev])
        toast.success(`Generated ${newImages.length} photo(s)!`)
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
              <h2 className="text-lg font-semibold">Photodump</h2>
            </div>

            {/* Style Preset */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((s) => (
                  <Button
                    key={s.id}
                    variant={style === s.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      style === s.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setStyle(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mood Descriptor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mood / Description</label>
              <Textarea
                placeholder="Describe the mood... e.g., Golden hour at the beach, warm tones, soft light, candid moments, dreamy atmosphere"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Count Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Photos</label>
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
            disabled={!mood.trim() || imageGeneration.isPending}
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

      {/* Right Panel - Masonry Grid */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Photo Dump</h2>
                <p className="text-sm text-muted-foreground">
                  Your curated photo collection will appear here
                </p>
              </div>
              {generatedImages.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {generatedImages.length} photo{generatedImages.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {/* Masonry-style Grid */}
            {generatedImages.length > 0 ? (
              <div className="columns-2 lg:columns-3 gap-3 space-y-3">
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="break-inside-avoid"
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
                <h3 className="text-lg font-medium mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a style, describe the mood, and generate your
                  photo dump collection
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
