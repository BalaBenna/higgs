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
  Wand2,
  Loader2,
  Trash2,
  Save,
  X,
  Sliders,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
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
  CAMERA_MOVEMENTS,
  type AspectRatio,
  type Duration,
} from '@/stores/cinema-studio-store'
import { useImageGeneration, useVideoGeneration } from '@/hooks/use-generation'
import { usePromptEnhancement } from '@/hooks/use-vibe-motion'
import { useUpload } from '@/hooks/use-upload'
import { toast } from 'sonner'

const IMAGE_MODELS = [
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5' },
  { id: 'imagen-4', name: 'Imagen 4' },
  { id: 'flux-2-pro-replicate', name: 'FLUX 2 Pro' },
  { id: 'ideogram-v3-turbo', name: 'Ideogram V3 Turbo' },
]

const VIDEO_MODELS_CINEMA = [
  { id: 'generate_video_by_kling_v26_replicate', name: 'Kling v2.6', supportsImage: true },
  { id: 'generate_video_by_veo_google', name: 'Google Veo 3.1', supportsImage: true },
  { id: 'generate_video_by_sora_2_jaaz', name: 'Sora 2', supportsImage: false },
  { id: 'generate_video_by_hailuo_02_jaaz', name: 'Hailuo O2', supportsImage: false },
  { id: 'generate_video_by_seedance_v1_pro_volces', name: 'Seedance 1.5 Pro', supportsImage: false },
]

// Helper to check if selected model supports image input
const getSelectedVideoModel = (id: string) => VIDEO_MODELS_CINEMA.find(m => m.id === id)

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '16:9', label: '16:9', icon: '⬜' },
  { value: '9:16', label: '9:16', icon: '📱' },
  { value: '1:1', label: '1:1', icon: '⬛' },
  { value: '4:5', label: '4:5', icon: '📸' },
  { value: '21:9', label: '21:9', icon: '🎬' },
  { value: '4:3', label: '4:3', icon: '📽️' },
  { value: '3:4', label: '3:4', icon: '📱' },
]

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
]

export default function CinemaStudioPage() {
  const startFrameRef = useRef<HTMLInputElement>(null)
  const endFrameRef = useRef<HTMLInputElement>(null)
  const [selectedModel, setSelectedModel] = useState('generate_video_by_kling_v26_replicate')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Set default values for advanced settings based on selected model
  const modelSupportsAdvanced = selectedModel.includes('kling_v26')
  const [newProjectName, setNewProjectName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showMovementDropdown, setShowMovementDropdown] = useState(false)

  const imageGeneration = useImageGeneration()
  const videoGeneration = useVideoGeneration()
  const promptEnhancement = usePromptEnhancement()
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
    negativePrompt,
    setNegativePrompt,
    cfgScale,
    setCfgScale,
    motionStrength,
    setMotionStrength,
    startFrame,
    setStartFrame,
    endFrame,
    setEndFrame,
    camera,
    setCamera,
    movement,
    setMovement,
    movementVisible,
    setMovementVisible,
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    projects,
    activeProjectId,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
    loadProject,
    sidebarVisible,
    setSidebarVisible,
    generatedContent,
    addGeneratedContent,
    clearGeneratedContent,
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
    if (!prompt.trim() && !startFrame) {
      toast.error('Please enter a prompt or upload a start frame')
      return
    }
    setIsGenerating(true)

    let movementText = ''
    if (movement.id !== 'static') {
      movementText = `Camera movement: ${movement.name.toLowerCase()}. `
    }
    const cameraPrompt = `Shot on ${camera.name}, ${camera.lens} lens, f/${camera.focalLength}. ${movementText}${prompt}`

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
          negativePrompt: negativePrompt || undefined,
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
        const videoModel = getSelectedVideoModel(selectedModel)
        const modelId = videoModel?.id || VIDEO_MODELS_CINEMA[0].id

        // Check if model supports image input
        if (startFrame && videoModel && !videoModel.supportsImage) {
          toast.error(`${videoModel.name} does not support image input. Please use a different model or remove the uploaded image.`)
          setIsGenerating(false)
          return
        }

        const result = await videoGeneration.mutateAsync({
          model: modelId,
          prompt: cameraPrompt,
          duration: duration,
          aspectRatio: aspectRatio,
          sourceImage: startFrame,
          negativePrompt: negativePrompt || undefined,
          cfgScale: cfgScale,
          motionStrength: motionStrength,
          generateAudio: audioEnabled,
        })

        if (result?.url) {
          addGeneratedContent({
            type: 'video',
            url: result.url,
            prompt,
          })
          toast.success('Video generated!')
        } else if (result?.error) {
          toast.error(result.error)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      console.error('Generation error:', message)
      
      // Provide more helpful error messages
      if (message.includes('Coming Soon')) {
        toast.error('This model is coming soon. Please try a different model.')
      } else if (message.includes('not configured') || message.includes('API key')) {
        toast.error('API key not configured. Please check Settings.')
      } else if (message.includes('400')) {
        toast.error('Bad request. Try reducing parameters or using a different model.')
      } else if (message.includes('500')) {
        toast.error('Server error. Please try again or use a different model.')
      } else {
        toast.error(message)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [
    prompt, startFrame, endFrame, mode, selectedModel, camera, movement, aspectRatio,
    frameCount, duration, negativePrompt, cfgScale, motionStrength, audioEnabled,
    setIsGenerating, addGeneratedContent, imageGeneration, videoGeneration, uploadFile,
  ])

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to enhance')
      return
    }
    try {
      const result = await promptEnhancement.mutateAsync({
        prompt,
        preset: 'cinema',
      })
      setPrompt(result.enhancedPrompt)
      toast.success('Prompt enhanced!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhancement failed'
      toast.error(message)
    }
  }, [prompt, promptEnhancement, setPrompt])

  const handleSaveProject = useCallback(() => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    addProject({
      name: newProjectName,
      prompt,
      aspectRatio,
      duration,
      cameraId: camera.id,
      movementId: movement.id,
      audioEnabled,
    })
    setNewProjectName('')
    setShowSaveDialog(false)
    toast.success('Project saved!')
  }, [newProjectName, prompt, aspectRatio, duration, camera, movement, audioEnabled, addProject])

  const handleLoadProject = useCallback((project: typeof projects[0]) => {
    loadProject(project)
    toast.success(`Loaded project: ${project.name}`)
  }, [loadProject])

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject(id)
    toast.success('Project deleted')
  }, [deleteProject])

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
            <div className="p-4 border-b border-border space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                size="sm"
                onClick={() => setShowSaveDialog(true)}
              >
                <Save className="h-4 w-4" />
                Save Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                size="sm"
                onClick={clearGeneratedContent}
              >
                <Trash2 className="h-4 w-4" />
                Clear Content
              </Button>
            </div>

            {/* Save Project Dialog */}
            {showSaveDialog && (
              <div className="p-4 border-b border-border bg-muted/30 space-y-2">
                <Input
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="h-8"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={handleSaveProject}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setShowSaveDialog(false)
                      setNewProjectName('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Projects ({projects.length})
                </h3>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No projects saved
                  </p>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors group",
                        activeProjectId === project.id 
                          ? "bg-neon/10 border border-neon/30" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p 
                          className="text-sm font-medium truncate flex-1"
                          onClick={() => handleLoadProject(project)}
                        >
                          {project.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.duration}s • {project.aspectRatio} • {project.createdAt.toLocaleDateString()}
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
                          <div className="flex items-center gap-2">
                            <span>{m.name}</span>
                            {'supportsImage' in m && m.supportsImage === true && (
                              <Badge variant="outline" className="text-[10px] h-4">Img</Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Movements - Now Functional */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-9 gap-1.5 justify-start"
                      onClick={() => setShowMovementDropdown(!showMovementDropdown)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span className="text-xs truncate">{movement.name}</span>
                      <ChevronDown className={cn("h-3 w-3 ml-auto", showMovementDropdown && "rotate-180")} />
                    </Button>
                    {showMovementDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg z-50 max-h-48 overflow-y-auto">
                        {CAMERA_MOVEMENTS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setMovement(m)
                              setShowMovementDropdown(false)
                            }}
                            className={cn(
                              "w-full p-2 text-left text-xs hover:bg-accent/10 transition-colors",
                              movement.id === m.id && "bg-neon/10 text-neon"
                            )}
                          >
                            <span className="font-medium">{m.name}</span>
                            <span className="block text-muted-foreground text-[10px]">{m.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg col-span-2">
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
                    className={cn("h-9 gap-1.5", audioEnabled && "text-green-500")}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                    <span className="text-xs">Audio {audioEnabled ? 'On' : 'Off'}</span>
                  </Button>

                  {/* Advanced Settings Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-9 gap-1.5", showAdvanced && "text-neon")}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="text-xs">Advanced</span>
                  </Button>
                </div>

                {/* Advanced Settings Panel */}
                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 mt-2">
                    {/* CFG Scale */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">CFG Scale</span>
                        <span className="text-xs font-medium">{cfgScale}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={cfgScale}
                        onChange={(e) => setCfgScale(Number(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Motion Strength */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Motion</span>
                        <span className="text-xs font-medium">{motionStrength}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={motionStrength}
                        onChange={(e) => setMotionStrength(Number(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Negative Prompt */}
                    <div className="col-span-2 space-y-1">
                      <span className="text-xs text-muted-foreground">Negative Prompt</span>
                      <Input
                        placeholder="What to avoid..."
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    {/* Model info */}
                    <div className="col-span-2 text-[10px] text-muted-foreground text-center">
                      {selectedModel.includes('kling_v26') && 'Kling v2.6: Supports negative prompt & audio'}
                      {selectedModel.includes('kling_v25') && 'Kling v2.5: Supports guidance scale'}
                      {selectedModel.includes('veo_google') && 'Veo: Limited params, uses defaults'}
                      {selectedModel.includes('sora') && 'Sora: Basic params only'}
                      {selectedModel.includes('seedance') && 'Seedance: Basic params only'}
                      {selectedModel.includes('hailuo') && 'Hailuo: Basic params only'}
                    </div>
                  </div>
                )}

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
                {/* Prompt with Enhance */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Describe your scene</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-xs"
                      onClick={handleEnhancePrompt}
                      disabled={!prompt.trim() || promptEnhancement.isPending}
                    >
                      {promptEnhancement.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3" />
                      )}
                      Enhance
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Describe your cinematic scene... (e.g., 'pan left to reveal city skyline at sunset')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none bg-muted/30"
                  />
                </div>

                {/* Frame Upload Row */}
                {mode === 'video' && startFrame && !getSelectedVideoModel(selectedModel)?.supportsImage && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    ⚠️ {getSelectedVideoModel(selectedModel)?.name} does not support image input. Please remove the image or select a different model.
                  </div>
                )}
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
