'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Upload,
} from 'lucide-react'
import Masonry from 'react-masonry-css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GalleryCard } from '@/components/gallery/GalleryCard'

// Mock data
const FEATURED_CREATORS = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    followers: '12.5K',
    specialty: 'Portrait AI',
  },
  {
    id: '2',
    name: 'Marcus Webb',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    followers: '8.2K',
    specialty: 'Landscapes',
  },
  {
    id: '3',
    name: 'Luna Digital',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    followers: '25.1K',
    specialty: 'Anime',
  },
]

const CHALLENGES = [
  {
    id: '1',
    title: 'Neon Dreams',
    description: 'Create cyberpunk-inspired artwork',
    participants: 234,
    deadline: '3 days left',
    prize: '1000 credits',
  },
  {
    id: '2',
    title: 'Nature Awakens',
    description: 'Generate stunning nature scenes',
    participants: 567,
    deadline: '1 week left',
    prize: '500 credits',
  },
]

const MOCK_GALLERY = [
  { id: '1', type: 'image' as const, src: 'https://picsum.photos/seed/com1/400/500', title: 'Neon City', author: 'Sarah', likes: 234, model: 'Flux' },
  { id: '2', type: 'video' as const, src: 'https://picsum.photos/seed/com2/400/300', title: 'Ocean', author: 'Marcus', likes: 567, model: 'Kling' },
  { id: '3', type: 'image' as const, src: 'https://picsum.photos/seed/com3/400/600', title: 'Portrait', author: 'Luna', likes: 890, model: 'MJ' },
  { id: '4', type: 'image' as const, src: 'https://picsum.photos/seed/com4/400/400', title: 'Abstract', author: 'Alex', likes: 123, model: 'DALL-E' },
  { id: '5', type: 'image' as const, src: 'https://picsum.photos/seed/com5/400/350', title: 'Fantasy', author: 'Maya', likes: 456, model: 'SD' },
  { id: '6', type: 'video' as const, src: 'https://picsum.photos/seed/com6/400/500', title: 'Dance', author: 'Ray', likes: 789, model: 'Veo3' },
]

const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 2,
  640: 1,
}

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('feed')

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-neon neon-text">Community</span>
          </h1>
          <p className="text-muted-foreground">
            Connect with creators and share your AI artwork
          </p>
        </div>
        <Button variant="neon" className="gap-2">
          <Upload className="h-4 w-4" />
          Share Creation
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        className="flex gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators, artworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="feed" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="creators" className="gap-2">
            <Users className="h-4 w-4" />
            Creators
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Award className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Featured Creators Row */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Featured Creators</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {FEATURED_CREATORS.map((creator) => (
                  <Card key={creator.id} className="card-hover cursor-pointer min-w-[200px]">
                    <CardContent className="p-4 text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-3">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-medium">{creator.name}</h4>
                      <p className="text-sm text-muted-foreground">{creator.specialty}</p>
                      <Badge variant="secondary" className="mt-2">
                        {creator.followers} followers
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <h3 className="text-lg font-semibold mb-4">Latest Creations</h3>
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-grid-column"
            >
              {MOCK_GALLERY.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GalleryCard item={item} />
                </motion.div>
              ))}
            </Masonry>
          </motion.div>
        </TabsContent>

        <TabsContent value="creators">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Discover Creators</h3>
            <p className="text-sm text-muted-foreground">
              Browse and follow talented AI artists from around the world
            </p>
          </motion.div>
        </TabsContent>

        <TabsContent value="challenges">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHALLENGES.map((challenge) => (
                <Card key={challenge.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge variant="neon">{challenge.prize}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participants
                      </span>
                      <span>{challenge.deadline}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Join Challenge
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="discussions">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Join the Conversation</h3>
            <p className="text-sm text-muted-foreground">
              Discuss AI art, share tips, and connect with the community
            </p>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
