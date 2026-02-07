'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film,
  Video,
  ImageIcon,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  FolderPlus,
  Play,
  Upload,
  Camera,
  Maximize,
  Grid3X3,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCinemaStudioStore,
  CAMERA_PRESETS,
  type AspectRatio,
  type Duration,
} from '@/stores/cinema-studio-store'
import { useImageGeneration, useVideoGeneration } from '@/hooks/use-generation'
import { useUpload } from '@/hooks/use-upload'
import { toast } from 'sonner'

const IMAGE_MODELS = [
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5' },
  { id: 'imagen-4', name: 'Imagen 4' },
  { id: 'flux-2-pro-replicate', name: 'FLUX 2 Pro' },
  { id: 'ideogram-v3-turbo', name: 'Ideogram V3 Turbo' },
]

const VIDEO_MODELS_CINEMA = [
  { id: 'kling-v2.6-replicate', name: 'Kling v2.6' },
  { id: 'veo-3.1', name: 'Google Veo 3.1' },
  { id: 'sora-2', name: 'Sora 2' },
  { id: 'hailuo-o2', name: 'Hailuo O2' },
  { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro' },
]

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '16:9', label: '16:9', icon: '⬜' },
  { value: '9:16', label: '9:16', icon: '📱' },
  { value: '1:1', label: '1:1', icon: '⬛' },
]

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
]

export default function CinemaStudioPage() {
  const startFrameRef = useRef<HTMLInputElement>(null)
  const endFrameRef = useRef<HTMLInputElement>(null)
  const [selectedModel, setSelectedModel] = useState('kling-v2.6-replicate')

  const imageGeneration = useImageGeneration()
  const videoGeneration = useVideoGeneration()
  const { upload: uploadFile } = useUpload()

  const {
    mode,
    setMode,
    aspectRatio,
    setAspectRatio,
    duration,
    setDuration,
    audioEnabled,
    setAudioEnabled,
    frameCount,
    setFrameCount,
    startFrame,
    setStartFrame,
    endFrame,
    setEndFrame,
    camera,
    setCamera,
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    projects,
    sidebarVisible,
    setSidebarVisible,
    generatedContent,
    addGeneratedContent,
  } = useCinemaStudioStore()

  const handleStartFrameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) setStartFrame(file)
    },
    [setStartFrame]
  )

  const handleEndFrameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) setEndFrame(file)
    },
    [setEndFrame]
  )

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && !startFrame) return
    setIsGenerating(true)

    const cameraPrompt = `Shot on ${camera.name}, ${camera.lens} lens, f/${camera.focalLength}. ${prompt}`

    try {
      if (mode === 'image') {
        const modelId = IMAGE_MODELS.find((m) => m.id === selectedModel)
          ? selectedModel
          : IMAGE_MODELS[0].id

        const inputImages: string[] = []
        if (startFrame) {
          const uploadResult = await uploadFile(startFrame)
          if (uploadResult?.url) inputImages.push(uploadResult.url)
        }

        const result = await imageGeneration.mutateAsync({
          model: modelId,
          prompt: cameraPrompt,
          aspectRatio: aspectRatio,
          numImages: frameCount,
          inputImages: inputImages.length > 0 ? inputImages : undefined,
        })

        if (result?.images) {
          for (const img of result.images) {
            addGeneratedContent({
              type: 'image',
              url: img.url || img.src || '',
              prompt,
            })
          }
          toast.success('Images generated!')
        }
      } else {
        const modelId = VIDEO_MODELS_CINEMA.find((m) => m.id === selectedModel)
          ? selectedModel
          : VIDEO_MODELS_CINEMA[0].id

        const result = await videoGeneration.mutateAsync({
          model: modelId,
          prompt: cameraPrompt,
          duration: duration,
          aspectRatio: aspectRatio,
          sourceImage: startFrame,
        })

        if (result?.url) {
          addGeneratedContent({
            type: 'video',
            url: result.url,
            prompt,
          })
          toast.success('Video generated!')
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [
    prompt, startFrame, mode, selectedModel, camera, aspectRatio,
    frameCount, duration, setIsGenerating, addGeneratedContent,
    imageGeneration, videoGeneration, uploadFile,
  ])

  const creditCost = mode === 'video' ? (duration === 5 ? 2 : 8) : 1

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarVisible && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-r border-border bg-card/50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <Button variant="outline" className="w-full gap-2" size="sm">
                <FolderPlus className="h-4 w-4" />
                New project
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Projects
                </h3>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No projects yet
                  </p>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="gap-2"
          >
            {sidebarVisible ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4" />
                Show
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Cinema Studio
            </Badge>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20">
          <div className="relative w-full max-w-4xl">
            {/* Main Preview */}
            <motion.div
              className={cn(
                'relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-2xl',
                aspectRatio === '16:9' && 'aspect-video',
                aspectRatio === '9:16' && 'aspect-[9/16] max-h-[500px] mx-auto',
                aspectRatio === '1:1' && 'aspect-square max-h-[500px] mx-auto'
              )}
              layout
            >
              {generatedContent.length > 0 ? (
                <div className="relative w-full h-full">
                  {generatedContent[0].type === 'video' ? (
                    <video
                      src={generatedContent[0].url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      loop
                    />
                  ) : (
                    <Image
                      src={generatedContent[0].url}
                      alt="Generated"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <Film className="h-16 w-16 text-neon/50 mb-6" />
                  <h2 className="text-2xl font-bold mb-2">EXPLORE FEATURES</h2>
                  <p className="text-4xl font-bold text-neon neon-text">CINEMA STUDIO</p>
                  <p className="text-muted-foreground mt-4 max-w-md">
                    Create cinematic videos and images with AI-powered camera simulation
                  </p>
                </div>
              )}

              {/* Play overlay for videos */}
              {generatedContent.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-20 h-20 rounded-full bg-neon/90 flex items-center justify-center cursor-pointer hover:bg-neon transition-colors">
                    <Play className="h-8 w-8 text-black fill-black ml-1" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Carousel */}
            {generatedContent.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {generatedContent.slice(0, 6).map((content, i) => (
                  <div
                    key={content.id}
                    className={cn(
                      'w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                      i === 0 ? 'border-neon' : 'border-transparent hover:border-border'
                    )}
                  >
                    {content.type === 'video' ? (
                      <video src={content.url} className="w-full h-full object-cover" />
                    ) : (
                      <Image
                        src={content.url}
                        alt=""
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-border bg-card/80 backdrop-blur-xl p-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-[200px_1fr] gap-6">
              {/* Left Controls */}
              <div className="space-y-3">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={mode === 'image' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn('flex-1 gap-1.5', mode === 'image' && 'bg-background')}
                    onClick={() => setMode('image')}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </Button>
                  <Button
                    variant={mode === 'video' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn('flex-1 gap-1.5', mode === 'video' && 'bg-background')}
                    onClick={() => setMode('video')}
                  >
                    <Video className="h-4 w-4" />
                    Video
                  </Button>
                </div>

                {/* Model Selector */}
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS_CINEMA).map(
                      (m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Movements */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">Movements</span>
                  </div>

                  {/* Aspect Ratio */}
                  <Select
                    value={aspectRatio}
                    onValueChange={(v) => setAspectRatio(v as AspectRatio)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <Maximize className="h-3 w-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Duration (Video only) */}
                  {mode === 'video' && (
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                      <Clock className="h-3 w-3 text-muted-foreground ml-1" />
                      {DURATION_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          variant={duration === opt.value ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setDuration(opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Audio Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    <span className="text-xs">{audioEnabled ? 'On' : 'Off'}</span>
                  </Button>
                </div>

                {/* Frame Count */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground">Frames</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFrameCount(Math.max(1, frameCount - 1))}
                      disabled={frameCount <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-4 text-center">{frameCount}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFrameCount(Math.min(8, frameCount + 1))}
                      disabled={frameCount >= 8}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Controls - Prompt & Frames */}
              <div className="space-y-3">
                {/* Prompt */}
                <Textarea
                  placeholder="Describe your cinematic scene..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px] resize-none bg-muted/30"
                />

                {/* Frame Upload Row */}
                <div className="flex items-center gap-4">
                  {/* Start Frame */}
                  <div
                    className="flex-1 flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-neon/50 cursor-pointer transition-colors"
                    onClick={() => startFrameRef.current?.click()}
                  >
                    <input
                      ref={startFrameRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleStartFrameChange}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {startFrame ? (
                        <ImageIcon className="h-5 w-5 text-neon" />
                      ) : (
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {startFrame ? startFrame.name : 'START FRAME'}
                      </p>
                      <p className="text-xs text-muted-foreground">Optional</p>
                    </div>
                  </div>

                  {/* End Frame */}
                  <div
                    className="flex-1 flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-neon/50 cursor-pointer transition-colors"
                    onClick={() => endFrameRef.current?.click()}
                  >
                    <input
                      ref={endFrameRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEndFrameChange}
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      {endFrame ? (
                        <ImageIcon className="h-5 w-5 text-neon" />
                      ) : (
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {endFrame ? endFrame.name : 'END FRAME'}
                      </p>
                      <p className="text-xs text-muted-foreground">Optional</p>
                    </div>
                  </div>
                </div>

                {/* Camera & Generate Row */}
                <div className="flex items-center gap-4">
                  {/* Camera Select */}
                  <div className="flex-1">
                    <Select
                      value={camera.id}
                      onValueChange={(v) => {
                        const preset = CAMERA_PRESETS.find((p) => p.id === v)
                        if (preset) setCamera(preset)
                      }}
                    >
                      <SelectTrigger className="bg-muted/30">
                        <Camera className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMERA_PRESETS.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{preset.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {preset.lens}, {preset.focalLength}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    variant="neon"
                    size="lg"
                    className="px-8 gap-2"
                    onClick={handleGenerate}
                    disabled={(!prompt.trim() && !startFrame) || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Generating...
                      </>
                    ) : (
                      <>
                        GENERATE
                        <Badge variant="secondary" className="ml-1 text-xs">
                          <Sparkles className="h-3 w-3 mr-0.5" />
                          {creditCost}
                        </Badge>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
