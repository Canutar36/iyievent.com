import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_CARILER, DEMO_KASALAR, DEMO_KASA_HAREKETLERI, DEMO_GIDERLER, DEMO_TAHSILATLAR, DEMO_PNL } from '@/lib/demo-finans'
import MuhasebeClient from './MuhasebeClient'

export const metadata = { title: 'Ön Muhasebe | Yönetim' }

async function getData() {
  if (isDevPreview()) {
    return { cariler: DEMO_CARILER, kasalar: DEMO_KASALAR, hareketler: DEMO_KASA_HAREKETLERI, giderler: DEMO_GIDERLER, tahsilatlar: DEMO_TAHSILATLAR, pnl: DEMO_PNL }
  }
  try {
    const supabase = createServiceClient()
    const [c, k, h, gd, t] = await Promise.all([
      supabase.from('cariler').select('*').order('unvan'),
      supabase.from('kasa_hesaplari').select('*').order('ad'),
      supabase.from('kasa_hareketleri').select('*').order('tarih', { ascending: false }).limit(50),
      supabase.from('giderler').select('*, etkinlikler(ad), tedarikciler(ad)').order('tarih', { ascending: false }),
      supabase.from('tahsilatlar').select('*, etkinlikler(ad)').order('tarih', { ascending: false }),
    ])
    const giderler = (gd.data || []).map(x => ({ ...x, etkinlik_ad: x.etkinlikler?.ad, tedarikci_ad: x.tedarikciler?.ad }))
    const tahsilatlar = (t.data || []).map(x => ({ ...x, etkinlik_ad: x.etkinlikler?.ad }))
    const pnlMap = {}
    for (const it of tahsilatlar) { const e = it.etkinlik_ad || 'Diğer'; pnlMap[e] = pnlMap[e] || { etkinlik: e, gelir: 0, gider: 0 }; pnlMap[e].gelir += Number(it.tutar) || 0 }
    for (const it of giderler) { const e = it.etkinlik_ad || 'Diğer'; pnlMap[e] = pnlMap[e] || { etkinlik: e, gelir: 0, gider: 0 }; pnlMap[e].gider += Number(it.tutar) || 0 }
    const pnl = Object.values(pnlMap).map(p => ({ ...p, kar: p.gelir - p.gider }))
    return { cariler: c.data || [], kasalar: k.data || [], hareketler: h.data || [], giderler, tahsilatlar, pnl }
  } catch {
    return { cariler: [], kasalar: [], hareketler: [], giderler: [], tahsilatlar: [], pnl: [] }
  }
}

export default async function MuhasebePage() {
  const data = await getData()
  return <MuhasebeClient data={data} demo={isDevPreview()} />
}
