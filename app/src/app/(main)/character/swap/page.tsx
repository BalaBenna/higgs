'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Upload,
  RefreshCw,
  Repeat,
  X,
  ArrowRight,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { GeneratedImage } from '@/components/generation/GeneratedImage'
import { HistoryDialog } from '@/components/generation/HistoryDialog'
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
  isDragging,
  onFileSelect,
  onClear,
  openFilePicker,
  fileInputRef,
  dropZoneProps,
}: {
  label: string
  description: string
  preview: string | null
  isUploading: boolean
  isDragging?: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  openFilePicker: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  dropZoneProps?: Record<string, (e: React.DragEvent) => void>
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors min-h-[140px] flex items-center justify-center ${isDragging
          ? 'border-neon bg-neon/10'
          : 'border-border hover:border-neon/50'
          }`}
        onClick={openFilePicker}
        {...dropZoneProps}
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

export default function CharacterSwapPage() {
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<GeneratedResult[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  const sourceUpload = useUpload()
  const targetUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  const handleGenerate = async () => {
    if (!sourceUpload.url || !targetUpload.url) {
      toast.error('Please upload both a source character and target scene')
      return
    }

    try {
      const result = await featureGeneration.mutateAsync({
        featureType: 'character_swap',
        inputImages: [sourceUpload.url, targetUpload.url],
        prompt: prompt || undefined,
      })

      if (result) {
        const newResult: GeneratedResult = {
          id: result.id || `cs_${Date.now()}`,
          src: result.url || result.src || '',
          prompt: prompt || 'Character swap result',
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Character swap completed!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Character swap failed'
      toast.error(message)
    }
  }

  const canGenerate =
    !!sourceUpload.url &&
    !!targetUpload.url &&
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
                <Repeat className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-semibold">Character Swap</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Replace entire characters while preserving scene context
              </p>
            </motion.div>

            {/* Upload Zones */}
            <div className="space-y-4">
              <UploadZone
                label="Source Character"
                description="Drop image here or click to upload"
                preview={sourceUpload.preview}
                isUploading={sourceUpload.isUploading}
                isDragging={sourceUpload.isDragging}
                onFileSelect={sourceUpload.handleFileSelect}
                onClear={sourceUpload.clear}
                openFilePicker={sourceUpload.openFilePicker}
                fileInputRef={sourceUpload.fileInputRef}
                dropZoneProps={sourceUpload.dropZoneProps}
              />

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-neon" />
                </div>
              </div>

              <UploadZone
                label="Target Scene"
                description="Drop image here or click to upload"
                preview={targetUpload.preview}
                isUploading={targetUpload.isUploading}
                isDragging={targetUpload.isDragging}
                onFileSelect={targetUpload.handleFileSelect}
                onClear={targetUpload.clear}
                openFilePicker={targetUpload.openFilePicker}
                fileInputRef={targetUpload.fileInputRef}
                dropZoneProps={targetUpload.dropZoneProps}
              />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Guidance Prompt{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Describe any adjustments, e.g. 'Match the lighting' or 'Keep the pose'..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={sourceUpload.url ? 'new' : 'secondary'}>
                  {sourceUpload.url ? 'Character Ready' : 'Character Needed'}
                </Badge>
                <Badge variant={targetUpload.url ? 'new' : 'secondary'}>
                  {targetUpload.url ? 'Scene Ready' : 'Scene Needed'}
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
                Swapping Character...
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
                  Your character swap results will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setHistoryOpen(true)}>
                <ImageIcon className="h-4 w-4" />
                View History
              </Button>
              <HistoryDialog
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                featureType="character_swap"
                title="Character Swap"
              />
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
                  <Repeat className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No results yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload a source character and target scene, then click Generate
                  to swap characters
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
