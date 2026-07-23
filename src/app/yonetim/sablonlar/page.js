import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import SablonlarClient from './SablonlarClient'

export const metadata = { title: 'Şablonlar | Yönetim' }

// Varsayılan (seed) şablonlar — DB boşsa bunlar gösterilir.
const SEED = [
  { id: 'seed-tanitim', tur: 'email', anahtar: 'tanitim', ad: 'Kurumsal Tanıtım Maili', konu: 'iyi event — Kusursuz Etkinlik & Organizasyon Çözümleri', icerik: 'Sayın {{ad}}, iyi event olarak kurumsal galalardan bespoke düğünlere kadar her ölçekte etkinliği uçtan uca planlıyoruz. Hizmet kategorilerimiz: Kurumsal, Bireysel & Özel Gün, Tematik & Açık Hava, Çocuk & Geleneksel. Size özel teklif için iletişime geçin.', aktif: true },
  { id: 'seed-randevu', tur: 'email', anahtar: 'randevu', ad: 'Randevu Oluşturuldu Maili', konu: 'Randevunuz Oluşturuldu — iyi event', icerik: 'Sayın {{ad}}, randevunuz {{tarih}} {{saat}} için {{konum}} konumunda oluşturulmuştur. Çalışma arkadaşlarımız sizi arayarak net saati teyit edecektir.', aktif: true },
  { id: 'seed-tesekkur', tur: 'email', anahtar: 'tesekkur', ad: 'Etkinlik Sonrası Teşekkür', konu: 'Teşekkür Ederiz — iyi event', icerik: 'Sayın {{ad}}, {{etkinlik}} etkinliğinizde bizi tercih ettiğiniz için teşekkür ederiz. Deneyiminizi değerlendirmenizden memnuniyet duyarız.', aktif: true },
]

async function getSablonlar() {
  if (isDevPreview()) return SEED
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('sablonlar').select('*').order('tur').order('ad')
    if (!data || data.length === 0) return SEED
    // Seed'lerden DB'de olmayanları ekle (görünürlük için)
    const anahtarlar = new Set(data.map(s => s.anahtar))
    return [...data, ...SEED.filter(s => !anahtarlar.has(s.anahtar))]
  } catch {
    return SEED
  }
}

export default async function SablonlarPage() {
  const sablonlar = await getSablonlar()
  return <SablonlarClient sablonlar={sablonlar} demo={isDevPreview()} />
}
