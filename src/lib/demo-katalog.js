/**
 * Dev önizleme için örnek katalog verisi.
 * Katalog modülü ve Teklif Builder backend bağlı değilken bunu kullanır.
 */

export const DEMO_HIZMETLER = [
  { id: 'h1', ad: 'Lüks Bohem Piknik', kategori: 'tematik', fiyatlandirma_tipi: 'kisi_basi', birim_fiyat: 1200, min_kisi: 10, aktif: true, aciklama: 'Sahilde/ormanda yer minderleri, ahşap masalar, şık catering.', kademeler: [] },
  { id: 'h2', ad: 'Kır Düğünü', kategori: 'bireysel', fiyatlandirma_tipi: 'kisi_basi', birim_fiyat: 3500, min_kisi: 50, aktif: true, aciklama: 'Konsept tasarım, catering, süsleme ve koordinasyon dahil.', kademeler: [] },
  { id: 'h3', ad: 'Kurumsal Gala Gecesi', kategori: 'kurumsal', fiyatlandirma_tipi: 'kademeli', birim_fiyat: 2500, min_kisi: 100, aktif: true, aciklama: 'Sahne, prodüksiyon, ikram ve VIP karşılama.', kademeler: [
    { min_kisi: 0, max_kisi: 250, birim_fiyat: 2500 },
    { min_kisi: 251, max_kisi: 500, birim_fiyat: 2200 },
    { min_kisi: 501, max_kisi: null, birim_fiyat: 2000 },
  ] },
  { id: 'h4', ad: 'Tematik Çocuk Doğum Günü', kategori: 'cocuk', fiyatlandirma_tipi: 'sabit', birim_fiyat: 45000, min_kisi: 0, aktif: true, aciklama: 'Konsept dekor, animasyon, pasta ve hediyelikler.', kademeler: [] },
  { id: 'h5', ad: 'İftar & Sahur Daveti', kategori: 'dini', fiyatlandirma_tipi: 'kisi_basi', birim_fiyat: 800, min_kisi: 20, aktif: true, aciklama: 'Bahçe/salon iftar organizasyonu, ikram ve süsleme.', kademeler: [] },
  { id: 'h6', ad: 'Evlilik Teklifi Kurgusu', kategori: 'bireysel', fiyatlandirma_tipi: 'sabit', birim_fiyat: 28000, min_kisi: 0, aktif: true, aciklama: 'Kumsal/yat/kapalı mekan özel teklif kurulumu.', kademeler: [] },
]

export const DEMO_EKSTRALAR = [
  { id: 'e1', ad: 'Dondurma Arabası', grup: 'İkram', birim: 'sabit', birim_fiyat: 15000, aktif: true },
  { id: 'e2', ad: 'Patlamış Mısır Standı', grup: 'İkram', birim: 'sabit', birim_fiyat: 8000, aktif: true },
  { id: 'e3', ad: 'Karşılama Kokteyli', grup: 'İkram', birim: 'kisi', birim_fiyat: 250, aktif: true },
  { id: 'e4', ad: 'Şarkıcı / Canlı Müzik', grup: 'Eğlence', birim: 'sabit', birim_fiyat: 35000, aktif: true },
  { id: 'e5', ad: 'Palyaço & Yüz Boyama', grup: 'Eğlence', birim: 'sabit', birim_fiyat: 6000, aktif: true },
  { id: 'e6', ad: 'Çocuk Eğlence Ekibi', grup: 'Eğlence', birim: 'sabit', birim_fiyat: 9000, aktif: true },
  { id: 'e7', ad: 'Sis Füzesi Efekti', grup: 'Teknik', birim: 'adet', birim_fiyat: 2500, aktif: true },
  { id: 'e8', ad: 'LED Ekran', grup: 'Teknik', birim: 'adet', birim_fiyat: 12000, aktif: true },
  { id: 'e9', ad: 'Profesyonel Fotoğraf & Video', grup: 'Prodüksiyon', birim: 'sabit', birim_fiyat: 18000, aktif: true },
]

export const KATEGORILER = [
  { key: 'kurumsal', label: 'Kurumsal' },
  { key: 'bireysel', label: 'Bireysel & Özel Gün' },
  { key: 'tematik', label: 'Tematik & Açık Hava' },
  { key: 'cocuk', label: 'Çocuk' },
  { key: 'dini', label: 'Dini & Geleneksel' },
]
