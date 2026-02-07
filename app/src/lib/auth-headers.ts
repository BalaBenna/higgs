import { createClient } from '@/lib/supabase/client'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  // getUser() forces a token refresh if the access token has expired
  await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}
