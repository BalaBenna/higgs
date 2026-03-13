'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Palette,
  Upload,
  RefreshCw,
  Download,
  X,
  Sparkles,
  ImageIcon,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUpload } from '@/hooks/use-upload'
import { useFeatureGeneration } from '@/hooks/use-feature'

const STYLE_CATEGORIES = [
  {
    id: 'fashion',
    label: 'Fashion & Clothing',
    styles: [
      { id: 'streetwear', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=300&h=400&fit=crop' },
      { id: 'haute-couture', label: 'Haute Couture', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop' },
      { id: 'casual', label: 'Casual Chic', image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=300&h=400&fit=crop' },
      { id: 'vintage-fashion', label: 'Vintage', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop' },
      { id: 'minimalist', label: 'Minimalist', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=300&h=400&fit=crop' },
      { id: 'bohemian', label: 'Bohemian', image: 'https://images.unsplash.com/photo-1520423465871-0866049020c7?w=300&h=400&fit=crop' },
    ],
  },
  {
    id: 'artistic',
    label: 'Artistic Styles',
    styles: [
      { id: 'anime', label: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop' },
      { id: 'oil-painting', label: 'Oil Painting', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=400&fit=crop' },
      { id: 'watercolor', label: 'Watercolor', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=400&fit=crop' },
      { id: 'pop-art', label: 'Pop Art', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=300&h=400&fit=crop' },
      { id: 'cyberpunk', label: 'Cyberpunk', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=400&fit=crop' },
      { id: 'art-nouveau', label: 'Art Nouveau', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=300&h=400&fit=crop' },
    ],
  },
  {
    id: 'photo',
    label: 'Photography Styles',
    styles: [
      { id: 'cinematic', label: 'Cinematic', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop' },
      { id: 'film-noir', label: 'Film Noir', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=400&fit=crop' },
      { id: 'vintage-photo', label: 'Vintage Film', image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&h=400&fit=crop' },
      { id: 'neon', label: 'Neon Glow', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=400&fit=crop' },
      { id: 'golden-hour', label: 'Golden Hour', image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300&h=400&fit=crop' },
      { id: 'moody', label: 'Dark & Moody', image: 'https://images.unsplash.com/photo-1518818419601-72c8673f5852?w=300&h=400&fit=crop' },
    ],
  },
]

interface StylistResult {
  id: string
  originalPreview: string
  resultUrl: string
  style: string
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/90 hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
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

export default function AIStylistPage() {
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const [selectedStyle, setSelectedStyle] = useState('streetwear')
  const [additionalPrompt, setAdditionalPrompt] = useState('')
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourcePreview, setSourcePreview] = useState<string | null>(null)
  const [results, setResults] = useState<StylistResult[]>([])
  const [fileDragActive, setFileDragActive] = useState(false)

  const uploader = useUpload()
  const featureGeneration = useFeatureGeneration()

  const selectedStyleLabel = STYLE_CATEGORIES
    .flatMap((c) => c.styles)
    .find((s) => s.id === selectedStyle)?.label || selectedStyle

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSourceFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setSourcePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearFile = () => {
    setSourceFile(null)
    setSourcePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!sourceFile) {
      toast.error('Please upload a source image')
      return
    }

    try {
      const uploadResult = await uploader.upload(sourceFile)
      if (!uploadResult) {
        toast.error('Failed to upload file')
        return
      }

      const promptParts = [`Transform into ${selectedStyleLabel} style.`]
      if (additionalPrompt.trim()) {
        promptParts.push(additionalPrompt.trim())
      }

      const result = await featureGeneration.mutateAsync({
        featureType: 'style_transfer',
        inputImages: [uploadResult.filename],
        prompt: promptParts.join(' '),
        params: { style: selectedStyle },
      })

      if (result) {
        const newResult: StylistResult = {
          id: result.id || `stylist_${Date.now()}`,
          originalPreview: sourcePreview || '',
          resultUrl: result.url || result.src || '',
          style: selectedStyleLabel,
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Style transfer complete!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Style transfer failed'
      toast.error(message)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel */}
      <div className="w-[340px] border-r border-white/[0.06] bg-black/20 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 border border-[#c8ff00]/20 flex items-center justify-center">
                <Palette className="h-4 w-4 text-[#c8ff00]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">AI Stylist</h2>
                <p className="text-[11px] text-white/40">Transform styles with AI</p>
              </div>
            </div>

            {/* Source Upload */}
            <Section title="Source Image" defaultOpen={true}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                  fileDragActive
                    ? 'border-[#c8ff00] bg-[#c8ff00]/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
                onClick={() => fileInputRef.current?.click()}
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
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setFileDragActive(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    setSourceFile(file)
                    const r = new FileReader()
                    r.onload = (ev) =>
                      setSourcePreview(ev.target?.result as string)
                    r.readAsDataURL(file)
                  }
                }}
              >
                {sourcePreview ? (
                  <div className="relative">
                    <img
                      src={sourcePreview}
                      alt="Source preview"
                      className="max-h-40 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-7 w-7 mx-auto mb-2 text-white/30" />
                    <p className="text-sm text-white/50">Upload source image</p>
                    <p className="text-[11px] text-white/30 mt-1">
                      Drop an image or click to browse
                    </p>
                  </>
                )}
              </div>
            </Section>

            {/* Style Categories */}
            {STYLE_CATEGORIES.map((category) => (
              <Section
                key={category.id}
                title={category.label}
                defaultOpen={category.id === 'fashion'}
              >
                <div className="grid grid-cols-3 gap-2">
                  {category.styles.map((s) => (
                    <button
                      key={s.id}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden group/style transition-all ${
                        selectedStyle === s.id
                          ? 'ring-2 ring-[#c8ff00] shadow-[0_0_12px_#c8ff0033]'
                          : 'ring-1 ring-white/[0.06] hover:ring-white/20'
                      }`}
                      onClick={() => setSelectedStyle(s.id)}
                    >
                      <Image
                        src={s.image}
                        alt={s.label}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium text-white/90 truncate">
                        {s.label}
                      </span>
                      {selectedStyle === s.id && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#c8ff00] flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Section>
            ))}

            {/* Additional Prompt */}
            <Section title="Additional Guidance" defaultOpen={false}>
              <Textarea
                placeholder="Optional: Describe specific style details..."
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                className="min-h-[80px] resize-none bg-white/[0.03] border-white/[0.06] text-sm placeholder:text-white/25"
              />
            </Section>
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/[0.06]">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={
              !sourceFile || featureGeneration.isPending || uploader.isUploading
            }
          >
            {featureGeneration.isPending || uploader.isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {uploader.isUploading ? 'Uploading...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Apply Style
              </>
            )}
          </Button>
          <p className="text-[11px] text-white/30 text-center mt-2">
            Selected: {selectedStyleLabel}
          </p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            {results.length > 0 ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Results</h2>
                  <span className="text-xs text-white/40">
                    {results.length} generation{results.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#c8ff00]">
                        {result.style}
                      </span>
                      {result.resultUrl && (
                        <a href={result.resultUrl} download>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-white/50 hover:text-white"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Original */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider">
                          Original
                        </p>
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                          {result.originalPreview ? (
                            <img
                              src={result.originalPreview}
                              alt="Original"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-white/20" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Styled */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider">
                          Styled
                        </p>
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                          {result.resultUrl ? (
                            <img
                              src={result.resultUrl}
                              alt="Styled result"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Palette className="h-8 w-8 text-white/20" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#c8ff00]/10 to-transparent border border-white/[0.06] flex items-center justify-center mb-5">
                  <Palette className="h-10 w-10 text-[#c8ff00]/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  AI Stylist
                </h3>
                <p className="text-sm text-white/40 max-w-sm mb-6">
                  Upload an image and choose a style to transform it. From fashion
                  looks to artistic styles and photography effects.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {STYLE_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 text-center"
                    >
                      <p className="text-xs font-medium text-white/70">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {cat.styles.length} styles
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
