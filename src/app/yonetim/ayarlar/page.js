import { createClient, createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { isSuperAdmin } from '@/lib/roles'
import { redirect } from 'next/navigation'
import AyarlarClient from './AyarlarClient'

export const metadata = { title: 'Ayarlar | Yönetim' }

const DEMO_EKIP = [
  { id: 'u1', full_name: 'Deniz Yılmaz', email: 'deniz@iyievent.com', role: 'yonetici' },
  { id: 'u2', full_name: 'Selin Aksoy', email: 'selin@iyievent.com', role: 'operasyon' },
  { id: 'u3', full_name: 'Kaan Öztürk', email: 'kaan@iyievent.com', role: 'satis' },
  { id: 'u4', full_name: 'Merve Şahin', email: 'merve@iyievent.com', role: 'muhasebe' },
]
const DEMO_AKTIVITE = [
  { id: 'a1', personel_ad: 'Kaan Öztürk', eylem: 'teklif_olusturuldu', ozet: 'TKF-2026-4821 — Arda Holding (700.000 ₺)', hedef_tur: 'teklif', created_at: '2026-07-22T14:30:00Z' },
  { id: 'a2', personel_ad: 'Merve Şahin', eylem: 'fatura_kesildi', ozet: 'IYI2026000042 — Arda Holding A.Ş. (700.000 ₺)', hedef_tur: 'fatura', created_at: '2026-07-22T11:10:00Z' },
  { id: 'a3', personel_ad: 'Selin Aksoy', eylem: 'sozlesme_durum', ozet: 'Kurumsal Gala Hizmet Sözleşmesi → imzalandi', hedef_tur: 'sozlesme', created_at: '2026-07-21T16:45:00Z' },
  { id: 'a4', personel_ad: 'Kaan Öztürk', eylem: 'lead_eklendi', ozet: 'Yeni lead: Nova Teknoloji Ltd.', hedef_tur: 'lead', created_at: '2026-07-21T09:20:00Z' },
  { id: 'a5', personel_ad: 'Selin Aksoy', eylem: 'randevu_olusturuldu', ozet: 'Melis Sabancı — yüz yüze görüşme (22 Tem)', hedef_tur: 'randevu', created_at: '2026-07-20T13:00:00Z' },
]

async function getData() {
  if (isDevPreview()) return { ekip: DEMO_EKIP, aktivite: DEMO_AKTIVITE }
  try {
    const supabase = createServiceClient()
    const [e, a] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role').in('role', ['satis', 'operasyon', 'muhasebe', 'yonetici']).order('full_name'),
      supabase.from('aktiviteler').select('*').order('created_at', { ascending: false }).limit(40),
    ])
    return { ekip: e.data || [], aktivite: a.data || [] }
  } catch {
    return { ekip: [], aktivite: [] }
  }
}

export default async function AyarlarPage() {
  // Ayarlar YALNIZCA sistem sahibine (süper-admin) açıktır.
  if (!isDevPreview()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isSuperAdmin(user.email)) redirect('/yonetim')
  }
  const { ekip, aktivite } = await getData()
  return <AyarlarClient ekip={ekip} aktivite={aktivite} demo={isDevPreview()} />
}
