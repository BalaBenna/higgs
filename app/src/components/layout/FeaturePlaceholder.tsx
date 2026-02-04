'use client'

import { motion } from 'framer-motion'
import { type LucideIcon, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface FeaturePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
  features?: string[]
  comingSoon?: boolean
}

export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  features = [],
  comingSoon = true,
}: FeaturePlaceholderProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neon/10">
            <Icon className="h-7 w-7 text-neon" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">
          {title.split(' ').map((word, i, arr) =>
            i === arr.length - 1 ? (
              <span key={i} className="text-neon neon-text">
                {' '}
                {word}
              </span>
            ) : (
              <span key={i}>{word}</span>
            )
          )}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </motion.div>

      {comingSoon && (
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-neon/10 to-neon/5 border-neon/30">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-neon" />
              <Badge variant="new" className="mb-4">
                Coming Soon
              </Badge>
              <h2 className="text-2xl font-bold mb-2">Under Development</h2>
              <p className="text-muted-foreground mb-6">
                This feature is currently being built. Join the waitlist to be notified
                when it launches.
              </p>
              <Button variant="neon">Join Waitlist</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {features.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Planned Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="h-full opacity-70">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{feature}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
