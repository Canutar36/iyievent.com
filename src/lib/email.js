import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_1234567890')

const MARKA = {
  slate: '#2A3538', slateDeep: '#141A1B', orange: '#F05A28', cream: '#F6F3EA',
  tel: '0212 993 99 39', mail: 'bilgi@iyievent.com', site: 'iyievent.com',
}

/** Ortak kurumsal e-posta iskeleti. */
function epostaKabuk(icBaslik, govde) {
  return `
  <!DOCTYPE html>
  <html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:${MARKA.cream};font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:620px;margin:0 auto;background:#FFFFFF;">
      <div style="background:${MARKA.slate};padding:2.6rem 2.5rem;text-align:center;">
        <p style="font-family:Arial,sans-serif;font-size:0.68rem;letter-spacing:0.35em;text-transform:uppercase;color:${MARKA.orange};margin:0 0 0.5rem;">iyi event</p>
        <h1 style="font-family:Georgia,serif;font-weight:300;font-size:1.9rem;color:${MARKA.cream};margin:0;line-height:1.3;">${icBaslik}</h1>
      </div>
      <div style="padding:2.8rem 2.5rem;">${govde}</div>
      <div style="background:${MARKA.slateDeep};padding:1.8rem 2.5rem;text-align:center;">
        <p style="color:rgba(246,243,234,0.5);font-family:Arial,sans-serif;font-size:0.75rem;margin:0;line-height:1.7;">
          iyi event &nbsp;|&nbsp; ${MARKA.mail} &nbsp;|&nbsp; ${MARKA.tel}<br>${MARKA.site}
        </p>
      </div>
    </div>
  </body></html>`
}

/**
 * Davetiye e-postası gönder
 */
export async function sendDavetiyeEmail({ misafir, etkinlik }) {
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/davet/${misafir.qr_kod}`
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#F6F3EA;font-family:'Georgia',serif;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
        
        <!-- Header -->
        <div style="background:#2A3538;padding:3rem 2.5rem;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:#F05A28;margin:0 0 0.5rem;">iyi event</p>
          <h1 style="font-family:'Georgia',serif;font-weight:300;font-size:2rem;color:#F6F3EA;margin:0;line-height:1.3;">Sizi Aramızda Görmek İstiyoruz</h1>
        </div>

        <!-- Body -->
        <div style="padding:3rem 2.5rem;">
          <p style="font-size:1.1rem;color:#2A3538;line-height:1.8;">Sayın <strong>${misafir.ad_soyad}</strong>,</p>
          <p style="color:#555;line-height:1.8;">${etkinlik.ad} etkinliğine davetlisiniz.</p>
          
          <div style="background:#F6F3EA;border-left:3px solid #F05A28;padding:1.5rem 2rem;margin:2rem 0;">
            <div style="margin-bottom:0.8rem;">
              <span style="font-family:Arial,sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#F05A28;">ETKİNLİK</span>
              <p style="margin:0.2rem 0 0;font-size:1.2rem;color:#2A3538;font-weight:600;">${etkinlik.ad}</p>
            </div>
            ${etkinlik.tarih ? `
            <div style="margin-bottom:0.8rem;">
              <span style="font-family:Arial,sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#F05A28;">TARİH</span>
              <p style="margin:0.2rem 0 0;color:#2A3538;">${new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}${etkinlik.saat ? ' — ' + etkinlik.saat.slice(0,5) : ''}</p>
            </div>` : ''}
            ${etkinlik.mekan_adi ? `
            <div>
              <span style="font-family:Arial,sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#F05A28;">MEKAN</span>
              <p style="margin:0.2rem 0 0;color:#2A3538;">${etkinlik.mekan_adi}${etkinlik.mekan_adres ? '<br><small style="color:#888;">' + etkinlik.mekan_adres + '</small>' : ''}</p>
            </div>` : ''}
          </div>

          <div style="text-align:center;margin:2rem 0;">
            <a href="${qrUrl}?yanit=katilacak" style="display:inline-block;background:#F05A28;color:#fff;padding:1rem 2.5rem;text-decoration:none;font-family:Arial,sans-serif;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;margin-right:0.5rem;">Katılıyorum</a>
            <a href="${qrUrl}?yanit=katilmayacak" style="display:inline-block;background:transparent;color:#2A3538;padding:1rem 2.5rem;text-decoration:none;font-family:Arial,sans-serif;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;border:1px solid #2A3538;">Katılamıyorum</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#2A3538;padding:2rem 2.5rem;text-align:center;">
          <p style="color:rgba(246,243,234,0.4);font-family:Arial,sans-serif;font-size:0.75rem;margin:0;">
            iyi event | bilgi@iyievent.com | 0212 993 99 39
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  return await resend.emails.send({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: misafir.email,
    subject: `Davetiye: ${etkinlik.ad}`,
    html: htmlContent,
  })
}

/**
 * Müşteriye sözleşme hazır bildirimi gönder
 */
export async function sendSozlesmeEmail({ email, etkinlikAd, belgeAd }) {
  return await resend.emails.send({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Sözleşmeniz Hazır — ${etkinlikAd}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem;">
        <h2 style="color:#2A3538;">Sözleşmeniz Hazır</h2>
        <p>Sayın Müşterimiz,</p>
        <p><strong>${etkinlikAd}</strong> etkinliğinize ait <strong>${belgeAd}</strong> belgesi hesabınıza yüklendi.</p>
        <p>Belgeyi incelemek ve imzalamak için hesabınıza giriş yapın:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/giris" 
           style="display:inline-block;background:#F05A28;color:#fff;padding:0.8rem 2rem;text-decoration:none;margin-top:1rem;">
          Hesabıma Git
        </a>
        <hr style="margin:2rem 0;border:none;border-top:1px solid #eee;">
        <p style="color:#999;font-size:0.8rem;">iyi event | bilgi@iyievent.com | 0212 993 99 39</p>
      </div>
    `,
  })
}

/**
 * Ödeme hatırlatma maili
 */
export async function sendOdemeHatirlatmaEmail({ email, etkinlikAd, tutar, link }) {
  return await resend.emails.send({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Ödeme Hatırlatması — ${etkinlikAd}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem;">
        <h2 style="color:#2A3538;">Ödeme Hatırlatması</h2>
        <p><strong>${etkinlikAd}</strong> etkinliğinize ait <strong>${tutar.toLocaleString('tr-TR')} ₺</strong> tutarındaki ödeme bekliyor.</p>
        <a href="${link}" style="display:inline-block;background:#F05A28;color:#fff;padding:0.8rem 2rem;text-decoration:none;margin-top:1rem;">
          Ödeme Yap
        </a>
        <p style="color:#999;font-size:0.8rem;margin-top:2rem;">iyi event | bilgi@iyievent.com</p>
      </div>
    `,
  })
}

/**
 * Kurumsal tanıtım e-postası (E-Marketing → lead'e).
 * Şirketin tüm hizmet yelpazesini anlatan kapsamlı, kurumsal mail.
 */
export async function sendTanitimEmail({ email, ad }) {
  const hizmetBlok = (baslik, kalemler) => `
    <div style="margin-bottom:1.6rem;">
      <p style="font-family:Arial,sans-serif;font-size:0.66rem;letter-spacing:0.18em;text-transform:uppercase;color:${MARKA.orange};margin:0 0 0.5rem;">${baslik}</p>
      <p style="color:#555;font-size:0.95rem;line-height:1.7;margin:0;">${kalemler}</p>
    </div>`

  const govde = `
    <p style="font-size:1.05rem;color:${MARKA.slate};line-height:1.8;margin:0 0 1.2rem;">Sayın ${ad || 'Yetkili'},</p>
    <p style="color:#555;font-size:0.98rem;line-height:1.8;margin:0 0 1.8rem;">
      <strong>iyi event</strong> olarak, kurumsal galalardan bespoke düğünlere, açık hava festivallerinden
      çocuk şenliklerine kadar her ölçekte etkinliği uçtan uca planlıyor; konsept tasarımından
      operasyona, catering'den prodüksiyona tüm süreci tek elden kusursuzca yönetiyoruz.
    </p>

    <div style="background:${MARKA.cream};border-left:3px solid ${MARKA.orange};padding:1.6rem 1.8rem;margin:0 0 1.8rem;">
      ${hizmetBlok('Kurumsal', 'Bayi toplantıları & kongreler, lansmanlar, gala geceleri, açılış organizasyonları, fuar & stant, team building.')}
      ${hizmetBlok('Bireysel & Özel Gün', 'Evlilik teklifi, düğün & nişan, kına gecesi, söz & isteme, doğum günü, gender reveal, baby shower, sünnet.')}
      ${hizmetBlok('Tematik & Açık Hava', 'Lüks/bohem piknikler, açık hava sinema, festival & panayır, atölye & workshop, doğa organizasyonları.')}
      ${hizmetBlok('Çocuk & Geleneksel', 'Tematik çocuk partileri, AVM şenlikleri, iftar & sahur davetleri, anma & taziye ikramları.')}
    </div>

    <p style="color:#555;font-size:0.98rem;line-height:1.8;margin:0 0 1.8rem;">
      Ek hizmetlerimiz: LED ekran & ses/sahne/truss kiralama, sokak lezzetleri & kokteyl catering,
      prodüksiyon, ajans & medya hizmetleri. Bütçenize ve hayalinize özel bir teklif için memnuniyetle yanınızdayız.
    </p>

    <div style="text-align:center;margin:2rem 0 0.5rem;">
      <a href="tel:02129939939" style="display:inline-block;background:${MARKA.orange};color:#fff;padding:0.95rem 2.4rem;text-decoration:none;font-family:Arial,sans-serif;font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;">Hemen İletişime Geçin</a>
    </div>`

  return await resend.emails.send({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'iyi event — Kusursuz Etkinlik & Organizasyon Çözümleri',
    html: epostaKabuk('Etkinliklerinizi Sanata Dönüştürüyoruz', govde),
  })
}

/**
 * Randevu oluşturuldu e-postası (müşteriye).
 */
export async function sendRandevuEmail({ email, ad, tarih, saat, konum }) {
  const tarihStr = tarih
    ? new Date(tarih).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const govde = `
    <p style="font-size:1.05rem;color:${MARKA.slate};line-height:1.8;margin:0 0 1.2rem;">Sayın ${ad || 'Misafirimiz'},</p>
    <p style="color:#555;font-size:0.98rem;line-height:1.8;margin:0 0 1.8rem;">
      Görüşme talebiniz için teşekkür ederiz. Aşağıdaki bilgilerle randevunuz oluşturulmuştur.
      Çalışma arkadaşlarımız sizi arayarak net saati teyit edecek ve ziyaretinizi gerçekleştirecektir.
    </p>
    <div style="background:${MARKA.cream};border-left:3px solid ${MARKA.orange};padding:1.5rem 1.8rem;margin:0 0 1.8rem;">
      <div style="margin-bottom:0.9rem;">
        <span style="font-family:Arial,sans-serif;font-size:0.64rem;letter-spacing:0.15em;text-transform:uppercase;color:${MARKA.orange};">Tarih</span>
        <p style="margin:0.2rem 0 0;font-size:1.05rem;color:${MARKA.slate};">${tarihStr}${saat ? ' — ' + String(saat).slice(0, 5) : ''}</p>
      </div>
      ${konum ? `<div>
        <span style="font-family:Arial,sans-serif;font-size:0.64rem;letter-spacing:0.15em;text-transform:uppercase;color:${MARKA.orange};">Konum</span>
        <p style="margin:0.2rem 0 0;color:${MARKA.slate};">${konum}</p>
      </div>` : ''}
    </div>
    <p style="color:#555;font-size:0.95rem;line-height:1.8;margin:0;">Sabırsızlıkla bekliyoruz.</p>`

  return await resend.emails.send({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Randevunuz Oluşturuldu — iyi event',
    html: epostaKabuk('Randevunuz Oluşturuldu', govde),
  })
}

/**
 * Toplu kampanya e-postası (Dijital Pazarlama).
 * @param {object} p
 * @param {string[]} p.emails - Alıcı e-posta listesi
 * @param {string} p.konu
 * @param {string} p.baslik - Kabuk başlığı
 * @param {string} p.icerik - Gövde metni (düz metin/HTML)
 * Resend batch API ile gönderir (max 100/istek). Alıcı yoksa no-op.
 */
export async function sendKampanyaEmail({ emails = [], konu, baslik, icerik }) {
  const liste = (emails || []).filter(Boolean)
  if (liste.length === 0) return { gonderilen: 0 }

  const html = epostaKabuk(baslik || konu || 'iyi event', `
    <div style="font-size:0.98rem;color:#555;line-height:1.8;white-space:pre-wrap;">${icerik || ''}</div>
    <div style="text-align:center;margin:2rem 0 0.5rem;">
      <a href="https://iyievent.com" style="display:inline-block;background:${MARKA.orange};color:#fff;padding:0.9rem 2.2rem;text-decoration:none;font-family:Arial,sans-serif;font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;">Detaylı Bilgi</a>
    </div>`)

  // 100'erli gruplar halinde batch gönder
  let gonderilen = 0
  for (let i = 0; i < liste.length; i += 100) {
    const grup = liste.slice(i, i + 100)
    const payload = grup.map(to => ({ from: `iyi event <${process.env.EMAIL_FROM}>`, to, subject: konu || 'iyi event', html }))
    await resend.batch.send(payload)
    gonderilen += grup.length
  }
  return { gonderilen }
}
