'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  RefreshCw,
  Download,
  X,
  Sparkles,
  Heart,
  Replace,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpload } from '@/hooks/use-upload'
import { useFeatureGeneration } from '@/hooks/use-feature'

const SKIN_MODELS = [
  {
    id: 'enhance_image_by_topaz',
    label: 'Topaz Enhance',
    provider: 'Topaz Labs',
    description: 'AI face & skin enhancement',
  },
  {
    id: 'generate_image_by_gpt_image_openai',
    label: 'GPT Image',
    provider: 'OpenAI',
    description: 'Best for natural skin retouching',
  },
  {
    id: 'edit_image_by_doubao_seededit_3_volces',
    label: 'Seedream Edit 3',
    provider: 'ByteDance',
    description: 'High-quality image editing',
  },
  {
    id: 'generate_image_by_imagen_4_ultra_google',
    label: 'Imagen 4 Ultra',
    provider: 'Google',
    description: 'Highest quality Google model',
  },
  {
    id: 'generate_image_by_imagen_4_fast_google',
    label: 'Imagen 4 Fast',
    provider: 'Google',
    description: 'Fast Google editing',
  },
] as const

interface SkinResult {
  id: string
  originalPreview: string
  resultUrl: string
  settings: string
}

export default function SkinEnhancerPage() {
  const [selectedModel, setSelectedModel] = useState<string>(SKIN_MODELS[0].id)
  const [smoothness, setSmoothness] = useState(60)
  const [blemishReduction, setBlemishReduction] = useState(70)
  const [skinTone, setSkinTone] = useState(50)
  const [additionalPrompt, setAdditionalPrompt] = useState('')
  const [results, setResults] = useState<SkinResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SkinResult | null>(null)

  const imageUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  const currentSettingsLabel = () => {
    return `Smooth ${smoothness}% · Blemish ${blemishReduction}% · Tone ${skinTone}%`
  }

  const handleGenerate = async () => {
    if (!imageUpload.url) {
      toast.error('Please upload a portrait first')
      return
    }

    try {
      const smoothnessDesc =
        smoothness < 30
          ? 'subtly smooth'
          : smoothness < 70
            ? 'moderately smooth'
            : 'heavily smooth'
      const blemishDesc =
        blemishReduction < 30
          ? 'keep most natural skin texture'
          : blemishReduction < 70
            ? 'reduce visible blemishes while keeping skin texture'
            : 'remove blemishes, acne marks, and dark spots thoroughly'
      const toneDesc =
        skinTone < 30
          ? 'keep original skin tone'
          : skinTone < 70
            ? 'even out skin tone slightly'
            : 'significantly even out and brighten skin tone'

      const prompt =
        `${smoothnessDesc} the skin. ${blemishDesc}. ${toneDesc}. This is a skin-only retouch — the face shape, facial features, identity, expression, eyes, nose, mouth, jawline, hair, ears, clothing, pose, and background must remain COMPLETELY UNCHANGED pixel-for-pixel. Only the skin surface texture and tone should be modified.${additionalPrompt ? ' ' + additionalPrompt : ''}`.trim()

      const result = await featureGeneration.mutateAsync({
        featureType: 'skin_enhance',
        inputImages: [imageUpload.url],
        prompt,
        toolId: selectedModel,
        params: {
          smoothness,
          blemish_reduction: blemishReduction,
          skin_tone: skinTone,
        },
      })

      if (result) {
        const newResult: SkinResult = {
          id: result.id || `skin_${Date.now()}`,
          originalPreview: imageUpload.preview || '',
          resultUrl: result.url || result.src || '',
          settings: currentSettingsLabel(),
        }
        setResults((prev) => [newResult, ...prev])
        setSelectedResult(newResult)
        toast.success('Skin enhancement applied!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Skin enhancement failed'
      toast.error(message)
    }
  }

  // Upload state — hero layout
  if (!imageUpload.preview) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
        <motion.div
          className="max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={`relative rounded-2xl overflow-hidden border-2 border-dashed mb-8 cursor-pointer transition-colors ${
              imageUpload.isDragging
                ? 'border-[#c8ff00] bg-[#c8ff00]/5'
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={imageUpload.openFilePicker}
            {...imageUpload.dropZoneProps}
          >
            <input
              ref={imageUpload.fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={imageUpload.handleFileSelect}
            />
            <div className="aspect-[4/3] bg-gradient-to-b from-white/[0.03] to-transparent flex flex-col items-center justify-center">
              {imageUpload.isUploading ? (
                <RefreshCw className="h-12 w-12 animate-spin text-[#c8ff00]" />
              ) : (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-white/20" />
                  </div>
                  <Upload className="h-5 w-5 text-white/30 mb-3" />
                  <p className="text-sm text-white/40">
                    Drop a portrait or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            SKIN ENHANCER
          </h1>
          <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
            Professional AI skin retouching — smooth skin, reduce blemishes, and
            even out skin tone while keeping it natural
          </p>

          <Button
            variant="neon"
            size="lg"
            className="gap-2"
            onClick={imageUpload.openFilePicker}
          >
            <Upload className="h-4 w-4" />
            Upload portrait
          </Button>
        </motion.div>
      </div>
    )
  }

  // Editor state — image + sidebar
  const displayImage = selectedResult?.resultUrl || imageUpload.preview

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel — Image Preview */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="border-b border-white/[0.06] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/60 hover:text-white"
              onClick={() => {
                imageUpload.clear()
                setResults([])
                setSelectedResult(null)
              }}
            >
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/60 hover:text-white"
              onClick={imageUpload.openFilePicker}
            >
              <Replace className="h-3.5 w-3.5" />
              Replace
            </Button>
            <input
              ref={imageUpload.fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={imageUpload.handleFileSelect}
            />
          </div>
          {results.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Main image area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <motion.div
            className="relative rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={displayImage!}
              alt={selectedResult ? 'Enhanced result' : 'Original'}
              className="max-w-[600px] max-h-[500px] object-contain"
            />
            {selectedResult && (
              <Badge className="absolute top-3 left-3 bg-[#c8ff00]/90 text-black text-[10px] font-semibold">
                Enhanced
              </Badge>
            )}
          </motion.div>
        </div>

        {/* Results strip */}
        {results.length > 0 && (
          <div className="border-t border-white/[0.06] px-4 py-3 bg-black/20">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {/* Original thumbnail */}
              <button
                className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  !selectedResult
                    ? 'border-[#c8ff00]/50'
                    : 'border-white/[0.06] hover:border-white/20'
                }`}
                onClick={() => setSelectedResult(null)}
              >
                <img
                  src={imageUpload.preview!}
                  alt="Original"
                  className="w-14 h-14 object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white/70 text-center py-0.5">
                  Original
                </span>
              </button>

              {results.map((result) => (
                <button
                  key={result.id}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedResult?.id === result.id
                      ? 'border-[#c8ff00]/50'
                      : 'border-white/[0.06] hover:border-white/20'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <img
                    src={result.resultUrl}
                    alt={result.settings}
                    className="w-14 h-14 object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white/70 text-center py-0.5">
                    Enhanced
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar — Controls */}
      <div className="w-[320px] border-l border-white/[0.06] bg-black/20 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 border border-[#c8ff00]/20 flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-[#c8ff00]" />
              </div>
              <h2 className="text-sm font-semibold text-white">Skin Enhancer</h2>
            </div>

            {/* Model Selection */}
            <div>
              <p className="text-[11px] text-white/50 mb-2 font-medium uppercase tracking-wider">
                Model
              </p>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full bg-white/[0.03] border-white/[0.06] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <span className="flex items-center gap-2">
                        {model.label}
                        <span className="text-white/30 text-[10px]">
                          {model.provider}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Smoothness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  Smoothness
                </p>
                <span className="text-[11px] text-white/40">{smoothness}%</span>
              </div>
              <Slider
                value={[smoothness]}
                onValueChange={([v]) => setSmoothness(v)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-[10px] text-white/30 mt-1">
                How much to smooth skin texture
              </p>
            </div>

            {/* Blemish Reduction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  Blemish Reduction
                </p>
                <span className="text-[11px] text-white/40">{blemishReduction}%</span>
              </div>
              <Slider
                value={[blemishReduction]}
                onValueChange={([v]) => setBlemishReduction(v)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-[10px] text-white/30 mt-1">
                Reduce acne, spots, and imperfections
              </p>
            </div>

            {/* Skin Tone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  Tone Evenness
                </p>
                <span className="text-[11px] text-white/40">{skinTone}%</span>
              </div>
              <Slider
                value={[skinTone]}
                onValueChange={([v]) => setSkinTone(v)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-[10px] text-white/30 mt-1">
                Even out skin tone and reduce discoloration
              </p>
            </div>

            {/* Additional Guidance */}
            <div>
              <p className="text-[11px] text-white/50 mb-2 font-medium uppercase tracking-wider">
                Additional guidance
              </p>
              <Textarea
                placeholder="Optional: Describe specific areas to focus on, desired look..."
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                className="min-h-[70px] resize-none bg-white/[0.03] border-white/[0.06] text-sm placeholder:text-white/25"
              />
            </div>

            {/* Download button for selected result */}
            {selectedResult?.resultUrl && (
              <a href={selectedResult.resultUrl} download className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-white/[0.06] text-white/60 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Result
                </Button>
              </a>
            )}
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/[0.06]">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!imageUpload.url || featureGeneration.isPending}
          >
            {featureGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Enhance Skin
              </>
            )}
          </Button>
          <p className="text-[11px] text-white/30 text-center mt-2">
            {currentSettingsLabel()}
          </p>
        </div>
      </div>
    </div>
  )
}
