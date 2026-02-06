'use client'

import Link from 'next/link'
import { User, Mail, Calendar, ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not signed in</div>
      </div>
    )
  }

  const userName =
    user.user_metadata?.full_name || user.user_metadata?.name || ''
  const userEmail = user.email || ''
  const userAvatar =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
  const provider = user.app_metadata?.provider || ''
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : ''

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-border/40 bg-card p-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-muted text-2xl">
            {userName ? userName.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h1 className="text-2xl font-bold">{userName}</h1>
          {provider && (
            <span className="mt-1 inline-block rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground capitalize">
              {provider}
            </span>
          )}
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{userEmail}</span>
          </div>
          {createdAt && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined {createdAt}</span>
            </div>
          )}
        </div>

        <Button asChild variant="outline" className="mt-4 gap-2">
          <Link href="/my-content">
            <ImageIcon className="h-4 w-4" />
            View My Content
          </Link>
        </Button>
      </div>
    </div>
  )
}
