'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
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
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface ProductKitData {
  productName: string
  productDescription: string
  images: string[]
  selectedImages: string[]
  favicon: string
  siteName: string
}

interface VideoConfig {
  model: string
  adFormat: string
  duration: string
  style: string
}

interface ImageConfig {
  model: string
  aspectRatio: string
  numImages: number
  imageStyle: string
}

interface ClickToAdProductKitProps {
  mode: 'video' | 'image'
  product: ProductKitData
  onProductChange: (product: ProductKitData) => void
  videoConfig?: VideoConfig
  onVideoConfigChange?: (config: VideoConfig) => void
  imageConfig?: ImageConfig
  onImageConfigChange?: (config: ImageConfig) => void
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
  videoModels?: { id: string; name: string; provider: string; quality?: string }[]
  imageModels?: { id: string; name: string; provider: string; badge?: string; isComingSoon?: boolean }[]
}

const AD_FORMATS = [
  { id: 'instagram-reel', label: 'Instagram Reel', aspectRatio: '9:16' },
  { id: 'tiktok', label: 'TikTok', aspectRatio: '9:16' },
  { id: 'youtube-short', label: 'YouTube Short', aspectRatio: '9:16' },
  { id: 'story', label: 'Story', aspectRatio: '9:16' },
]

const VIDEO_DURATIONS = [
  { id: '5', label: '5 seconds' },
  { id: '10', label: '10 seconds' },
]

const VIDEO_STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'playful', label: 'Playful' },
]

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '4:3', label: '4:3' },
  { id: '3:4', label: '3:4' },
]

const IMAGE_STYLES = [
  'None',
  'Cinematic',
  'Photography',
  'Digital Art',
  'Anime',
  'Oil Painting',
  'Watercolor',
  '3D Render',
  'Pixel Art',
  'Comic Book',
]

export function ClickToAdProductKit({
  mode,
  product,
  onProductChange,
  videoConfig,
  onVideoConfigChange,
  imageConfig,
  onImageConfigChange,
  onBack,
  onGenerate,
  isGenerating,
  videoModels = [],
  imageModels = [],
}: ClickToAdProductKitProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  const toggleImage = (imageUrl: string) => {
    const selected = product.selectedImages.includes(imageUrl)
      ? product.selectedImages.filter((u) => u !== imageUrl)
      : [...product.selectedImages, imageUrl]
    onProductChange({ ...product, selectedImages: selected })
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Product Kit */}
      <div className="w-96 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
                data-testid="back-button"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">YOUR PRODUCT KIT</h2>
            </div>

            {/* Site info */}
            {product.siteName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {product.favicon && (
                  <Image
                    src={product.favicon}
                    alt=""
                    width={16}
                    height={16}
                    className="rounded"
                    unoptimized
                    onError={() => {}}
                  />
                )}
                <span>{product.siteName}</span>
              </div>
            )}

            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <input
                type="text"
                value={product.productName}
                onChange={(e) =>
                  onProductChange({ ...product, productName: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-neon/50"
                data-testid="product-name-input"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Description</label>
              <Textarea
                value={product.productDescription}
                onChange={(e) =>
                  onProductChange({ ...product, productDescription: e.target.value })
                }
                className="min-h-[100px] resize-none"
                data-testid="product-description-input"
              />
            </div>

            {/* Image Grid */}
            {product.images.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Product Images ({product.selectedImages.length} selected)
                </label>
                <div className="grid grid-cols-3 gap-2" data-testid="image-grid">
                  {product.images.map((img) =>
                    imageLoadErrors.has(img) ? null : (
                      <button
                        key={img}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          product.selectedImages.includes(img)
                            ? 'border-neon ring-2 ring-neon/30'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        onClick={() => toggleImage(img)}
                        data-testid="image-select-button"
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                          onError={() =>
                            setImageLoadErrors((prev) => new Set(prev).add(img))
                          }
                        />
                        {product.selectedImages.includes(img) && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-neon flex items-center justify-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Config Section */}
            <div className="border-t border-border pt-4 space-y-4">
              {mode === 'video' && videoConfig && onVideoConfigChange && (
                <>
                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <Select
                      value={videoConfig.model}
                      onValueChange={(v) =>
                        onVideoConfigChange({ ...videoConfig, model: v })
                      }
                    >
                      <SelectTrigger data-testid="model-selector">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {videoModels.map((m) => (
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

                  {/* Ad Format */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ad Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AD_FORMATS.map((f) => (
                        <Button
                          key={f.id}
                          variant={videoConfig.adFormat === f.id ? 'secondary' : 'outline'}
                          size="sm"
                          className={videoConfig.adFormat === f.id ? 'border-neon/50 bg-neon/10' : ''}
                          onClick={() =>
                            onVideoConfigChange({ ...videoConfig, adFormat: f.id })
                          }
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xs">{f.label}</span>
                            <span className="text-[10px] text-muted-foreground">{f.aspectRatio}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VIDEO_DURATIONS.map((d) => (
                        <Button
                          key={d.id}
                          variant={videoConfig.duration === d.id ? 'secondary' : 'outline'}
                          size="sm"
                          className={videoConfig.duration === d.id ? 'border-neon/50 bg-neon/10' : ''}
                          onClick={() =>
                            onVideoConfigChange({ ...videoConfig, duration: d.id })
                          }
                        >
                          {d.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VIDEO_STYLES.map((s) => (
                        <Button
                          key={s.id}
                          variant={videoConfig.style === s.id ? 'secondary' : 'outline'}
                          size="sm"
                          className={videoConfig.style === s.id ? 'border-neon/50 bg-neon/10' : ''}
                          onClick={() =>
                            onVideoConfigChange({ ...videoConfig, style: s.id })
                          }
                        >
                          {s.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'image' && imageConfig && onImageConfigChange && (
                <>
                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <Select
                      value={imageConfig.model}
                      onValueChange={(v) =>
                        onImageConfigChange({ ...imageConfig, model: v })
                      }
                    >
                      <SelectTrigger data-testid="model-selector">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {imageModels.map((m) => (
                          <SelectItem key={m.id} value={m.id} disabled={m.isComingSoon}>
                            <div className="flex items-center gap-2">
                              <span className={m.isComingSoon ? 'text-muted-foreground' : ''}>
                                {m.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{m.provider}</span>
                              {m.badge && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {m.badge.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                      {ASPECT_RATIOS.map((r) => (
                        <Button
                          key={r.id}
                          variant={imageConfig.aspectRatio === r.id ? 'secondary' : 'outline'}
                          size="sm"
                          className={imageConfig.aspectRatio === r.id ? 'border-neon/50 bg-neon/10' : ''}
                          onClick={() =>
                            onImageConfigChange({ ...imageConfig, aspectRatio: r.id })
                          }
                        >
                          {r.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Images */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Number of Images</label>
                      <Badge variant="secondary">{imageConfig.numImages}</Badge>
                    </div>
                    <Slider
                      value={[imageConfig.numImages]}
                      onValueChange={([v]) =>
                        onImageConfigChange({ ...imageConfig, numImages: v })
                      }
                      min={1}
                      max={8}
                      step={1}
                    />
                  </div>

                  {/* Image Style */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select
                      value={imageConfig.imageStyle}
                      onValueChange={(v) =>
                        onImageConfigChange({ ...imageConfig, imageStyle: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={onGenerate}
            disabled={isGenerating}
            data-testid="generate-button"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate {mode === 'video' ? 'Video' : 'Image'} Ad
              </>
            )}
          </Button>
          {mode === 'video' && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              ~2-5 minutes generation time
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Ready to generate</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Review your product kit and click Generate to create your{' '}
            {mode === 'video' ? 'video' : 'image'} ad
          </p>
        </div>
      </div>
    </div>
  )
}
