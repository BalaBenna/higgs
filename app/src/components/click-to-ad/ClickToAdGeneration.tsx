'use client'

import { motion } from 'framer-motion'
import {
  Video,
  Play,
  Download,
  RefreshCw,
  ArrowLeft,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GeneratedImage } from '@/components/generation/GeneratedImage'

interface VideoResult {
  id: string
  url: string
  prompt: string
  duration: string
  model: string
  format: string
}

interface ImageResult {
  id: string
  src: string
  prompt: string
}

interface ClickToAdGenerationProps {
  mode: 'video' | 'image'
  videoResults?: VideoResult[]
  imageResults?: ImageResult[]
  isGenerating: boolean
  onRegenerate: () => void
  onBack: () => void
  onNewAd: () => void
}

export function ClickToAdGeneration({
  mode,
  videoResults = [],
  imageResults = [],
  isGenerating,
  onRegenerate,
  onBack,
  onNewAd,
}: ClickToAdGenerationProps) {
  const hasResults = mode === 'video' ? videoResults.length > 0 : imageResults.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="back-button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Generated Ads</h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? 'Generating your ad...'
                : hasResults
                  ? `${mode === 'video' ? videoResults.length : imageResults.length} ad(s) generated`
                  : 'No ads generated yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            data-testid="regenerate-button"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button variant="neon" size="sm" onClick={onNewAd} data-testid="new-ad-button">
            <Plus className="h-4 w-4" />
            New Ad
          </Button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isGenerating && !hasResults && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <RefreshCw className="h-12 w-12 text-neon animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Generating your ad</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                This may take a few minutes. Your {mode === 'video' ? 'video' : 'image'} ad
                is being created...
              </p>
            </div>
          )}

          {mode === 'video' && videoResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {videoResults.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative aspect-[9/16] max-h-[400px]">
                    {video.url ? (
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={(e) => {
                          const el = e.target as HTMLVideoElement
                          el.pause()
                          el.currentTime = 0
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-neon flex items-center justify-center">
                        <Play className="h-6 w-6 text-black fill-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-black/70 text-white text-xs">{video.format}</Badge>
                    </div>
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm line-clamp-2">{video.prompt}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{video.model}</Badge>
                      {video.url && (
                        <a href={video.url} download>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {mode === 'image' && imageResults.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {imageResults.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GeneratedImage image={image} />
                </motion.div>
              ))}
            </div>
          )}

          {!isGenerating && !hasResults && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No ads yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Click Regenerate or start a new ad
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
