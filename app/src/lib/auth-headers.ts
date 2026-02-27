import { createClient } from '@/lib/supabase/client'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  // getUser() forces a token refresh if the access token has expired
  const { data: userData, error: userError } = await supabase.auth.getUser()
  console.log('[AUTH-HEADERS] getUser result:', { user: userData.user?.id, error: userError })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log('[AUTH-HEADERS] getSession result:', { 
    hasSession: !!session, 
    hasAccessToken: !!session?.access_token,
    tokenLength: session?.access_token?.length 
  })
  
  if (session?.access_token) {
    console.log('[AUTH-HEADERS] Returning Authorization header')
    return { Authorization: `Bearer ${session.access_token}` }
  }
  console.warn('[AUTH-HEADERS] No access token - returning empty headers')
  return {}
}
