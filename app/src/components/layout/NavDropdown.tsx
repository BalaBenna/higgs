'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { NavigationMenu, BadgeType } from '@/data/navigation-menus'

interface NavDropdownProps {
  menu: NavigationMenu
  isOpen: boolean
  onClose: () => void
  tabId: string
}

function getBadgeVariant(badge: BadgeType): 'new' | 'top' | 'best' | 'neon' | 'default' {
  if (badge === 'new') return 'new'
  if (badge === 'top') return 'top'
  if (badge === 'best') return 'best'
  return 'neon'
}

function getBadgeLabel(badge: BadgeType): string {
  if (badge === 'new') return 'NEW'
  if (badge === 'top') return 'TOP'
  if (badge === 'best') return 'BEST'
  return ''
}

export function NavDropdown({ menu, isOpen, onClose, tabId }: NavDropdownProps) {
  const router = useRouter()

  const handleModelClick = useCallback((model: typeof menu.models[0]) => {
    if (model.isComingSoon) {
      toast.info(`${model.label} is coming soon!`)
      return
    }
    if (model.toolId) {
      const baseRoute = tabId === 'video' || tabId === 'edit' ? '/video' : '/image'
      router.push(`${baseRoute}?model=${model.id}`)
      onClose()
    }
  }, [tabId, router, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden min-w-[600px]">
            <div className="grid grid-cols-2 divide-x divide-border/30">
              {/* Features Column */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Features
                </h3>
                <div className="space-y-0.5">
                  {menu.features.map((feature) => (
                    <Link
                      key={feature.id}
                      href={feature.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg',
                        'hover:bg-accent/50 transition-colors group'
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                        <feature.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                        {feature.label}
                      </span>
                      {feature.badge && (
                        <Badge
                          variant={getBadgeVariant(feature.badge)}
                          className="text-[10px] px-1.5 py-0 ml-auto"
                        >
                          {getBadgeLabel(feature.badge)}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Models Column */}
              <div className="p-4 bg-muted/20">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Models
                </h3>
                <div className="space-y-0.5">
                  {menu.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelClick(model)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-lg text-left',
                        'hover:bg-accent/50 transition-colors group',
                        model.isComingSoon && 'opacity-60'
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                          {model.label}
                        </span>
                        {model.provider && (
                          <span className="text-xs text-muted-foreground">
                            {model.provider}
                          </span>
                        )}
                      </div>
                      {model.badge && (
                        <Badge
                          variant={getBadgeVariant(model.badge)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getBadgeLabel(model.badge)}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface NavDropdownTriggerProps {
  children: React.ReactNode
  menu: NavigationMenu
  tabId: string
  isActive: boolean
  className?: string
}

export function NavDropdownTrigger({
  children,
  menu,
  tabId,
  isActive,
  className,
}: NavDropdownTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    enterTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 150) // 150ms enter delay
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300) // 300ms leave delay
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <NavDropdown
        menu={menu}
        isOpen={isOpen}
        onClose={handleClose}
        tabId={tabId}
      />
    </div>
  )
}
