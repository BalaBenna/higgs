'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Type,
  Image,
  Presentation,
  Plus,
  Sparkles,
  Clock,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TEMPLATES = [
  {
    id: 'infographics',
    title: 'Infographics',
    description: 'Create animated data visualizations',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'text-animation',
    title: 'Text Animation',
    description: 'Bring your text to life with motion',
    icon: Type,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'posters',
    title: 'Posters',
    description: 'Design eye-catching animated posters',
    icon: Image,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'presentation',
    title: 'Presentation',
    description: 'Create professional animated slides',
    icon: Presentation,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'scratch',
    title: 'From Scratch',
    description: 'Start with a blank canvas',
    icon: Plus,
    color: 'from-gray-500 to-gray-600',
  },
]

const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'Product Launch',
    thumbnail: 'https://picsum.photos/seed/proj1/400/225',
    type: 'Text Animation',
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Q4 Report',
    thumbnail: 'https://picsum.photos/seed/proj2/400/225',
    type: 'Infographics',
    updatedAt: '1 day ago',
  },
]

export default function VibeMotionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Badge variant="neon" className="mb-4">Beta</Badge>
        <h1 className="text-4xl font-bold mb-3">
          Create with{' '}
          <span className="text-neon neon-text">Vibe Motion</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into stunning motion graphics with AI-powered templates
        </p>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-6">Choose a Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TEMPLATES.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="card-hover cursor-pointer group overflow-hidden">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                  >
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        {MOCK_PROJECTS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_PROJECTS.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="card-hover cursor-pointer overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {project.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.updatedAt}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a template above to create your first Vibe Motion project
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
