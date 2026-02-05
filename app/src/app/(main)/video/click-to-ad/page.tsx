'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import {
  ClickToAdUrlStep,
  ClickToAdProductKit,
  ClickToAdGeneration,
} from '@/components/click-to-ad'
import type { ProductKitData } from '@/components/click-to-ad'
import { useProductScraper } from '@/hooks/use-product-scraper'
import { useVideoGeneration } from '@/hooks/use-generation'

const VIDEO_MODELS = [
  { id: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', quality: 'High' },
  { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', quality: 'Ultra' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', quality: 'High' },
  { id: 'hailuo-o2', name: 'Minimax Hailuo O2', provider: 'MiniMax', quality: 'High' },
]

const AD_FORMATS = [
  { id: 'instagram-reel', label: 'Instagram Reel', aspectRatio: '9:16' },
  { id: 'tiktok', label: 'TikTok', aspectRatio: '9:16' },
  { id: 'youtube-short', label: 'YouTube Short', aspectRatio: '9:16' },
  { id: 'story', label: 'Story', aspectRatio: '9:16' },
]

const STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'playful', label: 'Playful' },
]

interface VideoResult {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
  format: string
}

export default function ClickToAdVideoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [url, setUrl] = useState('')
  const [autoAnalyze, setAutoAnalyze] = useState(true)
  const [additionalContext, setAdditionalContext] = useState('')
  const [product, setProduct] = useState<ProductKitData>({
    productName: '',
    productDescription: '',
    images: [],
    selectedImages: [],
    favicon: '',
    siteName: '',
  })
  const [videoConfig, setVideoConfig] = useState({
    model: 'kling-2.6',
    adFormat: 'instagram-reel',
    duration: '5',
    style: 'cinematic',
  })
  const [generatedVideos, setGeneratedVideos] = useState<VideoResult[]>([])

  const scraper = useProductScraper()
  const videoGeneration = useVideoGeneration()

  const handleScrape = async () => {
    if (!url.trim()) return

    try {
      const data = await scraper.mutateAsync({ url, autoAnalyze })
      setProduct({
        productName: data.product_name,
        productDescription: data.product_description,
        images: data.images,
        selectedImages: data.images.length > 0 ? [data.images[0]] : [],
        favicon: data.favicon,
        siteName: data.site_name,
      })
      setStep(2)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze product'
      toast.error(message)
    }
  }

  const handleGenerate = async () => {
    const format = AD_FORMATS.find((f) => f.id === videoConfig.adFormat)
    const style = STYLES.find((s) => s.id === videoConfig.style)
    const formatLabel = format?.label || 'Instagram Reel'
    const styleLabel = style?.label || 'Cinematic'
    const aspectRatio = format?.aspectRatio || '9:16'

    const fullPrompt = `Professional ${styleLabel} ${formatLabel} video ad for ${product.productName}: ${product.productDescription}.${additionalContext ? ' Additional context: ' + additionalContext : ''} Dynamic product showcase, engaging visuals, marketing quality.`

    setStep(3)

    try {
      // Fetch the first selected image as a File for sourceImage
      let sourceImage: File | null = null
      if (product.selectedImages.length > 0) {
        try {
          const imgResponse = await fetch(product.selectedImages[0])
          const blob = await imgResponse.blob()
          const ext = product.selectedImages[0].split('.').pop()?.split('?')[0] || 'jpg'
          sourceImage = new File([blob], `product.${ext}`, { type: blob.type })
        } catch {
          // Continue without source image
        }
      }

      const result = await videoGeneration.mutateAsync({
        model: videoConfig.model,
        prompt: fullPrompt,
        duration: parseInt(videoConfig.duration),
        aspectRatio,
        sourceImage,
      })

      if (result) {
        const newVideo: VideoResult = {
          id: result.id || `ad_${Date.now()}`,
          url: result.url || '',
          prompt: product.productName,
          duration: `${videoConfig.duration}s`,
          model: VIDEO_MODELS.find((m) => m.id === videoConfig.model)?.name || videoConfig.model,
          format: formatLabel,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Ad video generated successfully!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed'
      toast.error(message)
    }
  }

  const handleStartOver = () => {
    setStep(1)
    setUrl('')
    setAutoAnalyze(true)
    setAdditionalContext('')
    setProduct({
      productName: '',
      productDescription: '',
      images: [],
      selectedImages: [],
      favicon: '',
      siteName: '',
    })
    setGeneratedVideos([])
  }

  if (step === 1) {
    return (
      <ClickToAdUrlStep
        mode="video"
        url={url}
        onUrlChange={setUrl}
        autoAnalyze={autoAnalyze}
        onAutoAnalyzeChange={setAutoAnalyze}
        additionalContext={additionalContext}
        onAdditionalContextChange={setAdditionalContext}
        onContinue={handleScrape}
        isLoading={scraper.isPending}
      />
    )
  }

  if (step === 2) {
    return (
      <ClickToAdProductKit
        mode="video"
        product={product}
        onProductChange={setProduct}
        videoConfig={videoConfig}
        onVideoConfigChange={setVideoConfig}
        onBack={() => setStep(1)}
        onGenerate={handleGenerate}
        isGenerating={videoGeneration.isPending}
        videoModels={VIDEO_MODELS}
      />
    )
  }

  return (
    <ClickToAdGeneration
      mode="video"
      videoResults={generatedVideos}
      isGenerating={videoGeneration.isPending}
      onRegenerate={handleGenerate}
      onBack={() => setStep(2)}
      onNewAd={handleStartOver}
    />
  )
}
