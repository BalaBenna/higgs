'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Upload,
    X,
    Loader2,
    User,
    Sparkles,
    ImageIcon,
    FolderOpen,
    Video,
    Image as ImageLucide,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useUpload } from '@/hooks/use-upload'
import {
    useCreateCharacter,
    useGenerateCharacterPreviews,
    useAvailableTools,
} from '@/hooks/use-characters'
import { ImageLibraryPicker } from '@/components/ui/image-library-picker'

const STYLES = [
    'Realistic',
    'Anime',
    '3D',
    'Cartoon',
    'Cinematic',
    'Fantasy',
    'Cyberpunk',
    'Watercolor',
]

// Models that can use reference images for character consistency
const REFERENCE_CAPABLE_IDS = new Set([
    'flux-kontext-pro-replicate',
    'flux-kontext-max-replicate',
])

const ALL_IMAGE_MODELS = [
    { id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'OpenAI', toolId: 'generate_image_by_gpt_image_openai' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', toolId: 'generate_image_by_dalle3_openai' },
    { id: 'imagen-3', name: 'Imagen 3', provider: 'Google', toolId: 'generate_image_by_imagen_google' },
    { id: 'imagen-4', name: 'Imagen 4', provider: 'Google', toolId: 'generate_image_by_imagen_4_replicate' },
    { id: 'imagen-4-fast', name: 'Imagen 4 Fast', provider: 'Google', toolId: 'generate_image_by_imagen_4_fast_google' },
    { id: 'imagen-4-ultra', name: 'Imagen 4 Ultra', provider: 'Google', toolId: 'generate_image_by_imagen_4_ultra_google' },
    { id: 'flux-2-pro-replicate', name: 'FLUX 2 Pro', provider: 'Black Forest Labs', toolId: 'generate_image_by_flux_2_pro_replicate' },
    { id: 'flux-kontext-pro-replicate', name: 'FLUX Kontext Pro', provider: 'Black Forest Labs', toolId: 'generate_image_by_flux_kontext_pro_replicate' },
    { id: 'flux-kontext-max-replicate', name: 'FLUX Kontext Max', provider: 'Black Forest Labs', toolId: 'generate_image_by_flux_kontext_max_replicate' },
    { id: 'ideogram-v3-turbo', name: 'Ideogram V3 Turbo', provider: 'Ideogram', toolId: 'generate_image_by_ideogram_v3_turbo_replicate' },
    { id: 'recraft-v3-replicate', name: 'Recraft V3', provider: 'Recraft', toolId: 'generate_image_by_recraft_v3_replicate' },
    { id: 'flux-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'Black Forest Labs', toolId: 'generate_image_by_flux_1_1_pro_replicate' },
    { id: 'grok-imagine-image', name: 'Grok Imagine', provider: 'xAI', toolId: 'generate_image_by_grok_imagine_xai' },
]

const ALL_VIDEO_MODELS = [
    { id: 'veo-3.1', name: 'Google Veo 3.1', provider: 'Google', toolId: 'generate_video_by_veo_google' },
    { id: 'sora-2', name: 'Sora 2', provider: 'OpenAI', toolId: 'generate_video_by_sora_openai' },
    { id: 'sora-2-pro', name: 'Sora 2 Pro', provider: 'OpenAI', toolId: 'generate_video_by_sora_2_pro_openai' },
    { id: 'kling-v2.6-replicate', name: 'Kling v2.6', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v26_replicate' },
    { id: 'kling-v2.5-turbo-replicate', name: 'Kling v2.5 Turbo', provider: 'Kuaishou', toolId: 'generate_video_by_kling_v25_turbo_replicate' },
    { id: 'seedance-1.5-pro', name: 'Seedance 1.5 Pro', provider: 'ByteDance', toolId: 'generate_video_by_seedance_v1_pro_volces' },
    { id: 'grok-imagine', name: 'Grok Imagine', provider: 'xAI', toolId: 'generate_video_by_grok_imagine_xai' },
]

export default function CreateCharacterPage() {
    const router = useRouter()
    const createCharacter = useCreateCharacter()
    const generatePreviews = useGenerateCharacterPreviews()
    const { upload } = useUpload()
    const { data: availableTools = {} } = useAvailableTools()

    const IMAGE_MODELS = useMemo(
        () => ALL_IMAGE_MODELS.filter((m) => m.toolId in availableTools),
        [availableTools],
    )
    const VIDEO_MODELS = useMemo(
        () => ALL_VIDEO_MODELS.filter((m) => m.toolId in availableTools),
        [availableTools],
    )

    const [name, setName] = useState('')
    const [style, setStyle] = useState('Realistic')
    const [description, setDescription] = useState('')
    const [refPreviews, setRefPreviews] = useState<string[]>([])
    const [refFiles, setRefFiles] = useState<File[]>([])
    const [refUrls, setRefUrls] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [libraryOpen, setLibraryOpen] = useState(false)
    const [genMediaType, setGenMediaType] = useState<'image' | 'video'>('image')
    const [imageModel, setImageModel] = useState('')
    const [videoModel, setVideoModel] = useState('')
    const [genPrompt, setGenPrompt] = useState('')

    // Effective model: use selected if still available, else first available
    // Prefer a reference-capable model so character likeness is preserved
    const defaultRefModel = IMAGE_MODELS.find((m) => REFERENCE_CAPABLE_IDS.has(m.id))?.id || IMAGE_MODELS[0]?.id || ''
    const effectiveImageModel = IMAGE_MODELS.find((m) => m.id === imageModel)?.id || defaultRefModel
    const effectiveVideoModel = VIDEO_MODELS.find((m) => m.id === videoModel)?.id || VIDEO_MODELS[0]?.id || ''

    const fileInputRef = useRef<HTMLInputElement>(null)

    const totalCount = refFiles.length + refUrls.length

    const addRefFiles = useCallback(
        (files: FileList | File[]) => {
            const newFiles = Array.from(files).slice(0, 5 - totalCount)
            newFiles.forEach((file) => {
                const reader = new FileReader()
                reader.onload = (ev) =>
                    setRefPreviews((prev) => [...prev, ev.target?.result as string])
                reader.readAsDataURL(file)
            })
            setRefFiles((prev) => [...prev, ...newFiles])
        },
        [totalCount],
    )

    const handleLibrarySelect = (urls: string[]) => {
        setRefUrls((prev) => [...prev, ...urls])
        setRefPreviews((prev) => [...prev, ...urls])
    }

    const handleRemovePreview = (index: number) => {
        const src = refPreviews[index]
        if (refUrls.includes(src)) {
            setRefUrls((prev) => prev.filter((u) => u !== src))
        } else {
            const libraryBefore = refUrls.filter((u) => {
                const uIdx = refPreviews.indexOf(u)
                return uIdx >= 0 && uIdx < index
            }).length
            const fileIndex = index - libraryBefore
            setRefFiles((prev) => prev.filter((_, i) => i !== fileIndex))
        }
        setRefPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Please enter a character name')
            return
        }
        setIsCreating(true)
        try {
            const uploadedUrls: string[] = [...refUrls]
            for (const file of refFiles) {
                const result = await upload(file)
                if (result?.url) uploadedUrls.push(result.url)
            }

            const character = await createCharacter.mutateAsync({
                name: name.trim(),
                style,
                description,
                reference_images: uploadedUrls,
            })

            toast.success(`Character "${character.name}" created!`)

            if (uploadedUrls.length > 0 && character.id) {
                const isVideo = genMediaType === 'video'
                const models = isVideo ? VIDEO_MODELS : IMAGE_MODELS
                const effectiveId = isVideo ? effectiveVideoModel : effectiveImageModel
                const selectedModel = models.find((m) => m.id === effectiveId)
                toast.info(
                    isVideo
                        ? `Generating video with ${selectedModel?.name}…`
                        : 'Generating style previews…',
                )
                generatePreviews.mutate(
                    {
                        characterId: character.id,
                        toolId: selectedModel?.toolId,
                        mediaType: genMediaType,
                        prompt: genPrompt || undefined,
                    },
                    {
                        onSuccess: () =>
                            toast.success(
                                isVideo ? 'Video generated!' : 'Preview images ready!',
                            ),
                        onError: () =>
                            toast.error(
                                isVideo
                                    ? 'Video generation failed'
                                    : 'Some previews failed to generate',
                            ),
                    },
                )
            }

            router.push('/character')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create character')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                    variant="ghost"
                    className="gap-2 mb-6"
                    onClick={() => router.push('/character')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Characters
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Create <span className="text-neon neon-text">Character</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Define your character&apos;s identity and upload reference images for
                        consistent AI generations
                    </p>
                </div>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-[1fr,320px]">
                {/* Left – Form */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Character Name</label>
                        <Input
                            placeholder="e.g., Luna, Marcus, Aria…"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-base"
                        />
                    </div>

                    {/* Style */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Style</label>
                        <Select value={style} onValueChange={setStyle}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STYLES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {STYLES.map((s) => (
                                <Badge
                                    key={s}
                                    variant={s === style ? 'default' : 'outline'}
                                    className="cursor-pointer text-xs"
                                    onClick={() => setStyle(s)}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description{' '}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <Textarea
                            placeholder="Describe your character's appearance, personality, or any distinguishing features…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Reference images */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                Reference Images{' '}
                                <span className="text-muted-foreground font-normal">
                                    ({totalCount}/5)
                                </span>
                            </label>
                            {refPreviews.length > 0 && (
                                <button
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => {
                                        setRefPreviews([])
                                        setRefFiles([])
                                        setRefUrls([])
                                    }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) addRefFiles(e.target.files)
                                e.target.value = ''
                            }}
                        />

                        {/* Thumbnails grid */}
                        {refPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-3">
                                {refPreviews.map((src, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-square rounded-lg overflow-hidden border group"
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemovePreview(i)}
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalCount < 5 && (
                            <div className="flex gap-3">
                                <div
                                    className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive
                                        ? 'border-neon bg-neon/10'
                                        : 'border-border hover:border-neon/50'
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault()
                                        setDragActive(true)
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault()
                                        setDragActive(false)
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        setDragActive(false)
                                        if (e.dataTransfer.files) addRefFiles(e.dataTransfer.files)
                                    }}
                                >
                                    <Upload className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Upload new images</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP</p>
                                </div>

                                <div
                                    className="flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-neon/50"
                                    onClick={() => setLibraryOpen(true)}
                                >
                                    <FolderOpen className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Choose from Library</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Previously generated or uploaded
                                    </p>
                                </div>
                            </div>
                        )}

                        <ImageLibraryPicker
                            open={libraryOpen}
                            onOpenChange={setLibraryOpen}
                            onSelect={handleLibrarySelect}
                            maxSelect={5}
                            currentCount={totalCount}
                        />
                    </div>

                    {/* Generation Model Selection */}
                    <div className="space-y-4 border-t border-border pt-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-neon" />
                            <label className="text-sm font-semibold">AI Generation</label>
                        </div>

                        {/* Image / Video toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={genMediaType === 'image' ? 'secondary' : 'outline'}
                                size="sm"
                                className={
                                    genMediaType === 'image'
                                        ? 'border-neon/50 bg-neon/10 gap-1.5'
                                        : 'gap-1.5'
                                }
                                onClick={() => setGenMediaType('image')}
                            >
                                <ImageLucide className="h-3.5 w-3.5" />
                                Image
                            </Button>
                            <Button
                                variant={genMediaType === 'video' ? 'secondary' : 'outline'}
                                size="sm"
                                className={
                                    genMediaType === 'video'
                                        ? 'border-neon/50 bg-neon/10 gap-1.5'
                                        : 'gap-1.5'
                                }
                                onClick={() => setGenMediaType('video')}
                            >
                                <Video className="h-3.5 w-3.5" />
                                Video
                            </Button>
                        </div>

                        {/* Model selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Model</label>
                            {genMediaType === 'image' ? (
                                <Select value={effectiveImageModel} onValueChange={setImageModel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {IMAGE_MODELS.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{m.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {m.provider}
                                                    </span>
                                                    {REFERENCE_CAPABLE_IDS.has(m.id) && (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0">Ref</Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Select value={effectiveVideoModel} onValueChange={setVideoModel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VIDEO_MODELS.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{m.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {m.provider}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {genMediaType === 'image' && !REFERENCE_CAPABLE_IDS.has(effectiveImageModel) && (
                                <p className="text-xs text-amber-500">This model cannot use reference images — character likeness may vary</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Custom Prompt{' '}
                                <span className="text-muted-foreground font-normal">
                                    (optional — leave blank for style previews)
                                </span>
                            </label>
                            <Textarea
                                placeholder={
                                    genMediaType === 'video'
                                        ? 'e.g., Character walking through a futuristic city, cinematic slow-mo…'
                                        : 'e.g., Portrait in dramatic lighting, fantasy setting…'
                                }
                                value={genPrompt}
                                onChange={(e) => setGenPrompt(e.target.value)}
                                className="min-h-[80px] resize-none"
                            />
                        </div>

                        {genMediaType === 'video' && (
                            <p className="text-xs text-muted-foreground">
                                Video generation may take 2-5 minutes depending on the model.
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        variant="neon"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleCreate}
                        disabled={!name.trim() || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Create Character
                            </>
                        )}
                    </Button>
                </motion.div>

                {/* Right – Live preview card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-sm font-medium mb-3 text-muted-foreground">Preview</p>
                    <Card className="overflow-hidden sticky top-24">
                        <div className="aspect-square relative bg-muted">
                            {refPreviews[0] ? (
                                <img
                                    src={refPreviews[0]}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <User className="h-16 w-16 mb-2" />
                                    <span className="text-sm">No image yet</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white font-semibold text-lg truncate">
                                    {name || 'Character Name'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                        {style}
                                    </Badge>
                                    {refPreviews.length > 0 && (
                                        <span className="text-white/70 text-sm flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3" />
                                            {refPreviews.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {description && (
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {description}
                                </p>
                            </CardContent>
                        )}
                        <CardContent className="p-4 pt-0 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {genMediaType === 'image' ? (
                                    <ImageLucide className="h-3 w-3" />
                                ) : (
                                    <Video className="h-3 w-3" />
                                )}
                                <span>
                                    {genMediaType === 'image'
                                        ? IMAGE_MODELS.find((m) => m.id === effectiveImageModel)?.name
                                        : VIDEO_MODELS.find((m) => m.id === effectiveVideoModel)?.name}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
