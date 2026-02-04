'use client'

import { Repeat } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function CharacterSwapPage() {
  return (
    <FeaturePlaceholder
      icon={Repeat}
      title="Character Swap"
      description="Replace entire characters in images while maintaining scene consistency"
      features={[
        'Full body replacement',
        'Pose matching',
        'Clothing adaptation',
        'Scene integration',
        'Style consistency',
        'Multiple character swap',
      ]}
    />
  )
}
