'use client'

import { Pencil } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function DrawToVideoPage() {
  return (
    <FeaturePlaceholder
      icon={Pencil}
      title="Draw to Video"
      description="Transform your drawings and sketches into animated video sequences"
      features={[
        'Freehand drawing canvas',
        'Frame-by-frame animation',
        'AI motion interpolation',
        'Style transfer options',
        'Export as GIF or video',
        'Collaborative drawing',
      ]}
    />
  )
}
