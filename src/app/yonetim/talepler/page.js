import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import TaleplerClient from './TaleplerClient'

export const metadata = { title: 'Talepler | Yönetim' }

const DEMO_TALEPLER = [
  { id: '1', ad_soyad: 'Melis Sabancı', email: 'melis@example.com', telefon: '0532 111 22 33', etkinlik_turu: 'Bespoke Düğün', tahmini_misafir: '250', butce: '750.000₺+', mesaj: 'Çırağan Sarayı’nda bir düğün planlıyoruz, Ağustos 2026.', durum: 'yeni', created_at: '2026-07-21T10:00:00Z' },
  { id: '2', ad_soyad: 'Arda Holding', email: 'etkinlik@ardaholding.com', telefon: '0212 444 55 66', etkinlik_turu: 'Kurumsal Gala', tahmini_misafir: '500', butce: '1.000.000₺+', mesaj: '25. yıl gala gecemiz için teklif istiyoruz.', durum: 'yeni', created_at: '2026-07-20T14:30:00Z' },
  { id: '3', ad_soyad: 'Zeynep Koç', email: 'zeynep.koc@example.com', telefon: '0533 777 88 99', etkinlik_turu: 'Özel Davet', tahmini_misafir: '80', butce: '300.000₺', mesaj: 'Doğum günü sürprizi, yat üzerinde.', durum: 'inceleniyor', created_at: '2026-07-19T09:15:00Z' },
  { id: '4', ad_soyad: 'Deniz Yılmaz', email: 'deniz@example.com', telefon: '0534 222 33 44', etkinlik_turu: 'Destinasyon Düğün', tahmini_misafir: '120', butce: '500.000₺', mesaj: 'Bodrum’da destinasyon düğünü düşünüyoruz.', durum: 'yeni', created_at: '2026-07-18T16:00:00Z' },
  { id: '5', ad_soyad: 'Selin Aksoy', email: 'selin@example.com', telefon: '0535 888 99 00', etkinlik_turu: 'Kurumsal Lansman', tahmini_misafir: '300', butce: '600.000₺', mesaj: 'Yeni ürün lansmanı, Tersane İstanbul.', durum: 'etkinlige_donustu', created_at: '2026-07-10T11:00:00Z' },
  { id: '6', ad_soyad: 'Mert Demir', email: 'mert@example.com', telefon: '0536 123 45 67', etkinlik_turu: 'Özel Davet', tahmini_misafir: '40', butce: '120.000₺', mesaj: 'Bütçe uyuşmadı.', durum: 'reddedildi', created_at: '2026-07-05T13:00:00Z' },
]

async function getTalepler() {
  if (isDevPreview()) return DEMO_TALEPLER
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('talepler').select('*').order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function TaleplerPage() {
  const talepler = await getTalepler()
  return <TaleplerClient talepler={talepler} demo={isDevPreview()} />
}
