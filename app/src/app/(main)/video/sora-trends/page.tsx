'use client'

import { TrendingUp } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/layout/FeaturePlaceholder'

export default function SoraTrendsPage() {
  return (
    <FeaturePlaceholder
      icon={TrendingUp}
      title="Sora 2 Trends"
      description="Explore and create with the most popular Sora 2 video styles and trends"
      features={[
        'Trending style gallery',
        'One-click style application',
        'Community-curated collections',
        'Style mixing and blending',
        'Trend analytics dashboard',
        'Weekly style updates',
      ]}
    />
  )
}
