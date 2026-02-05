'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  Upload,
  RefreshCw,
  Download,
  X,
  Sparkles,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUpload } from '@/hooks/use-upload'
import { useFeatureGeneration } from '@/hooks/use-feature'

const SCALE_FACTORS = [
  { id: '2', label: '2x', desc: 'Double resolution' },
  { id: '4', label: '4x', desc: 'Quadruple resolution' },
]

const ENHANCEMENTS = [
  { id: 'noise_reduction', label: 'Noise Reduction' },
  { id: 'color_enhancement', label: 'Color Enhancement' },
  { id: 'detail_boost', label: 'Detail Boost' },
]

interface UpscaleResult {
  id: string
  originalPreview: string
  resultUrl: string
  scale: string
  enhancements: string[]
}

export default function VideoUpscalePage() {
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const [scale, setScale] = useState('2')
  const [activeEnhancements, setActiveEnhancements] = useState<string[]>([])
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)
  const [results, setResults] = useState<UpscaleResult[]>([])

  const uploader = useUpload()
  const featureGeneration = useFeatureGeneration()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSourceFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setSourcePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearFile = () => {
    setSourceFile(null)
    setSourcePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleEnhancement = (id: string) => {
    setActiveEnhancements((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const handleUpscale = async () => {
    if (!sourceFile) {
      toast.error('Please upload a file to upscale')
      return
    }

    try {
      // Upload the file first
      const uploadResult = await uploader.upload(sourceFile)
      if (!uploadResult) {
        toast.error('Failed to upload file')
        return
      }

      const result = await featureGeneration.mutateAsync({
        featureType: 'upscale',
        inputImages: [uploadResult.filename],
        params: {
          scale: parseInt(scale),
          ...activeEnhancements.reduce(
            (acc, e) => ({ ...acc, [e]: 1 }),
            {} as Record<string, number>
          ),
        },
      })

      if (result) {
        const newResult: UpscaleResult = {
          id: result.id || `upscale_${Date.now()}`,
          originalPreview: sourcePreview || '',
          resultUrl: result.url || result.src || '',
          scale: `${scale}x`,
          enhancements: [...activeEnhancements],
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Upscale complete!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upscale failed'
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
              <ArrowUp className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Video Upscale</h2>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Source File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-neon/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {sourcePreview ? (
                  <div className="relative">
                    {sourceFile?.type.startsWith('video/') ? (
                      <div className="flex flex-col items-center gap-2">
                        <video
                          src={sourcePreview}
                          className="max-h-32 mx-auto rounded-lg"
                          muted
                        />
                        <p className="text-xs text-muted-foreground">{sourceFile.name}</p>
                      </div>
                    ) : (
                      <img
                        src={sourcePreview}
                        alt="Source preview"
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload image or video</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Image or video up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Scale Factor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Scale Factor</label>
              <div className="grid grid-cols-2 gap-2">
                {SCALE_FACTORS.map((s) => (
                  <Button
                    key={s.id}
                    variant={scale === s.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={scale === s.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setScale(s.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.desc}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Enhancement Toggles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enhancements</label>
              <div className="space-y-2">
                {ENHANCEMENTS.map((e) => (
                  <Button
                    key={e.id}
                    variant={activeEnhancements.includes(e.id) ? 'secondary' : 'outline'}
                    size="sm"
                    className={`w-full justify-start ${
                      activeEnhancements.includes(e.id) ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => toggleEnhancement(e.id)}
                  >
                    <div
                      className={`w-3 h-3 rounded-sm border mr-2 ${
                        activeEnhancements.includes(e.id)
                          ? 'bg-neon border-neon'
                          : 'border-muted-foreground'
                      }`}
                    />
                    {e.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Upscale Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleUpscale}
            disabled={!sourceFile || featureGeneration.isPending || uploader.isUploading}
          >
            {featureGeneration.isPending || uploader.isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {uploader.isUploading ? 'Uploading...' : 'Upscaling...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Upscale
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~1-3 minutes processing time
          </p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Upscale Results</h2>
                <p className="text-sm text-muted-foreground">
                  Before and after comparison
                </p>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="space-y-8">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="neon" className="text-xs">
                        {result.scale} Upscale
                      </Badge>
                      {result.enhancements.map((e) => (
                        <Badge key={e} variant="secondary" className="text-xs">
                          {e.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Original</p>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50">
                          {result.originalPreview ? (
                            <img
                              src={result.originalPreview}
                              alt="Original"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upscaled */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">
                            Upscaled ({result.scale})
                          </p>
                          {result.resultUrl && (
                            <a href={result.resultUrl} download>
                              <Button variant="ghost" size="sm" className="h-7 gap-1">
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50">
                          {result.resultUrl ? (
                            <img
                              src={result.resultUrl}
                              alt="Upscaled"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ArrowUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <ArrowUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No upscales yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload an image or video, choose scale and enhancements, then upscale
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
