'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  LayoutGrid,
  RefreshCw,
  Wand2,
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

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9' },
  { id: '1:1', label: '1:1' },
  { id: '4:3', label: '4:3' },
  { id: '3:4', label: '3:4' },
]

const PANEL_COUNTS = [2, 4, 6]

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

export default function StoryboardPage() {
  const [storyPrompt, setStoryPrompt] = useState('')
  const [numPanels, setNumPanels] = useState(4)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [model, setModel] = useState('gpt-image-1.5')
  const [generatedPanels, setGeneratedPanels] = useState<GeneratedImageData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const imageGeneration = useImageGeneration()

  const handleGenerate = async () => {
    if (!storyPrompt.trim()) {
      toast.error('Please enter a story description')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    const panels: GeneratedImageData[] = []

    try {
      for (let i = 0; i < numPanels; i++) {
        const scenePrompt = `Scene ${i + 1} of ${numPanels}: ${storyPrompt}. Cinematic storyboard panel, consistent art style, detailed composition`
        setProgress(i)

        const result = await imageGeneration.mutateAsync({
          model,
          prompt: scenePrompt,
          aspectRatio,
          numImages: 1,
        })

        if (result?.images) {
          const newImages = result.images.map(
            (img: { id: string; src?: string; url?: string }) => ({
              id: img.id || `panel_${Date.now()}_${i}`,
              src: img.src || img.url || '',
              prompt: scenePrompt,
            })
          )
          panels.push(...newImages)
          setGeneratedPanels([...panels])
        }
      }

      setProgress(numPanels)
      toast.success(`Storyboard with ${panels.length} panels generated!`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const gridCols = numPanels === 6 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Storyboard</h2>
            </div>

            {/* Story Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Story Description</label>
              <Textarea
                placeholder="Describe your story... e.g., A detective follows mysterious clues through a neon-lit city at night, discovering a hidden underground world"
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                className="min-h-[140px] resize-none"
              />
            </div>

            {/* Number of Panels */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Panels</label>
              <div className="grid grid-cols-3 gap-2">
                {PANEL_COUNTS.map((count) => (
                  <Button
                    key={count}
                    variant={numPanels === count ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      numPanels === count ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setNumPanels(count)}
                  >
                    {count} Panels
                  </Button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <Button
                    key={ratio.id}
                    variant={aspectRatio === ratio.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      aspectRatio === ratio.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setAspectRatio(ratio.id)}
                  >
                    {ratio.label}
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
          {isGenerating && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Generating panels...</span>
                <span>{progress}/{numPanels}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-neon h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress / numPanels) * 100}%` }}
                />
              </div>
            </div>
          )}
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!storyPrompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating Panel {progress + 1} of {numPanels}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Storyboard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Panel - Storyboard Grid */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Storyboard Panels</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated storyboard panels will appear here
                </p>
              </div>
              {generatedPanels.length > 0 && (
                <Badge variant="secondary">
                  {generatedPanels.length} panel{generatedPanels.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Storyboard Grid */}
            {generatedPanels.length > 0 ? (
              <div className={`grid ${gridCols} gap-4`}>
                {generatedPanels.map((panel, index) => (
                  <motion.div
                    key={panel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="neon" className="text-xs font-bold">
                        Scene {index + 1}
                      </Badge>
                    </div>
                    <GeneratedImage image={panel} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Wand2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No storyboard yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter a story description and click Generate to create your
                  AI-generated storyboard panels
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
