'use client'

import { motion } from 'framer-motion'
import { Upload, Brush, Eraser, Sparkles, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

export default function InpaintPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Tools */}
      <div className="w-72 border-r border-border bg-card/50 p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">Inpainting Tools</h2>

          {/* Brush Tools */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 gap-2">
                <Brush className="h-4 w-4" />
                Brush
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Eraser className="h-4 w-4" />
                Eraser
              </Button>
            </div>

            {/* Brush Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Brush Size</label>
              <Slider defaultValue={[20]} min={1} max={100} step={1} />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Replacement Prompt</label>
              <Textarea
                placeholder="Describe what should replace the masked area..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button variant="neon" className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Inpaint
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">100%</span>
            <Button variant="ghost" size="icon">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-background p-8">
          <motion.div
            className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Upload an image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select an image to start inpainting
            </p>
            <Button variant="outline">Select Image</Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
