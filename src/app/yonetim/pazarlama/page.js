import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import PazarlamaClient from './PazarlamaClient'

export const metadata = { title: 'Dijital Pazarlama | Yönetim' }

const DEMO = {
  kampanyalar: [
    { id: 'k1', ad: 'Yaz Sezonu Kır Düğünü Kampanyası', kanal: 'email', hedef_segment: 'b2c', konu: 'Hayalinizdeki Kır Düğünü', icerik: 'Bu yaz, doğanın kalbinde unutulmaz bir kutlama sizi bekliyor. Erken rezervasyona özel %15 indirim.', durum: 'gonderildi', alici_sayisi: 27, acilma_sayisi: 19, tiklama_sayisi: 8, donusum_sayisi: 3, gonderim_tarihi: '2026-07-15T10:00:00Z' },
    { id: 'k2', ad: 'Kurumsal Gala & Yılbaşı Teklifi', kanal: 'email', hedef_segment: 'b2b', konu: 'Şirketiniz İçin Kusursuz Bir Yıl Sonu', icerik: 'Yıl sonu galanız ve yılbaşı partiniz için erken planlama avantajları.', durum: 'planlandi', alici_sayisi: 0, acilma_sayisi: 0, tiklama_sayisi: 0, donusum_sayisi: 0 },
    { id: 'k3', ad: 'Doğum Günü Hatırlatma SMS', kanal: 'sms', hedef_segment: 'tumu', konu: null, icerik: 'iyi event ile çocuğunuzun doğum gününü masala çevirin! Bilgi: 0212 993 99 39', durum: 'taslak', alici_sayisi: 0, acilma_sayisi: 0, tiklama_sayisi: 0, donusum_sayisi: 0 },
  ],
  icerikler: [
    { id: 'i1', baslik: 'Çırağan Gala kulis fotoğrafları', platform: 'instagram', tip: 'reel', tarih: '2026-07-26', durum: 'onay', notlar: 'Sahne kurulumu + davetli girişi montajı' },
    { id: 'i2', baslik: 'Lüks piknik konsept tanıtımı', platform: 'instagram', tip: 'gonderi', tarih: '2026-07-28', durum: 'tasarim' },
    { id: 'i3', baslik: 'Evlilik teklifi anı (müşteri izniyle)', platform: 'tiktok', tip: 'reel', tarih: '2026-07-30', durum: 'fikir' },
    { id: 'i4', baslik: 'Yıl sonu kurumsal etkinlik daveti', platform: 'linkedin', tip: 'etkinlik_duyuru', tarih: '2026-08-01', durum: 'fikir' },
    { id: 'i5', baslik: 'Olive Grove düğün after-movie', platform: 'youtube', tip: 'gonderi', tarih: '2026-08-16', durum: 'fikir' },
    { id: 'i6', baslik: 'Behind the scenes — kına gecesi', platform: 'instagram', tip: 'hikaye', tarih: '2026-07-24', durum: 'yayinlandi' },
  ],
  segmentSayilari: { tumu: 42, b2b: 15, b2c: 27 },
  kaynakDagilim: [
    { kaynak: 'Web Formu', sayi: 18 },
    { kaynak: 'Referans', sayi: 9 },
    { kaynak: 'Reklam', sayi: 8 },
    { kaynak: 'Manuel', sayi: 7 },
  ],
}

const KAYNAK_ETIKET = { form: 'Web Formu', referans: 'Referans', reklam: 'Reklam', manuel: 'Manuel' }

async function getData() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const [k, ic, leadler] = await Promise.all([
      supabase.from('kampanyalar').select('*').order('created_at', { ascending: false }),
      supabase.from('icerik_takvimi').select('*').order('tarih'),
      supabase.from('leadler').select('tip, kaynak'),
    ])
    const leads = leadler.data || []
    const segmentSayilari = { tumu: leads.length, b2b: leads.filter(l => l.tip === 'b2b').length, b2c: leads.filter(l => l.tip === 'b2c').length }
    const kMap = {}
    for (const l of leads) { const key = l.kaynak || 'manuel'; kMap[key] = (kMap[key] || 0) + 1 }
    const kaynakDagilim = Object.entries(kMap).map(([k, sayi]) => ({ kaynak: KAYNAK_ETIKET[k] || k, sayi })).sort((a, b) => b.sayi - a.sayi)
    return { kampanyalar: k.data || [], icerikler: ic.data || [], segmentSayilari, kaynakDagilim }
  } catch {
    return { kampanyalar: [], icerikler: [], segmentSayilari: { tumu: 0, b2b: 0, b2c: 0 }, kaynakDagilim: [] }
  }
}

export default async function PazarlamaPage() {
  const data = await getData()
  return <PazarlamaClient data={data} demo={isDevPreview()} />
}
