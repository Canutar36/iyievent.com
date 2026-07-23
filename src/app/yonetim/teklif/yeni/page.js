import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_HIZMETLER, DEMO_EKSTRALAR } from '@/lib/demo-katalog'
import TeklifBuilderClient from './TeklifBuilderClient'

export const metadata = { title: 'Yeni Teklif | Yönetim' }

async function getKatalog() {
  if (isDevPreview()) {
    return { hizmetler: DEMO_HIZMETLER.filter(h => h.aktif !== false), ekstralar: DEMO_EKSTRALAR.filter(e => e.aktif !== false) }
  }
  try {
    const supabase = createServiceClient()
    const [h, k, e] = await Promise.all([
      supabase.from('hizmetler').select('*').eq('aktif', true).order('siralama').order('ad'),
      supabase.from('hizmet_kademeleri').select('*').order('siralama'),
      supabase.from('ekstralar').select('*').eq('aktif', true).order('siralama').order('ad'),
    ])
    const kademeler = k.data || []
    const hizmetler = (h.data || []).map(x => ({ ...x, kademeler: kademeler.filter(km => km.hizmet_id === x.id) }))
    return { hizmetler, ekstralar: e.data || [] }
  } catch {
    return { hizmetler: [], ekstralar: [] }
  }
}

export default async function YeniTeklifPage() {
  const { hizmetler, ekstralar } = await getKatalog()
  return <TeklifBuilderClient hizmetler={hizmetler} ekstralar={ekstralar} demo={isDevPreview()} />
}
