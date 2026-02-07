'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import { ModelSelector } from './ModelSelector'
import { StyleSelector } from './StyleSelector'
import { ThemeSelector } from './ThemeSelector'
import { DurationSelector } from './DurationSelector'
import { AspectRatioSelector } from './AspectRatioSelector'
import { MediaUploader, type MediaFile } from './MediaUploader'
import { RemotionPreview } from './RemotionPreview'

import { useVibeMotionGeneration, useMotionMediaUpload } from '@/hooks/use-vibe-motion'
import {
  ASPECT_RATIO_DATA,
  MODEL_DATA,
  PRESET_LABELS,
  QUICK_PROMPTS,
  THEME_DATA,
  type AspectRatioId,
  type ModelId,
  type PresetId,
  type StyleId,
  type ThemeId,
} from '@/lib/remotion/types'

interface VibeMotionCreatorProps {
  preset: PresetId
  onBack: () => void
}

export function VibeMotionCreator({ preset, onBack }: VibeMotionCreatorProps) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<ModelId>('gpt-4o')
  const [style, setStyle] = useState<StyleId | undefined>()
  const [theme, setTheme] = useState<ThemeId | undefined>()
  const [duration, setDuration] = useState(10)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('16:9')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [previewDuration, setPreviewDuration] = useState(10)

  const ratioData = ASPECT_RATIO_DATA.find((r) => r.id === aspectRatio) ?? ASPECT_RATIO_DATA[0]

  const mediaUpload = useMotionMediaUpload()

  const onCodeUpdate = useCallback((code: string) => {
    setGeneratedCode(code)
  }, [])

  const generation = useVibeMotionGeneration({ onCodeUpdate })

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    const effectiveDuration = duration === 0 ? 10 : duration
    setPreviewDuration(effectiveDuration)
    setGeneratedCode('')

    const themeColors = theme
      ? THEME_DATA.find((t) => t.id === theme)?.colors
      : undefined

    const mediaUrls = mediaFiles
      .filter((f) => f.url)
      .map((f) => f.url as string)

    try {
      await generation.mutateAsync({
        prompt,
        preset,
        style,
        theme,
        themeColors,
        duration: effectiveDuration,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        model,
        aspectRatio,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    }
  }

  const handleMediaUpload = async (file: File) => {
    const result = await mediaUpload.mutateAsync(file)
    return result
  }

  const quickPrompts = QUICK_PROMPTS[preset]

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Top bar */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Change preset
        </Button>
        <Badge variant="secondary" className="text-xs">
          {PRESET_LABELS[preset]}
        </Badge>
      </motion.div>

      {/* Preview area */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <RemotionPreview
          code={generatedCode}
          durationInSeconds={previewDuration}
          isGenerating={generation.isPending}
          width={ratioData.width}
          height={ratioData.height}
        />
      </motion.div>

      {/* Form */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Media Upload */}
        <MediaUploader
          files={mediaFiles}
          onFilesChange={setMediaFiles}
          onUpload={handleMediaUpload}
          isUploading={mediaUpload.isPending}
        />

        {/* Aspect Ratio */}
        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

        {/* Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your video</label>
          <Textarea
            placeholder="Describe the motion graphic you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Quick prompt chips */}
        {quickPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((chip) => (
              <Button
                key={chip}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPrompt(chip)}
              >
                {chip}
              </Button>
            ))}
          </div>
        )}

        {/* Model */}
        <ModelSelector value={model} onChange={setModel} />

        {/* Style */}
        <StyleSelector value={style} onChange={setStyle} />

        {/* Theme */}
        <ThemeSelector value={theme} onChange={setTheme} />

        {/* Duration */}
        <DurationSelector value={duration} onChange={setDuration} />

        {/* Generate Button */}
        <div className="pt-4 pb-8">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generation.isPending}
          >
            {generation.isPending ? (
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
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by {MODEL_DATA.find((m) => m.id === model)?.label ?? 'AI'} — generation takes
            ~10-30 seconds
          </p>
        </div>
      </motion.div>
    </div>
  )
}
