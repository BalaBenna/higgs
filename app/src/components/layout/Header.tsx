'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Folder,
  Crown,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavDropdownTrigger } from '@/components/layout/NavDropdown'
import { NAVIGATION_MENUS, TABS_WITH_DROPDOWN } from '@/data/navigation-menus'

const NAVIGATION_TABS = [
  { id: 'explore', label: 'Explore', path: '/explore' },
  { id: 'image', label: 'Image', path: '/image', hasDropdown: true },
  { id: 'video', label: 'Video', path: '/video', hasDropdown: true },
  { id: 'edit', label: 'Edit', path: '/edit', hasDropdown: true },
  { id: 'character', label: 'Character', path: '/character', hasDropdown: true },
  { id: 'inpaint', label: 'Inpaint', path: '/inpaint' },
  { id: 'vibe-motion', label: 'Vibe Motion', path: '/vibe-motion', badge: 'Beta' },
  { id: 'cinema-studio', label: 'Cinema Studio', path: '/cinema-studio' },
  { id: 'motion-control', label: 'Motion Control', path: '/motion-control' },
  { id: 'ai-influencer', label: 'AI Influencer', path: '/ai-influencer' },
  { id: 'apps', label: 'Apps', path: '/apps' },
  { id: 'community', label: 'Community', path: '/community' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold">Higgs</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {NAVIGATION_TABS.map((tab) => {
              const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
              const hasDropdown = tab.hasDropdown && TABS_WITH_DROPDOWN.includes(tab.id)
              const menu = hasDropdown ? NAVIGATION_MENUS[tab.id] : null

              const tabContent = (
                <Link href={tab.path}>
                  <motion.div
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      'hover:text-foreground hover:bg-accent/50',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab.label}
                      {hasDropdown && (
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      )}
                      {tab.badge && (
                        <Badge variant="neon" className="text-[10px] px-1.5 py-0">
                          {tab.badge}
                        </Badge>
                      )}
                    </span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon"
                        layoutId="activeTab"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{
                          boxShadow: '0 0 8px #c8ff00',
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              )

              if (hasDropdown && menu) {
                return (
                  <NavDropdownTrigger
                    key={tab.id}
                    menu={menu}
                    tabId={tab.id}
                    isActive={isActive}
                  >
                    {tabContent}
                  </NavDropdownTrigger>
                )
              }

              return <div key={tab.id}>{tabContent}</div>
            })}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Pricing Button */}
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Crown className="h-4 w-4 text-neon" />
            <span className="hidden sm:inline">Pricing</span>
          </Button>

          {/* Asset Library Button */}
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Folder className="h-4 w-4" />
            <span className="hidden sm:inline">Asset Library</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-muted text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Folder className="mr-2 h-4 w-4" />
                My Projects
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
