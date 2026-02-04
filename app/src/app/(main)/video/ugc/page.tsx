'use client'

import { Factory } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function UGCFactoryPage() {
  return (
    <FeaturePlaceholder
      icon={Factory}
      title="UGC Factory"
      description="Generate authentic user-generated content style videos at scale for your brand"
      features={[
        'AI-generated UGC avatars',
        'Script to video conversion',
        'Brand voice customization',
        'Multiple UGC styles',
        'Bulk content generation',
        'Platform optimization',
      ]}
    />
  )
}
