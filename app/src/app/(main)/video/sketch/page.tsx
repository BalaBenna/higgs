'use client'

import { PenTool } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function SketchToVideoPage() {
  return (
    <FeaturePlaceholder
      icon={PenTool}
      title="Sketch to Video"
      description="Convert rough sketches and storyboards into polished video content"
      features={[
        'Upload sketch images',
        'Automatic scene detection',
        'Style-consistent generation',
        'Motion path definition',
        'Camera movement controls',
        'Batch processing',
      ]}
    />
  )
}
