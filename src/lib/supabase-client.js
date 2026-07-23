'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Component'lerde kullanılacak Supabase istemcisi.
 * Singleton pattern — her çağrıda yeni instance oluşturmaz.
 */
let client

export function createClient() {
  if (client) return client
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'

  client = createBrowserClient(url, key)
  
  return client
}
