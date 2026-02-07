'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, RefreshCw, Sparkles, Download, ZoomIn } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UpscalePanel, UpscaleSettings } from '@/components/generation/UpscalePanel'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

interface UpscaleResult {
  id: string
  src: string
  settings: UpscaleSettings
}

export default function ImageUpscalePage() {
  const [results, setResults] = useState<UpscaleResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const imageUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  const handleSubmit = async (settings: UpscaleSettings) => {
    if (!imageUpload.filename) {
      toast.error('Please upload an image first')
      return
    }

    try {
      // Map scale factor to number
      const scaleMap: Record<string, number> = {
        'x1': 1,
        'x2': 2,
        'x4': 4,
        'x8': 8,
        'x16': 16,
      }

      const result = await featureGeneration.mutateAsync({
        featureType: 'upscale',
        inputImages: [imageUpload.filename],
        params: {
          scale_factor: scaleMap[settings.scaleFactor] || 2,
          model: settings.model,
          preset: settings.preset,
          sharpness: settings.sharpness / 100,
          denoise: settings.denoise / 100,
          face_enhancement: settings.faceEnhancement,
        },
      })

      if (result) {
        const newResult: UpscaleResult = {
          id: result.id || `upscale_${Date.now()}`,
          src: result.url || result.src || '',
          settings,
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Upscale complete!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upscale failed'
      toast.error(message)
    }
  }

  const handleDownload = async (src: string) => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `upscaled-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download image')
    }
  }

  // Upload state (no image uploaded yet)
  if (!imageUpload.preview) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-3">
              Image <span className="text-neon neon-text">Upscale</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enhance your images to higher resolution with AI-powered upscaling
            </p>
          </motion.div>

          <motion.div
            className="max-w-2xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={imageUpload.handleFileSelect}
            />
            <div
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors bg-card/50"
              onClick={imageUpload.openFilePicker}
            >
              {imageUpload.isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-12 w-12 animate-spin text-neon" />
                  <p className="text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <>
                  <ZoomIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Upload an image to upscale</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to select a file
                  </p>
                  <Button variant="neon">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Features preview */}
          <motion.div
            className="max-w-4xl w-full mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Upscale Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Scale up to 16x', icon: ZoomIn },
                { label: 'Face Enhancement', icon: Sparkles },
                { label: 'Noise Reduction', icon: Download },
                { label: 'Detail Sharpening', icon: Upload },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-neon/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-neon" />
                  </div>
                  <span className="text-xs font-medium text-center">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Editor state (image uploaded)
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main Image Area - Centered */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                imageUpload.clear()
                setResults([])
              }}
            >
              <X className="h-3 w-3" />
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={imageUpload.openFilePicker}
            >
              <Upload className="h-3 w-3" />
              Replace Image
            </Button>
            <input
              ref={imageUpload.fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={imageUpload.handleFileSelect}
            />
          </div>
          {results.length > 0 && (
            <Badge variant="secondary">{results.length} upscale(s)</Badge>
          )}
        </div>

        {/* Canvas area - Image centered */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="flex gap-6 items-center">
            {/* Original Image */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Badge variant="secondary">Original</Badge>
              <div className="rounded-xl overflow-hidden border border-border shadow-lg relative group">
                <img
                  src={imageUpload.preview}
                  alt="Original"
                  className="max-w-[450px] max-h-[450px] object-contain"
                />
              </div>
            </motion.div>

            {/* Result Image */}
            <AnimatePresence mode="wait">
              {results.length > 0 && (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Badge variant="default" className="bg-neon text-black">
                    Upscaled {results[0].settings.scaleFactor}
                  </Badge>
                  <div className="rounded-xl overflow-hidden border border-neon/30 shadow-lg relative group">
                    <Image
                      src={results[0].src}
                      alt="Upscaled result"
                      width={450}
                      height={450}
                      className="max-w-[450px] max-h-[450px] object-contain"
                      unoptimized
                    />
                    <button
                      onClick={() => handleDownload(results[0].src)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing State */}
            {featureGeneration.isPending && (
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Badge variant="secondary">Processing</Badge>
                <div className="w-[450px] h-[450px] rounded-xl border border-border flex items-center justify-center bg-card/50">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-12 w-12 animate-spin text-neon" />
                    <p className="text-muted-foreground">Upscaling image...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results strip */}
        {results.length > 1 && (
          <div className="border-t border-border p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Upscale History</h3>
              <Badge variant="secondary">{results.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="relative flex-shrink-0 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={() => {
                    // Move this result to top
                    setResults((prev) => [result, ...prev.filter((r) => r.id !== result.id)])
                  }}
                >
                  <Image
                    src={result.src}
                    alt="Upscaled result"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover"
                    unoptimized
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-0 left-0 right-0 text-[8px] rounded-none text-center justify-center"
                  >
                    {result.settings.scaleFactor}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Upscale Controls */}
      <UpscalePanel
        onSubmit={handleSubmit}
        isProcessing={featureGeneration.isPending}
        creditsCost={2}
      />
    </div>
  )
}
