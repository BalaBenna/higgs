'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  User,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Palette,
  Eye,
  Smile,
  Settings2,
  RefreshCw,
  Download,
  Video,
  Play,
  Wand2,
  Clock,
  Image as ImageIcon,
  Trash2,
  Camera,
  Loader2,
  X,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useImageGeneration, useVideoGeneration } from '@/hooks/use-generation'
import { IMAGE_MODEL_MAPPINGS } from '@/config/model-mappings'
import { getAuthHeaders } from '@/lib/auth-headers'

/* ── Character type images (Unsplash) ── */
const CHARACTER_TYPES = [
  {
    id: 'realistic',
    name: 'Realistic',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face',
  },
  {
    id: 'anime',
    name: 'Anime',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop',
  },
  {
    id: '3d',
    name: '3D',
    image: 'https://images.unsplash.com/photo-1633957897986-70e83293f3ff?w=300&h=400&fit=crop',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=300&h=400&fit=crop',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=400&fit=crop',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=400&fit=crop',
  },
]

/* ── Showcase images for empty state hero ── */
const SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=450&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=550&fit=crop&crop=face',
]

const IMAGE_MODELS_INFLUENCER = IMAGE_MODEL_MAPPINGS.filter((m) => m.isAvailable).map(
  (m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
  })
)

const VIDEO_MODELS_INFLUENCER = [
  { id: 'kling-v2.6-replicate', name: 'Kling v2.6' },
  { id: 'kling-v2.5-turbo-replicate', name: 'Kling v2.5 Turbo' },
  { id: 'kling-v2.1-i2v-replicate', name: 'Kling v2.1 I2V' },
]

const GENDERS = [
  { id: 'Male', name: 'Male', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face' },
  { id: 'Female', name: 'Female', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face' },
  { id: 'Trans woman', name: 'Trans woman', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=face' },
  { id: 'Non-binary', name: 'Non-binary', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop&crop=face' },
]

const ETHNICITIES = [
  { id: 'Caucasian', name: 'Caucasian', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face' },
  { id: 'African', name: 'African', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop&crop=face' },
  { id: 'Asian', name: 'Asian', image: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=300&h=400&fit=crop&crop=face' },
  { id: 'Latino', name: 'Latino', image: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=300&h=400&fit=crop&crop=face' },
  { id: 'Middle Eastern', name: 'Middle Eastern', image: 'https://images.unsplash.com/photo-1564463836146-4e30522c2984?w=300&h=400&fit=crop&crop=face' },
  { id: 'Mixed', name: 'Mixed', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face' },
]

const AGES = [
  { id: 'Young Adult', name: 'Young Adult', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop&crop=face' },
  { id: 'Adult', name: 'Adult', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=400&fit=crop&crop=face' },
  { id: 'Mature', name: 'Mature', image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=300&h=400&fit=crop&crop=face' },
  { id: 'Senior', name: 'Senior', image: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=300&h=400&fit=crop&crop=face' },
]

const SKIN_CONDITIONS = [
  { id: 'Clear', name: 'Clear', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=300&h=300&fit=crop&crop=face' },
  { id: 'Freckles', name: 'Freckles', image: 'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?w=300&h=300&fit=crop&crop=face' },
  { id: 'Moles', name: 'Moles', image: 'https://images.unsplash.com/photo-1504199367641-aba8151af406?w=300&h=300&fit=crop&crop=face' },
  { id: 'Scars', name: 'Scars', image: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=300&h=300&fit=crop&crop=face' },
  { id: 'Tattoos', name: 'Tattoos', image: 'https://images.unsplash.com/photo-1611042553484-d61f9d9b7073?w=300&h=300&fit=crop&crop=face' },
]

const EYE_TYPES = [
  { id: 'Almond', name: 'Almond', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
  { id: 'Round', name: 'Round', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { id: 'Hooded', name: 'Hooded', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
  { id: 'Monolid', name: 'Monolid', image: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=300&h=300&fit=crop&crop=face' },
  { id: 'Downturned', name: 'Downturned', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face' },
  { id: 'Upturned', name: 'Upturned', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face' },
]

const EYE_SECRETS = [
  { id: 'Normal', name: 'Normal', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
  { id: 'Heterochromia', name: 'Heterochromia', image: 'https://images.unsplash.com/photo-1528892952-3c2fb0f65733?w=300&h=300&fit=crop' },
  { id: 'Glowing', name: 'Glowing', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop' },
  { id: 'Cat-like', name: 'Cat-like', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop' },
  { id: 'Spiral', name: 'Spiral', image: 'https://images.unsplash.com/photo-1633957897986-70e83293f3ff?w=300&h=300&fit=crop' },
]

const MOUTH_TYPES = [
  { id: 'Full', name: 'Full', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face' },
  { id: 'Thin', name: 'Thin', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face' },
  { id: 'Heart-shaped', name: 'Heart-shaped', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face' },
  { id: 'Wide', name: 'Wide', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' },
  { id: 'Small', name: 'Small', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face' },
]

const SKIN_COLORS = [
  '#fce4d6',
  '#f5d5c8',
  '#e8c4b8',
  '#d4a574',
  '#c68642',
  '#8d5524',
  '#6b4423',
  '#4a3728',
  '#362a23',
  '#2d221c',
]

const EYE_COLORS = [
  '#634e34',
  '#2e536f',
  '#3d671d',
  '#497665',
  '#8b5a2b',
  '#91c3dc',
  '#808080',
  '#000000',
  '#9370db',
  '#ff4500',
]

const MOTION_PRESETS = [
  { id: 'dance', name: 'Dance', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=400&fit=crop' },
  { id: 'walk', name: 'Walking', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&h=400&fit=crop' },
  { id: 'talk', name: 'Talking', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop&crop=face' },
  { id: 'smile', name: 'Smile', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop&crop=face' },
  { id: 'wave', name: 'Wave', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop&crop=face' },
  { id: 'pose', name: 'Pose', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face' },
]

interface HistoryItem {
  id: string
  type: 'image' | 'video'
  url: string
  prompt: string
  model: string
  createdAt: Date
  thumbnail?: string
}

function resolveMediaUrl(item: Record<string, any>): string {
  if (item.public_url) return item.public_url
  if (item.metadata?.public_url) return item.metadata.public_url
  if (item.storage_path && !item.storage_path.startsWith('http'))
    return `/api/file/${item.storage_path}`
  return item.storage_path || ''
}

/* ── Collapsible section with glass styling ── */
function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-white/40" />
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/30 transition-transform duration-200',
            !open && '-rotate-90'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AIInfluencerPage() {
  // Character attributes
  const [characterType, setCharacterType] = useState('realistic')
  const [gender, setGender] = useState('Female')
  const [ethnicity, setEthnicity] = useState('Caucasian')
  const [skinColor, setSkinColor] = useState('#f5d5c8')
  const [eyeColor, setEyeColor] = useState('#634e34')
  const [age, setAge] = useState('Adult')

  const [skinConditions, setSkinConditions] = useState<string[]>([])
  const [eyeType, setEyeType] = useState('')
  const [eyeSecrets, setEyeSecrets] = useState('')
  const [mouthType, setMouthType] = useState('')
  const [faceShape, setFaceShape] = useState(50)
  const [jawDefinition, setJawDefinition] = useState(50)
  const [cheekbones, setCheekbones] = useState(50)

  // Model selection
  const [selectedImageModel, setSelectedImageModel] = useState('flux-2-pro-replicate')
  const [selectedVideoModel, setSelectedVideoModel] = useState(
    VIDEO_MODELS_INFLUENCER[0].id
  )

  // Generation states
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Animation states
  const [motionVideoFile, setMotionVideoFile] = useState<File | null>(null)
  const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null)
  const [selectedMotion, setSelectedMotion] = useState('')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [motionDragActive, setMotionDragActive] = useState(false)

  // History
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Active view
  const [activeView, setActiveView] = useState<'create' | 'animate' | 'history'>(
    'create'
  )

  const motionVideoRef = useRef<HTMLInputElement>(null!)
  const imageGeneration = useImageGeneration()
  const videoGeneration = useVideoGeneration()

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const authHeaders = await getAuthHeaders()
      const response = await fetch('/api/my-content', { headers: authHeaders })
      if (!response.ok) return
      const data = await response.json()
      const items: HistoryItem[] = (data.items || []).map(
        (item: Record<string, any>) => ({
          id: item.id,
          type: item.type === 'video' ? 'video' : 'image',
          url: resolveMediaUrl(item),
          prompt: item.prompt || '',
          model: item.model || item.provider || '',
          createdAt: new Date(item.created_at),
          thumbnail: item.type === 'video' ? undefined : undefined,
        })
      )
      setHistory((prev) => {
        const existingIds = new Set(prev.map((h) => h.id))
        const newFromBackend = items.filter((i) => !existingIds.has(i.id))
        return [...prev, ...newFromBackend]
      })
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const toggleSkinCondition = (condition: string) => {
    setSkinConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  const buildCharacterPrompt = (): string => {
    const styleMap: Record<string, string> = {
      realistic: 'photorealistic, realistic photography, high quality, detailed',
      anime: 'anime style, manga, cel-shaded, vibrant colors',
      '3d': '3D render, CGI, octane render, high quality, detailed',
      cartoon: 'cartoon style, illustrated, fun, colorful',
      fantasy: 'fantasy art, magical, ethereal, fantasy style',
      cyberpunk: 'cyberpunk, futuristic, neon lights, sci-fi',
    }

    const parts: string[] = []

    if (characterType === 'realistic') {
      parts.push(
        `a ${age.toLowerCase()} ${ethnicity.toLowerCase()} ${gender.toLowerCase()} woman`
      )
      parts.push('beautiful face, symmetrical features, detailed skin texture')
    } else {
      parts.push(`a ${characterType} style ${gender.toLowerCase()} character`)
      parts.push(`${ethnicity.toLowerCase()} appearance`)
    }

    parts.push(styleMap[characterType] || 'high quality')
    parts.push(`skin tone: ${skinColor}`)
    parts.push(`eye color: ${eyeColor}`)
    if (eyeType) parts.push(`eye shape: ${eyeType.toLowerCase()}`)
    if (eyeSecrets) parts.push(`eye detail: ${eyeSecrets.toLowerCase()}`)
    if (mouthType) parts.push(`mouth: ${mouthType.toLowerCase()} lips`)

    if (faceShape < 30) parts.push('round face shape')
    else if (faceShape > 70) parts.push('slim face shape')
    if (jawDefinition < 30) parts.push('soft jawline')
    else if (jawDefinition > 70) parts.push('defined jawline')
    if (cheekbones < 30) parts.push('flat cheeks')
    else if (cheekbones > 70) parts.push('high cheekbones')

    if (skinConditions.length > 0) {
      parts.push(skinConditions.map((c) => c.toLowerCase()).join(', '))
    }

    parts.push('masterpiece, best quality, 8k, highly detailed')
    return parts.join(', ')
  }

  const handleGenerateCharacter = async () => {
    setIsGeneratingImage(true)
    setGeneratedImage(null)

    try {
      const prompt = buildCharacterPrompt()
      const result = await imageGeneration.mutateAsync({
        model: selectedImageModel,
        prompt: prompt,
        aspectRatio: '1:1',
        numImages: 1,
      })

      if (result?.images?.length > 0) {
        const imageUrl = result.images[0].url || result.images[0].src || null
        if (imageUrl) {
          setGeneratedImage(imageUrl)
          try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const file = new File([blob], 'character.jpg', { type: 'image/jpeg' })
            setGeneratedImageFile(file)
          } catch (e) {
            console.error('Failed to convert image to file:', e)
          }
          setHistory((prev) => [
            {
              id: crypto.randomUUID(),
              type: 'image',
              url: imageUrl,
              prompt: prompt,
              model: selectedImageModel,
              createdAt: new Date(),
            },
            ...prev,
          ])
          toast.success('AI Influencer created!')
          setActiveView('animate')
        } else {
          toast.error('Failed to generate image')
        }
      } else {
        toast.error('Failed to generate image')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleMotionVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMotionVideoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setMotionVideoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearMotionVideo = () => {
    setMotionVideoFile(null)
    setMotionVideoPreview(null)
    if (motionVideoRef.current) motionVideoRef.current.value = ''
  }

  const handleAnimateCharacter = async () => {
    if (!generatedImageFile) {
      toast.error('Please generate a character first')
      return
    }
    if (!motionVideoFile && !selectedMotion) {
      toast.error('Please upload a motion video or select a motion preset')
      return
    }

    setIsGeneratingVideo(true)

    try {
      const motionDescriptions: Record<string, string> = {
        dance: 'energetic dance moves, rhythm, full body movement',
        walk: 'walking naturally, casual pace, forward movement',
        talk: 'speaking, natural lip movement, facial expression',
        smile: 'smiling, happy expression, gentle movement',
        wave: 'waving hand, greeting gesture, friendly',
        pose: 'striking a pose, confident, model-like',
      }
      const prompt = motionDescriptions[selectedMotion] || 'natural movement'

      let result
      if (motionVideoFile) {
        result = await videoGeneration.mutateAsync({
          model: 'kling-v2.6-motion-control-replicate',
          prompt: prompt,
          sourceImage: generatedImageFile,
          videoFile: motionVideoFile,
        })
      } else {
        result = await videoGeneration.mutateAsync({
          model: selectedVideoModel,
          prompt: prompt,
          sourceImage: generatedImageFile,
          duration: 5,
          aspectRatio: '1:1',
        })
      }

      if (result?.url) {
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            type: 'video',
            url: result.url,
            prompt,
            model: motionVideoFile
              ? 'kling-v2.6-motion-control'
              : selectedVideoModel,
            createdAt: new Date(),
            thumbnail: generatedImage || undefined,
          },
          ...prev,
        ])
        toast.success('Character animated!')
      } else {
        toast.error('Failed to animate character')
      }
    } catch (error) {
      console.error('Animation error:', error)
      toast.error(error instanceof Error ? error.message : 'Animation failed')
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  const canAnimate =
    generatedImageFile &&
    (motionVideoFile || selectedMotion) &&
    !isGeneratingVideo

  const deleteHistoryItem = async (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
    try {
      const authHeaders = await getAuthHeaders()
      await fetch(`/api/my-content/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
    } catch {
      // best-effort
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#0a0a0a]">
      {/* ── Left: Preview / Result Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav pills */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-2">
          {[
            { key: 'create' as const, label: 'Create', icon: Sparkles },
            {
              key: 'animate' as const,
              label: 'Animate',
              icon: Video,
              disabled: !generatedImage,
            },
            {
              key: 'history' as const,
              label: 'History',
              icon: Clock,
              count: history.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              disabled={tab.disabled}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeView === tab.key
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]',
                tab.disabled && 'opacity-30 pointer-events-none'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeView === 'create' && (
            <div className="h-full flex flex-col items-center justify-center">
              {generatedImage ? (
                <motion.div
                  className="relative max-w-lg w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.06]">
                    <img
                      src={generatedImage}
                      alt="Generated Character"
                      className="w-full h-auto"
                    />
                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-neon" />
                      </div>
                    )}
                    {/* Overlay actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = generatedImage!
                            link.download = `ai-influencer-${Date.now()}.jpg`
                            link.click()
                          }}
                          className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white flex items-center gap-2 transition-colors backdrop-blur-sm"
                        >
                          <Download className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setActiveView('animate')}
                          className="h-9 px-4 rounded-xl bg-neon text-black text-sm font-semibold flex items-center gap-2 hover:bg-neon/80 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          Animate
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-white/[0.06] text-white/60 border-0"
                      >
                        {gender}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-white/[0.06] text-white/60 border-0"
                      >
                        {ethnicity}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-white/[0.06] text-white/60 border-0"
                      >
                        {age}
                      </Badge>
                      <Badge className="bg-neon/20 text-neon border-neon/30">
                        {CHARACTER_TYPES.find((t) => t.id === characterType)?.name}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ) : isGeneratingImage ? (
                <motion.div
                  className="flex flex-col items-center gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-72 h-72 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-neon/60" />
                  </div>
                  <p className="text-sm text-white/40">
                    Creating your AI influencer...
                  </p>
                </motion.div>
              ) : (
                /* ── Showcase Hero ── */
                <motion.div
                  className="flex flex-col items-center gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold text-white">
                      AI{' '}
                      <span className="text-neon">Influencer</span>
                    </h1>
                    <p className="text-white/40 text-sm max-w-md">
                      Design unique AI characters with full control over appearance,
                      then bring them to life with motion
                    </p>
                  </div>
                  {/* Showcase grid */}
                  <div className="flex gap-3 max-w-2xl">
                    {SHOWCASE_IMAGES.map((src, i) => (
                      <motion.div
                        key={i}
                        className="relative flex-1 rounded-2xl overflow-hidden border border-white/[0.06]"
                        style={{ height: i % 2 === 0 ? 220 : 260 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-white/20">
                    Configure your character on the right, then hit Generate
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {activeView === 'animate' && (
            <div className="max-w-xl mx-auto pt-6 space-y-5">
              {/* Character preview strip */}
              {generatedImage && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/[0.08] shrink-0">
                    <img
                      src={generatedImage}
                      alt="Character"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">
                      Character Ready
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      Add motion to bring your influencer to life
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView('create')}
                    className="text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Motion reference upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Motion Reference Video
                </label>
                <input
                  ref={motionVideoRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={handleMotionVideoSelect}
                />
                <div
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                    motionDragActive
                      ? 'border-neon bg-neon/5'
                      : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
                  )}
                  onClick={() => motionVideoRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMotionDragActive(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMotionDragActive(false)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMotionDragActive(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      setMotionVideoFile(file)
                      const r = new FileReader()
                      r.onload = (ev) =>
                        setMotionVideoPreview(ev.target?.result as string)
                      r.readAsDataURL(file)
                    }
                  }}
                >
                  {motionVideoPreview ? (
                    <div className="relative inline-block">
                      <video
                        src={motionVideoPreview}
                        className="max-h-40 mx-auto rounded-xl"
                      />
                      <button
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearMotionVideo()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                        <Video className="h-5 w-5 text-white/30" />
                      </div>
                      <div>
                        <p className="text-sm text-white/50">
                          Upload motion reference video
                        </p>
                        <p className="text-xs text-white/25 mt-1">
                          The character will copy this motion
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Motion presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Or choose a preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOTION_PRESETS.map((motion) => (
                    <button
                      key={motion.id}
                      onClick={() => setSelectedMotion(motion.id)}
                      className={cn(
                        'relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]',
                        selectedMotion === motion.id
                          ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                          : 'border-transparent hover:border-white/[0.1]'
                      )}
                    >
                      <Image
                        src={motion.image}
                        alt={motion.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span
                        className={cn(
                          'absolute bottom-2 left-0 right-0 text-center text-xs font-medium',
                          selectedMotion === motion.id ? 'text-neon' : 'text-white/70'
                        )}
                      >
                        {motion.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video model selector */}
              {!motionVideoFile && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    Animation Model
                  </label>
                  <Select
                    value={selectedVideoModel}
                    onValueChange={setSelectedVideoModel}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-white/[0.06] bg-white/[0.03] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_MODELS_INFLUENCER.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {motionVideoFile && (
                <p className="text-xs text-white/30">
                  Using Kling v2.6 Motion Control — character will copy the uploaded
                  video motion
                </p>
              )}

              {/* Animate button */}
              <button
                onClick={handleAnimateCharacter}
                disabled={!canAnimate}
                className={cn(
                  'w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                  canAnimate
                    ? 'bg-neon text-black hover:bg-neon/80 shadow-[0_0_20px_#c8ff0033]'
                    : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                )}
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Animating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Animate Character
                  </>
                )}
              </button>

              {/* Recent videos */}
              {history.filter((h) => h.type === 'video').length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Recent Videos
                    </h3>
                    <button
                      className="text-xs text-neon/60 hover:text-neon transition-colors"
                      onClick={() => setActiveView('history')}
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {history
                      .filter((h) => h.type === 'video')
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="relative rounded-xl overflow-hidden border border-white/[0.06] group"
                        >
                          <video
                            src={item.url}
                            className="w-full aspect-video object-cover"
                            controls
                          />
                          <button
                            className="absolute bottom-2 right-2 h-7 w-7 rounded-lg bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = item.url
                              link.download = `ai-influencer-video-${Date.now()}.mp4`
                              link.click()
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'history' && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-sm font-semibold text-white">
                  Generation History
                </h3>
                {history.length > 0 && (
                  <button
                    className="text-xs text-white/30 hover:text-red-400 flex items-center gap-1 transition-colors"
                    onClick={async () => {
                      const ids = history.map((h) => h.id)
                      setHistory([])
                      try {
                        const authHeaders = await getAuthHeaders()
                        await Promise.allSettled(
                          ids.map((id) =>
                            fetch(`/api/my-content/${id}`, {
                              method: 'DELETE',
                              headers: authHeaders,
                            })
                          )
                        )
                      } catch {
                        // best-effort
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-[3px]">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="relative overflow-hidden break-inside-avoid mb-[3px] group cursor-pointer"
                    >
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-auto object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-auto object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          {item.type === 'video' ? (
                            <Video className="h-3 w-3 text-white/60" />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-white/60" />
                          )}
                          <span className="text-[10px] text-white/50">
                            {item.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            className="flex-1 h-7 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              const link = document.createElement('a')
                              link.href = item.url
                              link.download = `ai-influencer-${item.type}-${Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`
                              link.click()
                            }}
                          >
                            <Download className="h-3 w-3" />
                            Save
                          </button>
                          {item.type === 'image' && (
                            <button
                              className="flex-1 h-7 text-xs rounded-lg bg-neon/20 hover:bg-neon/30 text-neon flex items-center justify-center gap-1 transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation()
                                setGeneratedImage(item.url)
                                try {
                                  const response = await fetch(item.url)
                                  const blob = await response.blob()
                                  const file = new File([blob], 'character.jpg', {
                                    type: 'image/jpeg',
                                  })
                                  setGeneratedImageFile(file)
                                } catch (err) {
                                  console.error('Failed to convert:', err)
                                }
                                setActiveView('animate')
                              }}
                            >
                              <Play className="h-3 w-3" />
                              Animate
                            </button>
                          )}
                          <button
                            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-red-500/50 text-white flex items-center justify-center transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteHistoryItem(item.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-white/20 mb-3" />
                  <p className="text-sm text-white/30">Loading history...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-white/20" />
                  </div>
                  <p className="text-sm text-white/40">No history yet</p>
                  <p className="text-xs text-white/20 mt-1">
                    Generated images and videos will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Configuration Panel ── */}
      <div className="w-[420px] shrink-0 border-l border-white/[0.06] bg-[#0d0d0d]">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-3">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Character Builder</h2>
              <p className="text-xs text-white/30 mt-1">
                Customize every detail of your AI character
              </p>
            </div>

            {/* Character Type - visual cards */}
            <Section title="Character Type" icon={Camera} defaultOpen>
              <div className="grid grid-cols-3 gap-2">
                {CHARACTER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCharacterType(type.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]',
                      characterType === type.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span
                      className={cn(
                        'absolute bottom-2 left-0 right-0 text-center text-xs font-medium',
                        characterType === type.id ? 'text-neon' : 'text-white/70'
                      )}
                    >
                      {type.name}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Gender */}
            <Section title="Gender" icon={User} defaultOpen>
              <div className="grid grid-cols-4 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]',
                      gender === g.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={g.image} alt={g.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', gender === g.id ? 'text-neon' : 'text-white/70')}>{g.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Ethnicity */}
            <Section title="Ethnicity / Origin" icon={User}>
              <div className="grid grid-cols-3 gap-2">
                {ETHNICITIES.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEthnicity(e.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]',
                      ethnicity === e.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={e.image} alt={e.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', ethnicity === e.id ? 'text-neon' : 'text-white/70')}>{e.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Skin Color */}
            <Section title="Skin Color" icon={Palette}>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      skinColor === color
                        ? 'border-neon scale-110 shadow-[0_0_8px_#c8ff0044]'
                        : 'border-white/[0.08] hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSkinColor(color)}
                  />
                ))}
              </div>
            </Section>

            {/* Eye Color */}
            <Section title="Eye Color" icon={Eye}>
              <div className="flex flex-wrap gap-2">
                {EYE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      eyeColor === color
                        ? 'border-neon scale-110 shadow-[0_0_8px_#c8ff0044]'
                        : 'border-white/[0.08] hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setEyeColor(color)}
                  />
                ))}
              </div>
            </Section>

            {/* Age */}
            <Section title="Age" icon={User}>
              <div className="grid grid-cols-4 gap-2">
                {AGES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAge(a.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]',
                      age === a.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={a.image} alt={a.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', age === a.id ? 'text-neon' : 'text-white/70')}>{a.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Skin Conditions */}
            <Section title="Skin Conditions" icon={User}>
              <div className="grid grid-cols-3 gap-2">
                {SKIN_CONDITIONS.map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => toggleSkinCondition(condition.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
                      skinConditions.includes(condition.id)
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={condition.image} alt={condition.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', skinConditions.includes(condition.id) ? 'text-neon' : 'text-white/70')}>{condition.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Eye Type */}
            <Section title="Eyes - Type" icon={Eye}>
              <div className="grid grid-cols-3 gap-2">
                {EYE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setEyeType(eyeType === type.id ? '' : type.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
                      eyeType === type.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={type.image} alt={type.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', eyeType === type.id ? 'text-neon' : 'text-white/70')}>{type.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Eye Secrets */}
            <Section title="Eyes - Secrets" icon={Eye}>
              <div className="grid grid-cols-3 gap-2">
                {EYE_SECRETS.map((secret) => (
                  <button
                    key={secret.id}
                    onClick={() => setEyeSecrets(eyeSecrets === secret.id ? '' : secret.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
                      eyeSecrets === secret.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={secret.image} alt={secret.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', eyeSecrets === secret.id ? 'text-neon' : 'text-white/70')}>{secret.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Mouth */}
            <Section title="Mouth & Teeth" icon={Smile}>
              <div className="grid grid-cols-3 gap-2">
                {MOUTH_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMouthType(mouthType === type.id ? '' : type.id)}
                    className={cn(
                      'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
                      mouthType === type.id
                        ? 'border-neon shadow-[0_0_12px_#c8ff0033]'
                        : 'border-transparent hover:border-white/[0.1]'
                    )}
                  >
                    <Image src={type.image} alt={type.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={cn('absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium', mouthType === type.id ? 'text-neon' : 'text-white/70')}>{type.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Advanced Settings */}
            <Section title="Advanced Settings" icon={Settings2}>
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/50">Face Shape</label>
                    <span className="text-[10px] text-white/30 tabular-nums">
                      {faceShape}
                    </span>
                  </div>
                  <Slider
                    value={[faceShape]}
                    onValueChange={([v]) => setFaceShape(v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/50">Jaw Definition</label>
                    <span className="text-[10px] text-white/30 tabular-nums">
                      {jawDefinition}
                    </span>
                  </div>
                  <Slider
                    value={[jawDefinition]}
                    onValueChange={([v]) => setJawDefinition(v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/50">Cheekbones</label>
                    <span className="text-[10px] text-white/30 tabular-nums">
                      {cheekbones}
                    </span>
                  </div>
                  <Slider
                    value={[cheekbones]}
                    onValueChange={([v]) => setCheekbones(v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </Section>

            {/* Image Model */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Image Model
              </label>
              <Select
                value={selectedImageModel}
                onValueChange={setSelectedImageModel}
              >
                <SelectTrigger className="h-10 rounded-xl border-white/[0.06] bg-white/[0.03] text-sm">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5 text-neon/60" />
                    <SelectValue placeholder="Select model" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS_INFLUENCER.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span>{m.name}</span>
                      <span className="text-xs text-white/30 ml-2">
                        {m.provider}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateCharacter}
              disabled={isGeneratingImage}
              className={cn(
                'w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                isGeneratingImage
                  ? 'bg-white/[0.04] text-white/30 cursor-not-allowed'
                  : 'bg-neon text-black hover:bg-neon/80 shadow-[0_0_20px_#c8ff0033]'
              )}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Character
                </>
              )}
            </button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
