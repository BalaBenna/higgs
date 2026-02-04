'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Play, Download, MoreHorizontal, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  src: string
  title: string
  author: string
  likes: number
  model: string
}

interface GalleryCardProps {
  item: GalleryItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-card border border-border/50 mb-4 card-hover cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image/Video */}
      <div className="relative aspect-auto">
        <Image
          src={item.src}
          alt={item.title}
          width={400}
          height={400}
          className="w-full h-auto object-cover"
        />

        {/* Video indicator */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent',
            'flex flex-col justify-end p-4'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Top Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Info */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm truncate">
              {item.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-white/80 text-xs">{item.author}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 gap-1.5 text-white/80 hover:text-white hover:bg-white/10',
                  isLiked && 'text-red-500 hover:text-red-500'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
              >
                <Heart
                  className={cn('h-4 w-4', isLiked && 'fill-red-500')}
                />
                <span className="text-xs">{item.likes + (isLiked ? 1 : 0)}</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Model Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-black/60 text-white/90 text-[10px]"
        >
          {item.model}
        </Badge>
      </div>
    </motion.div>
  )
}
