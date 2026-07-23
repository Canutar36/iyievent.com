# Supabase Kurulum Rehberi — iyi event

Bu adımlar uygulamayı **demo modundan** gerçek veritabanına geçirir. Anahtarları
**sen** giriyorsun (güvenlik gereği ben görmüyorum/girmiyorum). ~15 dakika sürer.

> Şu an: `.env.local` dummy değerlerde olduğu için uygulama demo modunda (girişsiz,
> örnek verilerle). Aşağıdaki adımlardan sonra gerçek, kalıcı veriye geçer.

---

## 1) Supabase projesi oluştur
1. https://supabase.com → giriş yap (GitHub veya e-posta ile).
2. **New project**.
   - **Name:** iyievent
   - **Database Password:** güçlü bir şifre belirle ve **bir yere kaydet** (sonra lazım olabilir).
   - **Region:** `Central EU (Frankfurt)` (Türkiye'ye en yakın, hızlı).
3. **Create new project** → ~2 dk kurulum bekle.

## 2) API anahtarlarını al
Proje açılınca sol menü: **Project Settings (dişli) → API**. Şunları kopyala:
- **Project URL** (ör. `https://abcdxyz.supabase.co`)
- **Project API keys → `anon` `public`**
- **Project API keys → `service_role` `secret`** ⚠️ *Bu gizli! Kimseyle paylaşma, git'e koyma.*

## 3) `.env.local` dosyasını doldur
Proje klasöründe `.env.local` dosyasını aç, **sadece şu 3 satırı** değiştir:

```
NEXT_PUBLIC_SUPABASE_URL=https://SENIN-PROJEN.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role secret)
```

Kaydet. (Diğer anahtarları — Resend/Netgsm/PayTR/Nilvera — sonra doldurabilirsin;
boş kaldıkça o servisler stub/pasif çalışır.)

## 4) Veritabanı şemasını kur
1. Supabase'de sol menü: **SQL Editor → New query**.
2. Proje klasöründeki **`supabase-kurulum.sql`** dosyasının **tüm içeriğini** kopyala.
3. SQL Editor'e yapıştır → sağ altta **Run** (veya Ctrl+Enter).
4. "Success. No rows returned" görürsen tamamdır. Tüm tablolar, roller, RLS
   güvenlik politikaları ve `belgeler` storage bucket'ı oluştu.

> Not: Bu dosyayı **yeni/boş bir projede bir kez** çalıştır. Tablolar "if not
> exists" olduğundan güvenli; ama güvenlik politikaları ikinci çalıştırmada
> "already exists" hatası verebilir — o durumda yeni proje ile baştan yap.
> Storage politikası satırında yetki hatası alırsan o kısmı atla ve bucket'ı
> Adım 6'daki gibi Dashboard'dan oluştur.

## 5) E-posta girişini ayarla
1. Sol menü: **Authentication → Sign In / Providers → Email** açık olsun.
2. **Authentication → URL Configuration:**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs → Add URL:** `http://localhost:3000/api/auth/callback`
   - (Canlıya çıkınca kendi domainini de ekleyeceksin.)
3. (Kolaylık) **Authentication → Providers → Email → "Confirm email"** dev sırasında
   kapatılabilir; böylece kayıt olur olmaz giriş yapabilirsin. Canlıda açık tut.

## 6) `belgeler` storage bucket'ını doğrula
- Sol menü: **Storage**. `belgeler` bucket'ı görünmeli (SQL ile oluştu) ve **Private** olmalı.
- Yoksa: **New bucket → Name: `belgeler` → Public: KAPALI → Create**.

## 7) İlk yönetici kullanıcını oluştur
İki yol var, birini seç:

**A) Uygulamadan (önerilen):**
1. `npm run dev` çalışırken tarayıcıda `http://localhost:3000/giris` → **Kayıt Ol**.
2. Kendi e-posta + şifrenle kayıt ol. (Confirm email açıksa gelen maildeki linke tıkla.)
3. Sonra SQL Editor'de rolünü yönetici yap:
   ```sql
   update public.profiles set role = 'yonetici' where email = 'senin@epostan.com';
   ```

**B) Dashboard'dan:**
1. **Authentication → Users → Add user → Create new user** (e-posta + şifre, "Auto confirm").
2. Aynı SQL ile rolü `yonetici` yap (yukarıdaki komut).

> Roller: `yonetici` (tam yetki), `satis`, `operasyon`, `muhasebe`, `musteri`.
> Ekibin için diğer kullanıcıları da ekleyip **Ayarlar → Ekip & Roller**'den rol atayabilirsin.

## 8) Uygulamayı yeniden başlat
```bash
npm run dev
```
`.env.local` değişikliği ancak yeniden başlatınca okunur. Artık:
- Uygulama **gerçek Supabase**'e bağlı (demo modu kapandı).
- `http://localhost:3000/giris` → yönetici e-postanla giriş → `/yonetim`.
- Eklediğin her kayıt (hizmet, lead, teklif…) **kalıcı**.

---

## Doğrulama (hızlı test)
1. Giriş yap → **Hizmet Kataloğu → Hizmet Ekle** → kaydet → sayfayı yenile: kayıt duruyorsa DB çalışıyor. ✅
2. **Lead Havuzu → İçe Aktar** → İSO Excel dosyanı yükle → sütunları eşle → aktar.
   22k satır 1000'erlik parçalarla yüklenir, mükerrer telefonlar atlanır.
3. **Telemarketing** → filtrele → aramaya başla. **Lead Havuzu** artık sunucudan
   sayfalı gelir (donma yok).

## Sonraki servisler (opsiyonel, hazır olunca)
`.env.local`'e ekleyip dev'i yeniden başlat:
- **Resend** (e-posta gönderimi) → `RESEND_API_KEY`. Ayrıca resend.com'da `iyievent.com`
  domainini doğrula (SPF/DKIM) ki mailler spam'e düşmesin.
- **Netgsm** (SMS) → `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_MSGHEADER`.
- **PayTR** (online tahsilat) → merchant id/key/salt.
- **Nilvera** (e-fatura) → `NILVERA_API_KEY` (boşken stub çalışır).

## Güvenlik notları
- `SUPABASE_SERVICE_ROLE_KEY` tüm RLS'i bypass eder — **sadece** sunucu tarafında
  kullanılır (kodda öyle ayarlı), asla tarayıcıya/git'e sızmamalı. `.env.local` `.gitignore`'da.
- RLS politikaları kurulu: müşteriler yalnızca kendi verilerini görür; personel
  rolüne göre modüllere erişir.
