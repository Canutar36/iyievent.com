import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_HIZMETLER, DEMO_EKSTRALAR } from '@/lib/demo-katalog'
import KatalogClient from './KatalogClient'

export const metadata = { title: 'Hizmet Kataloğu | Yönetim' }

async function getKatalog() {
  if (isDevPreview()) return { hizmetler: DEMO_HIZMETLER, ekstralar: DEMO_EKSTRALAR }
  try {
    const supabase = createServiceClient()
    const [h, k, e] = await Promise.all([
      supabase.from('hizmetler').select('*').order('siralama').order('ad'),
      supabase.from('hizmet_kademeleri').select('*').order('siralama'),
      supabase.from('ekstralar').select('*').order('siralama').order('ad'),
    ])
    const kademeler = k.data || []
    const hizmetler = (h.data || []).map(x => ({ ...x, kademeler: kademeler.filter(km => km.hizmet_id === x.id) }))
    return { hizmetler, ekstralar: e.data || [] }
  } catch {
    return { hizmetler: [], ekstralar: [] }
  }
}

export default async function KatalogPage() {
  const { hizmetler, ekstralar } = await getKatalog()
  return <KatalogClient hizmetler={hizmetler} ekstralar={ekstralar} demo={isDevPreview()} />
}
