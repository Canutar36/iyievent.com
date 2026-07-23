import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_FATURALAR, DEMO_CARILER } from '@/lib/demo-finans'
import FaturalarClient from './FaturalarClient'

export const metadata = { title: 'Faturalar | Yönetim' }

async function getData() {
  if (isDevPreview()) return { faturalar: DEMO_FATURALAR, cariler: DEMO_CARILER }
  try {
    const supabase = createServiceClient()
    const [f, k, c] = await Promise.all([
      supabase.from('faturalar').select('*, cariler(unvan), etkinlikler(ad)').order('tarih', { ascending: false }),
      supabase.from('fatura_kalemleri').select('*'),
      supabase.from('cariler').select('id, unvan, tip, vergi_no').order('unvan'),
    ])
    const kByF = {}
    for (const it of k.data || []) { (kByF[it.fatura_id] = kByF[it.fatura_id] || []).push(it) }
    const faturalar = (f.data || []).map(x => ({ ...x, cari_unvan: x.cariler?.unvan, etkinlik_ad: x.etkinlikler?.ad, kalemler: kByF[x.id] || [] }))
    return { faturalar, cariler: c.data || [] }
  } catch {
    return { faturalar: [], cariler: [] }
  }
}

export default async function FaturalarPage() {
  const { faturalar, cariler } = await getData()
  return <FaturalarClient faturalar={faturalar} cariler={cariler} demo={isDevPreview()} />
}
