'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Upload,
  RefreshCw,
  UserCircle,
  X,
  ArrowRight,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { GeneratedImage } from '@/components/generation/GeneratedImage'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

interface GeneratedResult {
  id: string
  src: string
  prompt: string
}

function UploadZone({
  label,
  description,
  preview,
  isUploading,
  onFileSelect,
  onClear,
  openFilePicker,
  fileInputRef,
  accept,
}: {
  label: string
  description: string
  preview: string | null
  isUploading: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  openFilePicker: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  accept?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || 'image/png,image/jpeg,image/webp'}
        className="hidden"
        onChange={onFileSelect}
      />
      <div
        className="relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors min-h-[140px] flex items-center justify-center"
        onClick={openFilePicker}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-neon" />
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt={label}
              className="max-h-28 mx-auto rounded-lg object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FaceSwapPage() {
  const [results, setResults] = useState<GeneratedResult[]>([])

  const sourceUpload = useUpload()
  const targetUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  const handleGenerate = async () => {
    if (!sourceUpload.filename || !targetUpload.filename) {
      toast.error('Please upload both a source face and target image')
      return
    }

    try {
      const result = await featureGeneration.mutateAsync({
        featureType: 'face_swap',
        inputImages: [sourceUpload.filename, targetUpload.filename],
      })

      if (result) {
        const newResult: GeneratedResult = {
          id: result.id || `fs_${Date.now()}`,
          src: result.url || result.src || '',
          prompt: 'Face swap result',
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Face swap completed!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Face swap failed'
      toast.error(message)
    }
  }

  const canGenerate =
    !!sourceUpload.filename &&
    !!targetUpload.filename &&
    !featureGeneration.isPending

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-semibold">Face Swap</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Swap faces between two images with AI
              </p>
            </motion.div>

            {/* Upload Zones */}
            <div className="space-y-4">
              <UploadZone
                label="Your Photo (Source Face)"
                description="Upload a photo with the face to use"
                preview={sourceUpload.preview}
                isUploading={sourceUpload.isUploading}
                onFileSelect={sourceUpload.handleFileSelect}
                onClear={sourceUpload.clear}
                openFilePicker={sourceUpload.openFilePicker}
                fileInputRef={sourceUpload.fileInputRef}
              />

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-neon" />
                </div>
              </div>

              <UploadZone
                label="Target Image"
                description="Upload the image to swap the face onto"
                preview={targetUpload.preview}
                isUploading={targetUpload.isUploading}
                onFileSelect={targetUpload.handleFileSelect}
                onClear={targetUpload.clear}
                openFilePicker={targetUpload.openFilePicker}
                fileInputRef={targetUpload.fileInputRef}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={sourceUpload.filename ? 'new' : 'secondary'}>
                  {sourceUpload.filename ? 'Source Ready' : 'Source Needed'}
                </Badge>
                <Badge variant={targetUpload.filename ? 'new' : 'secondary'}>
                  {targetUpload.filename ? 'Target Ready' : 'Target Needed'}
                </Badge>
              </div>
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
            disabled={!canGenerate}
          >
            {featureGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Swapping Faces...
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

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Results</h2>
                <p className="text-sm text-muted-foreground">
                  Your face swap results will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                View History
              </Button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((image, index) => (
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
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No results yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload a source face and a target image, then click Generate
                  to swap faces
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
