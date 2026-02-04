'use client'

import { MousePointer } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function ClickToAdPage() {
  return (
    <FeaturePlaceholder
      icon={MousePointer}
      title="Click to Ad"
      description="Transform any product URL into engaging video advertisements instantly"
      features={[
        'Paste product URL to start',
        'AI extracts product info automatically',
        'Multiple ad format templates',
        'Platform-specific optimization',
        'A/B testing variations',
        'Performance analytics',
      ]}
    />
  )
}
