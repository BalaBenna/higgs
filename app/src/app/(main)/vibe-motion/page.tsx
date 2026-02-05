'use client'

import { useState, Suspense } from 'react'
import { VibeMotionLanding } from '@/components/vibe-motion/VibeMotionLanding'
import { VibeMotionCreator } from '@/components/vibe-motion/VibeMotionCreator'
import type { PresetId } from '@/lib/remotion/types'

function VibeMotionContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<PresetId | null>(null)

  if (selectedTemplate) {
    return (
      <VibeMotionCreator
        preset={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    )
  }

  return <VibeMotionLanding onSelectTemplate={setSelectedTemplate} />
}

export default function VibeMotionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          Loading...
        </div>
      }
    >
      <VibeMotionContent />
    </Suspense>
  )
}
