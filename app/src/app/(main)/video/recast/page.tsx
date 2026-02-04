'use client'

import { Clapperboard } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function RecastStudioPage() {
  return (
    <FeaturePlaceholder
      icon={Clapperboard}
      title="Recast Studio"
      description="Transform existing videos with new characters, styles, and settings"
      features={[
        'Character replacement',
        'Background swapping',
        'Style transformation',
        'Voice cloning support',
        'Scene recomposition',
        'Batch recasting',
      ]}
    />
  )
}
