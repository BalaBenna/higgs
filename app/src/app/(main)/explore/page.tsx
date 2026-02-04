'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp, Clock, Heart, Sparkles } from 'lucide-react'
import Masonry from 'react-masonry-css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GalleryCard } from '@/components/gallery/GalleryCard'

// Mock data for the gallery
const MOCK_GALLERY_ITEMS = [
  {
    id: '1',
    type: 'image' as const,
    src: 'https://picsum.photos/seed/1/400/600',
    title: 'Cyberpunk City',
    author: 'AIArtist',
    likes: 234,
    model: 'Flux Pro',
  },
  {
    id: '2',
    type: 'video' as const,
    src: 'https://picsum.photos/seed/2/400/300',
    title: 'Ocean Waves',
    author: 'NatureAI',
    likes: 567,
    model: 'Kling',
  },
  {
    id: '3',
    type: 'image' as const,
    src: 'https://picsum.photos/seed/3/400/500',
    title: 'Portrait Study',
    author: 'PortraitPro',
    likes: 123,
    model: 'Midjourney',
  },
  {
    id: '4',
    type: 'image' as const,
    src: 'https://picsum.photos/seed/4/400/400',
    title: 'Abstract Art',
    author: 'AbstractAI',
    likes: 456,
    model: 'DALL-E 3',
  },
  {
    id: '5',
    type: 'video' as const,
    src: 'https://picsum.photos/seed/5/400/550',
    title: 'Dance Motion',
    author: 'MotionMaster',
    likes: 789,
    model: 'Veo3',
  },
  {
    id: '6',
    type: 'image' as const,
    src: 'https://picsum.photos/seed/6/400/350',
    title: 'Fantasy Landscape',
    author: 'DreamScape',
    likes: 345,
    model: 'Stable Diffusion',
  },
  {
    id: '7',
    type: 'image' as const,
    src: 'https://picsum.photos/seed/7/400/450',
    title: 'Neon Dreams',
    author: 'NeonArtist',
    likes: 678,
    model: 'Flux Pro',
  },
  {
    id: '8',
    type: 'video' as const,
    src: 'https://picsum.photos/seed/8/400/600',
    title: 'City Timelapse',
    author: 'TimelapseAI',
    likes: 901,
    model: 'Hailuo',
  },
]

const FILTER_TYPES = ['All', 'Images', 'Videos']
const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'recent', label: 'Most Recent', icon: Clock },
  { value: 'popular', label: 'Most Liked', icon: Heart },
]

const breakpointColumns = {
  default: 5,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('trending')

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-3">
          Explore{' '}
          <span className="text-neon neon-text">AI Creations</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover stunning AI-generated images and videos from our creative community
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {FILTER_TYPES.map((type) => (
              <Button
                key={type}
                variant={activeFilter === type ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(type)}
                className={activeFilter === type ? 'bg-card' : ''}
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More Filters */}
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {MOCK_GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GalleryCard item={item} />
            </motion.div>
          ))}
        </Masonry>
      </motion.div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Load More
        </Button>
      </div>
    </div>
  )
}
