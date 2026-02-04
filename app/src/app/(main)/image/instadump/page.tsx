'use client'

import { Camera } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function InstadumpPage() {
  return (
    <FeaturePlaceholder
      icon={Camera}
      title="Instadump"
      description="Create Instagram-ready photo dumps and carousels instantly"
      features={[
        'AI photo curation',
        'Consistent aesthetic filters',
        'Carousel layout templates',
        'Caption suggestions',
        'Hashtag recommendations',
        'Optimal posting times',
      ]}
    />
  )
}
