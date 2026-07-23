import { google } from 'googleapis'

/**
 * Google Sheets servisi ile form verilerini kaydet
 */

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
    ],
  })
}

/**
 * Yeni talep formunu Google Sheets'e kaydet
 * Sheet'in sütun sırası: Tarih | Ad Soyad | Telefon | E-posta | Etkinlik Türü | Misafir Sayısı | Bütçe | Mesaj | Durum
 */
export async function appendToSheet(talep) {
  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })

    const row = [
      new Date().toLocaleString('tr-TR'),
      talep.ad_soyad,
      talep.telefon,
      talep.email,
      talep.etkinlik_turu || '',
      talep.tahmini_misafir || '',
      talep.butce || '',
      talep.mesaj || '',
      'Yeni',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Talepler!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })

    return { success: true }
  } catch (error) {
    console.error('Google Sheets hatası:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Google Calendar'a etkinlik ekle
 */
export async function createCalendarEvent({ etkinlik, musteriEmail }) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const startDate = etkinlik.tarih
    const startTime = etkinlik.saat || '12:00:00'
    
    const event = {
      summary: `[iyi event] ${etkinlik.ad}`,
      description: `Müşteri: ${musteriEmail}\nEtkinlik Türü: ${etkinlik.tur}\nMisafir: ${etkinlik.tahmini_misafir_sayisi || '-'} kişi`,
      location: etkinlik.mekan_adres || etkinlik.mekan_adi || '',
      start: {
        dateTime: `${startDate}T${startTime}`,
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: `${startDate}T23:00:00`,
        timeZone: 'Europe/Istanbul',
      },
      attendees: musteriEmail ? [{ email: musteriEmail }] : [],
      colorId: '6', // Mandalay (turuncu)
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    })

    return { success: true, eventId: response.data.id, eventLink: response.data.htmlLink }
  } catch (error) {
    console.error('Google Calendar hatası:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Google Calendar etkinliğini güncelle
 */
export async function updateCalendarEvent({ googleEventId, etkinlik }) {
  try {
    const auth = getAuth()
    const calendar = google.calendar({ version: 'v3', auth })

    const startDate = etkinlik.tarih
    const startTime = etkinlik.saat || '12:00:00'

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: {
        summary: `[iyi event] ${etkinlik.ad}`,
        start: { dateTime: `${startDate}T${startTime}`, timeZone: 'Europe/Istanbul' },
        end: { dateTime: `${startDate}T23:00:00`, timeZone: 'Europe/Istanbul' },
        location: etkinlik.mekan_adres || '',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Google Calendar güncelleme hatası:', error)
    return { success: false, error: error.message }
  }
}
