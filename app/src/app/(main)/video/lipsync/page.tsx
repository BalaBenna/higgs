'use client'

import { Mic } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function LipsyncPage() {
  return (
    <FeaturePlaceholder
      icon={Mic}
      title="Lipsync Studio"
      description="Create perfectly synchronized talking head videos with AI-powered lip sync technology"
      features={[
        'Upload audio or record voice',
        'Multiple avatar styles',
        'Emotion and expression control',
        'Multiple language support',
        'Background customization',
        'Real-time preview',
      ]}
    />
  )
}
