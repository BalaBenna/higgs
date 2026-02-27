'use client'

import { useState } from 'react'
import { Download, RefreshCw, FileVideo, Image, Film } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'

type ExportFormat = 'webm' | 'mp4' | 'gif'
type QualityLevel = 'low' | 'medium' | 'high'

interface ExportDialogProps {
  onExport: (format: ExportFormat, quality: QualityLevel, fps: number) => Promise<void>
  isExporting: boolean
  disabled?: boolean
}

const FORMAT_CONFIG: {
  id: ExportFormat
  label: string
  description: string
  icon: typeof FileVideo
}[] = [
  {
    id: 'webm',
    label: 'WebM',
    description: 'Fast browser recording, smaller file size',
    icon: FileVideo,
  },
  {
    id: 'mp4',
    label: 'MP4',
    description: 'Universal format, requires server processing',
    icon: Film,
  },
  {
    id: 'gif',
    label: 'GIF',
    description: 'Animated image, best for short loops',
    icon: Image,
  },
]

const QUALITY_CONFIG: {
  id: QualityLevel
  label: string
  bitrate: number
}[] = [
  { id: 'low', label: 'Low (1 Mbps)', bitrate: 1_000_000 },
  { id: 'medium', label: 'Medium (4 Mbps)', bitrate: 4_000_000 },
  { id: 'high', label: 'High (8 Mbps)', bitrate: 8_000_000 },
]

export function ExportDialog({ onExport, isExporting, disabled }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('webm')
  const [quality, setQuality] = useState<QualityLevel>('medium')
  const [fps, setFps] = useState(30)

  const handleExport = async () => {
    try {
      await onExport(format, quality, fps)
      setOpen(false)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting} className="gap-2">
          {isExporting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={(v: ExportFormat) => setFormat(v)}>
              {FORMAT_CONFIG.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    format === f.id ? 'border-neon/50 bg-neon/5' : 'hover:border-border/80'
                  }`}
                  onClick={() => setFormat(f.id)}
                >
                  <RadioGroupItem value={f.id} id={f.id} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <f.icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={f.id} className="font-medium cursor-pointer">
                        {f.label}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Quality Selection */}
          <div className="space-y-3">
            <Label>Quality</Label>
            <RadioGroup
              value={quality}
              onValueChange={(v: QualityLevel) => setQuality(v)}
              className="grid grid-cols-3 gap-2"
            >
              {QUALITY_CONFIG.map((q) => (
                <div
                  key={q.id}
                  className={`flex flex-col items-center rounded-lg border p-3 cursor-pointer transition-colors ${
                    quality === q.id ? 'border-neon/50 bg-neon/5' : 'hover:border-border/80'
                  }`}
                  onClick={() => setQuality(q.id)}
                >
                  <RadioGroupItem value={q.id} id={`quality-${q.id}`} className="sr-only" />
                  <Label htmlFor={`quality-${q.id}`} className="text-xs cursor-pointer">
                    {q.label.split(' ')[0]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* FPS Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Frame Rate</Label>
              <span className="text-sm text-muted-foreground">{fps} FPS</span>
            </div>
            <Slider
              value={[fps]}
              onValueChange={([v]) => setFps(v)}
              min={15}
              max={60}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15</span>
              <span>30</span>
              <span>45</span>
              <span>60</span>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
