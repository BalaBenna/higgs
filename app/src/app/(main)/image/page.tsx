'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Wand2,
  Settings2,
  Loader2,
  Download,
  Maximize2,
  Copy,
  X,
  ArrowLeft,
  Heart,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useImageGeneration } from '@/hooks/use-generation'
import { useUpload } from '@/hooks/use-upload'
import { getAuthHeaders } from '@/lib/auth-headers'
import {
  IMAGE_MODEL_MAPPINGS,
  MODEL_TO_TOOL_MAP,
  getImageModelCapabilities,
  DEFAULT_ASPECT_RATIOS,
  DEFAULT_MAX_IMAGES,
} from '@/config/model-mappings'

// Display-only extras (badge, isComingSoon) keyed by model id
const MODEL_EXTRAS: Record<string, { badge?: string; isComingSoon?: boolean }> = {
  'gpt-image-1.5': { badge: 'top' },
  'flux-2': { badge: 'new' },
  'seedream-4.5': { badge: 'new' },
}

const EXCLUDED_TOOL_IDS = new Set(['enhance_image_by_topaz'])

const IMAGE_MODELS = IMAGE_MODEL_MAPPINGS.filter(
  (m) => m.isAvailable && !EXCLUDED_TOOL_IDS.has(m.toolId)
).map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider,
  isComingSoon: MODEL_EXTRAS[m.id]?.isComingSoon,
  badge: MODEL_EXTRAS[m.id]?.badge,
}))

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1' },
  { id: '4:3', label: '4:3' },
  { id: '16:9', label: '16:9' },
  { id: '3:4', label: '3:4' },
  { id: '9:16', label: '9:16' },
]

interface GeneratedImageData {
  id: string
  src: string
  prompt: string
  model?: string
  aspectRatio?: string
  createdAt?: string
}

interface GenerationGroup {
  id: string
  prompt: string
  model: string
  aspectRatio: string
  images: GeneratedImageData[]
  isLoading: boolean
  createdAt: string
}

function getBadgeVariant(badge?: string): 'new' | 'top' | 'best' | 'neon' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
}

function SkeletonPlaceholder({ aspectRatio }: { aspectRatio: string }) {
  const cls = ASPECT_RATIO_CLASSES[aspectRatio] || 'aspect-square'
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.05]',
        cls
      )}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-white/[0.06]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
      </div>
    </div>
  )
}

function GalleryImage({
  image,
  onClick,
}: {
  image: GeneratedImageData
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded')
    } catch {
      window.open(image.src, '_blank')
    }
  }

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.05] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="relative aspect-square">
        <Image
          src={image.src}
          alt={image.prompt}
          fill
          className="object-cover"
          unoptimized
        />
        <motion.div
          className="absolute inset-0 bg-black/60 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="mt-auto p-2 flex gap-1.5">
            <button
              className="flex-1 h-7 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1 transition-colors"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3" />
              Save
            </button>
            <button
              className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                window.open(image.src, '_blank')
              }}
            >
              <Maximize2 className="h-3 w-3" />
            </button>
            <button
              className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(image.prompt)
                toast.success('Prompt copied')
              }}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Image Detail Modal (Higgsfield-style) ── */
function ImageDetailModal({
  image,
  open,
  onClose,
}: {
  image: GeneratedImageData
  open: boolean
  onClose: () => void
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${image.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded')
    } catch {
      window.open(image.src, '_blank')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 flex w-full h-full">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main area: image + sidebar */}
            <div className="flex flex-1 pt-14 pb-4 px-4 gap-4 overflow-hidden">
              {/* Large image */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                <div className="relative w-full h-full max-w-[calc(100vh-8rem)] mx-auto">
                  <Image
                    src={image.src}
                    alt={image.prompt}
                    fill
                    className="object-contain rounded-xl"
                    unoptimized
                  />
                </div>
              </div>

              {/* Right sidebar */}
              <div className="w-80 shrink-0 flex flex-col gap-5 overflow-y-auto">
                <div className="rounded-2xl bg-[#1a1a1a] border border-white/[0.06] p-5 space-y-5">
                  {/* PROMPT section */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                      Prompt
                    </h4>
                    <p className="text-sm text-white/80 leading-relaxed line-clamp-6">
                      {image.prompt || 'No prompt'}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(image.prompt || '')
                          toast.success('Prompt copied')
                        }}
                        className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.06]" />

                  {/* INFORMATION section */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                      Information
                    </h4>
                    <div className="space-y-2.5">
                      {image.model && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">Model</span>
                          <span className="text-xs text-white/80">{image.model}</span>
                        </div>
                      )}
                      {image.aspectRatio && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">Aspect Ratio</span>
                          <span className="text-xs text-white/80">
                            {image.aspectRatio}
                          </span>
                        </div>
                      )}
                      {image.createdAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">Created</span>
                          <span className="text-xs text-white/80">
                            {new Date(image.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/[0.06]"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-white flex items-center justify-center transition-colors border border-white/[0.06]"
                    onClick={() => {
                      window.open(image.src, '_blank')
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-red-400 flex items-center justify-center transition-colors border border-white/[0.06]">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Aspect ratio icon SVG (matches Higgsfield) ── */
function AspectRatioIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={cn('text-white', className)}
    >
      <path
        d="M13 12.5C13 13.8807 11.8807 15 10.5 15L4.5 15C3.11929 15 2 13.8807 2 12.5L2 3.5C2 2.11929 3.11929 1 4.5 1L10.5 1C11.8807 1 13 2.11929 13 3.5L13 12.5ZM12 3.5C12 2.67157 11.3284 2 10.5 2L4.5 2C3.67157 2 3 2.67157 3 3.5L3 12.5C3 13.3284 3.67157 14 4.5 14L10.5 14C11.3284 14 12 13.3284 12 12.5L12 3.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ── Model icon SVG (matches Higgsfield) ── */
function ModelIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={cn('text-neon', className)}
    >
      <g clipPath="url(#modelClip)">
        <path
          d="M3.1544 12.1539L0.533203 12.8092V1.19824L3.1544 1.85354V12.1539Z"
          fill="currentColor"
        />
        <path
          d="M15.8225 12.8333L13.1963 13.4886V0.518555L15.8225 1.169V12.8333Z"
          fill="currentColor"
        />
        <path
          d="M7.31261 12.5083L4.69141 13.1636V6.32422L7.31261 6.97947V12.5083Z"
          fill="currentColor"
        />
        <path
          d="M9.02539 5.3096L11.6516 4.6543V11.4937L9.02539 10.8384V5.3096Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="modelClip">
          <rect width="16" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ── Sparkle icon SVG (matches Higgsfield generate button) ── */
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={cn('size-4', className)}
    >
      <path
        d="M11.8525 4.21651L11.7221 3.2387C11.6906 3.00226 11.4889 2.82568 11.2504 2.82568C11.0118 2.82568 10.8102 3.00226 10.7786 3.23869L10.6483 4.21651C10.2658 7.0847 8.00939 9.34115 5.14119 9.72358L4.16338 9.85396C3.92694 9.88549 3.75037 10.0872 3.75037 10.3257C3.75037 10.5642 3.92694 10.7659 4.16338 10.7974L5.14119 10.9278C8.00938 11.3102 10.2658 13.5667 10.6483 16.4349L10.7786 17.4127C10.8102 17.6491 11.0118 17.8257 11.2504 17.8257C11.4889 17.8257 11.6906 17.6491 11.7221 17.4127L11.8525 16.4349C12.2349 13.5667 14.4913 11.3102 17.3595 10.9278L18.3374 10.7974C18.5738 10.7659 18.7504 10.5642 18.7504 10.3257C18.7504 10.0872 18.5738 9.88549 18.3374 9.85396L17.3595 9.72358C14.4913 9.34115 12.2349 7.0847 11.8525 4.21651Z"
        fill="currentColor"
      />
      <path
        d="M4.6519 14.7568L4.82063 14.2084C4.84491 14.1295 4.91781 14.0757 5.00037 14.0757C5.08292 14.0757 5.15582 14.1295 5.1801 14.2084L5.34883 14.7568C5.56525 15.4602 6.11587 16.0108 6.81925 16.2272L7.36762 16.3959C7.44652 16.4202 7.50037 16.4931 7.50037 16.5757C7.50037 16.6582 7.44652 16.7311 7.36762 16.7554L6.81926 16.9241C6.11587 17.1406 5.56525 17.6912 5.34883 18.3946L5.1801 18.9429C5.15582 19.0218 5.08292 19.0757 5.00037 19.0757C4.91781 19.0757 4.84491 19.0218 4.82063 18.9429L4.65191 18.3946C4.43548 17.6912 3.88486 17.1406 3.18147 16.9241L2.63311 16.7554C2.55421 16.7311 2.50037 16.6582 2.50037 16.5757C2.50037 16.4931 2.55421 16.4202 2.63311 16.3959L3.18148 16.2272C3.88486 16.0108 4.43548 15.4602 4.6519 14.7568Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ImagePageContent() {
  const searchParams = useSearchParams()
  const modelParam = searchParams.get('model')
  const galleryEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [model, setModel] = useState('gpt-image-1.5')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [style, setStyle] = useState('None')
  const [numImages, setNumImages] = useState(4)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [groups, setGroups] = useState<GenerationGroup[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImageData | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const imageGeneration = useImageGeneration()
  const {
    isUploading,
    preview,
    fileInputRef,
    handleFileSelect,
    openFilePicker,
    clear: clearUpload,
  } = useUpload()

  // Load saved images from API on mount
  const { data: savedContent } = useQuery({
    queryKey: ['my-content', 'image'],
    queryFn: async () => {
      const headers = await getAuthHeaders()
      if (!headers.Authorization) return null
      const res = await fetch('/api/my-content?type=image&limit=50', { headers })
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 60_000,
  })

  // Transform saved content into generation groups on load
  useEffect(() => {
    if (!savedContent?.items?.length) return
    const items = savedContent.items as Array<{
      id: string
      prompt: string
      model: string
      metadata: { public_url?: string; aspect_ratio?: string }
      created_at: string
    }>

    const groupMap = new Map<string, GenerationGroup>()
    for (const item of items) {
      const key = `${item.prompt}_${item.model}`
      const existing = groupMap.get(key)
      const imgData: GeneratedImageData = {
        id: item.id,
        src: item.metadata?.public_url || '',
        prompt: item.prompt || '',
        model: item.model || '',
        aspectRatio: item.metadata?.aspect_ratio || '1:1',
        createdAt: item.created_at,
      }
      if (
        existing &&
        Math.abs(
          new Date(existing.createdAt).getTime() - new Date(item.created_at).getTime()
        ) < 30_000
      ) {
        existing.images.push(imgData)
      } else {
        groupMap.set(`${key}_${item.id}`, {
          id: item.id,
          prompt: item.prompt || '',
          model: item.model || '',
          aspectRatio: item.metadata?.aspect_ratio || '1:1',
          images: [imgData],
          isLoading: false,
          createdAt: item.created_at,
        })
      }
    }
    setGroups((prev) => {
      if (prev.some((g) => !g.isLoading && g.images.length > 0)) return prev
      return [...groupMap.values()]
    })
  }, [savedContent])

  // Sync model from URL param
  useEffect(() => {
    if (modelParam) {
      const foundModel = IMAGE_MODELS.find((m) => m.id === modelParam)
      if (foundModel) {
        if (foundModel.isComingSoon) {
          toast.info(`${foundModel.name} is coming soon!`)
        } else {
          setModel(modelParam)
        }
      } else if (MODEL_TO_TOOL_MAP[modelParam]) {
        setModel(modelParam)
      }
    }
  }, [modelParam])

  const caps = getImageModelCapabilities(model)
  const availableRatios = caps.aspectRatios ?? DEFAULT_ASPECT_RATIOS
  const maxImages = caps.maxImages ?? DEFAULT_MAX_IMAGES
  const hasAdvancedOptions =
    caps.supportsNegativePrompt || caps.supportsGuidanceScale || caps.supportsStyle

  // Reset/clamp state when model changes
  useEffect(() => {
    const newCaps = getImageModelCapabilities(model)
    const newRatios = newCaps.aspectRatios ?? DEFAULT_ASPECT_RATIOS
    const newMax = newCaps.maxImages ?? DEFAULT_MAX_IMAGES

    if (!newRatios.includes(aspectRatio)) {
      setAspectRatio(newRatios[0])
    }
    if (numImages > newMax) {
      setNumImages(newMax)
    }
    if (!newCaps.supportsStyle) {
      setStyle('None')
    }
    if (!newCaps.supportsNegativePrompt) {
      setNegativePrompt('')
    }
    if (newCaps.defaultGuidanceScale !== undefined) {
      setGuidanceScale(newCaps.defaultGuidanceScale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  // Auto-scroll to bottom when new group added
  useEffect(() => {
    galleryEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groups.length])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || imageGeneration.isPending) return

    const selectedModel = IMAGE_MODELS.find((m) => m.id === model)
    if (selectedModel?.isComingSoon) {
      toast.info(`${selectedModel.name} is coming soon!`)
      return
    }

    const groupId = `gen_${Date.now()}`
    const loadingGroup: GenerationGroup = {
      id: groupId,
      prompt,
      model: selectedModel?.name || model,
      aspectRatio,
      images: Array.from({ length: numImages }, (_, i) => ({
        id: `placeholder_${i}`,
        src: '',
        prompt,
      })),
      isLoading: true,
      createdAt: new Date().toISOString(),
    }
    setGroups((prev) => [...prev, loadingGroup])

    try {
      const result = await imageGeneration.mutateAsync({
        model,
        prompt:
          caps.supportsStyle && style !== 'None' ? `${prompt}, ${style} style` : prompt,
        negativePrompt: caps.supportsNegativePrompt
          ? negativePrompt || undefined
          : undefined,
        aspectRatio,
        numImages,
        guidanceScale: caps.supportsGuidanceScale ? guidanceScale : undefined,
        style: caps.supportsStyle && style !== 'None' ? style : undefined,
        inputImages: uploadedUrl ? [uploadedUrl] : undefined,
      })

      if (result?.images) {
        const modelName = selectedModel?.name || model
        const newImages: GeneratedImageData[] = result.images.map(
          (img: { id: string; src?: string; url?: string }) => ({
            id: img.id,
            src: img.src || img.url || '',
            prompt,
            model: modelName,
            aspectRatio,
            createdAt: new Date().toISOString(),
          })
        )
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, images: newImages, isLoading: false } : g
          )
        )
        toast.success(`Generated ${newImages.length} image(s)!`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
      setGroups((prev) => prev.filter((g) => g.id !== groupId))
    }
  }, [
    prompt,
    model,
    aspectRatio,
    numImages,
    style,
    negativePrompt,
    guidanceScale,
    caps,
    imageGeneration,
    uploadedUrl,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const selectedModelInfo = IMAGE_MODELS.find((m) => m.id === model)

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      {/* ── Scrollable Gallery (4 images per row) ── */}
      <div className="h-full overflow-y-auto pb-52">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {groups.length > 0 ? (
            <div className="space-y-10">
              {groups.map((group) => (
                <div key={group.id}>
                  {/* Group prompt header */}
                  <div className="mb-3">
                    <p className="text-sm text-white/80 line-clamp-2">
                      {group.prompt}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {group.model} &middot; {group.aspectRatio}
                    </p>
                  </div>
                  {/* 4-column image grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {group.isLoading
                      ? group.images.map((_, i) => (
                          <SkeletonPlaceholder
                            key={i}
                            aspectRatio={group.aspectRatio}
                          />
                        ))
                      : group.images
                          .filter((img) => img.src)
                          .map((image) => (
                            <GalleryImage
                              key={image.id}
                              image={image}
                              onClick={() =>
                                setSelectedImage({
                                  ...image,
                                  model: image.model || group.model,
                                  aspectRatio: image.aspectRatio || group.aspectRatio,
                                  createdAt: image.createdAt || group.createdAt,
                                })
                              }
                            />
                          ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
                <Wand2 className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Create something amazing
              </h3>
              <p className="text-sm text-white/40 max-w-sm">
                Describe the scene you imagine and hit Generate
              </p>
            </div>
          )}
          <div ref={galleryEndRef} />
        </div>
      </div>

      {/* ── Fixed Bottom Chat Bar (Higgsfield-style) ── */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className="w-full max-w-[70rem] p-0.5 rounded-[26px] bg-[rgba(28,30,32,0.88)] pointer-events-auto flex flex-col items-center justify-center"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <form
            className="w-full p-[22px] border rounded-3xl bg-[rgba(15,17,19,0.9)] border-white/[0.05]"
            style={{ backdropFilter: 'blur(10.45px)' }}
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerate()
            }}
          >
            <div className="flex gap-3">
              {/* ── Left: prompt + controls ── */}
              <div className="flex-1 space-y-2 min-h-0 min-w-0">
                {/* Row 1: Plus button + Upload preview + Textarea */}
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const result = await handleFileSelect(e)
                      if (result) setUploadedUrl(result.url)
                    }}
                  />
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={isUploading}
                    className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.03] hover:text-neon hover:bg-white/[0.06] text-white transition-colors relative -top-1 disabled:opacity-50"
                    title="Upload reference image"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <path
                          fill="currentColor"
                          d="M9.16602 9.16602V4.16602H10.8327V9.16602H15.8327V10.8327H10.8327V15.8327H9.16602V10.8327H4.16602V9.16602H9.16602Z"
                        />
                      </svg>
                    )}
                  </button>
                  {preview && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 -top-1">
                      <Image
                        src={preview}
                        alt="Upload preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          clearUpload()
                          setUploadedUrl(null)
                        }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center leading-none hover:bg-red-400 transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    name="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe the scene you imagine"
                    rows={1}
                    className="w-full resize-none bg-transparent text-[15px] text-white placeholder:text-white/40 focus:outline-none leading-normal"
                    style={{ minHeight: '40px', height: '40px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = `${Math.min(target.scrollHeight, 112)}px`
                    }}
                  />
                </div>

                {/* Row 2: Controls */}
                <div className="h-10 flex items-center gap-2">
                  {/* Model selector */}
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-10 w-auto min-w-0 rounded-xl border border-white/[0.05] bg-[#1a1a1a] hover:bg-[#222] px-3 py-2.5 gap-2 text-sm font-medium text-white focus:ring-0 focus:ring-offset-0 shadow-none [&>svg]:text-white/40 [&>svg]:h-4 [&>svg]:w-4">
                      <div className="flex items-center gap-2">
                        <ModelIcon className="!w-4 !h-4 shrink-0" />
                        <SelectValue placeholder="Select model" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {IMAGE_MODELS.map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          disabled={m.isComingSoon}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span
                                className={cn(
                                  'text-sm',
                                  m.isComingSoon && 'text-white/30'
                                )}
                              >
                                {m.name}
                              </span>
                              <span className="text-xs text-white/40">
                                {m.provider}
                              </span>
                            </div>
                            {m.badge && (
                              <Badge
                                variant={getBadgeVariant(m.badge)}
                                className="text-[9px] px-1.5 py-0"
                              >
                                {m.badge.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Aspect ratio selector */}
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="h-10 w-auto min-w-0 rounded-xl border border-white/[0.05] bg-[#1a1a1a] hover:bg-[#222] px-3 py-2.5 gap-2 text-sm font-medium text-white focus:ring-0 focus:ring-offset-0 shadow-none [&>svg]:text-white/40 [&>svg]:h-4 [&>svg]:w-4">
                      <div className="flex items-center gap-2">
                        <AspectRatioIcon className="!w-4 !h-4 shrink-0" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.filter((r) =>
                        availableRatios.includes(r.id)
                      ).map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.id}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Number of images stepper: - N/max + */}
                  <div className="flex items-center justify-center rounded-xl border border-white/[0.05] bg-[#1a1a1a] h-10 px-3 gap-1">
                    <button
                      type="button"
                      className="text-white/40 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-white/40"
                      onClick={() => setNumImages((n) => Math.max(1, n - 1))}
                      disabled={numImages <= 1}
                      aria-label="Decrement"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" className="size-5">
                        <path
                          fill="currentColor"
                          d="M4.16602 9.16602H15.8327V10.8327H4.16602V9.16602Z"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold text-white w-8 text-center tabular-nums">
                      {numImages}
                      <span className="text-white/40">/{maxImages}</span>
                    </span>
                    <button
                      type="button"
                      className="text-white/40 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-white/40"
                      onClick={() =>
                        setNumImages((n) => Math.min(maxImages, n + 1))
                      }
                      disabled={numImages >= maxImages}
                      aria-label="Increment"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" className="size-5">
                        <path
                          fill="currentColor"
                          d="M9.16602 9.16602V4.16602H10.8327V9.16602H15.8327V10.8327H10.8327V15.8327H9.16602V10.8327H4.16602V9.16602H9.16602Z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Advanced settings gear (dialog) */}
                  {hasAdvancedOptions && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-xl border border-white/[0.05] bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Advanced Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          {caps.supportsNegativePrompt && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Negative Prompt
                              </label>
                              <Textarea
                                placeholder="What to avoid in the image..."
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                          )}
                          {caps.supportsGuidanceScale && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">
                                  Guidance Scale
                                </label>
                                <Badge variant="secondary">{guidanceScale}</Badge>
                              </div>
                              <Slider
                                value={[guidanceScale]}
                                onValueChange={([v]) => setGuidanceScale(v)}
                                min={caps.minGuidanceScale ?? 1}
                                max={caps.maxGuidanceScale ?? 20}
                                step={0.5}
                              />
                            </div>
                          )}
                          {caps.supportsStyle && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Style</label>
                              <Select value={style} onValueChange={setStyle}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="None">None</SelectItem>
                                  {caps.styleOptions?.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {/* ── Right: Generate button (tall, matches Higgsfield) ── */}
              <aside className="h-[84px] self-end flex items-end justify-end">
                <button
                  type="submit"
                  disabled={!prompt.trim() || imageGeneration.isPending}
                  className={cn(
                    'w-36 h-full rounded-xl font-semibold text-sm transition-all',
                    'bg-neon text-black border border-neon',
                    'hover:bg-neon/80',
                    'focus-visible:ring-2 focus-visible:ring-neon/50',
                    'disabled:bg-[#1a1a1a] disabled:text-white/30 disabled:border-white/10 disabled:shadow-none',
                    !imageGeneration.isPending &&
                      prompt.trim() &&
                      'shadow-[0_0_10px_#c8ff0066]'
                  )}
                >
                  {imageGeneration.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        Generate
                        <div className="flex items-center gap-0.5">
                          <SparkleIcon />
                          <span>{numImages}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              </aside>
            </div>
          </form>
        </div>
      </div>

      {/* Image detail modal */}
      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

export default function ImagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <ImagePageContent />
    </Suspense>
  )
}
