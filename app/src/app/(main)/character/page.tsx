'use client'

import { motion } from 'framer-motion'
import { Plus, User, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MOCK_CHARACTERS = [
  {
    id: '1',
    name: 'Luna',
    avatar: 'https://picsum.photos/seed/char1/200/200',
    style: 'Anime',
    images: 24,
  },
  {
    id: '2',
    name: 'Marcus',
    avatar: 'https://picsum.photos/seed/char2/200/200',
    style: 'Realistic',
    images: 18,
  },
  {
    id: '3',
    name: 'Aria',
    avatar: 'https://picsum.photos/seed/char3/200/200',
    style: '3D',
    images: 12,
  },
]

export default function CharacterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            My <span className="text-neon neon-text">Characters</span>
          </h1>
          <p className="text-muted-foreground">
            Create and manage consistent AI characters for your projects
          </p>
        </div>
        <Button variant="neon" className="gap-2">
          <Plus className="h-4 w-4" />
          New Character
        </Button>
      </motion.div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Create New Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-dashed cursor-pointer hover:border-neon/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Create Character</h3>
              <p className="text-sm text-muted-foreground">
                Build a new AI character with consistent features
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Existing Characters */}
        {MOCK_CHARACTERS.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (index + 1) * 0.05 }}
          >
            <Card className="card-hover cursor-pointer overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">
                    {character.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {character.style}
                    </Badge>
                    <span className="text-white/70 text-sm">
                      {character.images} images
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate with {character.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
