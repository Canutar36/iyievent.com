import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_PORT || '465') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const MARKA = {
  slate: '#2A3538', slateDeep: '#141A1B', orange: '#F05A28', cream: '#F6F3EA',
  tel: '0212 993 99 39', mail: 'bilgi@iyievent.com', site: 'iyievent.com',
}

function epostaKabuk(icBaslik, govde) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iyievent-com.vercel.app'
  return `
  <!DOCTYPE html>
  <html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:${MARKA.cream};font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:620px;margin:0 auto;background:#FFFFFF;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
        <tr><td align="center" style="padding:34px 32px 10px;">
          <img src="${APP_URL}/assets/email/logo.png" alt="iyi event" width="190" style="display:block;border:0;width:190px;max-width:58%;height:auto;" />
        </td></tr>
        <tr><td style="padding:0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${MARKA.slate};padding:36px 30px;text-align:center;">
            <h1 style="font-family:Georgia,serif;font-weight:300;font-size:1.8rem;color:${MARKA.cream};margin:0;line-height:1.3;">${icBaslik}</h1>
          </td></tr></table>
        </td></tr>
      </table>
      <div style="padding:2.8rem 2.5rem;">${govde}</div>
      <div style="background:${MARKA.slateDeep};padding:1.8rem 2.5rem;text-align:center;">
        <p style="color:rgba(246,243,234,0.5);font-family:Arial,sans-serif;font-size:0.75rem;margin:0;line-height:1.7;">
          iyi event &nbsp;|&nbsp; ${MARKA.mail} &nbsp;|&nbsp; ${MARKA.tel}<br>${MARKA.site}
        </p>
      </div>
    </div>
  </body></html>`
}

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

  const transporter = getTransporter()
  return await transporter.sendMail({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: misafir.email,
    subject: `Davetiye: ${etkinlik.ad}`,
    html: htmlContent,
  })
}

export async function sendSozlesmeEmail({ email, etkinlikAd, belgeAd }) {
  const transporter = getTransporter()
  return await transporter.sendMail({
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

export async function sendOdemeHatirlatmaEmail({ email, etkinlikAd, tutar, link }) {
  const transporter = getTransporter()
  return await transporter.sendMail({
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://iyievent-com.vercel.app'

export function tanitimEmailHtml(ad = '') {
  const S = MARKA.slate, D = MARKA.slateDeep, O = MARKA.orange, C = MARKA.cream
  const foto = (dosya, etiket) => `
    <td width="33.3%" valign="top" style="padding:0 5px;">
      <img src="${APP_URL}/assets/email/${dosya}" alt="${etiket}" width="100%" style="display:block;border:0;width:100%;height:auto;border-radius:3px;" />
      <p style="margin:9px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${S};text-align:center;font-weight:bold;">${etiket}</p>
    </td>`
  const kategori = (baslik, metin) => `
    <tr><td style="padding:0 0 12px;">
      <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${O};font-weight:bold;">${baslik}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13.5px;line-height:1.6;color:#555;">${metin}</p>
    </td></tr>`

  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>iyi event</title></head>
<body style="margin:0;padding:0;background:${C};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Kurumsal galalardan düğünlere, her etkinlik tek elden ve kusursuz. iyi event ile tanışın.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C};"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;">
      <tr><td align="center" style="padding:34px 32px 6px;">
        <img src="${APP_URL}/assets/email/logo.png" alt="iyi event" width="190" style="display:block;border:0;width:190px;max-width:58%;height:auto;" />
      </td></tr>
      <tr><td style="padding:10px 28px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${S};padding:42px 30px;text-align:center;">
          <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${O};">Etkinlik &amp; Organizasyon</p>
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:30px;line-height:1.25;color:${C};">Anlarınızı Sanata<br>Dönüştürüyoruz</h1>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:30px 36px 6px;">
        <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:18px;color:${S};">Sayın ${ad || 'Yetkili'},</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14.5px;line-height:1.75;color:#555;">
          <strong style="color:${S};">iyi event</strong> olarak kurumsal galalardan bespoke düğünlere, açık hava festivallerinden
          çocuk şenliklerine kadar her ölçekte etkinliği <strong style="color:${S};">tek elden</strong> planlıyoruz —
          konsept tasarımından operasyona, catering'den prodüksiyona kusursuz bir kurgu ile.
        </p>
      </td></tr>
      <tr><td style="padding:24px 31px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${foto('gala.jpg', 'Kurumsal &amp; Gala')}
          ${foto('wedding.jpg', 'Düğün &amp; Nişan')}
          ${foto('soiree.jpg', 'Özel &amp; Tematik')}
        </tr></table>
      </td></tr>
      <tr><td style="padding:22px 36px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${kategori('Kurumsal', 'Bayi toplantıları &amp; kongreler, lansmanlar, gala geceleri, açılış organizasyonları, fuar &amp; stant, team building.')}
          ${kategori('Bireysel &amp; Özel Gün', 'Evlilik teklifi, düğün &amp; nişan, kına gecesi, söz &amp; isteme, doğum günü, gender reveal, baby shower, sünnet.')}
          ${kategori('Tematik &amp; Açık Hava', 'Lüks/bohem piknikler, açık hava sinema, festival &amp; panayır, atölye &amp; workshop, doğa organizasyonları.')}
          ${kategori('Çocuk &amp; Geleneksel', 'Tematik çocuk partileri, AVM şenlikleri, iftar &amp; sahur davetleri, anma &amp; taziye ikramları.')}
        </table>
      </td></tr>
      <tr><td style="padding:8px 36px 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#777;">
          Ayrıca: LED ekran &amp; ses/sahne/truss kiralama, sokak lezzetleri &amp; kokteyl catering, prodüksiyon, ajans &amp; medya hizmetleri.
        </p>
      </td></tr>
      <tr><td align="center" style="padding:30px 32px 8px;">
        <a href="tel:+902129939939" style="display:inline-block;background:${O};color:#ffffff;padding:15px 42px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:bold;">Hemen İletişime Geçin</a>
        <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:14px;color:${S};">0212 993 99 39 &nbsp;·&nbsp; bilgi@iyievent.com</p>
      </td></tr>
      <tr><td style="padding:22px 28px 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${D};padding:24px;text-align:center;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:rgba(246,243,234,0.65);">iyi event · Etkinlik &amp; Organizasyon Tasarımı</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;color:rgba(246,243,234,0.4);">bilgi@iyievent.com &nbsp;·&nbsp; 0212 993 99 39 &nbsp;·&nbsp; iyievent.com</p>
        </td></tr></table>
        <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:10.5px;line-height:1.6;color:#aaa;text-align:center;">
          Bu e-postayı iyi event ile ilgilenebileceğinizi düşündüğümüz için aldınız.<br>
          Bu tür iletileri almak istemiyorsanız
          <a href="mailto:bilgi@iyievent.com?subject=Ticari%20ileti%20almak%20istemiyorum&amp;body=Listenizden%20cikarilmak%20istiyorum." style="color:#888;text-decoration:underline;">buraya tıklayarak</a>
          bildirebilirsiniz; talebiniz derhal işlenir.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

export async function sendTanitimEmail({ email, ad }) {
  const transporter = getTransporter()
  return await transporter.sendMail({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'iyi event — Kusursuz Etkinlik & Organizasyon Çözümleri',
    html: tanitimEmailHtml(ad),
  })
}

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

  const transporter = getTransporter()
  return await transporter.sendMail({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Randevunuz Oluşturuldu — iyi event',
    html: epostaKabuk('Randevunuz Oluşturuldu', govde),
  })
}

export async function sendKampanyaEmail({ emails = [], konu, baslik, icerik }) {
  const liste = (emails || []).filter(Boolean)
  if (liste.length === 0) return { gonderilen: 0 }

  const html = epostaKabuk(baslik || konu || 'iyi event', `
    <div style="font-size:0.98rem;color:#555;line-height:1.8;white-space:pre-wrap;">${icerik || ''}</div>
    <div style="text-align:center;margin:2rem 0 0.5rem;">
      <a href="https://iyievent.com" style="display:inline-block;background:${MARKA.orange};color:#fff;padding:0.9rem 2.2rem;text-decoration:none;font-family:Arial,sans-serif;font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;">Detaylı Bilgi</a>
    </div>`)

  const transporter = getTransporter()
  let gonderilen = 0
  for (const to of liste) {
    await transporter.sendMail({
      from: `iyi event <${process.env.EMAIL_FROM}>`,
      to,
      subject: konu || 'iyi event',
      html,
    })
    gonderilen++
  }
  return { gonderilen }
}

// ============================================================
// ETKİNLİK DURUM DEĞİŞİKLİĞİ MAİLLERİ
// ============================================================

const DURUM_SABLONLARI = {
  planlama: {
    baslik: 'Talebiniz Değerlendirmeye Alındı',
    satir: 'Etkinlik talebiniz planlama sürecine alınmıştır.',
    govde: 'Tarafımızdan detaylar için aranacaksınız, sonrasında onay sürecine geçeceğiz.',
    ikon: 'fas fa-clipboard-list',
  },
  onaylandi: {
    baslik: 'Etkinliğiniz Onaylandı',
    satir: 'Etkinliğiniz onay sürecinden geçmiş ve kesinleşmiştir.',
    govde: 'Tüm detaylar tarafınıza iletilecektir. Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.',
    ikon: 'fas fa-check-circle',
  },
  tamamlandi: {
    baslik: 'Etkinliğiniz Tamamlandı',
    satir: 'Etkinliğiniz başarıyla tamamlanmıştır.',
    govde: 'Bizi tercih ettiğiniz için çok teşekkür ederiz. Deneyiminizi bizimle paylaşmak isterseniz yanıtlayabilirsiniz.',
    ikon: 'fas fa-trophy',
  },
  iptal: {
    baslik: 'Etkinliğiniz İptal Edildi',
    satir: 'Etkinlik talebiniz iptal edilmiştir.',
    govde: 'Herhangi bir ödeme yapıldıysa iade süreci başlatılacaktır. Sorularınız için bizimle iletişime geçebilirsiniz.',
    ikon: 'fas fa-xmark-circle',
  },
}

export async function sendEtkinlikDurumEmail({ email, musteriAd, etkinlikAd, durum }) {
  const sablon = DURUM_SABLONLARI[durum]
  if (!sablon || !email) return null

  const govde = `
    <p style="font-size:1.05rem;color:${MARKA.slate};line-height:1.8;margin:0 0 1.2rem;">Sayın ${musteriAd || 'Müşterimiz'},</p>
    <p style="color:#555;font-size:0.98rem;line-height:1.8;margin:0 0 1.5rem;">
      <strong>${etkinlikAd}</strong> etkinliğinizle ilgili güncellemeniz aşağıdadır.
    </p>
    <div style="background:${MARKA.cream};border-left:3px solid ${MARKA.orange};padding:1.5rem 1.8rem;margin:0 0 1.5rem;">
      <div style="margin-bottom:0.8rem;">
        <span style="font-family:Arial,sans-serif;font-size:0.64rem;letter-spacing:0.15em;text-transform:uppercase;color:${MARKA.orange};">ETKİNLİK</span>
        <p style="margin:0.2rem 0 0;font-size:1.05rem;color:${MARKA.slate};font-weight:600;">${etkinlikAd}</p>
      </div>
      <div>
        <span style="font-family:Arial,sans-serif;font-size:0.64rem;letter-spacing:0.15em;text-transform:uppercase;color:${MARKA.orange};">DURUM</span>
        <p style="margin:0.2rem 0 0;font-size:1.05rem;color:${MARKA.slate};font-weight:600;">${sablon.satir}</p>
      </div>
    </div>
    <p style="color:#555;font-size:0.95rem;line-height:1.8;margin:0 0 1rem;">${sablon.govde}</p>
    <p style="color:#555;font-size:0.95rem;line-height:1.8;margin:0;">Herhangi bir sorunuz olursa bize ulaşmaktan çekinmeyin.</p>`

  const transporter = getTransporter()
  return await transporter.sendMail({
    from: `iyi event <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `${sablon.baslik} — ${etkinlikAd}`,
    html: epostaKabuk(sablon.baslik, govde),
  })
}
