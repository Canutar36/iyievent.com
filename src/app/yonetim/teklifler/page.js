import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import TekliflerClient from './TekliflerClient'

export const metadata = { title: 'Teklifler | Yönetim' }

const DEMO = [
  { id: '1', teklif_no: 'TKF-2026-4821', musteri_ad: 'Arda Holding', musteri_telefon: '0212 444 55 66', musteri_email: 'etkinlik@ardaholding.com', hizmet_ad: 'Kurumsal Gala Gecesi', kategori: 'kurumsal', kisi_sayisi: 300, ara_toplam: 660000, ekstra_toplam: 65000, indirim: 25000, toplam: 700000, durum: 'gonderildi', created_at: '2026-07-20T14:30:00Z', kalemler: [ { tur: 'hizmet', ad: 'Kurumsal Gala Gecesi', birim: 'kisi', adet: 300, birim_fiyat: 2200, tutar: 660000 }, { tur: 'ekstra', ad: 'Şarkıcı / Canlı Müzik', birim: 'sabit', adet: 1, birim_fiyat: 35000, tutar: 35000 }, { tur: 'ekstra', ad: 'LED Ekran', birim: 'adet', adet: 2, birim_fiyat: 12000, tutar: 24000 }, { tur: 'ekstra', ad: 'Sis Füzesi Efekti', birim: 'adet', adet: 2, birim_fiyat: 2500, tutar: 5000 } ] },
  { id: '2', teklif_no: 'TKF-2026-4820', musteri_ad: 'Melis Sabancı', musteri_telefon: '0532 111 22 33', musteri_email: 'melis@example.com', hizmet_ad: 'Kır Düğünü', kategori: 'bireysel', kisi_sayisi: 250, ara_toplam: 875000, ekstra_toplam: 53000, indirim: 0, toplam: 928000, durum: 'kabul', created_at: '2026-07-18T10:00:00Z', kalemler: [ { tur: 'hizmet', ad: 'Kır Düğünü', birim: 'kisi', adet: 250, birim_fiyat: 3500, tutar: 875000 }, { tur: 'ekstra', ad: 'Karşılama Kokteyli', birim: 'kisi', adet: 250, birim_fiyat: 212, tutar: 53000 } ] },
  { id: '3', teklif_no: 'TKF-2026-4818', musteri_ad: 'Zeynep Koç', musteri_telefon: '0533 777 88 99', musteri_email: 'zeynep.koc@example.com', hizmet_ad: 'Lüks Bohem Piknik', kategori: 'tematik', kisi_sayisi: 60, ara_toplam: 72000, ekstra_toplam: 23000, indirim: 0, toplam: 95000, durum: 'taslak', created_at: '2026-07-17T09:00:00Z', kalemler: [ { tur: 'hizmet', ad: 'Lüks Bohem Piknik', birim: 'kisi', adet: 60, birim_fiyat: 1200, tutar: 72000 }, { tur: 'ekstra', ad: 'Dondurma Arabası', birim: 'sabit', adet: 1, birim_fiyat: 15000, tutar: 15000 }, { tur: 'ekstra', ad: 'Patlamış Mısır Standı', birim: 'sabit', adet: 1, birim_fiyat: 8000, tutar: 8000 } ] },
  { id: '4', teklif_no: 'TKF-2026-4810', musteri_ad: 'Deniz Yılmaz', musteri_telefon: '0534 222 33 44', musteri_email: 'deniz@example.com', hizmet_ad: 'Tematik Çocuk Doğum Günü', kategori: 'cocuk', kisi_sayisi: 0, ara_toplam: 45000, ekstra_toplam: 15000, indirim: 0, toplam: 60000, durum: 'goruldu', created_at: '2026-07-15T16:00:00Z', kalemler: [ { tur: 'hizmet', ad: 'Tematik Çocuk Doğum Günü', birim: 'sabit', adet: 1, birim_fiyat: 45000, tutar: 45000 }, { tur: 'ekstra', ad: 'Palyaço & Yüz Boyama', birim: 'sabit', adet: 1, birim_fiyat: 6000, tutar: 6000 }, { tur: 'ekstra', ad: 'Çocuk Eğlence Ekibi', birim: 'sabit', adet: 1, birim_fiyat: 9000, tutar: 9000 } ] },
]

async function getTeklifler() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('teklifler').select('*').order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function TekliflerPage() {
  const teklifler = await getTeklifler()
  return <TekliflerClient teklifler={teklifler} demo={isDevPreview()} />
}
