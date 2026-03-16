'use client'

import { useState, Suspense } from 'react'
import { VibeMotionLanding } from '@/components/vibe-motion/VibeMotionLanding'
import { VibeMotionCreator } from '@/components/vibe-motion/VibeMotionCreator'
import type { PresetId } from '@/lib/remotion/types'

interface ProjectData {
  preset: PresetId
  prompt: string
  code: string
  model: string
  style?: string
  duration: number
  aspectRatio: string
}

function VibeMotionContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<PresetId | null>(null)
  const [loadedProject, setLoadedProject] = useState<ProjectData | null>(null)

  if (selectedTemplate) {
    return (
      <VibeMotionCreator
        preset={selectedTemplate}
        initialProject={loadedProject ?? undefined}
        onBack={() => {
          setSelectedTemplate(null)
          setLoadedProject(null)
        }}
      />
    )
  }

  return (
    <VibeMotionLanding
      onSelectTemplate={setSelectedTemplate}
      onLoadProject={(project) => {
        setLoadedProject(project)
        setSelectedTemplate(project.preset)
      }}
    />
  )
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
