import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import SozlesmelerClient from './SozlesmelerClient'

export const metadata = { title: 'Sözleşmeler | Yönetim' }

const DEMO = [
  { id: 's1', sozlesme_no: 'SZL-2026-4501', baslik: 'Kurumsal Gala Hizmet Sözleşmesi', musteri_ad: 'Arda Holding A.Ş.', etkinlik_ad: 'Bosphorus Ethereal Gala', tutar: 700000, durum: 'imzalandi', musteri_email: 'muhasebe@ardaholding.com', gonderim_tarihi: '2026-07-06T10:00:00Z', imza_tarihi: '2026-07-09T14:00:00Z', created_at: '2026-07-05T10:00:00Z' },
  { id: 's2', sozlesme_no: 'SZL-2026-4502', baslik: 'Düğün Organizasyon Sözleşmesi', musteri_ad: 'Melis Sabancı', etkinlik_ad: 'Olive Grove Wedding', tutar: 928000, durum: 'gonderildi', musteri_email: 'melis@example.com', gonderim_tarihi: '2026-07-19T10:00:00Z', created_at: '2026-07-18T10:00:00Z' },
  { id: 's3', sozlesme_no: 'SZL-2026-4503', baslik: 'Ürün Lansmanı Hizmet Sözleşmesi', musteri_ad: 'Nova Teknoloji Ltd.', etkinlik_ad: 'Nova Ürün Lansmanı', tutar: 300000, durum: 'taslak', musteri_email: 'selin@novateknoloji.com', created_at: '2026-07-21T10:00:00Z' },
]

async function getData() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('sozlesmeler').select('*, etkinlikler(ad)').order('created_at', { ascending: false })
    return (data || []).map(x => ({ ...x, etkinlik_ad: x.etkinlikler?.ad }))
  } catch {
    return []
  }
}

export default async function SozlesmelerPage() {
  const sozlesmeler = await getData()
  return <SozlesmelerClient sozlesmeler={sozlesmeler} demo={isDevPreview()} />
}
