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
import { useImageGeneration } from '@/hooks/use-generation'

const IMAGE_MODELS = [
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI' },
  { id: 'seedream-4.5', name: 'Seedream 4.5', provider: 'ByteDance', badge: 'new' },
  { id: 'flux-2', name: 'FLUX.2', provider: 'Black Forest Labs', badge: 'new' },
  { id: 'midjourney', name: 'Midjourney', provider: 'Midjourney' },
  { id: 'imagen-4', name: 'Imagen 4', provider: 'Google' },
  { id: 'ideogram-3', name: 'Ideogram 3', provider: 'Ideogram' },
  { id: 'recraft-v3', name: 'Recraft V3', provider: 'Recraft' },
  { id: 'flux-kontext-pro', name: 'FLUX Kontext Pro', provider: 'Black Forest Labs' },
]

interface ImageResult {
  id: string
  src: string
  prompt: string
}

export default function ClickToAdImagePage() {
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
  const [imageConfig, setImageConfig] = useState({
    model: 'gpt-image-1.5',
    aspectRatio: '1:1',
    numImages: 4,
    imageStyle: 'None',
  })
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([])

  const scraper = useProductScraper()
  const imageGeneration = useImageGeneration()

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
    const styleText =
      imageConfig.imageStyle !== 'None' ? ` ${imageConfig.imageStyle} style.` : ''

    const fullPrompt = `Professional image ad for ${product.productName}: ${product.productDescription}.${additionalContext ? ' Additional context: ' + additionalContext : ''}${styleText} High-quality product photography, marketing quality, attention-grabbing.`

    setStep(3)

    try {
      // Upload selected images to get filenames for input_images
      const inputImages: string[] = []
      for (const imgUrl of product.selectedImages) {
        try {
          const imgResponse = await fetch(imgUrl)
          const blob = await imgResponse.blob()
          const ext = imgUrl.split('.').pop()?.split('?')[0] || 'jpg'
          const file = new File([blob], `product.${ext}`, { type: blob.type })

          const formData = new FormData()
          formData.append('file', file)
          const uploadRes = await fetch('/api/upload_image', {
            method: 'POST',
            body: formData,
          })
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            if (uploadData.filename) {
              inputImages.push(uploadData.filename)
            }
          }
        } catch {
          // Continue without this image
        }
      }

      const result = await imageGeneration.mutateAsync({
        model: imageConfig.model,
        prompt: fullPrompt,
        aspectRatio: imageConfig.aspectRatio,
        numImages: imageConfig.numImages,
        style: imageConfig.imageStyle !== 'None' ? imageConfig.imageStyle : undefined,
      })

      if (result?.images) {
        const newImages: ImageResult[] = result.images.map(
          (img: { id: string; src?: string; url?: string }) => ({
            id: img.id,
            src: img.src || img.url || '',
            prompt: product.productName,
          })
        )
        setGeneratedImages((prev) => [...newImages, ...prev])
        toast.success(`Generated ${newImages.length} image(s)!`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image generation failed'
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
    setGeneratedImages([])
  }

  if (step === 1) {
    return (
      <ClickToAdUrlStep
        mode="image"
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
        mode="image"
        product={product}
        onProductChange={setProduct}
        imageConfig={imageConfig}
        onImageConfigChange={setImageConfig}
        onBack={() => setStep(1)}
        onGenerate={handleGenerate}
        isGenerating={imageGeneration.isPending}
        imageModels={IMAGE_MODELS}
      />
    )
  }

  return (
    <ClickToAdGeneration
      mode="image"
      imageResults={generatedImages}
      isGenerating={imageGeneration.isPending}
      onRegenerate={handleGenerate}
      onBack={() => setStep(2)}
      onNewAd={handleStartOver}
    />
  )
}
