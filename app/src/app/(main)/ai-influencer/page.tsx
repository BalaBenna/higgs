'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useImageGeneration, useVideoGeneration } from '@/hooks/use-generation'

const CHARACTER_TYPES = [
  { id: 'realistic', name: 'Realistic', preview: 'https://picsum.photos/seed/type1/100/100' },
  { id: 'anime', name: 'Anime', preview: 'https://picsum.photos/seed/type2/100/100' },
  { id: '3d', name: '3D', preview: 'https://picsum.photos/seed/type3/100/100' },
  { id: 'cartoon', name: 'Cartoon', preview: 'https://picsum.photos/seed/type4/100/100' },
  { id: 'fantasy', name: 'Fantasy', preview: 'https://picsum.photos/seed/type5/100/100' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: 'https://picsum.photos/seed/type6/100/100' },
]

const GENDERS = ['Male', 'Female', 'Trans woman', 'Non-binary']
const ETHNICITIES = ['Caucasian', 'African', 'Asian', 'Latino', 'Middle Eastern', 'Mixed']
const AGES = ['Young Adult', 'Adult', 'Mature', 'Senior']
const SKIN_CONDITIONS = ['Clear', 'Freckles', 'Moles', 'Scars', 'Tattoos']
const EYE_TYPES = ['Almond', 'Round', 'Hooded', 'Monolid', 'Downturned', 'Upturned']
const EYE_SECRETS = ['Normal', 'Heterochromia', 'Glowing', 'Cat-like', 'Spiral']
const MOUTH_TYPES = ['Full', 'Thin', 'Heart-shaped', 'Wide', 'Small']

const SKIN_COLORS = [
  '#fce4d6', '#f5d5c8', '#e8c4b8', '#d4a574', '#c68642',
  '#8d5524', '#6b4423', '#4a3728', '#362a23', '#2d221c',
]

const EYE_COLORS = [
  '#634e34', '#2e536f', '#3d671d', '#497665', '#8b5a2b',
  '#91c3dc', '#808080', '#000000', '#9370db', '#ff4500',
]

const MOTION_PRESETS = [
  { id: 'dance', name: 'Dance', preview: '🎵' },
  { id: 'walk', name: 'Walking', preview: '🚶' },
  { id: 'talk', name: 'Talking', preview: '💬' },
  { id: 'smile', name: 'Smile', preview: '😊' },
  { id: 'wave', name: 'Wave', preview: '👋' },
  { id: 'pose', name: 'Pose', preview: '📸' },
]

export default function AIInfluencerPage() {
  const [activeTab, setActiveTab] = useState('create')
  
  // Character attributes
  const [characterType, setCharacterType] = useState('realistic')
  const [gender, setGender] = useState('Female')
  const [ethnicity, setEthnicity] = useState('Caucasian')
  const [skinColor, setSkinColor] = useState('#f5d5c8')
  const [eyeColor, setEyeColor] = useState('#634e34')
  const [age, setAge] = useState('Adult')
  const [expandedSections, setExpandedSections] = useState<string[]>(['character-type', 'gender'])
  
  // Additional attributes
  const [skinConditions, setSkinConditions] = useState<string[]>([])
  const [eyeType, setEyeType] = useState('')
  const [eyeSecrets, setEyeSecrets] = useState('')
  const [mouthType, setMouthType] = useState('')
  const [faceShape, setFaceShape] = useState(50)
  const [jawDefinition, setJawDefinition] = useState(50)
  const [cheekbones, setCheekbones] = useState(50)
  
  // Generation states
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImageFile, setGeneratedImageFile] = useState<File | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  // Animation states
  const [motionVideoFile, setMotionVideoFile] = useState<File | null>(null)
  const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null)
  const [selectedMotion, setSelectedMotion] = useState('')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generatedVideos, setGeneratedVideos] = useState<{url: string, prompt: string}[]>([])
  
  // Refs
  const motionVideoRef = useRef<HTMLInputElement>(null!)
  
  const imageGeneration = useImageGeneration()
  const videoGeneration = useVideoGeneration()

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

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
      parts.push(`a ${age.toLowerCase()} ${ethnicity.toLowerCase()} ${gender.toLowerCase()} woman`)
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
      console.log('Generating AI influencer with prompt:', prompt)

      const result = await imageGeneration.mutateAsync({
        model: 'flux-2-pro-replicate',
        prompt: prompt,
        aspectRatio: '1:1',
        numImages: 1,
      })

      if (result?.images?.length > 0) {
        const imageUrl = result.images[0].url || result.images[0].src || null
        if (imageUrl) {
          setGeneratedImage(imageUrl)
          
          // Convert URL to File for video generation
          try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const file = new File([blob], 'character.jpg', { type: 'image/jpeg' })
            setGeneratedImageFile(file)
          } catch (e) {
            console.error('Failed to convert image to file:', e)
          }
          
          toast.success('AI Influencer created!')
          // Auto-switch to animate tab
          setActiveTab('animate')
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
    if (motionVideoRef.current) {
      motionVideoRef.current.value = ''
    }
  }

  const handleAnimateCharacter = async () => {
    if (!generatedImageFile) {
      toast.error('Please generate a character first')
      return
    }

    if (!motionVideoFile) {
      toast.error('Please upload a motion reference video')
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
      
      const result = await videoGeneration.mutateAsync({
        model: 'kling-v2.6-motion-control-replicate',
        prompt: prompt,
        sourceImage: generatedImageFile,
        videoFile: motionVideoFile,
      })

      if (result?.url) {
        setGeneratedVideos((prev) => [{ url: result.url, prompt }, ...prev])
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

  const canAnimate = generatedImageFile && motionVideoFile && !isGeneratingVideo

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Preview */}
      <div className="w-1/2 border-r border-border bg-gradient-to-br from-background to-card/50 flex flex-col p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="create" className="gap-2">
              <User className="h-4 w-4" />
              Create Character
            </TabsTrigger>
            <TabsTrigger value="animate" className="gap-2" disabled={!generatedImage}>
              <Video className="h-4 w-4" />
              Animate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="flex-1 flex flex-col items-center justify-center m-0">
            <motion.div
              className="relative w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Character Preview */}
              <div className="w-full aspect-square rounded-2xl bg-card border border-border overflow-hidden shadow-2xl">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated Character"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <User className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-neon" />
                  </div>
                )}
              </div>

              {/* Character Info */}
              <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Your AI Influencer</h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="secondary">{gender}</Badge>
                  <Badge variant="secondary">{ethnicity}</Badge>
                  <Badge variant="secondary">{age}</Badge>
                  <Badge variant="neon">{CHARACTER_TYPES.find(t => t.id === characterType)?.name}</Badge>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                variant="neon" 
                size="lg" 
                className="w-full mt-6 gap-2"
                onClick={handleGenerateCharacter}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Character
                  </>
                )}
              </Button>

              {generatedImage && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full mt-2 gap-2"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = generatedImage
                    link.download = `ai-influencer-${Date.now()}.jpg`
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </Button>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="animate" className="flex-1 flex flex-col m-0 overflow-y-auto">
            <div className="space-y-4">
              {/* Character Image Preview */}
              <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  {generatedImage && (
                    <img src={generatedImage} alt="Character" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Character Ready</h3>
                  <p className="text-sm text-muted-foreground">Now add motion to bring your influencer to life</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('create')}>
                  Edit
                </Button>
              </div>

              {/* Motion Reference Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Motion Reference Video</label>
                <input
                  ref={motionVideoRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={handleMotionVideoSelect}
                />
                <div
                  className="relative border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-neon/50 transition-colors"
                  onClick={() => motionVideoRef.current?.click()}
                >
                  {motionVideoPreview ? (
                    <div className="relative">
                      <video
                        src={motionVideoPreview}
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearMotionVideo()
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload motion reference video
                      </p>
                      <p className="text-xs text-muted-foreground">
                        The character will copy this motion
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Motion Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Or choose a motion preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {MOTION_PRESETS.map((motion) => (
                    <Button
                      key={motion.id}
                      variant={selectedMotion === motion.id ? 'secondary' : 'outline'}
                      className={`gap-2 ${selectedMotion === motion.id ? 'border-neon/50 bg-neon/10' : ''}`}
                      onClick={() => setSelectedMotion(motion.id)}
                    >
                      <span>{motion.preview}</span>
                      {motion.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Animate Button */}
              <Button 
                variant="neon" 
                size="lg" 
                className="w-full gap-2"
                onClick={handleAnimateCharacter}
                disabled={!canAnimate}
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Animating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Animate Character
                  </>
                )}
              </Button>

              {/* Generated Videos */}
              {generatedVideos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="font-semibold">Generated Videos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedVideos.map((video, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden bg-card border">
                        <video
                          src={video.url}
                          className="w-full aspect-video object-cover"
                          controls
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute bottom-2 right-2 gap-1"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = video.url
                            link.download = `ai-influencer-video-${Date.now()}.mp4`
                            link.click()
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Attribute Panels */}
      <div className="w-1/2 bg-card/50">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold mb-2">
                AI <span className="text-neon neon-text">Influencer</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Create and animate your AI character
              </p>
            </motion.div>

            {/* Character Type Section */}
            <AttributeSection
              title="Character Type"
              icon={User}
              isExpanded={expandedSections.includes('character-type')}
              onToggle={() => toggleSection('character-type')}
            >
              <div className="grid grid-cols-3 gap-2">
                {CHARACTER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                      characterType === type.id
                        ? 'border-neon'
                        : 'border-transparent hover:border-border'
                    }`}
                    onClick={() => setCharacterType(type.id)}
                  >
                    <img
                      src={type.preview}
                      alt={type.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-white text-xs font-medium">
                        {type.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </AttributeSection>

            {/* Gender Section */}
            <AttributeSection
              title="Gender"
              icon={User}
              isExpanded={expandedSections.includes('gender')}
              onToggle={() => toggleSection('gender')}
            >
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <Button
                    key={g}
                    variant={gender === g ? 'secondary' : 'outline'}
                    size="sm"
                    className={gender === g ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </AttributeSection>

            {/* Ethnicity Section */}
            <AttributeSection
              title="Ethnicity / origin"
              icon={User}
              isExpanded={expandedSections.includes('ethnicity')}
              onToggle={() => toggleSection('ethnicity')}
            >
              <Select value={ethnicity} onValueChange={setEthnicity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETHNICITIES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AttributeSection>

            {/* Skin Color Section */}
            <AttributeSection
              title="Skin Color"
              icon={Palette}
              isExpanded={expandedSections.includes('skin')}
              onToggle={() => toggleSection('skin')}
            >
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      skinColor === color
                        ? 'border-neon scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSkinColor(color)}
                  />
                ))}
              </div>
            </AttributeSection>

            {/* Eye Color Section */}
            <AttributeSection
              title="Eye Color"
              icon={Eye}
              isExpanded={expandedSections.includes('eyes')}
              onToggle={() => toggleSection('eyes')}
            >
              <div className="flex flex-wrap gap-2">
                {EYE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      eyeColor === color
                        ? 'border-neon scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEyeColor(color)}
                  />
                ))}
              </div>
            </AttributeSection>

            {/* Age Section */}
            <AttributeSection
              title="Age"
              icon={User}
              isExpanded={expandedSections.includes('age')}
              onToggle={() => toggleSection('age')}
            >
              <div className="grid grid-cols-2 gap-2">
                {AGES.map((a) => (
                  <Button
                    key={a}
                    variant={age === a ? 'secondary' : 'outline'}
                    size="sm"
                    className={age === a ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setAge(a)}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </AttributeSection>

            {/* Skin Conditions Section */}
            <AttributeSection
              title="Skin Conditions"
              icon={User}
              isExpanded={expandedSections.includes('skin-conditions')}
              onToggle={() => toggleSection('skin-conditions')}
            >
              <div className="flex flex-wrap gap-2">
                {SKIN_CONDITIONS.map((condition) => (
                  <Badge
                    key={condition}
                    variant={skinConditions.includes(condition) ? 'default' : 'outline'}
                    className={`cursor-pointer hover:bg-accent ${
                      skinConditions.includes(condition) ? 'bg-neon text-black' : ''
                    }`}
                    onClick={() => toggleSkinCondition(condition)}
                  >
                    {condition}
                  </Badge>
                ))}
              </div>
            </AttributeSection>

            {/* Eye Type Section */}
            <AttributeSection
              title="Eyes - Type"
              icon={Eye}
              isExpanded={expandedSections.includes('eye-type')}
              onToggle={() => toggleSection('eye-type')}
            >
              <div className="grid grid-cols-3 gap-2">
                {EYE_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={eyeType === type ? 'secondary' : 'outline'}
                    size="sm"
                    className={eyeType === type ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setEyeType(eyeType === type ? '' : type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </AttributeSection>

            {/* Eye Secrets Section */}
            <AttributeSection
              title="Eyes - Secrets"
              icon={Eye}
              isExpanded={expandedSections.includes('eye-secrets')}
              onToggle={() => toggleSection('eye-secrets')}
            >
              <div className="grid grid-cols-3 gap-2">
                {EYE_SECRETS.map((secret) => (
                  <Button
                    key={secret}
                    variant={eyeSecrets === secret ? 'secondary' : 'outline'}
                    size="sm"
                    className={eyeSecrets === secret ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setEyeSecrets(eyeSecrets === secret ? '' : secret)}
                  >
                    {secret}
                  </Button>
                ))}
              </div>
            </AttributeSection>

            {/* Mouth Section */}
            <AttributeSection
              title="Mouth & Teeth"
              icon={Smile}
              isExpanded={expandedSections.includes('mouth')}
              onToggle={() => toggleSection('mouth')}
            >
              <div className="grid grid-cols-3 gap-2">
                {MOUTH_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={mouthType === type ? 'secondary' : 'outline'}
                    size="sm"
                    className={mouthType === type ? 'border-neon/50 bg-neon/10' : ''}
                    onClick={() => setMouthType(mouthType === type ? '' : type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </AttributeSection>

            {/* Advanced Settings Section */}
            <AttributeSection
              title="Advanced Settings"
              icon={Settings2}
              isExpanded={expandedSections.includes('advanced')}
              onToggle={() => toggleSection('advanced')}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Face Shape</label>
                  <Slider 
                    value={[faceShape]} 
                    onValueChange={([v]) => setFaceShape(v)} 
                    min={0} 
                    max={100} 
                    step={1} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jaw Definition</label>
                  <Slider 
                    value={[jawDefinition]} 
                    onValueChange={([v]) => setJawDefinition(v)} 
                    min={0} 
                    max={100} 
                    step={1} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cheekbones</label>
                  <Slider 
                    value={[cheekbones]} 
                    onValueChange={([v]) => setCheekbones(v)} 
                    min={0} 
                    max={100} 
                    step={1} 
                  />
                </div>
              </div>
            </AttributeSection>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function AttributeSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CardContent className="pt-0 pb-4">{children}</CardContent>
        </motion.div>
      )}
    </Card>
  )
}
