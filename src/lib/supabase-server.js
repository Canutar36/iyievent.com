import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server Component ve Route Handler'larda kullanılacak Supabase istemcisi.
 * Cookie'lerden session okur.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component'ten çağrıldığında set yapılamaz, 
            // Middleware session yenileme ile halleder.
          }
        },
      },
    }
  )
}

/**
 * Service Role ile Supabase (RLS bypass — sadece admin API route'larında kullanın!)
 */
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key'
  return createSupabaseClient(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
