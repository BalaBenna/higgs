'use client'

import { useState } from 'react'
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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

const ATTRIBUTE_SECTIONS = [
  {
    id: 'character-type',
    title: 'Character Type',
    icon: User,
  },
  {
    id: 'gender',
    title: 'Gender',
    icon: User,
  },
  {
    id: 'ethnicity',
    title: 'Ethnicity / Origin',
    icon: User,
  },
  {
    id: 'skin',
    title: 'Skin Color',
    icon: Palette,
  },
  {
    id: 'eyes',
    title: 'Eye Color',
    icon: Eye,
  },
  {
    id: 'skin-conditions',
    title: 'Skin Conditions',
    icon: User,
  },
  {
    id: 'age',
    title: 'Age',
    icon: User,
  },
  {
    id: 'eye-type',
    title: 'Eyes - Type',
    icon: Eye,
  },
  {
    id: 'eye-secrets',
    title: 'Eyes - Secrets',
    icon: Eye,
  },
  {
    id: 'mouth',
    title: 'Mouth & Teeth',
    icon: Smile,
  },
  {
    id: 'advanced',
    title: 'Advanced Settings',
    icon: Settings2,
  },
]

const SKIN_COLORS = [
  '#fce4d6', '#f5d5c8', '#e8c4b8', '#d4a574', '#c68642',
  '#8d5524', '#6b4423', '#4a3728', '#362a23', '#2d221c',
]

const EYE_COLORS = [
  '#634e34', '#2e536f', '#3d671d', '#497665', '#8b5a2b',
  '#91c3dc', '#808080', '#000000', '#9370db', '#ff4500',
]

export default function AIInfluencerPage() {
  const [characterType, setCharacterType] = useState('realistic')
  const [gender, setGender] = useState('Female')
  const [ethnicity, setEthnicity] = useState('Caucasian')
  const [skinColor, setSkinColor] = useState('#f5d5c8')
  const [eyeColor, setEyeColor] = useState('#634e34')
  const [age, setAge] = useState('Adult')
  const [expandedSections, setExpandedSections] = useState<string[]>(['character-type', 'gender'])

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Character Preview */}
      <div className="w-1/2 border-r border-border bg-gradient-to-br from-background to-card/50 flex flex-col items-center justify-center p-8">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Character Preview */}
          <div className="w-80 h-80 rounded-2xl bg-card border border-border overflow-hidden shadow-2xl">
            <img
              src={`https://picsum.photos/seed/${characterType}${gender}/400/400`}
              alt="Character Preview"
              className="w-full h-full object-cover"
            />
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
          <Button variant="neon" size="lg" className="w-full mt-6 gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Character
          </Button>
        </motion.div>
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
                Customize every aspect of your AI character
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
              title="Ethnicity / Origin"
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
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
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
                  <Button key={type} variant="outline" size="sm">
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
                  <Button key={secret} variant="outline" size="sm">
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
                  <Button key={type} variant="outline" size="sm">
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
                  <Slider defaultValue={[50]} min={0} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jaw Definition</label>
                  <Slider defaultValue={[50]} min={0} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cheekbones</label>
                  <Slider defaultValue={[50]} min={0} max={100} step={1} />
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
