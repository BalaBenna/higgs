'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Shirt,
  RefreshCw,
  Wand2,
  Upload,
  X,
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
import { useUpload } from '@/hooks/use-upload'
import { MODEL_TO_TOOL_MAP, getModelById } from '@/config/model-mappings'

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

const CATEGORIES = [
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'haute-couture', label: 'Haute Couture' },
  { id: 'casual', label: 'Casual' },
  { id: 'formal', label: 'Formal' },
  { id: 'activewear', label: 'Activewear' },
]

const ASPECT_RATIOS = [
  { id: '3:4', label: '3:4', desc: 'Portrait' },
  { id: '9:16', label: '9:16', desc: 'Full body' },
  { id: '1:1', label: '1:1', desc: 'Square' },
  { id: '4:3', label: '4:3', desc: 'Landscape' },
]

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

export default function FashionPage() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('streetwear')
  const [aspectRatio, setAspectRatio] = useState('3:4')
  const [model, setModel] = useState('gpt-image-1.5')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([])
  const [isGeneratingWithRef, setIsGeneratingWithRef] = useState(false)

  const imageGeneration = useImageGeneration()
  const uploadHook = useUpload()

  const selectedCategory = CATEGORIES.find((c) => c.id === category)

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a garment description')
      return
    }

    const categoryLabel = selectedCategory?.label || 'Streetwear'
    const fullPrompt = `${description}, ${categoryLabel} fashion, professional lookbook photography, studio lighting, high-end editorial, detailed fabric texture`

    // If reference image is uploaded, call the API directly with input_images
    if (uploadHook.filename) {
      setIsGeneratingWithRef(true)
      try {
        const toolId = MODEL_TO_TOOL_MAP[model]
        if (!toolId) {
          throw new Error(`No tool mapping found for model: ${model}`)
        }
        const modelInfo = getModelById(model)

        const response = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: toolId,
            prompt: fullPrompt,
            aspect_ratio: aspectRatio,
            num_images: 1,
            model_name: modelInfo?.name,
            input_images: [uploadHook.filename],
          }),
        })

        if (!response.ok) {
          let errorMsg = 'Generation failed'
          try {
            const errorText = await response.text()
            try {
              const errorData = JSON.parse(errorText)
              errorMsg = errorData.detail || errorData.message || errorMsg
            } catch {
              errorMsg = errorText || errorMsg
            }
          } catch {}
          throw new Error(errorMsg)
        }

        const result = await response.json()
        if (result?.images) {
          const newImages: GeneratedImageData[] = result.images.map(
            (img: { id: string; src?: string; url?: string }) => ({
              id: img.id || `fashion_${Date.now()}_${Math.random()}`,
              src: img.src || img.url || '',
              prompt: description,
            })
          )
          setGeneratedImages((prev) => [...newImages, ...prev])
          toast.success(`Generated ${newImages.length} image(s)!`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Generation failed'
        toast.error(message)
      } finally {
        setIsGeneratingWithRef(false)
      }
      return
    }

    // Standard generation without reference image
    try {
      const result = await imageGeneration.mutateAsync({
        model,
        prompt: fullPrompt,
        aspectRatio,
        numImages: 1,
      })

      if (result?.images) {
        const newImages: GeneratedImageData[] = result.images.map(
          (img: { id: string; src?: string; url?: string }) => ({
            id: img.id || `fashion_${Date.now()}_${Math.random()}`,
            src: img.src || img.url || '',
            prompt: description,
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

  const isPending = imageGeneration.isPending || isGeneratingWithRef

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Fashion Factory</h2>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <Button
                    key={c.id}
                    variant={category === c.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      category === c.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setCategory(c.id)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Garment Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Garment Description</label>
              <Textarea
                placeholder="Describe the garment... e.g., Oversized leather bomber jacket with intricate embroidery, paired with distressed denim and chunky boots"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Image (optional)</label>
              <input
                ref={uploadHook.fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={uploadHook.handleFileSelect}
              />
              {uploadHook.preview ? (
                <div className="relative">
                  <img
                    src={uploadHook.preview}
                    alt="Reference"
                    className="w-full rounded-lg object-cover max-h-40 border border-border"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
                    onClick={uploadHook.clear}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {uploadHook.isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={uploadHook.openFilePicker}
                >
                  <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Upload a reference image
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
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
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{ratio.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {ratio.desc}
                      </span>
                    </div>
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
            disabled={!description.trim() || isPending}
          >
            {isPending ? (
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

      {/* Right Panel - Lookbook Grid */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Lookbook</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated fashion designs will appear here
                </p>
              </div>
              {generatedImages.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {generatedImages.length} design{generatedImages.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>

            {/* Lookbook Grid - 2-col tall images */}
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 max-w-3xl">
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                <h3 className="text-lg font-medium mb-2">No designs yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a category, describe the garment, and generate
                  your fashion lookbook
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
