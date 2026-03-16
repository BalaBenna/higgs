'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Type,
  Image,
  Presentation,
  Plus,
  Sparkles,
  ArrowRight,
  Megaphone,
  Fingerprint,
  ShoppingBag,
  Timer,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PresetId } from '@/lib/remotion/types'
import { PRESET_LABELS } from '@/lib/remotion/types'
import { useVibeMotionProjects } from '@/hooks/use-vibe-motion'

const TEMPLATES: {
  id: PresetId
  title: string
  description: string
  icon: typeof BarChart3
  gradient: string
}[] = [
  {
    id: 'infographics',
    title: 'Infographics',
    description: 'Animate charts, data, and visual storytelling elements',
    icon: BarChart3,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'text-animation',
    title: 'Text Animation',
    description: 'Bring titles, captions, and typography to life',
    icon: Type,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'posters',
    title: 'Posters',
    description: 'Turn static posters into eye-catching motion visuals',
    icon: Image,
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'presentation',
    title: 'Presentation',
    description: 'Create smooth, engaging slides and motion decks',
    icon: Presentation,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'social-media-ad',
    title: 'Social Media Ad',
    description: 'Bold, attention-grabbing ads for social platforms',
    icon: Megaphone,
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'logo-animation',
    title: 'Logo Animation',
    description: 'Professional logo reveals and brand intros',
    icon: Fingerprint,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'product-showcase',
    title: 'Product Showcase',
    description: 'Highlight features with animated callouts',
    icon: ShoppingBag,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 'countdown',
    title: 'Countdown',
    description: 'Engaging countdown timers and launch sequences',
    icon: Timer,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'scratch',
    title: 'From Scratch',
    description: 'Start with a blank canvas and build any motion you want',
    icon: Plus,
    gradient: 'from-gray-500/20 to-gray-600/20',
  },
]

const PRESET_ICONS: Partial<Record<PresetId, typeof BarChart3>> = {
  infographics: BarChart3,
  'text-animation': Type,
  posters: Image,
  presentation: Presentation,
  'social-media-ad': Megaphone,
  'logo-animation': Fingerprint,
  'product-showcase': ShoppingBag,
  countdown: Timer,
  scratch: Plus,
}

interface VibeMotionLandingProps {
  onSelectTemplate: (id: PresetId) => void
  onLoadProject?: (project: {
    preset: PresetId
    prompt: string
    code: string
    model: string
    style?: string
    duration: number
    aspectRatio: string
  }) => void
}

export function VibeMotionLanding({ onSelectTemplate, onLoadProject }: VibeMotionLandingProps) {
  const { data: projects, isLoading: projectsLoading } = useVibeMotionProjects()

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge variant="neon" className="mb-4">
          Beta
        </Badge>
        <h1 className="text-4xl font-bold mb-3">
          Create with{' '}
          <span className="text-neon neon-text">Vibe Motion</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          How would you like to get started?
        </p>
      </motion.div>

      {/* Template Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card
              className="cursor-pointer group overflow-hidden bg-card/50 border-border/50 hover:border-neon/30 transition-all h-full"
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-5 flex flex-col h-full">
                {/* Preview area */}
                <div
                  className={`h-24 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform`}
                >
                  <template.icon className="h-8 w-8 text-foreground/60" />
                </div>
                {/* Title + arrow */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{template.title}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Your Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wider text-xs">
          Your Projects
        </h2>

        {projectsLoading ? (
          <Card className="p-12 text-center border-dashed">
            <RefreshCw className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </Card>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const PresetIcon = PRESET_ICONS[project.preset as PresetId] ?? Sparkles
              const date = project.updated_at || project.created_at
              const formattedDate = date
                ? new Date(date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : ''

              return (
                <Card
                  key={project.id}
                  className="cursor-pointer group overflow-hidden bg-card/50 border-border/50 hover:border-neon/30 transition-all"
                  onClick={() =>
                    onLoadProject?.({
                      preset: (project.preset || 'scratch') as PresetId,
                      prompt: project.prompt || '',
                      code: project.code || '',
                      model: project.model || 'gpt-4o',
                      style: project.style || undefined,
                      duration: project.duration || 10,
                      aspectRatio: project.aspect_ratio || '16:9',
                    })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <PresetIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {project.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {project.prompt
                            ? project.prompt.slice(0, 80) + (project.prompt.length > 80 ? '...' : '')
                            : 'No prompt'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {PRESET_LABELS[project.preset as PresetId] || project.preset}
                          </Badge>
                          {formattedDate && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                              <Clock className="h-3 w-3" />
                              {formattedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              No projects yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Choose a template above to create your first Vibe Motion project
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
