import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_TAHSILATLAR, DEMO_CARILER, DEMO_KASALAR } from '@/lib/demo-finans'
import OdemelerClient from './OdemelerClient'

export const metadata = { title: 'Tahsilatlar | Yönetim' }

async function getData() {
  if (isDevPreview()) return { tahsilatlar: DEMO_TAHSILATLAR, cariler: DEMO_CARILER, kasalar: DEMO_KASALAR }
  try {
    const supabase = createServiceClient()
    const [t, c, k] = await Promise.all([
      supabase.from('tahsilatlar').select('*, cariler(unvan), etkinlikler(ad), kasa_hesaplari(ad)').order('tarih', { ascending: false }),
      supabase.from('cariler').select('id, unvan, tip').order('unvan'),
      supabase.from('kasa_hesaplari').select('id, ad, tip').eq('aktif', true).order('ad'),
    ])
    const tahsilatlar = (t.data || []).map(x => ({ ...x, cari_unvan: x.cariler?.unvan, etkinlik_ad: x.etkinlikler?.ad, kasa_ad: x.kasa_hesaplari?.ad }))
    return { tahsilatlar, cariler: c.data || [], kasalar: k.data || [] }
  } catch {
    return { tahsilatlar: [], cariler: [], kasalar: [] }
  }
}

export default async function OdemelerPage() {
  const { tahsilatlar, cariler, kasalar } = await getData()
  return <OdemelerClient tahsilatlar={tahsilatlar} cariler={cariler} kasalar={kasalar} demo={isDevPreview()} />
}
