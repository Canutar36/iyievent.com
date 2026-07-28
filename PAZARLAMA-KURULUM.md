# Dijital Pazarlama Kurulumu — E-posta (Resend) & SMS (Netgsm)

Kod tarafı hazır: tanıtım e-posta şablonu, toplu kampanya gönderimi (parça parça,
22k+ alıcıya uygun), SMS metinleri ve test gönderimi. Kalan tek şey **hesap
bilgilerini girmek** — bunları sen giriyorsun (ben gizli anahtar girmiyorum).

---

## ⚖️ ÖNCE BUNU OKU — İYS / Ticari İleti (Türkiye)

22 bin firmaya toplu e-posta/SMS göndermek **6563 sayılı Kanun** kapsamındadır.
Ceza riskine girmemen için özet (ben avukat değilim, bilgi amaçlıdır — mali
müşavirin/avukatınla teyit et):

- **İYS kaydı zorunlu.** Ticari ileti gönderen her firma [iys.org.tr](https://iys.org.tr)'ye
  marka olarak kayıtlı olmalı. Netgsm/Resend bunu senin yerine yapmaz.
- **İyi haber (B2B istisnası):** Alıcı **tacir veya esnaf** ise (İSO datası tam olarak
  budur — firmalar), ticari ileti için **önceden onay almak zorunlu değildir.**
  Yani İSO firmalarına tanıtım gönderebilirsin.
- **Ama şartları var:**
  1. Her iletide **ret (çıkma) imkânı** bulunmalı. SMS'te Netgsm bunu otomatik ekler;
     e-postada şablona ret bağlantısı eklemeliyiz (aşağıya bak).
  2. Ret eden bir daha **asla** gönderilmemeli → sistemde işaretlenmeli.
  3. Gönderimler **İYS'ye raporlanmalı** (Netgsm İYS entegrasyonu ile otomatik yapılabilir).
- **Bireysel (B2C) kişilere** ise **önceden açık onay** olmadan ticari ileti gönderilemez.
  Lead Havuzu'nda B2C kayıtlara toplu gönderim yaparken buna dikkat et.

> Pratik öneri: İlk etapta **sadece B2B segmentine** gönder (Kampanya oluştururken
> hedef segment = **B2B**). B2C için önce onay topla (web formu, etkinlik kaydı vb.).

---

## 1) E-POSTA — Resend kurulumu

### a) Hesap ve domain doğrulama
1. [resend.com](https://resend.com) → ücretsiz hesap aç (ayda 3.000 mail ücretsiz;
   toplu gönderim için ücretli plana geçmen gerekebilir).
2. **Domains → Add Domain** → `iyievent.com` yaz.
3. Resend sana **DNS kayıtları** verir (genelde 3 kayıt):
   - `MX` veya `TXT` (SPF) — ör. `send.iyievent.com`
   - `TXT` (DKIM) — ör. `resend._domainkey`
   - `TXT` (DMARC) — opsiyonel ama önerilir
4. Bu kayıtları **Hostinger → Domainler → iyievent.com → DNS Bölgesi Düzenleyicisi**'ne ekle.

> ⚠️ **E-postan bozulmasın:** Hostinger'daki `bilgi@iyievent.com` çalışmaya devam
> etmeli. Resend'in verdiği kayıtları **eklersin**, mevcut MX kayıtlarını **silmezsin**.
> Resend genelde alt alan adı (`send.iyievent.com`) kullanır — bu, ana MX'ini etkilemez.
> Mevcut SPF kaydın varsa iki ayrı SPF satırı OLMAZ; tek satırda birleştirilir:
> `v=spf1 include:_spf.mail.hostinger.com include:amazonses.com ~all`

5. DNS yayılması 5 dk – 24 saat. Resend panelinde domain **Verified** olunca hazır.
6. **API Keys → Create API Key** → kopyala.

### b) Anahtarı sisteme gir
- **Yerel:** `.env.local` içinde
  ```
  RESEND_API_KEY=re_xxxxxxxxxx
  EMAIL_FROM=bilgi@iyievent.com
  ```
- **Canlı (Vercel):** Project → Settings → Environment Variables → aynı ikisini ekle → **Redeploy**.

### c) Test et
Yönetim → **Dijital Pazarlama → Kampanyalar** → üstteki *Kurumsal Tanıtım E-postası*
kartından:
- **Şablonu Önizle** → tarayıcıda tam görünüm.
- **Test Gönderimi** → kendi adresine gönder, gelen kutunda kontrol et (spam'e düşüyor mu?).

---

## 2) SMS — Netgsm kurulumu

1. [netgsm.com.tr](https://www.netgsm.com.tr) → firma hesabı aç, SMS kredisi yükle.
2. **Mesaj başlığı (gönderici adı)** başvurusu yap: ör. `IYIEVENT`.
   Onaylanması 1–3 iş günü sürer. **Onaysız başlıkla gönderim yapılamaz** (hata kodu 40).
3. Netgsm panelinde **API erişimini aç** (Ayarlar → API/Web servis erişimi).
   Bazı hesaplarda API için ayrı bir alt kullanıcı/şifre tanımlanır.
4. Bilgileri gir:
   - **Yerel:** `.env.local`
     ```
     NETGSM_USERCODE=850xxxxxxx   (veya API alt kullanıcı kodu)
     NETGSM_PASSWORD=xxxxxxxx
     NETGSM_MSGHEADER=IYIEVENT     (onaylanan başlık, birebir aynı)
     ```
   - **Canlı:** Vercel Environment Variables → aynı üçü → Redeploy.
5. **İYS entegrasyonu:** Netgsm panelinde İYS bağlantısını aktif et (marka kodun ile).
   Böylece ret edenlere gönderim otomatik engellenir.

### Test
Dijital Pazarlama → **Kampanya Oluştur** → Kanal: **SMS** → metni yaz →
alttaki **Test** kutusuna kendi numaranı gir → gönder.

> Sistem sana canlı olarak **karakter sayısı, kaç SMS (segment) ve tahmini kredi**
> maliyetini gösterir. Türkçe karakter (ç, ğ, ı, ö, ş, ü) kullanırsan 1 SMS = 70
> karakter olur (maliyet 2 katına çıkabilir); kullanmazsan 160 karakter.

---

## 3) Hazır tanıtım metinleri

**SMS (150 karakter, 1 segment):**
> iyi event ile kurumsal etkinlikleriniz emin ellerde. Gala, lansman, bayi
> toplantisi, dugun ve ozel organizasyonlar. Bilgi: 0212 993 99 39 iyievent.com

**E-posta:** Hazır kurumsal şablon — logo, 3 referans görseli (toplam ~175 KB),
4 hizmet kategorisi, iletişim CTA'sı. Önizlemeden görebilirsin.

---

## 4) Gönderim akışı (sistemde nasıl çalışıyor)

1. **Lead Havuzu** → tek tek: müşteri detayında **“Tanıtım Maili Gönder”**.
2. **Dijital Pazarlama → Kampanyalar** → toplu:
   - Kampanya oluştur (kanal, hedef segment: B2B/B2C/tümü, metin)
   - **Test gönder** → kontrol et
   - **Gönder** → sistem 500'erli parçalar hâlinde işler, ilerleme çubuğu gösterir
     (22k alıcıda bile tarayıcı/sunucu kilitlenmez)
3. **Performans & ROI** sekmesinde açılma/tıklama/dönüşüm takibi.

---

## 5) Yapılacaklar listesi (özet)

- [ ] İYS kaydı (iys.org.tr) + Netgsm İYS bağlantısı
- [ ] Resend hesabı + `iyievent.com` domain doğrulama (Hostinger DNS)
- [ ] `RESEND_API_KEY`, `EMAIL_FROM` → `.env.local` + Vercel
- [ ] Netgsm hesabı + `IYIEVENT` başlık onayı + API erişimi
- [ ] `NETGSM_USERCODE/PASSWORD/MSGHEADER` → `.env.local` + Vercel
- [ ] Test e-postası + test SMS'i (kendine)
- [ ] İlk kampanya: **B2B segmenti**, küçük bir grupla dene, sonra tamamına
