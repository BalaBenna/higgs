'use client'

import { motion } from 'framer-motion'
import {
  Move,
  RotateCcw,
  Maximize,
  Camera,
  Target,
  Sparkles,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const MOTION_CONTROLS = [
  {
    icon: Move,
    title: 'Pan',
    description: 'Control horizontal and vertical movement',
  },
  {
    icon: RotateCcw,
    title: 'Rotate',
    description: 'Add rotation effects to your motion',
  },
  {
    icon: Maximize,
    title: 'Zoom',
    description: 'Control zoom in and out effects',
  },
  {
    icon: Camera,
    title: 'Camera Path',
    description: 'Define custom camera movement paths',
  },
  {
    icon: Target,
    title: 'Focus Point',
    description: 'Set the focal point of the animation',
  },
]

export default function MotionControlPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Controls */}
      <div className="w-80 border-r border-border bg-card/50 p-4 space-y-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">Motion Controls</h2>

          {/* Control Sliders */}
          <div className="space-y-6">
            {MOTION_CONTROLS.map((control, index) => (
              <motion.div
                key={control.title}
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <control.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{control.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {control.description}
                    </p>
                  </div>
                </div>
                <Slider defaultValue={[50]} min={0} max={100} step={1} />
              </motion.div>
            ))}
          </div>

          {/* Generate Button */}
          <Button variant="neon" className="w-full mt-6 gap-2">
            <Sparkles className="h-4 w-4" />
            Apply Motion
          </Button>
        </motion.div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <motion.div
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Upload an image or video</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add an image or video to apply motion controls
          </p>
          <Button variant="outline">Select File</Button>
        </motion.div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-72 border-l border-border bg-card/50 p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <Card className="aspect-video flex items-center justify-center">
            <CardContent className="text-center py-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Motion preview will appear here
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium">Timeline</h3>
            <div className="h-16 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground">
                No content loaded
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
