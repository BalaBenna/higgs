'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Upload,
  Wand2,
  Crop,
  Eraser,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Sun,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveHorizontal,
  MoveVertical,
  ZoomIn,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeatureGeneration } from '@/hooks/use-feature'
import { useUpload } from '@/hooks/use-upload'

type EditTool =
  | 'relight'
  | 'upscale'
  | 'enhance'
  | 'remove_objects'
  | 'background_replace'
  | 'smart_crop'

const EDIT_TABS: { id: EditTool; label: string; icon: React.ElementType }[] = [
  { id: 'relight', label: 'Relight', icon: Sun },
  { id: 'upscale', label: 'Upscale', icon: ZoomIn },
  { id: 'enhance', label: 'AI Enhance', icon: Wand2 },
  { id: 'remove_objects', label: 'Remove Objects', icon: Eraser },
  { id: 'background_replace', label: 'Background', icon: Layers },
  { id: 'smart_crop', label: 'Smart Crop', icon: Crop },
]

const LIGHT_DIRECTIONS = [
  { id: 'top', label: 'Top', icon: ArrowUp },
  { id: 'front', label: 'Front', icon: MoveVertical },
  { id: 'right', label: 'Right', icon: ArrowRight },
  { id: 'left', label: 'Left', icon: ArrowLeft },
  { id: 'back', label: 'Back', icon: MoveHorizontal },
  { id: 'bottom', label: 'Bottom', icon: ArrowDown },
]

const CROP_RATIOS = [
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '4:3', label: '4:3' },
  { id: '3:2', label: '3:2' },
  { id: '21:9', label: '21:9' },
]

interface EditResult {
  id: string
  src: string
  prompt: string
  tool: string
}

export default function EditPage() {
  const [activeTool, setActiveTool] = useState<EditTool>('relight')
  const [results, setResults] = useState<EditResult[]>([])

  // Relight state
  const [lightDirection, setLightDirection] = useState('front')
  const [lightIntensity, setLightIntensity] = useState(5)
  const [lightMode, setLightMode] = useState<'soft' | 'hard'>('soft')

  // Upscale state
  const [scaleFactor, setScaleFactor] = useState('2x')

  // Enhance state
  const [enhanceStrength, setEnhanceStrength] = useState(5)

  // Remove objects state
  const [removePrompt, setRemovePrompt] = useState('')

  // Background replace state
  const [bgPrompt, setBgPrompt] = useState('')

  // Smart crop state
  const [cropRatio, setCropRatio] = useState('1:1')

  const imageUpload = useUpload()
  const featureGeneration = useFeatureGeneration()

  const getParams = (): Record<string, string | number> => {
    switch (activeTool) {
      case 'relight':
        return {
          light_direction: lightDirection,
          intensity: lightIntensity,
          mode: lightMode,
        }
      case 'upscale':
        return { scale_factor: parseInt(scaleFactor) }
      case 'enhance':
        return { strength: enhanceStrength }
      case 'remove_objects':
        return {}
      case 'background_replace':
        return {}
      case 'smart_crop':
        return { aspect_ratio: cropRatio }
      default:
        return {}
    }
  }

  const getPrompt = (): string => {
    switch (activeTool) {
      case 'remove_objects':
        return removePrompt
      case 'background_replace':
        return bgPrompt
      default:
        return ''
    }
  }

  const handleGenerate = async () => {
    if (!imageUpload.filename) {
      toast.error('Please upload an image first')
      return
    }

    if (activeTool === 'remove_objects' && !removePrompt.trim()) {
      toast.error('Please describe what to remove')
      return
    }

    if (activeTool === 'background_replace' && !bgPrompt.trim()) {
      toast.error('Please describe the new background')
      return
    }

    try {
      const result = await featureGeneration.mutateAsync({
        featureType: activeTool,
        inputImages: [imageUpload.filename],
        prompt: getPrompt(),
        params: getParams(),
      })

      if (result) {
        const tab = EDIT_TABS.find((t) => t.id === activeTool)
        const newResult: EditResult = {
          id: result.id || `edit_${Date.now()}`,
          src: result.url || result.src || '',
          prompt: getPrompt() || `${tab?.label || activeTool} applied`,
          tool: tab?.label || activeTool,
        }
        setResults((prev) => [newResult, ...prev])
        toast.success(`${tab?.label} applied successfully!`)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Edit operation failed'
      toast.error(message)
    }
  }

  const needsPrompt =
    (activeTool === 'remove_objects' && !removePrompt.trim()) ||
    (activeTool === 'background_replace' && !bgPrompt.trim())

  const canGenerate =
    !!imageUpload.filename && !needsPrompt && !featureGeneration.isPending

  // Render tool-specific controls
  const renderToolControls = () => {
    switch (activeTool) {
      case 'relight':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Light Direction</label>
              <div className="grid grid-cols-3 gap-2">
                {LIGHT_DIRECTIONS.map((dir) => (
                  <Button
                    key={dir.id}
                    variant={lightDirection === dir.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={`gap-1 ${
                      lightDirection === dir.id ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => setLightDirection(dir.id)}
                  >
                    <dir.icon className="h-3 w-3" />
                    {dir.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Intensity</label>
                <Badge variant="secondary">{lightIntensity}</Badge>
              </div>
              <Slider
                value={[lightIntensity]}
                onValueChange={([v]) => setLightIntensity(v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={lightMode === 'soft' ? 'secondary' : 'outline'}
                  size="sm"
                  className={
                    lightMode === 'soft' ? 'border-neon/50 bg-neon/10' : ''
                  }
                  onClick={() => setLightMode('soft')}
                >
                  Soft
                </Button>
                <Button
                  variant={lightMode === 'hard' ? 'secondary' : 'outline'}
                  size="sm"
                  className={
                    lightMode === 'hard' ? 'border-neon/50 bg-neon/10' : ''
                  }
                  onClick={() => setLightMode('hard')}
                >
                  Hard
                </Button>
              </div>
            </div>
          </div>
        )

      case 'upscale':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scale Factor</label>
              <div className="grid grid-cols-2 gap-2">
                {['2x', '4x'].map((factor) => (
                  <Button
                    key={factor}
                    variant={scaleFactor === factor ? 'secondary' : 'outline'}
                    size="lg"
                    className={`text-lg font-bold ${
                      scaleFactor === factor ? 'border-neon/50 bg-neon/10' : ''
                    }`}
                    onClick={() => setScaleFactor(factor)}
                  >
                    {factor}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {scaleFactor === '2x'
                  ? 'Doubles the image resolution'
                  : 'Quadruples the image resolution'}
              </p>
            </div>
          </div>
        )

      case 'enhance':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enhancement Strength</label>
                <Badge variant="secondary">{enhanceStrength}</Badge>
              </div>
              <Slider
                value={[enhanceStrength]}
                onValueChange={([v]) => setEnhanceStrength(v)}
                min={1}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher values apply more aggressive enhancement
              </p>
            </div>
          </div>
        )

      case 'remove_objects':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What to Remove</label>
              <Textarea
                placeholder="Describe the object(s) to remove, e.g. 'the person on the left' or 'the car in the background'..."
                value={removePrompt}
                onChange={(e) => setRemovePrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )

      case 'background_replace':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Background</label>
              <Textarea
                placeholder="Describe the new background, e.g. 'a sunny beach at sunset' or 'a professional studio backdrop'..."
                value={bgPrompt}
                onChange={(e) => setBgPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        )

      case 'smart_crop':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {CROP_RATIOS.map((ratio) => (
                  <Button
                    key={ratio.id}
                    variant={cropRatio === ratio.id ? 'secondary' : 'outline'}
                    size="sm"
                    className={
                      cropRatio === ratio.id ? 'border-neon/50 bg-neon/10' : ''
                    }
                    onClick={() => setCropRatio(ratio.id)}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Upload state (no image uploaded yet)
  if (!imageUpload.preview) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-3">
              Image <span className="text-neon neon-text">Editor</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-powered editing tools to enhance and transform your images
            </p>
          </motion.div>

          <motion.div
            className="max-w-2xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              ref={imageUpload.fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={imageUpload.handleFileSelect}
            />
            <div
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors bg-card/50"
              onClick={imageUpload.openFilePicker}
            >
              {imageUpload.isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-12 w-12 animate-spin text-neon" />
                  <p className="text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Upload an image to edit</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to select a file
                  </p>
                  <Button variant="neon">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Tool preview cards */}
          <motion.div
            className="max-w-4xl w-full mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Available Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {EDIT_TABS.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-neon/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center">
                    <tool.icon className="h-5 w-5 text-neon" />
                  </div>
                  <span className="text-xs font-medium text-center">{tool.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Editor state (image uploaded)
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main Image Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                imageUpload.clear()
                setResults([])
              }}
            >
              <X className="h-3 w-3" />
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={imageUpload.openFilePicker}
            >
              <Upload className="h-3 w-3" />
              Replace Image
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
            <Badge variant="secondary">{results.length} edit(s)</Badge>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="flex gap-6 items-center">
            {/* Original */}
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary">Original</Badge>
              <motion.div
                className="rounded-xl overflow-hidden border border-border shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <img
                  src={imageUpload.preview}
                  alt="Original"
                  className="max-w-[450px] max-h-[450px] object-contain"
                />
              </motion.div>
            </div>

            {/* Result */}
            {results.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <Badge variant="new">{results[0].tool}</Badge>
                <motion.div
                  className="rounded-xl overflow-hidden border border-neon/30 shadow-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Image
                    src={results[0].src}
                    alt={results[0].prompt}
                    width={450}
                    height={450}
                    className="max-w-[450px] max-h-[450px] object-contain"
                    unoptimized
                  />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Results strip */}
        {results.length > 1 && (
          <div className="border-t border-border p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Edit History</h3>
              <Badge variant="secondary">{results.length}</Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="relative flex-shrink-0 rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    src={result.src}
                    alt={result.prompt}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover"
                    unoptimized
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-0 left-0 right-0 text-[8px] rounded-none text-center justify-center"
                  >
                    {result.tool}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Tool Controls */}
      <div className="w-80 border-l border-border bg-card/50 flex flex-col">
        <div className="p-3 border-b border-border">
          <Tabs
            value={activeTool}
            onValueChange={(v) => setActiveTool(v as EditTool)}
          >
            <TabsList className="w-full grid grid-cols-3 h-auto gap-1">
              {EDIT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 py-2 text-[10px] data-[state=active]:bg-neon/10 data-[state=active]:text-neon"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const tab = EDIT_TABS.find((t) => t.id === activeTool)
                const Icon = tab?.icon || ImageIcon
                return (
                  <>
                    <Icon className="h-5 w-5 text-neon" />
                    <h3 className="text-sm font-semibold">{tab?.label}</h3>
                  </>
                )
              })()}
            </div>
            {renderToolControls()}
          </div>
        </ScrollArea>

        {/* Generate Button */}
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="neon"
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {featureGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
