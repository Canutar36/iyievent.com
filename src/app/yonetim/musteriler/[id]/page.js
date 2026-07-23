import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { notFound } from 'next/navigation'
import MusteriDetayClient from './MusteriDetayClient'

export const metadata = { title: 'Müşteri Dosyaları | Yönetim' }

const DEMO_MUSTERILER = {
  '1': { id: '1', full_name: 'Melis Sabancı', email: 'melis@example.com', phone: '0532 111 22 33', created_at: '2026-06-01T10:00:00Z' },
  '2': { id: '2', full_name: 'Selin Aksoy', email: 'selin@example.com', phone: '0535 888 99 00', created_at: '2026-05-12T10:00:00Z' },
  '3': { id: '3', full_name: 'Zeynep Koç', email: 'zeynep.koc@example.com', phone: '0533 777 88 99', created_at: '2026-04-20T10:00:00Z' },
}
const DEMO_ETKINLIKLER = {
  '1': [{ id: 'ev1', ad: 'Olive Grove Wedding', tur: 'Kır Düğünü', tarih: '2026-08-14', durum: 'planlama' }],
  '2': [
    { id: 'ev2', ad: 'Nova Ürün Lansmanı', tur: 'Kurumsal', tarih: '2026-09-05', durum: 'onaylandi' },
    { id: 'ev3', ad: 'Nova Yılbaşı Partisi', tur: 'Kurumsal', tarih: '2026-12-20', durum: 'talep' },
  ],
  '3': [{ id: 'ev4', ad: 'Yat Doğum Günü', tur: 'Özel Davet', tarih: '2026-08-02', durum: 'onaylandi' }],
}
const DEMO_BELGELER = {
  ev1: [
    { id: 'b1', ad: 'Hizmet Sözleşmesi', tur: 'sozlesme', durum: 'onaylandi', dosya_boyutu: 245000, yukleyen_rol: 'admin', created_at: '2026-06-05T10:00:00Z' },
    { id: 'b2', ad: 'İmzalı Sözleşme (Islak)', tur: 'islak_imza', durum: 'yuklendi', dosya_boyutu: 1240000, yukleyen_rol: 'musteri', created_at: '2026-06-08T10:00:00Z' },
  ],
  ev2: [{ id: 'b3', ad: 'Ön Fatura', tur: 'fatura', durum: 'yuklendi', dosya_boyutu: 88000, yukleyen_rol: 'admin', created_at: '2026-07-01T10:00:00Z' }],
}
const DEMO_GORSEL_SAYISI = { ev1: 24, ev2: 0, ev3: 0, ev4: 12 }

async function getData(id) {
  if (isDevPreview()) {
    const musteri = DEMO_MUSTERILER[id]
    if (!musteri) return null
    const etkinlikler = (DEMO_ETKINLIKLER[id] || []).map(e => ({ ...e, belgeler: DEMO_BELGELER[e.id] || [], gorsel_sayisi: DEMO_GORSEL_SAYISI[e.id] || 0 }))
    return { musteri, etkinlikler }
  }
  try {
    const supabase = createServiceClient()
    const { data: musteri } = await supabase.from('profiles').select('id, full_name, email, phone, created_at').eq('id', id).single()
    if (!musteri) return null
    const { data: etkinliklerRaw } = await supabase.from('etkinlikler').select('id, ad, tur, tarih, durum').eq('musteri_id', id).order('tarih', { ascending: false })
    const etkinlikler = []
    for (const e of etkinliklerRaw || []) {
      const [{ data: belgeler }, { count }] = await Promise.all([
        supabase.from('belgeler').select('*').eq('etkinlik_id', e.id).order('created_at', { ascending: false }),
        supabase.from('etkinlik_gorselleri').select('*', { count: 'exact', head: true }).eq('etkinlik_id', e.id),
      ])
      etkinlikler.push({ ...e, belgeler: belgeler || [], gorsel_sayisi: count || 0 })
    }
    return { musteri, etkinlikler }
  } catch {
    return null
  }
}

export default async function MusteriDetayPage({ params }) {
  const { id } = await params
  const data = await getData(id)
  if (!data) notFound()
  return <MusteriDetayClient musteri={data.musteri} etkinlikler={data.etkinlikler} demo={isDevPreview()} />
}
