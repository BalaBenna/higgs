'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  Wand2,
  Crop,
  Palette,
  Eraser,
  Layers,
  Type,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const EDIT_TOOLS = [
  {
    icon: Wand2,
    title: 'AI Enhance',
    description: 'Automatically improve image quality and details',
  },
  {
    icon: Eraser,
    title: 'Remove Objects',
    description: 'Erase unwanted elements from your images',
  },
  {
    icon: Palette,
    title: 'Color Correction',
    description: 'Adjust colors, brightness, and contrast',
  },
  {
    icon: Crop,
    title: 'Smart Crop',
    description: 'Intelligent cropping with aspect ratio presets',
  },
  {
    icon: Layers,
    title: 'Background Replace',
    description: 'Change or remove image backgrounds',
  },
  {
    icon: Type,
    title: 'Add Text',
    description: 'Add stylized text overlays to your images',
  },
]

export default function EditPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="text-center mb-12"
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

      {/* Upload Area */}
      <motion.div
        className="max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-neon/50 transition-colors bg-card/50">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Upload an image to edit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select a file
          </p>
          <Button variant="neon">
            <Sparkles className="h-4 w-4 mr-2" />
            Select Image
          </Button>
        </div>
      </motion.div>

      {/* Edit Tools Grid */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDIT_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="card-hover cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center mb-2">
                    <tool.icon className="h-5 w-5 text-neon" />
                  </div>
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
