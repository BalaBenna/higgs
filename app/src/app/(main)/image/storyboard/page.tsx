'use client'

import { LayoutGrid } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function StoryboardPage() {
  return (
    <FeaturePlaceholder
      icon={LayoutGrid}
      title="Create Storyboard"
      description="Generate complete visual storyboards from scripts or descriptions"
      features={[
        'Script to storyboard conversion',
        'Consistent character design',
        'Shot composition suggestions',
        'Export to PDF or images',
        'Collaborative editing',
        'Camera angle presets',
      ]}
    />
  )
}
