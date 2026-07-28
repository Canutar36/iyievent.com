import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import EtkinliklerClient from './EtkinliklerClient'

export const metadata = { title: 'Etkinlik Talepleri | Yönetim' }

const DEMO = [
  { id: '1', ad: 'Kurumsal — Kurumsal Gala Gecesi', tur: 'Kurumsal', tarih: '2026-09-15', saat: '19:00', tahmini_misafir_sayisi: 150, durum: 'talep', notlar: 'İstanbul, Beşiktaş\nMisafir: 150', created_at: '2026-07-25T10:00:00Z', musteri: { full_name: 'Melis Sabancı', email: 'melis@example.com' } },
  { id: '2', ad: 'Düğün Organizasyonu', tur: 'Bireysel & Özel Gün', tarih: '2026-10-20', saat: '16:00', tahmini_misafir_sayisi: 300, durum: 'planlama', notlar: 'Antalya, Konyaaltı\nMisafir: 300', created_at: '2026-07-20T10:00:00Z', musteri: { full_name: 'Selin Aksoy', email: 'selin@example.com' } },
  { id: '3', ad: 'Özel Talep — Dini', tur: 'Dini & Geleneksel', tarih: null, saat: null, tahmini_misafir_sayisi: null, durum: 'talep', notlar: 'Özel Talep: İftar daveti düzenlenmek isteniyor.\nAnkara\nMisafir: 80', created_at: '2026-07-28T10:00:00Z', musteri: { full_name: 'Zeynep Koç', email: 'zeynep.koc@example.com' } },
]

async function getEtkinlikler() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('etkinlikler')
      .select('*, musteri:profiles!etkinlikler_musteri_id_fkey(full_name, email, phone)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function EtkinliklerPage() {
  const etkinlikler = await getEtkinlikler()
  return <EtkinliklerClient etkinlikler={etkinlikler} demo={isDevPreview()} />
}
