'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Wand2,
  Settings2,
  ImageIcon,
  RefreshCw,
  ChevronDown,
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
import { GeneratedImage } from '@/components/generation/GeneratedImage'
import { IMAGE_MODEL_MAPPINGS, getAvailableImageModels } from '@/config/model-mappings'

const IMAGE_MODELS = [
  { id: 'higgsfield-soul', name: 'Higgsfield Soul', provider: 'Higgsfield', badge: 'best', isComingSoon: true },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI', toolId: 'generate_image_by_gpt_image_1_jaaz' },
  { id: 'seedream-4.5', name: 'Seedream 4.5', provider: 'ByteDance', badge: 'new', toolId: 'generate_image_by_doubao_seedream_3_jaaz' },
  { id: 'flux-2', name: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new', toolId: 'generate_image_by_flux_kontext_max_jaaz' },
  { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney', toolId: 'generate_image_by_midjourney_jaaz' },
  { id: 'imagen-4', name: 'Imagen 4', provider: 'Google', toolId: 'generate_image_by_imagen_4_jaaz' },
  { id: 'ideogram-3', name: 'Ideogram 3', provider: 'Ideogram', toolId: 'generate_image_by_ideogram3_bal_jaaz' },
  { id: 'recraft-v3', name: 'Recraft V3', provider: 'Recraft', toolId: 'generate_image_by_recraft_v3_jaaz' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'Nano', badge: 'top', isComingSoon: true },
  { id: 'kling-o1-image', name: 'Kling O1 Image', provider: 'Kuaishou', isComingSoon: true },
]

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', width: 1024, height: 1024 },
  { id: '16:9', label: '16:9', width: 1344, height: 768 },
  { id: '9:16', label: '9:16', width: 768, height: 1344 },
  { id: '4:3', label: '4:3', width: 1152, height: 896 },
  { id: '3:4', label: '3:4', width: 896, height: 1152 },
]

const STYLES = [
  'None',
  'Cinematic',
  'Anime',
  'Digital Art',
  'Photography',
  'Oil Painting',
  'Watercolor',
  '3D Render',
  'Pixel Art',
  'Comic Book',
]

const MOCK_GENERATED = [
  {
    id: '1',
    src: 'https://picsum.photos/seed/gen1/512/512',
    prompt: 'A futuristic city with neon lights',
  },
  {
    id: '2',
    src: 'https://picsum.photos/seed/gen2/512/512',
    prompt: 'A futuristic city with neon lights',
  },
  {
    id: '3',
    src: 'https://picsum.photos/seed/gen3/512/512',
    prompt: 'A futuristic city with neon lights',
  },
  {
    id: '4',
    src: 'https://picsum.photos/seed/gen4/512/512',
    prompt: 'A futuristic city with neon lights',
  },
]

function getBadgeVariant(badge?: string): 'new' | 'top' | 'best' | 'neon' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

function ImagePageContent() {
  const searchParams = useSearchParams()
  const modelParam = searchParams.get('model')

  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [model, setModel] = useState('gpt-image-1.5')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [style, setStyle] = useState('None')
  const [numImages, setNumImages] = useState(4)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (modelParam) {
      const foundModel = IMAGE_MODELS.find((m) => m.id === modelParam)
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

    const selectedModel = IMAGE_MODELS.find((m) => m.id === model)
    if (selectedModel?.isComingSoon) {
      toast.info(`${selectedModel.name} is coming soon!`)
      return
    }

    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 3000)
  }

  const selectedModel = IMAGE_MODELS.find((m) => m.id === model)

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Textarea
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
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
                  {IMAGE_MODELS.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      disabled={m.isComingSoon}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex flex-col">
                          <span className={m.isComingSoon ? 'text-muted-foreground' : ''}>
                            {m.name}
                          </span>
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
              {selectedModel?.isComingSoon && (
                <p className="text-xs text-muted-foreground">
                  This model is coming soon
                </p>
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <Button
                    key={ratio.id}
                    variant={aspectRatio === ratio.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      aspectRatio === ratio.id
                        ? 'border-neon/50 bg-neon/10'
                        : ''
                    }
                    onClick={() => setAspectRatio(ratio.id)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Number of Images</label>
                <Badge variant="secondary">{numImages}</Badge>
              </div>
              <Slider
                value={[numImages]}
                onValueChange={([v]) => setNumImages(v)}
                min={1}
                max={8}
                step={1}
              />
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
                {/* Negative Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Negative Prompt</label>
                  <Textarea
                    placeholder="What to avoid in the image..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Guidance Scale */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Guidance Scale</label>
                    <Badge variant="secondary">{guidanceScale}</Badge>
                  </div>
                  <Slider
                    value={[guidanceScale]}
                    onValueChange={([v]) => setGuidanceScale(v)}
                    min={1}
                    max={20}
                    step={0.5}
                  />
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
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Panel - Generated Images */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Generated Images</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated images will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                View History
              </Button>
            </div>

            {/* Generated Images Grid */}
            {MOCK_GENERATED.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {MOCK_GENERATED.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
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
                  Enter a prompt and click Generate to create your first
                  AI-generated image
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function ImagePage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">Loading...</div>}>
      <ImagePageContent />
    </Suspense>
  )
}
