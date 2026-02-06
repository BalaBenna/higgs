'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Video,
  Settings2,
  Upload,
  Play,
  Download,
  RefreshCw,
  ChevronDown,
  ImageIcon,
  Mic,
  Film,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useVideoGeneration } from '@/hooks/use-generation'

// Per-model capability flags
interface ModelCapabilities {
  supportsNegativePrompt?: boolean
  supportsCfgScale?: boolean
  supportsGuidanceScale?: boolean
  supportsGenerateAudio?: boolean
  supportsEndImage?: boolean
  supportsModes?: boolean
  requiresImage?: boolean
  requiresVideo?: boolean
  requiresAudio?: boolean
  isKlingReplicate?: boolean
}

const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  'kling-v2.6-replicate': {
    supportsNegativePrompt: true,
    supportsGenerateAudio: true,
    isKlingReplicate: true,
  },
  'kling-v2.5-turbo-replicate': {
    supportsGuidanceScale: true,
    supportsEndImage: true,
    isKlingReplicate: true,
  },
  'kling-v2.1-master-replicate': {
    supportsNegativePrompt: true,
    isKlingReplicate: true,
  },
  'kling-v2.0-replicate': {
    supportsCfgScale: true,
    supportsNegativePrompt: true,
    isKlingReplicate: true,
  },
  'kling-v1.6-standard-replicate': {
    supportsCfgScale: true,
    supportsNegativePrompt: true,
    isKlingReplicate: true,
  },
  'kling-v1.6-pro-replicate': {
    supportsCfgScale: true,
    supportsNegativePrompt: true,
    supportsEndImage: true,
    isKlingReplicate: true,
  },
  'kling-v1.5-pro-replicate': {
    supportsCfgScale: true,
    supportsNegativePrompt: true,
    supportsEndImage: true,
    isKlingReplicate: true,
  },
  'kling-v2.1-i2v-replicate': {
    supportsNegativePrompt: true,
    supportsEndImage: true,
    supportsModes: true,
    requiresImage: true,
    isKlingReplicate: true,
  },
  'kling-v2.6-motion-control-replicate': {
    supportsModes: true,
    requiresImage: true,
    requiresVideo: true,
    isKlingReplicate: true,
  },
  'kling-avatar-v2-replicate': {
    requiresImage: true,
    requiresAudio: true,
    isKlingReplicate: true,
  },
  'kling-lip-sync-replicate': {
    requiresVideo: true,
    requiresAudio: true,
    isKlingReplicate: true,
  },
}

interface VideoModelDef {
  id: string
  name: string
  provider: string
  quality?: string
  badge?: string
  toolId?: string
  isComingSoon?: boolean
}

const VIDEO_MODELS: VideoModelDef[] = [
  {
    id: 'higgsfield-dop',
    name: 'Higgsfield DOP',
    provider: 'Higgsfield',
    toolId: 'generate_video_by_higgsfield_dop_jaaz',
  },
  {
    id: 'kling-2.6',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    quality: 'High',
    toolId: 'generate_video_by_kling_v2_jaaz',
  },
  {
    id: 'veo-3.1',
    name: 'Google Veo 3.1',
    provider: 'Google',
    quality: 'Ultra',
    toolId: 'generate_video_by_veo3_fast_jaaz',
  },
  {
    id: 'seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    provider: 'ByteDance',
    quality: 'High',
    toolId: 'generate_video_by_seedance_v1_jaaz',
  },
  {
    id: 'hailuo-o2',
    name: 'Minimax Hailuo O2',
    provider: 'MiniMax',
    quality: 'High',
    toolId: 'generate_video_by_hailuo_02_jaaz',
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'xAI',
    badge: 'new',
    toolId: 'generate_video_by_grok_imagine_jaaz',
  },
  {
    id: 'kling-3.0',
    name: 'Kling 3.0',
    provider: 'Kuaishou',
    badge: 'new',
    toolId: 'generate_video_by_kling_3_jaaz',
  },
  {
    id: 'kling-motion-control',
    name: 'Kling Motion Control',
    provider: 'Kuaishou',
    badge: 'new',
    toolId: 'generate_video_by_kling_motion_control_jaaz',
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    toolId: 'generate_video_by_sora_2_jaaz',
  },
  {
    id: 'wan-2.6',
    name: 'Wan 2.6',
    provider: 'Alibaba',
    toolId: 'generate_video_by_wan_2_6_jaaz',
  },
  {
    id: 'kling-avatars-2.0',
    name: 'Kling Avatars 2.0',
    provider: 'Kuaishou',
    toolId: 'generate_video_by_kling_avatars_2_jaaz',
  },
  // Kling Replicate models
  {
    id: 'kling-v2.6-replicate',
    name: 'Kling v2.6',
    provider: 'Kuaishou',
    badge: 'new',
    quality: 'High',
  },
  {
    id: 'kling-v2.5-turbo-replicate',
    name: 'Kling v2.5 Turbo',
    provider: 'Kuaishou',
    badge: 'new',
    quality: 'Fast',
  },
  {
    id: 'kling-v2.1-master-replicate',
    name: 'Kling v2.1 Master',
    provider: 'Kuaishou',
    quality: 'High',
  },
  {
    id: 'kling-v2.0-replicate',
    name: 'Kling v2.0',
    provider: 'Kuaishou',
  },
  {
    id: 'kling-v1.6-standard-replicate',
    name: 'Kling v1.6 Standard',
    provider: 'Kuaishou',
  },
  {
    id: 'kling-v1.6-pro-replicate',
    name: 'Kling v1.6 Pro',
    provider: 'Kuaishou',
    quality: 'High',
  },
  {
    id: 'kling-v1.5-pro-replicate',
    name: 'Kling v1.5 Pro',
    provider: 'Kuaishou',
  },
  {
    id: 'kling-v2.1-i2v-replicate',
    name: 'Kling v2.1 (I2V)',
    provider: 'Kuaishou',
    badge: 'new',
  },
  {
    id: 'kling-v2.6-motion-control-replicate',
    name: 'Kling v2.6 Motion Ctrl',
    provider: 'Kuaishou',
    badge: 'new',
  },
  {
    id: 'kling-avatar-v2-replicate',
    name: 'Kling Avatar v2',
    provider: 'Kuaishou',
    badge: 'new',
  },
  {
    id: 'kling-lip-sync-replicate',
    name: 'Kling Lip Sync',
    provider: 'Kuaishou',
    badge: 'new',
  },
]

const DURATIONS = [
  { id: '5', label: '5 seconds' },
  { id: '10', label: '10 seconds' },
]

const RESOLUTIONS = [
  { id: '480p', label: '480p', desc: 'Fast' },
  { id: '720p', label: '720p', desc: 'Balanced' },
  { id: '1080p', label: '1080p', desc: 'High Quality' },
]

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9', desc: 'Landscape' },
  { id: '9:16', label: '9:16', desc: 'Portrait' },
  { id: '1:1', label: '1:1', desc: 'Square' },
]

interface GeneratedVideoData {
  id: string
  url: string
  thumbnail: string
  prompt: string
  duration: string
  model: string
}

function getBadgeVariant(badge?: string): 'new' | 'top' | 'best' | 'neon' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

function VideoPageContent() {
  const searchParams = useSearchParams()
  const modelParam = searchParams.get('model')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const endImageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('kling-2.6')
  const [duration, setDuration] = useState('5')
  const [resolution, setResolution] = useState('720p')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [motionStrength, setMotionStrength] = useState(5)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])

  // Kling-specific state
  const [negativePrompt, setNegativePrompt] = useState('')
  const [cfgScale, setCfgScale] = useState(0.5)
  const [guidanceScale, setGuidanceScale] = useState(0.5)
  const [generateAudio, setGenerateAudio] = useState(false)
  const [klingMode, setKlingMode] = useState<'standard' | 'pro'>('standard')
  const [endImage, setEndImage] = useState<File | null>(null)
  const [endImagePreview, setEndImagePreview] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoFileName, setVideoFileName] = useState<string | null>(null)
  const [lipSyncText, setLipSyncText] = useState('')

  const videoGeneration = useVideoGeneration()

  const caps = MODEL_CAPABILITIES[model] || {}

  // Reset model-specific state when model changes
  useEffect(() => {
    setNegativePrompt('')
    setCfgScale(0.5)
    setGuidanceScale(0.5)
    setGenerateAudio(false)
    setKlingMode('standard')
    setEndImage(null)
    setEndImagePreview(null)
    setAudioFile(null)
    setAudioFileName(null)
    setVideoFile(null)
    setVideoFileName(null)
    setLipSyncText('')
    // Auto-switch to image mode if the model requires an image
    if (caps.requiresImage) {
      setMode('image')
    }
  }, [model]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modelParam) {
      const foundModel = VIDEO_MODELS.find((m) => m.id === modelParam)
      if (foundModel) {
        if (foundModel.isComingSoon) {
          toast.info(`${foundModel.name} is coming soon!`)
        } else {
          setModel(modelParam)
        }
      }
    }
  }, [modelParam])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSourceImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setSourceImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleEndImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEndImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setEndImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioFileName(file.name)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setVideoFileName(file.name)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !caps.requiresAudio && !caps.requiresVideo) return

    const selectedModel = VIDEO_MODELS.find((m) => m.id === model)
    if (selectedModel?.isComingSoon) {
      toast.info(`${selectedModel.name} is coming soon!`)
      return
    }

    // Validation for models that require specific inputs
    if (caps.requiresImage && !sourceImage) {
      toast.error('This model requires a source image. Please upload one.')
      return
    }
    if (caps.requiresVideo && !videoFile) {
      toast.error('This model requires a video file. Please upload one.')
      return
    }
    if (caps.requiresAudio && !audioFile && model !== 'kling-lip-sync-replicate') {
      toast.error('This model requires an audio file. Please upload one.')
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = {
        model,
        prompt: prompt || 'generate video',
        duration: parseInt(duration),
        aspectRatio,
        resolution,
        motionStrength,
        sourceImage: mode === 'image' ? sourceImage : null,
      }

      // Pass model-specific params
      if (caps.supportsNegativePrompt && negativePrompt) {
        params.negativePrompt = negativePrompt
      }
      if (caps.supportsCfgScale) {
        params.cfgScale = cfgScale
      }
      if (caps.supportsGuidanceScale) {
        params.guidanceScale = guidanceScale
      }
      if (caps.supportsGenerateAudio) {
        params.generateAudio = generateAudio
      }
      if (caps.supportsModes) {
        params.mode = klingMode
      }
      if (caps.supportsEndImage && endImage) {
        params.endImage = endImage
      }
      if (caps.requiresAudio && audioFile) {
        params.audioFile = audioFile
      }
      if (caps.requiresVideo && videoFile) {
        params.videoFile = videoFile
      }
      if (model === 'kling-lip-sync-replicate' && lipSyncText) {
        params.lipSyncText = lipSyncText
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await videoGeneration.mutateAsync(params as any)

      if (result) {
        const newVideo: GeneratedVideoData = {
          id: result.id || `gen_${Date.now()}`,
          url: result.url || '',
          thumbnail: result.thumbnail || '',
          prompt,
          duration: `${duration}s`,
          model: selectedModel?.name || model,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Video generated successfully!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed'
      toast.error(message)
    }
  }

  const selectedModel = VIDEO_MODELS.find((m) => m.id === model)
  const isKling = caps.isKlingReplicate

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Mode Toggle */}
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as 'text' | 'image')}
            >
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1 gap-2">
                  <Video className="h-4 w-4" />
                  Text to Video
                </TabsTrigger>
                <TabsTrigger value="image" className="flex-1 gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image to Video
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Image Upload (for Image to Video mode) */}
            {mode === 'image' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {sourceImagePreview ? (
                    <img
                      src={sourceImagePreview}
                      alt="Source"
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drop an image here or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Video Upload (for motion control / lip sync) */}
            {caps.requiresVideo && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  {model === 'kling-v2.6-motion-control-replicate'
                    ? 'Motion Reference Video'
                    : 'Source Video'}
                </label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/mov"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  {videoFileName ? (
                    <p className="text-sm text-foreground">{videoFileName}</p>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload video file</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Audio Upload (for avatar / lip sync) */}
            {caps.requiresAudio && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Audio File
                </label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a,audio/ogg"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={() => audioInputRef.current?.click()}
                >
                  {audioFileName ? (
                    <p className="text-sm text-foreground">{audioFileName}</p>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload audio file</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Lip Sync Text (alternative to audio for lip sync model) */}
            {model === 'kling-lip-sync-replicate' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Lip Sync Text (alternative to audio)</label>
                <Textarea
                  placeholder="Enter text for TTS lip sync..."
                  value={lipSyncText}
                  onChange={(e) => setLipSyncText(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {mode === 'text' ? 'Prompt' : 'Motion Description'}
              </label>
              <Textarea
                placeholder={
                  mode === 'text'
                    ? 'Describe the video you want to create...'
                    : 'Describe how the image should move...'
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id} disabled={m.isComingSoon}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className={m.isComingSoon ? 'text-muted-foreground' : ''}>
                          <span>{m.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {m.provider}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {m.quality && (
                            <Badge variant="secondary" className="text-[10px]">
                              {m.quality}
                            </Badge>
                          )}
                          {m.badge && (
                            <Badge
                              variant={getBadgeVariant(m.badge)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {m.badge.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel?.isComingSoon && (
                <p className="text-xs text-muted-foreground">This model is coming soon</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d) => (
                  <Button
                    key={d.id}
                    variant={duration === d.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={duration === d.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setDuration(d.id)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {RESOLUTIONS.map((r) => (
                  <Button
                    key={r.id}
                    variant={resolution === r.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={resolution === r.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setResolution(r.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span>{r.label}</span>
                      <span className="text-[10px] text-muted-foreground">{r.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <Button
                    key={a.id}
                    variant={aspectRatio === a.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={aspectRatio === a.id ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setAspectRatio(a.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span>{a.label}</span>
                      <span className="text-[10px] text-muted-foreground">{a.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Advanced Settings
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </Button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <motion.div
                className="space-y-4 pt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {/* Motion Strength (only for non-Kling models) */}
                {!isKling && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Motion Strength</label>
                      <Badge variant="secondary">{motionStrength}</Badge>
                    </div>
                    <Slider
                      value={[motionStrength]}
                      onValueChange={([v]) => setMotionStrength(v)}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values create more dynamic movement
                    </p>
                  </div>
                )}

                {/* Negative Prompt */}
                {caps.supportsNegativePrompt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Negative Prompt</label>
                    <Textarea
                      placeholder="What to avoid in the video..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                )}

                {/* CFG Scale */}
                {caps.supportsCfgScale && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">CFG Scale</label>
                      <Badge variant="secondary">{cfgScale.toFixed(2)}</Badge>
                    </div>
                    <Slider
                      value={[cfgScale]}
                      onValueChange={([v]) => setCfgScale(v)}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls how closely the video follows the prompt
                    </p>
                  </div>
                )}

                {/* Guidance Scale */}
                {caps.supportsGuidanceScale && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Guidance Scale</label>
                      <Badge variant="secondary">{guidanceScale.toFixed(2)}</Badge>
                    </div>
                    <Slider
                      value={[guidanceScale]}
                      onValueChange={([v]) => setGuidanceScale(v)}
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values follow the prompt more closely
                    </p>
                  </div>
                )}

                {/* Generate Audio toggle */}
                {caps.supportsGenerateAudio && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Generate Audio</label>
                    <Button
                      variant={generateAudio ? 'secondary' : 'outline'}
                      size="sm"
                      className={generateAudio ? 'border-neon/50 bg-neon/10' : ''}
                      onClick={() => setGenerateAudio(!generateAudio)}
                    >
                      {generateAudio ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                )}

                {/* Mode selector (standard/pro) */}
                {caps.supportsModes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['standard', 'pro'] as const).map((m) => (
                        <Button
                          key={m}
                          variant={klingMode === m ? 'secondary' : 'outline'}
                          size="sm"
                          className={klingMode === m ? 'border-neon/50 bg-neon/10' : ''}
                          onClick={() => setKlingMode(m)}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* End Image upload */}
                {caps.supportsEndImage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Image (optional)</label>
                    <input
                      ref={endImageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleEndImageUpload}
                    />
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors"
                      onClick={() => endImageInputRef.current?.click()}
                    >
                      {endImagePreview ? (
                        <img
                          src={endImagePreview}
                          alt="End"
                          className="max-h-24 mx-auto rounded-lg object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Upload end image for interpolation
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={
              (!prompt.trim() && !caps.requiresAudio && !caps.requiresVideo) ||
              videoGeneration.isPending
            }
          >
            {videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~2-5 minutes generation time
          </p>
        </div>
      </div>

      {/* Right Panel - Generated Videos */}
      <div className="flex-1 bg-background">
        {/* Loading overlay with animated border */}
        {videoGeneration.isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, hsl(var(--neon)), transparent)',
                  animation: 'spin 2s linear infinite',
                }}
              />
              <div className="absolute inset-2 rounded-full bg-background flex flex-col items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-neon mb-2" />
                <p className="text-xs text-muted-foreground">Generating...</p>
              </div>
            </div>
          </div>
        )}
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Generated Videos</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated videos will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                View History
              </Button>
            </div>

            {/* Generated Videos Grid */}
            {generatedVideos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {generatedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video">
                      {video.url ? (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseLeave={(e) => {
                            const el = e.target as HTMLVideoElement
                            el.pause()
                            el.currentTime = 0
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                          <Play className="h-6 w-6 text-black fill-black ml-1" />
                        </div>
                      </div>
                      {/* Duration badge */}
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                        {video.duration}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="text-sm line-clamp-2">{video.prompt}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {video.model}
                        </Badge>
                        {video.url && (
                          <a href={video.url} download>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter a prompt and click Generate to create your first AI-generated video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <VideoPageContent />
    </Suspense>
  )
}
