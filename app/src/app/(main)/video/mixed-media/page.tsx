'use client'

import { LayoutGrid } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function MixedMediaPage() {
  return (
    <FeaturePlaceholder
      icon={LayoutGrid}
      title="Mixed Media"
      description="Combine multiple media types - images, videos, and text - into stunning mixed media projects"
      features={[
        'Combine images and video clips',
        'Add text overlays and captions',
        'Multi-track timeline editing',
        'AI-powered scene transitions',
        'Export in multiple formats',
        'Real-time collaboration',
      ]}
    />
  )
}
