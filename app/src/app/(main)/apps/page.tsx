'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Palette,
  Wand2,
  Video,
  Image,
  Sparkles,
  ExternalLink,
  Star,
  ArrowRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const APPS = [
  {
    id: 'ai-designer',
    title: 'AI Designer',
    description: 'Full-featured canvas editor with AI-powered design tools',
    icon: Palette,
    href: '/ai-designer',
    badge: 'Featured',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'image-gen',
    title: 'Image Generator',
    description: 'Generate stunning images with multiple AI models',
    icon: Image,
    href: '/image',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'video-gen',
    title: 'Video Generator',
    description: 'Create AI-powered videos from text or images',
    icon: Video,
    href: '/video',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'ai-enhance',
    title: 'AI Enhance',
    description: 'Upscale and enhance your images with AI',
    icon: Wand2,
    href: '/edit',
    color: 'from-green-500 to-emerald-500',
  },
]

const INTEGRATIONS = [
  {
    id: 'comfyui',
    title: 'ComfyUI',
    description: 'Connect to your local ComfyUI instance',
    status: 'Available',
  },
  {
    id: 'replicate',
    title: 'Replicate',
    description: 'Access thousands of AI models',
    status: 'Coming Soon',
  },
  {
    id: 'stability',
    title: 'Stability AI',
    description: 'Stable Diffusion and SDXL models',
    status: 'Available',
  },
]

export default function AppsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-neon neon-text">Apps</span> & Integrations
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our suite of AI-powered creative tools and integrations
        </p>
      </motion.div>

      {/* Featured Apps */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-6">Creative Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {APPS.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={app.href}>
                <Card className="card-hover cursor-pointer h-full group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <app.icon className="h-6 w-6 text-white" />
                      </div>
                      {app.badge && (
                        <Badge variant="neon">{app.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      {app.title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Designer Highlight */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-neon/10 via-neon/5 to-transparent border-neon/30 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <Badge variant="neon" className="mb-4">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
              <h3 className="text-2xl font-bold mb-2">AI Designer Canvas</h3>
              <p className="text-muted-foreground mb-4">
                Our powerful canvas editor combines traditional design tools with
                AI capabilities. Create, edit, and generate images right on the
                canvas with real-time AI assistance.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">Excalidraw Integration</Badge>
                <Badge variant="secondary">AI Chat</Badge>
                <Badge variant="secondary">Image Generation</Badge>
                <Badge variant="secondary">Video Generation</Badge>
              </div>
              <Link href="/ai-designer">
                <Button variant="neon" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Open AI Designer
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="w-full md:w-1/3">
              <div className="aspect-video rounded-lg bg-card border border-border overflow-hidden">
                <img
                  src="https://picsum.photos/seed/canvas/400/225"
                  alt="AI Designer Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-6">API Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{integration.title}</CardTitle>
                    <Badge
                      variant={
                        integration.status === 'Available' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{integration.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
