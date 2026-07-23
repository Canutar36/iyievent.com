import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { DEMO_PNL } from '@/lib/demo-finans'
import RaporlarClient from './RaporlarClient'

export const metadata = { title: 'Raporlar | Yönetim' }

const DEMO = {
  huni: [
    { asama: 'Lead', sayi: 42 },
    { asama: 'Teklif', sayi: 18 },
    { asama: 'Kabul', sayi: 9 },
    { asama: 'Etkinlik', sayi: 7 },
  ],
  ciroTur: [
    { tur: 'Kurumsal', tutar: 1000000 },
    { tur: 'Bireysel', tutar: 928000 },
    { tur: 'Tematik', tutar: 95000 },
    { tur: 'Çocuk', tutar: 60000 },
    { tur: 'Dini', tutar: 45000 },
  ],
  nakitAkis: [
    { ay: 'Şub', gelir: 180000, gider: 90000 },
    { ay: 'Mar', gelir: 240000, gider: 130000 },
    { ay: 'Nis', gelir: 320000, gider: 150000 },
    { ay: 'May', gelir: 410000, gider: 190000 },
    { ay: 'Haz', gelir: 380000, gider: 210000 },
    { ay: 'Tem', gelir: 650000, gider: 223000 },
  ],
  pnl: DEMO_PNL,
}

async function getData() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const [leadC, teklifAll, etkC, tahsilatlar, giderler] = await Promise.all([
      supabase.from('leadler').select('*', { count: 'exact', head: true }),
      supabase.from('teklifler').select('durum, kategori, toplam'),
      supabase.from('etkinlikler').select('*', { count: 'exact', head: true }).in('durum', ['planlama', 'onaylandi', 'tamamlandi']),
      supabase.from('tahsilatlar').select('tutar, tarih, etkinlikler(ad)'),
      supabase.from('giderler').select('tutar, tarih, etkinlikler(ad)'),
    ])
    const teklifler = teklifAll.data || []
    const kabul = teklifler.filter(t => ['kabul', 'etkinlige_donustu'].includes(t.durum)).length
    const huni = [
      { asama: 'Lead', sayi: leadC.count || 0 },
      { asama: 'Teklif', sayi: teklifler.length },
      { asama: 'Kabul', sayi: kabul },
      { asama: 'Etkinlik', sayi: etkC.count || 0 },
    ]
    const ciroMap = {}
    for (const t of teklifler) { const k = t.kategori || 'Diğer'; ciroMap[k] = (ciroMap[k] || 0) + (Number(t.toplam) || 0) }
    const ciroTur = Object.entries(ciroMap).map(([tur, tutar]) => ({ tur, tutar })).sort((a, b) => b.tutar - a.tutar)
    // Aylık nakit akış (son 6 ay)
    const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    const akisMap = {}
    const ekle = (tarih, alan, tutar) => { const d = new Date(tarih); const key = `${d.getFullYear()}-${d.getMonth()}`; akisMap[key] = akisMap[key] || { ay: aylar[d.getMonth()], gelir: 0, gider: 0, _k: key }; akisMap[key][alan] += Number(tutar) || 0 }
    for (const t of tahsilatlar.data || []) ekle(t.tarih, 'gelir', t.tutar)
    for (const gd of giderler.data || []) ekle(gd.tarih, 'gider', gd.tutar)
    const nakitAkis = Object.values(akisMap).sort((a, b) => a._k.localeCompare(b._k)).slice(-6)
    // P&L
    const pnlMap = {}
    for (const t of tahsilatlar.data || []) { const e = t.etkinlikler?.ad || 'Diğer'; pnlMap[e] = pnlMap[e] || { etkinlik: e, gelir: 0, gider: 0 }; pnlMap[e].gelir += Number(t.tutar) || 0 }
    for (const gd of giderler.data || []) { const e = gd.etkinlikler?.ad || 'Diğer'; pnlMap[e] = pnlMap[e] || { etkinlik: e, gelir: 0, gider: 0 }; pnlMap[e].gider += Number(gd.tutar) || 0 }
    const pnl = Object.values(pnlMap).map(p => ({ ...p, kar: p.gelir - p.gider }))
    return { huni, ciroTur, nakitAkis, pnl }
  } catch {
    return { huni: [], ciroTur: [], nakitAkis: [], pnl: [] }
  }
}

export default async function RaporlarPage() {
  const data = await getData()
  return <RaporlarClient data={data} />
}
