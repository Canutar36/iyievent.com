/**
 * Netgsm SMS API entegrasyonu
 * Docs: https://www.netgsm.com.tr/dokuman/
 */

const NETGSM_API_URL = 'https://api.netgsm.com.tr/sms/send/get'

/**
 * Tek veya toplu SMS gönder
 * @param {string|string[]} phones - Telefon numaraları (başında 90 olmadan, ör: "5321234567")
 * @param {string} message - Mesaj içeriği (max 160 karakter tek SMS)
 */
export async function sendSMS(phones, message) {
  const phoneList = Array.isArray(phones) ? phones : [phones]
  
  // Numaraları normalize et (90 ile başlamazsa ekle)
  const normalizedPhones = phoneList.map(p => {
    const clean = p.replace(/\D/g, '')
    if (clean.startsWith('90')) return clean
    if (clean.startsWith('0')) return '9' + clean
    return '90' + clean
  })

  const params = new URLSearchParams({
    usercode: process.env.NETGSM_USERCODE,
    password: process.env.NETGSM_PASSWORD,
    gsmno: normalizedPhones.join(','),
    message: message,
    msgheader: process.env.NETGSM_MSGHEADER,
    dil: 'TR',
  })

  try {
    const response = await fetch(`${NETGSM_API_URL}?${params.toString()}`)
    const text = await response.text()
    
    // Netgsm yanıtı: "00 XXXXXXXXX" başarılı, "20" hata vb.
    const code = text.split(' ')[0]
    if (code === '00' || code === '01' || code === '02') {
      return { success: true, bulkId: text.split(' ')[1] }
    } else {
      console.error('Netgsm SMS hatası:', text)
      return { success: false, error: text }
    }
  } catch (error) {
    console.error('SMS gönderim hatası:', error)
    return { success: false, error: error.message }
  }
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
