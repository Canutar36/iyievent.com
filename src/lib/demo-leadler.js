/**
 * Dev önizleme için ~120 satırlık gerçekçi İSO-tarzı lead verisi üretir.
 * Gerçek Supabase bağlanınca bunun yerine sunucu-taraflı sorgu çalışır;
 * bu üreteç yalnızca dev'de sayfalama/arama/filtre davranışını göstermek için.
 */

const ILCELER = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Ümraniye', 'Beylikdüzü', 'Bağcılar', 'Pendik', 'Ataşehir', 'Kağıthane', 'Maltepe', 'Esenyurt', 'Başakşehir', 'Sancaktepe', 'Tuzla', 'Sultanbeyli']
const SEKTORLER = ['Tekstil', 'Gıda', 'İnşaat', 'Metal İşleme', 'Kimya', 'Mobilya', 'Otomotiv Yan Sanayi', 'Bilişim', 'Lojistik', 'Ambalaj', 'Makine', 'Plastik']
const ARAMA_DURUMLARI = ['aranmadi', 'aranmadi', 'aranmadi', 'ulasildi', 'mesgul', 'ilgilenmiyor', 'randevu', 'geri_ara', 'ulasilamadi']
const LEAD_DURUMLARI = ['yeni', 'yeni', 'yeni', 'iletisimde', 'teklif', 'kazanildi', 'kaybedildi']
const ONEK = ['Ak', 'Öz', 'Yıldız', 'Anadolu', 'Marmara', 'Ege', 'Star', 'Mega', 'Elit', 'Doğa', 'Nova', 'Prime', 'Altın', 'Boğaziçi', 'Genç', 'Usta', 'Kılıç', 'Demir', 'Aslan', 'Güneş']
const TAKI = ['San. ve Tic. A.Ş.', 'Ltd. Şti.', 'Tic. Ltd. Şti.', 'San. Ltd. Şti.', 'A.Ş.', 'İth. İhr. Ltd. Şti.']
const YETKILILER = ['Ahmet Yılmaz', 'Mehmet Demir', 'Ayşe Kaya', 'Fatma Şahin', 'Mustafa Çelik', 'Zeynep Arslan', 'Ali Öztürk', 'Emine Doğan', 'Hüseyin Koç', 'Hatice Yıldız']

// Deterministik üretim (her yenilemede aynı sonuç)
function rng(seed) { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff } }

export function demoLeadler(adet = 120) {
  const r = rng(42)
  const pick = arr => arr[Math.floor(r() * arr.length)]
  const list = []
  for (let i = 1; i <= adet; i++) {
    const b2b = r() > 0.12
    const sektor = pick(SEKTORLER)
    const unvan = b2b ? `${pick(ONEK)}${pick(ONEK).toLocaleLowerCase('tr')} ${sektor.split(' ')[0]} ${pick(TAKI)}` : `${pick(YETKILILER)}`
    const telefon = `0212 ${String(200 + Math.floor(r() * 799)).padStart(3, '0')} ${String(Math.floor(r() * 90) + 10)} ${String(Math.floor(r() * 90) + 10)}`
    list.push({
      id: 'demo-' + i,
      tip: b2b ? 'b2b' : 'b2c',
      ad_unvan: unvan,
      yetkili_kisi: b2b ? pick(YETKILILER) : null,
      telefon,
      email: r() > 0.15 ? `info${i}@${pick(ONEK).toLocaleLowerCase('tr')}${sektor.split(' ')[0].toLocaleLowerCase('tr')}.com.tr` : null,
      il: 'İstanbul',
      ilce: pick(ILCELER),
      sektor,
      vergi_no: String(1000000000 + Math.floor(r() * 8999999999)).slice(0, 10),
      ilgilenilen_etkinlik: r() > 0.6 ? 'Kurumsal Etkinlik' : null,
      kaynak: 'iso',
      durum: pick(LEAD_DURUMLARI),
      arama_durumu: pick(ARAMA_DURUMLARI),
      durum_notu: '',
      tanitim_maili_gonderildi: r() > 0.7,
      created_at: new Date(Date.now() - Math.floor(r() * 60) * 86400000).toISOString(),
    })
  }
  return list
}

export const ISTANBUL_ILCELER = ILCELER
export const DEMO_SEKTORLER = SEKTORLER
