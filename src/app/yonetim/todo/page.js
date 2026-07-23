import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import TodoClient from './TodoClient'

export const metadata = { title: 'Yapılacaklar | Yönetim' }

const DEMO_ETKINLIKLER = [
  {
    id: 'e1', ad: 'Bosphorus Ethereal Gala', tur: 'Kurumsal Gala', tarih: '2026-07-25',
    gorevler: [
      { id: 'g1', baslik: 'Mekan sözleşmesi & keşif', grup: 'Hazırlık', durum: 'tamam', kaynak: 'sablon' },
      { id: 'g2', baslik: 'Sahne & truss kurulumu planı', grup: 'Teknik', durum: 'yapiliyor', kaynak: 'sablon' },
      { id: 'g3', baslik: 'Catering menü onayı', grup: 'İkram', durum: 'yapiliyor', kaynak: 'sablon' },
      { id: 'g4', baslik: 'LED ekran tedarik & kurulum', grup: 'Teknik', durum: 'bekliyor', kaynak: 'ekstra' },
      { id: 'g5', baslik: 'Şarkıcı / canlı müzik koordinasyonu', grup: 'Eğlence', durum: 'bekliyor', kaynak: 'ekstra' },
      { id: 'g6', baslik: 'VIP karşılama & host görevlendirme', grup: 'Operasyon', durum: 'bekliyor', kaynak: 'sablon' },
    ],
  },
  {
    id: 'e2', ad: 'Olive Grove Wedding', tur: 'Kır Düğünü', tarih: '2026-08-14',
    gorevler: [
      { id: 'g7', baslik: 'Konsept & dekor tasarımı', grup: 'Hazırlık', durum: 'tamam', kaynak: 'sablon' },
      { id: 'g8', baslik: 'Çiçek & masa süsleme siparişi', grup: 'Süsleme', durum: 'yapiliyor', kaynak: 'sablon' },
      { id: 'g9', baslik: 'Karşılama kokteyli hazırlığı', grup: 'İkram', durum: 'bekliyor', kaynak: 'ekstra' },
      { id: 'g10', baslik: 'Fotoğraf & video ekibi', grup: 'Prodüksiyon', durum: 'bekliyor', kaynak: 'manuel' },
    ],
  },
  {
    id: 'e3', ad: 'Zeynep Koç — Yat Doğum Günü', tur: 'Özel Davet', tarih: '2026-08-02',
    gorevler: [
      { id: 'g11', baslik: 'Yat kiralama teyidi', grup: 'Hazırlık', durum: 'yapiliyor', kaynak: 'sablon' },
      { id: 'g12', baslik: 'Dondurma arabası tedariki', grup: 'İkram', durum: 'bekliyor', kaynak: 'ekstra' },
    ],
  },
]

const DEMO_SABLONLAR = [
  {
    id: 's1', ad: 'Kurumsal Gala Checklist', hizmet_ad: 'Kurumsal Gala Gecesi', aktif: true,
    kalemler: [
      { id: 'k1', baslik: 'Mekan sözleşmesi & keşif', grup: 'Hazırlık', ekstra_ad: null },
      { id: 'k2', baslik: 'Sahne & truss kurulum planı', grup: 'Teknik', ekstra_ad: null },
      { id: 'k3', baslik: 'Catering menü onayı', grup: 'İkram', ekstra_ad: null },
      { id: 'k4', baslik: 'VIP karşılama & host görevlendirme', grup: 'Operasyon', ekstra_ad: null },
      { id: 'k5', baslik: 'LED ekran tedarik & kurulum', grup: 'Teknik', ekstra_ad: 'LED Ekran' },
      { id: 'k6', baslik: 'Şarkıcı / canlı müzik koordinasyonu', grup: 'Eğlence', ekstra_ad: 'Şarkıcı / Canlı Müzik' },
    ],
  },
  {
    id: 's2', ad: 'Piknik Checklist', hizmet_ad: 'Lüks Bohem Piknik', aktif: true,
    kalemler: [
      { id: 'k7', baslik: 'Alan keşfi & izin', grup: 'Hazırlık', ekstra_ad: null },
      { id: 'k8', baslik: 'Minder, ahşap masa, tekstil temini', grup: 'Kurulum', ekstra_ad: null },
      { id: 'k9', baslik: 'Catering & sepet hazırlığı', grup: 'İkram', ekstra_ad: null },
      { id: 'k10', baslik: 'Dondurma arabası tedariki', grup: 'İkram', ekstra_ad: 'Dondurma Arabası' },
      { id: 'k11', baslik: 'Patlamış mısır standı kurulumu', grup: 'İkram', ekstra_ad: 'Patlamış Mısır Standı' },
    ],
  },
]

async function getData() {
  if (isDevPreview()) return { etkinlikler: DEMO_ETKINLIKLER, sablonlar: DEMO_SABLONLAR }
  try {
    const supabase = createServiceClient()
    const [e, g, s, k] = await Promise.all([
      supabase.from('etkinlikler').select('id, ad, tur, tarih').in('durum', ['planlama', 'onaylandi']).order('tarih'),
      supabase.from('gorevler').select('*').order('siralama'),
      supabase.from('todo_sablonlari').select('*, hizmetler(ad)').order('created_at'),
      supabase.from('todo_sablon_kalemleri').select('*, ekstralar(ad)').order('siralama'),
    ])
    const gByE = {}
    for (const it of g.data || []) { (gByE[it.etkinlik_id] = gByE[it.etkinlik_id] || []).push(it) }
    const etkinlikler = (e.data || []).map(x => ({ ...x, gorevler: gByE[x.id] || [] }))
    const kBySablon = {}
    for (const it of k.data || []) { (kBySablon[it.sablon_id] = kBySablon[it.sablon_id] || []).push({ ...it, ekstra_ad: it.ekstralar?.ad || null }) }
    const sablonlar = (s.data || []).map(x => ({ ...x, hizmet_ad: x.hizmetler?.ad || null, kalemler: kBySablon[x.id] || [] }))
    return { etkinlikler, sablonlar }
  } catch {
    return { etkinlikler: [], sablonlar: [] }
  }
}

export default async function TodoPage() {
  const { etkinlikler, sablonlar } = await getData()
  return <TodoClient etkinlikler={etkinlikler} sablonlar={sablonlar} demo={isDevPreview()} />
}
