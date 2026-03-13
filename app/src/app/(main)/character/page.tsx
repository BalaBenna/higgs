'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  User,
  Sparkles,
  RefreshCw,
  X,
  Download,
  Trash2,
  ArrowLeft,
  ImagePlus,
  Loader2,
  Video,
  Image as ImageLucide,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
import { useUpload } from '@/hooks/use-upload'
import {
  useCharacters,
  useDeleteCharacter,
  useUpdateCharacter,
  useCharacterGenerations,
  useGenerateCharacterPreviews,
  useAvailableTools,
  type Character,
} from '@/hooks/use-characters'
import { useMemo } from 'react'

export default function CharacterPage() {
  const router = useRouter()
  const { data: characters = [], isLoading } = useCharacters()
  const deleteCharacter = useDeleteCharacter()
  const updateCharacter = useUpdateCharacter()
  const generatePreviews = useGenerateCharacterPreviews()
  const { upload } = useUpload()

  const { data: availableTools = {} } = useAvailableTools()
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const IMAGE_MODELS = useMemo(
    () => ALL_IMAGE_MODELS.filter((m) => m.toolId in availableTools),
    [availableTools],
  )
  const VIDEO_MODELS = useMemo(
    () => ALL_VIDEO_MODELS.filter((m) => m.toolId in availableTools),
    [availableTools],
  )

  // Generation state
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [generatingForId, setGeneratingForId] = useState<string | null>(null)

  const addRefInputRef = useRef<HTMLInputElement>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteCharacter.mutateAsync(id)
      if (selectedCharacter?.id === id) setSelectedCharacter(null)
      toast.success('Character deleted')
    } catch {
      toast.error('Failed to delete character')
    }
  }

  const handleGenerateWithCharacter = async (character: Character, mediaType = 'image', modelId?: string) => {
    const prompt =
      generatePrompt.trim() ||
      `A portrait of ${character.name} in ${character.style} style`
    setGeneratingForId(character.id)

    const models = mediaType === 'video' ? VIDEO_MODELS : IMAGE_MODELS
    const selectedModel = models.find((m) => m.id === modelId) || models[0]

    try {
      const result = await generatePreviews.mutateAsync({
        characterId: character.id,
        toolId: selectedModel.toolId,
        mediaType,
        prompt,
      })

      if (result.images && result.images.length > 0) {
        toast.success(`Character ${mediaType} generated!`)
      } else {
        toast.error('Generation failed — the model could not produce an image. Try a different model or prompt.')
      }
      setGeneratePrompt('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setGeneratingForId(null)
    }
  }

  const handleAddRefImage = async (character: Character, files: FileList) => {
    const urls: string[] = []
    for (const file of Array.from(files).slice(0, 5)) {
      const result = await upload(file)
      if (result?.url) urls.push(result.url)
    }
    if (urls.length === 0) return
    const existing = (character.reference_images || []).map((r) => r.url)
    await updateCharacter.mutateAsync({
      characterId: character.id,
      reference_images: [...existing, ...urls],
    })
    toast.success(`${urls.length} image(s) added`)
  }

  const handleRemoveRefImage = async (character: Character, index: number) => {
    const updated = (character.reference_images || [])
      .map((r) => r.url)
      .filter((_, i) => i !== index)
    await updateCharacter.mutateAsync({
      characterId: character.id,
      reference_images: updated,
    })
  }

  // ---- Detail view ----
  if (selectedCharacter) {
    return <CharacterDetail
      character={characters.find((c) => c.id === selectedCharacter.id) || selectedCharacter}
      imageModels={IMAGE_MODELS}
      videoModels={VIDEO_MODELS}
      onBack={() => setSelectedCharacter(null)}
      onGenerate={handleGenerateWithCharacter}
      onDelete={handleDelete}
      onAddRefImage={handleAddRefImage}
      onRemoveRefImage={handleRemoveRefImage}
      onRegeneratePreviews={(id) => {
        toast.info('Regenerating previews…')
        generatePreviews.mutate(
          { characterId: id },
          {
            onSuccess: (data) => {
              if (data.images && data.images.length > 0) {
                toast.success(`${data.images.length} preview(s) ready!`)
              } else {
                toast.error('Generation failed — the model could not produce images. Try a different model.')
              }
            },
            onError: () => toast.error('Some previews failed'),
          },
        )
      }}
      generatePrompt={generatePrompt}
      setGeneratePrompt={setGeneratePrompt}
      isGenerating={generatingForId === selectedCharacter.id}
      isRegenerating={generatePreviews.isPending}
      addRefInputRef={addRefInputRef}
    />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            My <span className="text-neon neon-text">Characters</span>
          </h1>
          <p className="text-muted-foreground">
            Create and manage consistent AI characters for your projects
          </p>
        </div>
        <Button variant="neon" className="gap-2" onClick={() => router.push('/character/create')}>
          <Plus className="h-4 w-4" />
          New Character
        </Button>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Characters Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="h-full border-dashed cursor-pointer hover:border-neon/50 transition-colors"
              onClick={() => router.push('/character/create')}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Create Character</h3>
                <p className="text-sm text-muted-foreground">
                  Build a new AI character with consistent features
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Character Cards */}
          {characters.map((character, index) => {
            const coverUrl =
              (character.reference_images || [])[0]?.url || null
            const isPreviewLoading =
              generatePreviews.isPending &&
              generatePreviews.variables?.characterId === character.id

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (index + 1) * 0.05 }}
              >
                <Card className="card-hover cursor-pointer overflow-hidden">
                  <div
                    className="aspect-square relative"
                    onClick={() => setSelectedCharacter(character)}
                  >
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Preview generating overlay */}
                    {isPreviewLoading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                        <span className="text-white text-sm">Generating previews…</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">
                        {character.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {character.style}
                        </Badge>
                        <span className="text-white/70 text-sm">
                          {(character.reference_images || []).length} ref
                        </span>
                      </div>
                    </div>
                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-red-500/80 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(character.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && characters.length === 0 && (
        <div className="text-center py-16">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No characters yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first character to start generating consistent AI images
          </p>
          <Button variant="neon" onClick={() => router.push('/character/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Character
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Character Detail sub-component
// ---------------------------------------------------------------------------

function CharacterDetail({
  character,
  imageModels,
  videoModels,
  onBack,
  onGenerate,
  onDelete,
  onAddRefImage,
  onRemoveRefImage,
  onRegeneratePreviews,
  generatePrompt,
  setGeneratePrompt,
  isGenerating,
  isRegenerating,
  addRefInputRef,
}: {
  character: Character
  imageModels: typeof ALL_IMAGE_MODELS
  videoModels: typeof ALL_VIDEO_MODELS
  onBack: () => void
  onGenerate: (c: Character, mediaType: string, modelId: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddRefImage: (c: Character, files: FileList) => Promise<void>
  onRemoveRefImage: (c: Character, index: number) => Promise<void>
  onRegeneratePreviews: (id: string) => void
  generatePrompt: string
  setGeneratePrompt: (v: string) => void
  isGenerating: boolean
  isRegenerating: boolean
  addRefInputRef: React.RefObject<HTMLInputElement | null>
}) {
  const { data: generations = [] } = useCharacterGenerations(character.id)
  const [detailMediaType, setDetailMediaType] = useState<'image' | 'video'>('image')
  // Prefer a reference-capable model so character likeness is preserved
  const defaultImageModel = imageModels.find((m) => REFERENCE_CAPABLE_IDS.has(m.id))?.id || imageModels[0]?.id || ''
  const [detailImageModel, setDetailImageModel] = useState(defaultImageModel)
  const [detailVideoModel, setDetailVideoModel] = useState(videoModels[0]?.id || '')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="gap-2 mb-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Characters
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{character.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{character.style}</Badge>
              {character.description && (
                <span className="text-sm text-muted-foreground">
                  {character.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => onRegeneratePreviews(character.id)}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRegenerating ? 'Generating…' : 'Regenerate Previews'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(character.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Reference Images */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Reference Images</h2>
          <div>
            <input
              ref={addRefInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onAddRefImage(character, e.target.files)
                e.target.value = ''
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => addRefInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
        {(character.reference_images || []).length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {character.reference_images.map((img, i) => (
              <div
                key={i}
                className="relative w-28 h-28 rounded-lg overflow-hidden border group"
              >
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                />
                <button
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveRefImage(character, i)}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No reference images yet. Add one to enable consistent generation.
          </p>
        )}
      </motion.section>

      {/* Generate */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold mb-3">Generate with {character.name}</h2>

        {/* Media type toggle */}
        <div className="flex gap-2 mb-3">
          <Button
            variant={detailMediaType === 'image' ? 'secondary' : 'outline'}
            size="sm"
            className={detailMediaType === 'image' ? 'border-neon/50 bg-neon/10 gap-1.5' : 'gap-1.5'}
            onClick={() => setDetailMediaType('image')}
          >
            <ImageLucide className="h-3.5 w-3.5" />
            Image
          </Button>
          <Button
            variant={detailMediaType === 'video' ? 'secondary' : 'outline'}
            size="sm"
            className={detailMediaType === 'video' ? 'border-neon/50 bg-neon/10 gap-1.5' : 'gap-1.5'}
            onClick={() => setDetailMediaType('video')}
          >
            <Video className="h-3.5 w-3.5" />
            Video
          </Button>
        </div>

        {/* Model selector */}
        <div className="mb-3">
          {detailMediaType === 'image' ? (
            <>
              <Select value={detailImageModel || defaultImageModel} onValueChange={setDetailImageModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.provider}</span>
                        {REFERENCE_CAPABLE_IDS.has(m.id) && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">Ref</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!REFERENCE_CAPABLE_IDS.has(detailImageModel || defaultImageModel) && (
                <p className="text-xs text-amber-500 mt-1">This model cannot use reference images — character likeness may vary</p>
              )}
            </>
          ) : (
          <Select value={detailVideoModel || videoModels[0]?.id || ''} onValueChange={setDetailVideoModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {videoModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    <span>{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.provider}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder={`Describe a scene with ${character.name}…`}
            value={generatePrompt}
            onChange={(e) => setGeneratePrompt(e.target.value)}
            className="min-h-[60px] resize-none flex-1"
          />
          <Button
            variant="neon"
            className="gap-2 self-end"
            disabled={isGenerating}
            onClick={() => onGenerate(character, detailMediaType, detailMediaType === 'video' ? (detailVideoModel || videoModels[0]?.id || '') : (detailImageModel || defaultImageModel))}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </motion.section>

      {/* Generated Images Gallery */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-3">
          Generated Content ({generations.length})
        </h2>
        {generations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {generations.map((gen: Record<string, unknown>) => {
              const url =
                (gen.metadata as Record<string, unknown>)?.public_url as string ||
                gen.storage_path as string ||
                ''
              const isVideo = gen.type === 'video'
              return (
                <div
                  key={gen.id as string}
                  className="relative group rounded-lg overflow-hidden aspect-square border"
                >
                  {isVideo ? (
                    <video src={url} className="w-full h-full object-cover" muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }} />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href={url} download>
                      <Button variant="ghost" size="icon" className="text-white">
                        <Download className="h-5 w-5" />
                      </Button>
                    </a>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 flex items-center gap-1">
                    {isVideo && <Video className="h-3 w-3 text-white" />}
                    {(gen.metadata as Record<string, unknown>)?.style_label && (
                      <span className="text-white text-xs">
                        {(gen.metadata as Record<string, unknown>)?.style_label as string}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg border-dashed">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              No generated content yet. Use the prompt above or click &quot;Regenerate
              Previews&quot; to create style variants.
            </p>
          </div>
        )}
      </motion.section>
    </div>
  )
}
