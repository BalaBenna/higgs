import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — important for keeping the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/explore', '/auth/callback']
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  )
  const isApiPath = request.nextUrl.pathname.startsWith('/api/')
  const isStaticPath =
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)

  // If not authenticated and not on a public/static/api path, redirect to login
  if (!user && !isPublicPath && !isApiPath && !isStaticPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
