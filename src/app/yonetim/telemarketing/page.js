import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { demoLeadler, ISTANBUL_ILCELER, DEMO_SEKTORLER } from '@/lib/demo-leadler'
import TelemarketingClient from './TelemarketingClient'

export const metadata = { title: 'Telemarketing | Yönetim' }

const KUYRUK_BOYUTU = 40

function demoKuyruk(filtre) {
  if (!globalThis.__demoLeadler) globalThis.__demoLeadler = demoLeadler(120)
  let rows = globalThis.__demoLeadler.filter(l => ['aranmadi', 'geri_ara', 'mesgul'].includes(l.arama_durumu))
  if (filtre.ilce) rows = rows.filter(l => l.ilce === filtre.ilce)
  if (filtre.sektor) rows = rows.filter(l => l.sektor === filtre.sektor)
  if (filtre.tip) rows = rows.filter(l => l.tip === filtre.tip)
  return rows.slice(0, KUYRUK_BOYUTU)
}

async function getData(sp) {
  const filtre = { ilce: sp.ilce || '', sektor: sp.sektor || '', tip: sp.tip || '' }

  if (isDevPreview()) {
    const kuyruk = demoKuyruk(filtre)
    const all = globalThis.__demoLeadler || []
    const sayac = {
      aranmadi: all.filter(l => l.arama_durumu === 'aranmadi').length,
      geri_ara: all.filter(l => l.arama_durumu === 'geri_ara').length,
      ulasildi: all.filter(l => l.arama_durumu === 'ulasildi').length,
      randevu: all.filter(l => l.arama_durumu === 'randevu').length,
    }
    return { kuyruk, sayac, filtre }
  }

  try {
    const supabase = createServiceClient()
    let q = supabase.from('leadler').select('*').in('arama_durumu', ['aranmadi', 'geri_ara', 'mesgul'])
    if (filtre.ilce) q = q.eq('ilce', filtre.ilce)
    if (filtre.sektor) q = q.eq('sektor', filtre.sektor)
    if (filtre.tip) q = q.eq('tip', filtre.tip)
    q = q.order('geri_arama_tarihi', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }).limit(KUYRUK_BOYUTU)
    const { data: kuyruk } = await q

    const sayimlar = await Promise.all(['aranmadi', 'geri_ara', 'ulasildi', 'randevu'].map(d =>
      supabase.from('leadler').select('*', { count: 'exact', head: true }).eq('arama_durumu', d)
    ))
    const sayac = { aranmadi: sayimlar[0].count || 0, geri_ara: sayimlar[1].count || 0, ulasildi: sayimlar[2].count || 0, randevu: sayimlar[3].count || 0 }
    return { kuyruk: kuyruk || [], sayac, filtre }
  } catch {
    return { kuyruk: [], sayac: { aranmadi: 0, geri_ara: 0, ulasildi: 0, randevu: 0 }, filtre }
  }
}

export default async function TelemarketingPage({ searchParams }) {
  const sp = await searchParams
  const data = await getData(sp)
  return <TelemarketingClient {...data} ilceler={ISTANBUL_ILCELER} sektorler={DEMO_SEKTORLER} demo={isDevPreview()} />
}
