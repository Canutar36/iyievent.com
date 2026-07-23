import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import KaynaklarClient from './KaynaklarClient'

export const metadata = { title: 'Kaynaklar | Yönetim' }

const DEMO = {
  tedarikciler: [
    { id: 't1', ad: 'Lezzet Catering', kategori: 'Catering', yetkili: 'Hakan Usta', telefon: '0212 555 10 20', email: 'info@lezzetcatering.com', aktif: true },
    { id: 't2', ad: 'ProSound Ses & Işık', kategori: 'Ses/Işık', yetkili: 'Emre Yıldız', telefon: '0532 444 55 66', email: 'emre@prosound.com', aktif: true },
    { id: 't3', ad: 'Bahçe Çadır Kiralama', kategori: 'Çadır', yetkili: 'Murat Kaya', telefon: '0555 123 45 67', aktif: true },
    { id: 't4', ad: 'Gül Çiçekçilik', kategori: 'Çiçek', yetkili: 'Ayşe Gül', telefon: '0533 987 65 43', aktif: true },
  ],
  envanter: [
    { id: 'e1', ad: 'Yuvarlak Masa (10 kişilik)', kategori: 'Masa', adet_toplam: 40, birim: 'adet', gunluk_kira: 120, aktif: true },
    { id: 'e2', ad: 'Chiavari Sandalye', kategori: 'Sandalye', adet_toplam: 400, birim: 'adet', gunluk_kira: 25, aktif: true },
    { id: 'e3', ad: 'LED Ekran 3x2m', kategori: 'Teknik', adet_toplam: 3, birim: 'adet', gunluk_kira: 4500, aktif: true },
    { id: 'e4', ad: 'Truss Sistemi (3m)', kategori: 'Teknik', adet_toplam: 24, birim: 'adet', gunluk_kira: 300, aktif: true },
    { id: 'e5', ad: 'Ahşap Piknik Masası', kategori: 'Masa', adet_toplam: 20, birim: 'adet', gunluk_kira: 200, aktif: true },
  ],
  personel: [
    { id: 'p1', ad: 'Selin Aksoy', rol_gorev: 'Koordinatör', telefon: '0532 111 22 33', gunluk_ucret: 2500, aktif: true },
    { id: 'p2', ad: 'Can Demir', rol_gorev: 'Host', telefon: '0533 222 33 44', gunluk_ucret: 1200, aktif: true },
    { id: 'p3', ad: 'DJ Kaan', rol_gorev: 'DJ', telefon: '0535 333 44 55', gunluk_ucret: 5000, aktif: true },
    { id: 'p4', ad: 'Merve Şahin', rol_gorev: 'Host', telefon: '0536 444 55 66', gunluk_ucret: 1200, aktif: true },
    { id: 'p5', ad: 'Ahmet Usta', rol_gorev: 'Şef', telefon: '0537 555 66 77', gunluk_ucret: 3500, aktif: true },
  ],
}

async function getData() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const [t, e, p] = await Promise.all([
      supabase.from('tedarikciler').select('*').order('ad'),
      supabase.from('envanter').select('*').order('kategori').order('ad'),
      supabase.from('personel').select('*').order('rol_gorev').order('ad'),
    ])
    return { tedarikciler: t.data || [], envanter: e.data || [], personel: p.data || [] }
  } catch {
    return { tedarikciler: [], envanter: [], personel: [] }
  }
}

export default async function KaynaklarPage() {
  const data = await getData()
  return <KaynaklarClient data={data} demo={isDevPreview()} />
}
