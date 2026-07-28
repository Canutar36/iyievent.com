/**
 * Netgsm SMS API entegrasyonu
 * Docs: https://www.netgsm.com.tr/dokuman/
 */

const NETGSM_API_URL = 'https://api.netgsm.com.tr/sms/send/get'

/** Netgsm hata kodları → anlaşılır Türkçe mesaj. */
const NETGSM_HATA = {
  '20': 'Mesaj metni hatalı veya karakter sınırı aşıldı.',
  '30': 'Geçersiz kullanıcı adı/şifre ya da API erişim izniniz yok (Netgsm panelinden API erişimini açın).',
  '40': 'Mesaj başlığı (gönderici adı) Netgsm’de tanımlı/onaylı değil.',
  '50': 'İYS kontrollü gönderimde alıcının onayı yok (ticari ileti izni gerekli).',
  '51': 'İYS marka bilgisi hatalı veya eksik.',
  '70': 'Hatalı sorgu — parametrelerden biri eksik/yanlış.',
  '80': 'Gönderim sınır aşımı.',
  '85': 'Mükerrer gönderim sınırı — aynı numaraya kısa sürede çok fazla mesaj.',
}

/** Telefon numarasını Netgsm formatına çevirir (90XXXXXXXXXX). Geçersizse null. */
export function normalizeTelefon(p) {
  if (!p) return null
  let t = String(p).replace(/\D/g, '')
  if (t.startsWith('90')) t = t.slice(2)
  else if (t.startsWith('0')) t = t.slice(1)
  // Türkiye cep/sabit: 10 hane (5XX / 2XX / 3XX / 4XX)
  if (t.length !== 10) return null
  return '90' + t
}

/**
 * SMS metnini analiz eder: Türkçe karakter varsa 70, yoksa 160 karakter/segment.
 * @returns {{uzunluk:number, turkce:boolean, segment:number, limit:number}}
 */
export function smsBilgi(message = '') {
  const turkce = /[çğıöşüÇĞİÖŞÜ]/.test(message)
  const limit = turkce ? 70 : 160
  const cokluLimit = turkce ? 67 : 153
  const uzunluk = message.length
  const segment = uzunluk === 0 ? 0 : uzunluk <= limit ? 1 : Math.ceil(uzunluk / cokluLimit)
  return { uzunluk, turkce, segment, limit }
}

/** Türkçe karakterleri sadeleştirir (tek SMS'e sığdırmak / maliyet için). */
export function turkceSadelestir(s = '') {
  const m = { ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U' }
  return s.replace(/[çÇğĞıİöÖşŞüÜ]/g, c => m[c] || c)
}

/**
 * Tek veya toplu SMS gönder (Netgsm).
 * @param {string|string[]} phones - Telefon numaraları
 * @param {string} message - Mesaj içeriği
 * @returns {Promise<{success:boolean, bulkId?:string, gonderilen?:number, error?:string, gecersiz?:number}>}
 */
export async function sendSMS(phones, message) {
  if (!message?.trim()) return { success: false, error: 'Mesaj metni boş.' }
  if (!process.env.NETGSM_USERCODE || !process.env.NETGSM_PASSWORD) {
    return { success: false, error: 'Netgsm bilgileri tanımlı değil (NETGSM_USERCODE / NETGSM_PASSWORD).' }
  }

  const phoneList = Array.isArray(phones) ? phones : [phones]
  const normalized = [...new Set(phoneList.map(normalizeTelefon).filter(Boolean))]
  const gecersiz = phoneList.length - normalized.length
  if (normalized.length === 0) return { success: false, error: 'Geçerli telefon numarası yok.', gecersiz }

  const params = new URLSearchParams({
    usercode: process.env.NETGSM_USERCODE,
    password: process.env.NETGSM_PASSWORD,
    gsmno: normalized.join(','),
    message,
    msgheader: process.env.NETGSM_MSGHEADER || '',
    dil: 'TR',
  })

  try {
    const response = await fetch(`${NETGSM_API_URL}?${params.toString()}`)
    const text = (await response.text()).trim()
    const code = text.split(' ')[0]

    if (code === '00' || code === '01' || code === '02') {
      return { success: true, bulkId: text.split(' ')[1], gonderilen: normalized.length, gecersiz }
    }
    const aciklama = NETGSM_HATA[code] || `Netgsm hata kodu: ${text}`
    console.error('Netgsm SMS hatası:', text, '→', aciklama)
    return { success: false, error: aciklama, kod: code, gecersiz }
  } catch (error) {
    console.error('SMS gönderim hatası:', error)
    return { success: false, error: 'Bağlantı hatası: ' + error.message }
  }
}

/**
 * Kurumsal tanıtım SMS metni (ticari ileti).
 * Türkçe karaktersiz → tek segment (160) içinde kalır, maliyet düşer.
 */
export function tanitimSmsMetni() {
  return turkceSadelestir(
    'iyi event ile kurumsal etkinlikleriniz emin ellerde. Gala, lansman, bayi toplantisi, dugun ve ozel organizasyonlar. Bilgi: 0212 993 99 39 iyievent.com'
  )
}

/** Tanıtım SMS'i gönder (tek numara veya liste). */
export async function sendTanitimSMS(phones, metin) {
  return sendSMS(phones, metin || tanitimSmsMetni())
}

/**
 * Davetiye SMS'i gönder
 */
export async function sendDavetiyeSMS({ misafir, etkinlik }) {
  const mesaj = `${etkinlik.ad} etkinliğine davetlisiniz! Tarih: ${etkinlik.tarih ? new Date(etkinlik.tarih).toLocaleDateString('tr-TR') : 'TBD'}. Mekan: ${etkinlik.mekan_adi || 'Belirtilecek'}. - iyi event`
  return sendSMS(misafir.telefon, mesaj)
}

/**
 * Etkinlik hatırlatma SMS'i (1 gün önce)
 */
export async function sendHatirlatmaSMS({ telefon, etkinlikAd, tarih, mekan }) {
  const mesaj = `Hatırlatma: ${etkinlikAd} etkinliği yarın ${tarih} tarihinde ${mekan} mekanında. iyi event - 0212 993 99 39`
  return sendSMS(telefon, mesaj)
}
