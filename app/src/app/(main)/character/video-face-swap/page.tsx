'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Upload,
  RefreshCw,
  Video,
  X,
  ArrowRight,
  Play,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useVideoGeneration } from '@/hooks/use-generation'
import { useUpload } from '@/hooks/use-upload'

interface GeneratedVideoData {
  id: string
  url: string
  prompt: string
}

export default function VideoFaceSwapPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [results, setResults] = useState<GeneratedVideoData[]>([])
  const videoInputRef = useRef<HTMLInputElement>(null!)

  const faceUpload = useUpload()
  const videoGeneration = useVideoGeneration()

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const clearVideo = () => {
    setVideoFile(null)
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoPreview(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!faceUpload.preview || !videoFile) {
      toast.error('Please upload both a face photo and a target video')
      return
    }

    try {
      const result = await videoGeneration.mutateAsync({
        model: 'kling-2.6',
        prompt: 'Face swap on video, preserve expressions and lighting',
        sourceImage: videoFile,
      })

      if (result) {
        const newResult: GeneratedVideoData = {
          id: result.id || `vfs_${Date.now()}`,
          url: result.url || '',
          prompt: 'Video face swap result',
        }
        setResults((prev) => [newResult, ...prev])
        toast.success('Video face swap completed!')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Video face swap failed'
      toast.error(message)
    }
  }

  const canGenerate =
    !!faceUpload.filename && !!videoFile && !videoGeneration.isPending

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Video className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-semibold">Video Face Swap</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Swap faces in videos with frame-by-frame AI processing
              </p>
            </motion.div>

            {/* Face Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Face Photo</label>
              <input
                ref={faceUpload.fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={faceUpload.handleFileSelect}
              />
              <div
                className="relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors min-h-[140px] flex items-center justify-center"
                onClick={faceUpload.openFilePicker}
              >
                {faceUpload.isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-neon" />
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  </div>
                ) : faceUpload.preview ? (
                  <div className="relative w-full">
                    <img
                      src={faceUpload.preview}
                      alt="Face photo"
                      className="max-h-28 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        faceUpload.clear()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload the face photo to use
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-neon" />
              </div>
            </div>

            {/* Target Video Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Video</label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
              <div
                className="relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-neon/50 transition-colors min-h-[140px] flex items-center justify-center"
                onClick={() => videoInputRef.current?.click()}
              >
                {videoPreview ? (
                  <div className="relative w-full">
                    <video
                      src={videoPreview}
                      className="max-h-28 mx-auto rounded-lg object-contain"
                      muted
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearVideo()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Video className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Upload the target video
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      MP4, MOV, AVI up to 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={faceUpload.filename ? 'new' : 'secondary'}>
                {faceUpload.filename ? 'Face Ready' : 'Face Needed'}
              </Badge>
              <Badge variant={videoFile ? 'new' : 'secondary'}>
                {videoFile ? 'Video Ready' : 'Video Needed'}
              </Badge>
            </div>
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
            {videoGeneration.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing Video...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ~3-10 minutes processing time
          </p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 bg-background">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Video Results</h2>
                <p className="text-sm text-muted-foreground">
                  Your video face swap results will appear here
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                View History
              </Button>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative aspect-video">
                      {video.url ? (
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          loop
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="text-sm line-clamp-1">{video.prompt}</p>
                      {video.url && (
                        <a href={video.url} download>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload a face photo and target video, then click Generate
                  to swap faces in the video
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
