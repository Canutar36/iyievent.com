import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { demoLeadler, ISTANBUL_ILCELER, DEMO_SEKTORLER } from '@/lib/demo-leadler'
import LeadlerClient from './LeadlerClient'

export const metadata = { title: 'Lead Havuzu | Yönetim' }

const SAYFA_BOYUTU = 50

const DEMO_ETKILESIMLER = {
  'demo-1': [{ id: 'i1', tur: 'telefon', ozet: 'İlk arama, ilgilendi.', created_at: '2026-07-20T15:00:00Z' }],
}

function tumDemo() {
  // Modül içinde bir kez üretilir (dev)
  if (!globalThis.__demoLeadler) globalThis.__demoLeadler = demoLeadler(120)
  return globalThis.__demoLeadler
}

function demoSorgu({ sayfa, ara, tip, ilce, sektor, durum, arama }) {
  let rows = tumDemo()
  if (tip) rows = rows.filter(l => l.tip === tip)
  if (ilce) rows = rows.filter(l => l.ilce === ilce)
  if (sektor) rows = rows.filter(l => l.sektor === sektor)
  if (durum) rows = rows.filter(l => l.durum === durum)
  if (arama) rows = rows.filter(l => l.arama_durumu === arama)
  if (ara) {
    const q = ara.toLocaleLowerCase('tr')
    rows = rows.filter(l => `${l.ad_unvan} ${l.email || ''} ${l.telefon || ''} ${l.yetkili_kisi || ''}`.toLocaleLowerCase('tr').includes(q))
  }
  const toplam = rows.length
  const bas = (sayfa - 1) * SAYFA_BOYUTU
  return { rows: rows.slice(bas, bas + SAYFA_BOYUTU), toplam }
}

async function getData(sp) {
  const sayfa = Math.max(1, parseInt(sp.sayfa) || 1)
  const filtre = { sayfa, ara: sp.ara || '', tip: sp.tip || '', ilce: sp.ilce || '', sektor: sp.sektor || '', durum: sp.durum || '', arama: sp.arama || '' }

  if (isDevPreview()) {
    const { rows, toplam } = demoSorgu(filtre)
    return { leadler: rows, toplam, etkilesimler: DEMO_ETKILESIMLER, sayfa, sayfaBoyutu: SAYFA_BOYUTU, filtre }
  }

  try {
    const supabase = createServiceClient()
    let q = supabase.from('leadler').select('*', { count: 'exact' })
    if (filtre.tip) q = q.eq('tip', filtre.tip)
    if (filtre.ilce) q = q.eq('ilce', filtre.ilce)
    if (filtre.sektor) q = q.eq('sektor', filtre.sektor)
    if (filtre.durum) q = q.eq('durum', filtre.durum)
    if (filtre.arama) q = q.eq('arama_durumu', filtre.arama)
    if (filtre.ara) q = q.or(`ad_unvan.ilike.%${filtre.ara}%,email.ilike.%${filtre.ara}%,telefon.ilike.%${filtre.ara}%`)
    const bas = (sayfa - 1) * SAYFA_BOYUTU
    q = q.order('created_at', { ascending: false }).range(bas, bas + SAYFA_BOYUTU - 1)
    const { data, count } = await q

    // Yalnızca bu sayfadaki lead'lerin etkileşimleri (sınırlı, hızlı)
    const ids = (data || []).map(l => l.id)
    const etkilesimler = {}
    if (ids.length) {
      const { data: etk } = await supabase.from('crm_etkilesimler').select('*').in('lead_id', ids).order('created_at', { ascending: false })
      for (const it of etk || []) { (etkilesimler[it.lead_id] = etkilesimler[it.lead_id] || []).push(it) }
    }
    return { leadler: data || [], toplam: count || 0, etkilesimler, sayfa, sayfaBoyutu: SAYFA_BOYUTU, filtre }
  } catch {
    return { leadler: [], toplam: 0, etkilesimler: {}, sayfa, sayfaBoyutu: SAYFA_BOYUTU, filtre }
  }
}

export default async function LeadlerPage({ searchParams }) {
  const sp = await searchParams
  const data = await getData(sp)
  return <LeadlerClient {...data} ilceler={ISTANBUL_ILCELER} sektorler={DEMO_SEKTORLER} demo={isDevPreview()} />
}
