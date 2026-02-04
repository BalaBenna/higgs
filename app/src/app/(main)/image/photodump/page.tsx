'use client'

import { Camera } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function PhotodumpStudioPage() {
  return (
    <FeaturePlaceholder
      icon={Camera}
      title="Photodump Studio"
      description="Professional photo dump creation with AI-powered editing and curation"
      features={[
        'Bulk photo processing',
        'Style consistency tools',
        'Smart cropping',
        'Color grading presets',
        'Export in multiple sizes',
        'Social media optimization',
      ]}
    />
  )
}
