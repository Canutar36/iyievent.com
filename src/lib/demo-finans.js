/**
 * Dev önizleme için örnek finans verisi (cari, kasa, fatura, tahsilat, gider).
 * Muhasebe / Faturalar / Tahsilatlar modülleri backend bağlı değilken bunu kullanır.
 */

export const DEMO_CARILER = [
  { id: 'c1', unvan: 'Arda Holding A.Ş.', tip: 'musteri', vergi_no: '1234567890', vergi_dairesi: 'Beşiktaş', telefon: '0212 444 55 66', email: 'muhasebe@ardaholding.com', bakiye: 300000 },
  { id: 'c2', unvan: 'Melis Sabancı', tip: 'musteri', telefon: '0532 111 22 33', email: 'melis@example.com', bakiye: 0 },
  { id: 'c3', unvan: 'Nova Teknoloji Ltd.', tip: 'musteri', vergi_no: '9876543210', vergi_dairesi: 'Şişli', telefon: '0535 888 99 00', email: 'selin@novateknoloji.com', bakiye: 150000 },
  { id: 'c4', unvan: 'Lezzet Catering', tip: 'tedarikci', vergi_no: '5556667778', vergi_dairesi: 'Kadıköy', telefon: '0212 555 10 20', email: 'info@lezzetcatering.com', bakiye: -85000 },
  { id: 'c5', unvan: 'ProSound Ses & Işık', tip: 'tedarikci', vergi_no: '1112223334', vergi_dairesi: 'Ümraniye', telefon: '0532 444 55 66', bakiye: -40000 },
]

export const DEMO_KASALAR = [
  { id: 'k1', ad: 'Merkez Kasa (Nakit)', tip: 'kasa', para_birimi: 'TRY', bakiye: 125000, aktif: true },
  { id: 'k2', ad: 'İş Bankası TL', tip: 'banka', para_birimi: 'TRY', bakiye: 840000, aktif: true },
  { id: 'k3', ad: 'PayTR Sanal POS', tip: 'pos', para_birimi: 'TRY', bakiye: 300000, aktif: true },
]

export const DEMO_KASA_HAREKETLERI = [
  { id: 'kh1', kasa_id: 'k2', tur: 'giris', tutar: 300000, tarih: '2026-07-20', kategori: 'Tahsilat', aciklama: 'Arda Holding — kapora', ref_tur: 'tahsilat' },
  { id: 'kh2', kasa_id: 'k3', tur: 'giris', tutar: 300000, tarih: '2026-07-18', kategori: 'Tahsilat', aciklama: 'Midnight Aegean — PayTR', ref_tur: 'tahsilat' },
  { id: 'kh3', kasa_id: 'k1', tur: 'cikis', tutar: 85000, tarih: '2026-07-15', kategori: 'Tedarikçi', aciklama: 'Lezzet Catering ödemesi', ref_tur: 'gider' },
  { id: 'kh4', kasa_id: 'k2', tur: 'cikis', tutar: 40000, tarih: '2026-07-12', kategori: 'Tedarikçi', aciklama: 'ProSound avans', ref_tur: 'gider' },
  { id: 'kh5', kasa_id: 'k1', tur: 'giris', tutar: 50000, tarih: '2026-07-10', kategori: 'Tahsilat', aciklama: 'Zeynep Koç — nakit kapora', ref_tur: 'tahsilat' },
]

export const DEMO_FATURALAR = [
  { id: 'f1', fatura_no: 'IYI2026000042', cari_id: 'c1', cari_unvan: 'Arda Holding A.Ş.', etkinlik_id: null, etkinlik_ad: 'Bosphorus Ethereal Gala', tur: 'satis', tarih: '2026-07-19', kdv_haric: 583333, kdv: 116667, toplam: 700000, durum: 'kesildi', nilvera_uuid: 'stub-a1b2c3d4-x1', nilvera_durum: 'onaylandi', fatura_tipi: 'e_fatura', kalemler: [{ ad: 'Kurumsal Gala Organizasyonu', adet: 1, birim: 'adet', birim_fiyat: 583333, kdv_orani: 20, tutar: 583333 }] },
  { id: 'f2', fatura_no: 'IYI2026000041', cari_id: 'c3', cari_unvan: 'Nova Teknoloji Ltd.', etkinlik_ad: 'Nova Ürün Lansmanı', tur: 'satis', tarih: '2026-07-10', kdv_haric: 250000, kdv: 50000, toplam: 300000, durum: 'kesildi', nilvera_uuid: 'stub-e5f6g7h8-x2', nilvera_durum: 'onaylandi', fatura_tipi: 'e_fatura', kalemler: [{ ad: 'Ürün Lansmanı Hizmeti', adet: 1, birim: 'adet', birim_fiyat: 250000, kdv_orani: 20, tutar: 250000 }] },
  { id: 'f3', fatura_no: null, cari_id: 'c2', cari_unvan: 'Melis Sabancı', etkinlik_ad: 'Olive Grove Wedding', tur: 'satis', tarih: '2026-07-22', kdv_haric: 106667, kdv: 21333, toplam: 128000, durum: 'taslak', nilvera_uuid: null, nilvera_durum: null, fatura_tipi: 'e_arsiv', kalemler: [{ ad: 'Düğün Organizasyonu — kapora', adet: 1, birim: 'adet', birim_fiyat: 106667, kdv_orani: 20, tutar: 106667 }] },
]

export const DEMO_TAHSILATLAR = [
  { id: 't1', cari_id: 'c1', cari_unvan: 'Arda Holding A.Ş.', fatura_id: 'f1', etkinlik_ad: 'Bosphorus Ethereal Gala', tutar: 300000, tarih: '2026-07-20', yontem: 'havale', kasa_id: 'k2', kasa_ad: 'İş Bankası TL' },
  { id: 't2', cari_id: 'c3', cari_unvan: 'Midnight Aegean Soiree', etkinlik_ad: 'Midnight Aegean Soiree', tutar: 300000, tarih: '2026-07-18', yontem: 'paytr', kasa_id: 'k3', kasa_ad: 'PayTR Sanal POS' },
  { id: 't3', cari_id: 'c2', cari_unvan: 'Zeynep Koç', etkinlik_ad: 'Yat Doğum Günü', tutar: 50000, tarih: '2026-07-10', yontem: 'nakit', kasa_id: 'k1', kasa_ad: 'Merkez Kasa' },
]

export const DEMO_GIDERLER = [
  { id: 'g1', etkinlik_ad: 'Bosphorus Ethereal Gala', tedarikci_ad: 'Lezzet Catering', kategori: 'Catering', aciklama: 'Gala menüsü 300 kişi', tutar: 85000, tarih: '2026-07-15', durum: 'odendi' },
  { id: 'g2', etkinlik_ad: 'Bosphorus Ethereal Gala', tedarikci_ad: 'ProSound Ses & Işık', kategori: 'Ses/Işık', aciklama: 'Sahne & LED kurulum', tutar: 120000, tarih: '2026-07-16', durum: 'bekliyor' },
  { id: 'g3', etkinlik_ad: 'Nova Ürün Lansmanı', tedarikci_ad: 'Gül Çiçekçilik', kategori: 'Süsleme', aciklama: 'Sahne süsleme', tutar: 18000, tarih: '2026-07-08', durum: 'odendi' },
]

// Etkinlik bazlı Kâr-Zarar (P&L)
export const DEMO_PNL = [
  { etkinlik: 'Bosphorus Ethereal Gala', gelir: 700000, gider: 205000, kar: 495000 },
  { etkinlik: 'Nova Ürün Lansmanı', gelir: 300000, gider: 18000, kar: 282000 },
  { etkinlik: 'Midnight Aegean Soiree', gelir: 300000, gider: 95000, kar: 205000 },
  { etkinlik: 'Yat Doğum Günü', gelir: 120000, gider: 42000, kar: 78000 },
]
