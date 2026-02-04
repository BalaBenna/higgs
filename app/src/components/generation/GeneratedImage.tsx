'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Download,
  Copy,
  Heart,
  RefreshCw,
  Maximize2,
  MoreHorizontal,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GeneratedImageProps {
  image: {
    id: string
    src: string
    prompt: string
  }
}

export function GeneratedImage({ image }: GeneratedImageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-card border border-border/50 card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        <Image
          src={image.src}
          alt={image.prompt}
          fill
          className="object-cover"
        />

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Top Actions */}
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  View Full Size
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto p-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
