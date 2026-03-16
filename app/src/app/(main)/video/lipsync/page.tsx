'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Mic,
  Video,
  Upload,
  RefreshCw,
  Download,
  X,
  Image as ImageIcon,
  FileAudio,
  FolderOpen,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MediaLibraryPicker } from '@/components/ui/media-library-picker'
import { useVideoGeneration } from '@/hooks/use-generation'

type InputMode = 'image' | 'video'
type AudioMode = 'text' | 'audio'

const LIPSYNC_MODELS = [
  {
    id: 'kling-lip-sync-replicate',
    name: 'Kling Lip Sync',
    provider: 'Kuaishou',
    description: 'Lip sync on existing video',
    inputMode: 'video' as InputMode,
  },
  {
    id: 'kling-avatar-v2-replicate',
    name: 'Kling Avatar v2',
    provider: 'Kuaishou',
    description: 'Talking head from portrait + audio',
    inputMode: 'image' as InputMode,
  },
]

// Kling Lip Sync requires specific voice IDs from their API
const VOICES = [
  { id: 'en_AOT', label: 'English — Neutral', lang: 'en' },
  { id: 'en_oversea_male1', label: 'English — Male', lang: 'en' },
  { id: 'en_commercial_lady_en_f-v1', label: 'English — Female (Commercial)', lang: 'en' },
  { id: 'en_girlfriend_4_speech02', label: 'English — Female (Casual)', lang: 'en' },
  { id: 'en_uk_boy1', label: 'English — UK Boy', lang: 'en' },
  { id: 'en_uk_man2', label: 'English — UK Man', lang: 'en' },
  { id: 'en_calm_story1', label: 'English — Calm Storyteller', lang: 'en' },
  { id: 'en_reader_en_m-v1', label: 'English — Reader (Male)', lang: 'en' },
  { id: 'zh_chengshu_jiejie', label: 'Chinese — Mature Female', lang: 'zh' },
  { id: 'zh_zhinen_xuesheng', label: 'Chinese — Student', lang: 'zh' },
  { id: 'zh_tiyuxi_xuedi', label: 'Chinese — Young Male', lang: 'zh' },
  { id: 'zh_girlfriend_1_speech02', label: 'Chinese — Female (Casual)', lang: 'zh' },
  { id: 'zh_cartoon-boy-07', label: 'Chinese — Cartoon Boy', lang: 'zh' },
  { id: 'zh_cartoon-girl-01', label: 'Chinese — Cartoon Girl', lang: 'zh' },
]

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
}

export default function LipsyncPage() {
  const imageInputRef = useRef<HTMLInputElement>(null!)
  const videoInputRef = useRef<HTMLInputElement>(null!)
  const audioInputRef = useRef<HTMLInputElement>(null!)

  const [inputMode, setInputMode] = useState<InputMode>('video')
  const [audioMode, setAudioMode] = useState<AudioMode>('text')
  const [speechText, setSpeechText] = useState('')
  const [voiceId, setVoiceId] = useState('en_AOT')
  const [model, setModel] = useState('kling-lip-sync-replicate')
  const [duration, setDuration] = useState('5')

  // Source media (image or video)
  const [sourceImage, setSourceImage] = useState<File | null>(null)
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null)
  const [sourceVideo, setSourceVideo] = useState<File | null>(null)
  const [sourceVideoPreview, setSourceVideoPreview] = useState<string | null>(null)

  // Audio file
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoData[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [fileDragActive, setFileDragActive] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)

  // Library picker state
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false)
  const [libraryPickerType, setLibraryPickerType] = useState<'image' | 'video' | 'audio'>('image')

  const videoGeneration = useVideoGeneration()

  // Load history on mount
  const fetchHistory = useCallback(async () => {
    try {
      const { getAuthHeaders } = await import('@/lib/auth-headers')
      const headers = await getAuthHeaders()
      const res = await fetch('/api/my-content?type=video&limit=30', { headers })
      if (!res.ok) return
      const data = await res.json()
      const items = (data.items || [])
        .filter((item: Record<string, unknown>) => {
          const model = (item.model as string) || ''
          return (
            model.includes('lip_sync') ||
            model.includes('lip-sync') ||
            model.includes('avatar') ||
            model.includes('kling_avatar')
          )
        })
        .map((item: Record<string, unknown>) => {
          const url =
            (item.public_url as string) ||
            ((item.metadata as Record<string, unknown>)?.public_url as string) ||
            (item.storage_path
              ? (item.storage_path as string).startsWith('http')
                ? (item.storage_path as string)
                : `/api/file/${item.storage_path}`
              : '')
          const model = (item.model as string) || ''
          return {
            id: (item.id as string) || `hist_${Date.now()}`,
            url,
            prompt: (item.prompt as string) || '',
            duration: ((item.metadata as Record<string, unknown>)?.duration as string) || '',
            model: model.includes('avatar') ? 'Kling Avatar v2' : 'Kling Lip Sync',
          }
        })
      setGeneratedVideos(items)
    } catch {
      // Silently fail
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode)
    // Auto-select matching model
    if (mode === 'video') {
      setModel('kling-lip-sync-replicate')
    } else {
      setModel('kling-avatar-v2-replicate')
    }
    // Clear media
    clearImage()
    clearVideo()
  }

  const handleImageUpload = (file: File) => {
    setSourceImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setSourceImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleVideoUpload = (file: File) => {
    setSourceVideo(file)
    setSourceVideoPreview(URL.createObjectURL(file))
  }

  const handleAudioUpload = (file: File) => {
    setAudioFile(file)
  }

  const clearImage = () => {
    setSourceImage(null)
    setSourceImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const clearVideo = () => {
    if (sourceVideoPreview) URL.revokeObjectURL(sourceVideoPreview)
    setSourceVideo(null)
    setSourceVideoPreview(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const clearAudio = () => {
    setAudioFile(null)
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const openLibraryPicker = (type: 'image' | 'video' | 'audio') => {
    setLibraryPickerType(type)
    setLibraryPickerOpen(true)
  }

  const handleLibrarySelect = async (url: string, name?: string) => {
    // Fetch the file from URL and convert to a File object
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const fileName = name || url.split('/').pop() || 'library_file'
      const file = new File([blob], fileName, { type: blob.type })

      if (libraryPickerType === 'image') {
        handleImageUpload(file)
      } else if (libraryPickerType === 'video') {
        handleVideoUpload(file)
      } else if (libraryPickerType === 'audio') {
        handleAudioUpload(file)
      }
    } catch {
      toast.error('Failed to load file from library')
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFileDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (inputMode === 'video' && file.type.startsWith('video/')) {
      handleVideoUpload(file)
    } else if (inputMode === 'image' && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const canGenerate = () => {
    if (videoGeneration.isPending || ttsLoading) return false

    if (inputMode === 'video') {
      // Lip sync: need video + (text or audio)
      if (!sourceVideo) return false
      if (audioMode === 'text' && !speechText.trim()) return false
      if (audioMode === 'audio' && !audioFile) return false
      return true
    } else {
      // Avatar: need image + (audio file or text for TTS)
      if (!sourceImage) return false
      if (audioMode === 'audio' && !audioFile) return false
      if (audioMode === 'text' && !speechText.trim()) return false
      return true
    }
  }

  const generateTTSAudio = async (text: string): Promise<File> => {
    const { getRequiredAuthHeaders } = await import('@/lib/auth-headers')
    const authHeaders = await getRequiredAuthHeaders()
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        text,
        voice: voiceId.startsWith('en_') ? 'alloy' : 'nova',
        speed: 1.0,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Text-to-speech failed')
    }
    const data = await response.json()
    // Fetch the audio file and convert to File object
    const audioResponse = await fetch(data.url)
    const audioBlob = await audioResponse.blob()
    return new File([audioBlob], 'tts_audio.mp3', { type: 'audio/mpeg' })
  }

  const handleGenerate = async () => {
    if (!canGenerate()) {
      if (inputMode === 'video' && !sourceVideo) {
        toast.error('Please upload a source video')
      } else if (inputMode === 'image' && !sourceImage) {
        toast.error('Please upload a portrait image')
      } else if (audioMode === 'audio' && !audioFile) {
        toast.error('Please upload an audio file')
      } else if (audioMode === 'text' && !speechText.trim()) {
        toast.error('Please enter the speech text')
      }
      return
    }

    const selectedVoice = VOICES.find((v) => v.id === voiceId)
    const selectedLang = selectedVoice?.lang === 'zh' ? 'Chinese' : 'English'
    const prompt = inputMode === 'video'
      ? `Lip sync video with speech in ${selectedLang}`
      : `Generate talking head video speaking in ${selectedLang}`

    try {
      // For portrait + text mode, generate audio via TTS first
      let resolvedAudioFile = audioFile
      if (inputMode === 'image' && audioMode === 'text') {
        setTtsLoading(true)
        toast.info('Generating speech audio...')
        try {
          resolvedAudioFile = await generateTTSAudio(speechText)
        } catch (ttsError) {
          const msg = ttsError instanceof Error ? ttsError.message : 'TTS failed'
          toast.error(msg)
          return
        } finally {
          setTtsLoading(false)
        }
      }

      const result = await videoGeneration.mutateAsync({
        model,
        prompt,
        duration: parseInt(duration),
        sourceImage: inputMode === 'image' ? sourceImage : undefined,
        videoFile: inputMode === 'video' ? sourceVideo : undefined,
        audioFile: inputMode === 'image' ? resolvedAudioFile : (audioMode === 'audio' ? audioFile : undefined),
        lipSyncText: audioMode === 'text' && inputMode === 'video' ? speechText : undefined,
        voiceId: audioMode === 'text' && inputMode === 'video' ? voiceId : undefined,
      })

      if (result) {
        const selectedModel = LIPSYNC_MODELS.find((m) => m.id === model)
        const newVideo: GeneratedVideoData = {
          id: result.id || `lipsync_${Date.now()}`,
          url: result.url || '',
          prompt,
          duration: `${duration}s`,
          model: selectedModel?.name || model,
        }
        setGeneratedVideos((prev) => [newVideo, ...prev])
        toast.success('Lipsync video generated successfully!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lipsync generation failed'
      toast.error(message)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-[340px] min-w-[340px] border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-neon" />
              <h2 className="text-lg font-semibold">Lipsync Studio</h2>
            </div>

            {/* Input Mode Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={inputMode === 'video' ? 'secondary' : 'outline'}
                  size="sm"
                  className={inputMode === 'video' ? 'border-neon/50 bg-neon/10' : ''}
                  onClick={() => handleInputModeChange('video')}
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  Video
                </Button>
                <Button
                  variant={inputMode === 'image' ? 'secondary' : 'outline'}
                  size="sm"
                  className={inputMode === 'image' ? 'border-neon/50 bg-neon/10' : ''}
                  onClick={() => handleInputModeChange('image')}
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  Portrait
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {inputMode === 'video'
                  ? 'Lip sync speech onto an existing video'
                  : 'Generate a talking head from a portrait photo'}
              </p>
            </div>

            {/* Source Media Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {inputMode === 'video' ? 'Source Video' : 'Portrait Image'}
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleVideoUpload(file)
                }}
              />
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative ${
                  fileDragActive
                    ? 'border-neon bg-neon/10'
                    : 'border-border hover:border-neon/50'
                }`}
                onClick={() =>
                  inputMode === 'video'
                    ? videoInputRef.current?.click()
                    : imageInputRef.current?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setFileDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setFileDragActive(false)
                }}
                onDrop={handleFileDrop}
              >
                {inputMode === 'video' && sourceVideoPreview ? (
                  <div className="relative">
                    <video
                      src={sourceVideoPreview}
                      className="max-h-32 mx-auto rounded-lg object-contain"
                      muted
                    />
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {sourceVideo?.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearVideo()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : inputMode === 'image' && sourceImagePreview ? (
                  <div className="relative">
                    <img
                      src={sourceImagePreview}
                      alt="Portrait preview"
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {inputMode === 'video' ? 'Upload source video' : 'Upload portrait image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inputMode === 'video'
                        ? 'The video whose lips will be synced'
                        : 'Best results with a clear face photo'}
                    </p>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => openLibraryPicker(inputMode)}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Choose from Library
              </Button>
            </div>

            {/* Audio Mode Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Speech Source</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={audioMode === 'text' ? 'secondary' : 'outline'}
                  size="sm"
                  className={audioMode === 'text' ? 'border-neon/50 bg-neon/10' : ''}
                  onClick={() => setAudioMode('text')}
                >
                  <Mic className="h-3.5 w-3.5 mr-1.5" />
                  Text-to-Speech
                </Button>
                <Button
                  variant={audioMode === 'audio' ? 'secondary' : 'outline'}
                  size="sm"
                  className={audioMode === 'audio' ? 'border-neon/50 bg-neon/10' : ''}
                  onClick={() => setAudioMode('audio')}
                >
                  <FileAudio className="h-3.5 w-3.5 mr-1.5" />
                  Audio File
                </Button>
              </div>
              {inputMode === 'image' && audioMode === 'text' && (
                <p className="text-[11px] text-muted-foreground">
                  Text will be converted to speech via OpenAI TTS
                </p>
              )}
            </div>

            {/* Speech Text (for TTS mode) */}
            {audioMode === 'text' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Speech Text</label>
                <Textarea
                  placeholder="Enter what the person should say..."
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            )}

            {/* Audio File Upload (for audio mode) */}
            {audioMode === 'audio' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Audio File</label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAudioUpload(file)
                  }}
                />
                {audioFile ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/50">
                    <FileAudio className="h-4 w-4 text-neon flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{audioFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={clearAudio}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => audioInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => openLibraryPicker('audio')}
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      Library
                    </Button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {inputMode === 'image'
                    ? 'Required for Kling Avatar v2 — the person will speak this audio'
                    : 'Upload an audio file to drive lip sync'}
                </p>
              </div>
            )}

            {/* Voice */}
            {audioMode === 'text' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice</label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger>
                    <SelectValue>
                      {VOICES.find((v) => v.id === voiceId)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inputMode === 'video' && (
                  <p className="text-[11px] text-muted-foreground">
                    Voice used by Kling for text-to-speech lip sync
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '5', label: '5 seconds' },
                  { id: '10', label: '10 seconds' },
                ].map((d) => (
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

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue>
                    {LIPSYNC_MODELS.find((m) => m.id === model)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LIPSYNC_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span>{m.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {m.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {model === 'kling-lip-sync-replicate'
                  ? 'Requires a source video. Accepts speech text or audio.'
                  : 'Requires a portrait image and an audio file.'}
              </p>
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
            disabled={!canGenerate()}
          >
            {ttsLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating speech...
              </>
            ) : videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating video...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Lipsync
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~2-5 minutes generation time
          </p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold">Generated Lipsync Videos</h2>
                <p className="text-sm text-muted-foreground">
                  Your AI lip-synced videos will appear here
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={fetchHistory}
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : generatedVideos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {generatedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="space-y-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50">
                      {video.url ? (
                        <video
                          src={video.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.model}
                        </Badge>
                        <Badge className="bg-black/70 text-white text-xs">
                          {video.duration}
                        </Badge>
                      </div>
                      {video.url && (
                        <a href={video.url} download>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No lipsync videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {inputMode === 'video'
                    ? 'Upload a video, add speech text or audio, and generate a lip-synced video'
                    : 'Upload a portrait, add an audio file, and generate a talking head video'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Media Library Picker */}
      <MediaLibraryPicker
        open={libraryPickerOpen}
        onOpenChange={setLibraryPickerOpen}
        onSelect={handleLibrarySelect}
        mediaType={libraryPickerType}
      />
    </div>
  )
}
