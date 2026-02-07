'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  User,
  Sparkles,
  Upload,
  RefreshCw,
  X,
  Download,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/dialog'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

interface Character {
  id: string
  name: string
  style: string
  referenceImage: string | null
  generatedImages: string[]
  createdAt: Date
}

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

export default function CharacterPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  // Create form state
  const [name, setName] = useState('')
  const [style, setStyle] = useState('Realistic')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [generatePrompt, setGeneratePrompt] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const featureGeneration = useFeatureGeneration()
  const { upload } = useUpload()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      const reader = new FileReader()
      reader.onload = (ev) => setReferencePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCreateCharacter = () => {
    if (!name.trim()) {
      toast.error('Please enter a character name')
      return
    }

    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name,
      style,
      referenceImage: referencePreview,
      generatedImages: [],
      createdAt: new Date(),
    }

    setCharacters((prev) => [newCharacter, ...prev])
    setShowCreateDialog(false)
    setName('')
    setStyle('Realistic')
    setReferenceImage(null)
    setReferencePreview(null)
    toast.success(`Character "${newCharacter.name}" created!`)
  }

  const handleGenerateWithCharacter = async (character: Character) => {
    const prompt = generatePrompt.trim() || `A portrait of ${character.name} in ${character.style} style`

    try {
      const inputImages: string[] = []
      if (character.referenceImage) {
        // Upload reference image if it's a data URL
        if (character.referenceImage.startsWith('data:')) {
          const blob = await fetch(character.referenceImage).then((r) => r.blob())
          const file = new File([blob], 'reference.png', { type: 'image/png' })
          const uploadResult = await upload(file)
          if (uploadResult?.url) inputImages.push(uploadResult.url)
        } else {
          inputImages.push(character.referenceImage)
        }
      }

      const result = await featureGeneration.mutateAsync({
        featureType: 'soul_id_character',
        prompt: `${prompt}. Style: ${character.style}. Character name: ${character.name}.`,
        inputImages,
        params: { aspect_ratio: '1:1' },
      })

      if (result?.url) {
        setCharacters((prev) =>
          prev.map((c) =>
            c.id === character.id
              ? { ...c, generatedImages: [result.url, ...c.generatedImages] }
              : c
          )
        )
        toast.success('Character image generated!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      toast.error(message)
    }
  }

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id))
    if (selectedCharacter?.id === id) setSelectedCharacter(null)
    toast.success('Character deleted')
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        <Button variant="neon" className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          New Character
        </Button>
      </motion.div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="h-full border-dashed cursor-pointer hover:border-neon/50 transition-colors"
            onClick={() => setShowCreateDialog(true)}
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

        {/* Existing Characters */}
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (index + 1) * 0.05 }}
          >
            <Card className="card-hover cursor-pointer overflow-hidden">
              <div className="aspect-square relative" onClick={() => setSelectedCharacter(character)}>
                {character.referenceImage ? (
                  <img
                    src={character.generatedImages[0] || character.referenceImage}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
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
                      {character.generatedImages.length} images
                    </span>
                  </div>
                </div>
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-red-500/80 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCharacter(character.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-2">
                <Textarea
                  placeholder={`Describe a scene with ${character.name}...`}
                  value={selectedCharacter?.id === character.id ? generatePrompt : ''}
                  onChange={(e) => {
                    setSelectedCharacter(character)
                    setGeneratePrompt(e.target.value)
                  }}
                  className="min-h-[60px] resize-none text-sm"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={featureGeneration.isPending}
                  onClick={() => handleGenerateWithCharacter(character)}
                >
                  {featureGeneration.isPending && selectedCharacter?.id === character.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate with {character.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Generated Images Gallery for selected character */}
      {selectedCharacter && selectedCharacter.generatedImages.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-semibold mb-4">
            Generated Images - {selectedCharacter.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedCharacter.generatedImages.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={url} download>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Download className="h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Character Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Character Name</label>
              <Input
                placeholder="e.g., Luna, Marcus, Aria..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Image (Optional)</label>
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
                {referencePreview ? (
                  <div className="relative">
                    <img
                      src={referencePreview}
                      alt="Reference"
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        setReferenceImage(null)
                        setReferencePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload a reference face/character image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="neon"
              className="w-full gap-2"
              onClick={handleCreateCharacter}
              disabled={!name.trim()}
            >
              <Plus className="h-4 w-4" />
              Create Character
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
