import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import TakvimClient from './TakvimClient'

export const metadata = { title: 'Takvim | Yönetim' }

const DEMO = [
  { id: 'r1', baslik: 'Melis Sabancı — yüz yüze görüşme', tur: 'gorusme', musteri_ad: 'Melis Sabancı', musteri_email: 'melis@example.com', tarih: '2026-07-22', baslangic_saat: '14:00', konum: 'Nişantaşı Ofis', durum: 'planlandi', mail_gonderildi: true, notlar: 'Bespoke düğün konsepti sunulacak.' },
  { id: 'r2', baslik: 'Arda Holding — teklif sunumu', tur: 'gorusme', musteri_ad: 'Arda Holding', musteri_email: 'etkinlik@ardaholding.com', tarih: '2026-07-22', baslangic_saat: '16:30', konum: 'Online (Zoom)', durum: 'planlandi', mail_gonderildi: true },
  { id: 'r3', baslik: 'Bosphorus Ethereal Gala', tur: 'etkinlik', tarih: '2026-07-25', baslangic_saat: '19:00', konum: 'Çırağan Palace', durum: 'planlandi', mail_gonderildi: false },
  { id: 'r4', baslik: 'Zeynep Koç — keşif görüşmesi', tur: 'gorusme', musteri_ad: 'Zeynep Koç', musteri_email: 'zeynep.koc@example.com', tarih: '2026-07-24', baslangic_saat: '11:00', konum: 'Kadıköy', durum: 'planlandi', mail_gonderildi: true },
  { id: 'r5', baslik: 'Olive Grove Wedding — mekan keşfi', tur: 'is', tarih: '2026-07-28', baslangic_saat: '13:00', konum: 'Şile Bağ Evi', durum: 'planlandi', mail_gonderildi: false },
  { id: 'r6', baslik: 'Selin Aksoy — sözleşme imzası', tur: 'gorusme', musteri_ad: 'Selin Aksoy', musteri_email: 'selin@example.com', tarih: '2026-07-18', baslangic_saat: '15:00', konum: 'Nişantaşı Ofis', durum: 'tamamlandi', mail_gonderildi: true },
]

async function getRandevular() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('randevular').select('*').order('tarih', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

export default async function TakvimPage() {
  const randevular = await getRandevular()
  return <TakvimClient randevular={randevular} demo={isDevPreview()} />
}
