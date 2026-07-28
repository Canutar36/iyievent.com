# Canlıya Alma Rehberi — GitHub + Vercel

Proje git deposuna alındı ve ilk commit atıldı (`main` dalı). Anahtarlar
`.gitignore` ile korunuyor — repoya **hiçbir gizli anahtar gitmez**.

---

## 1) GitHub'da boş bir private repo oluştur
1. https://github.com/new
2. **Repository name:** `iyievent` (veya istediğin ad)
3. **Private** seç ✅ (işletme uygulaması — herkese açık olmasın)
4. **README / .gitignore / license EKLEME** (boş kalsın — bizde zaten var)
5. **Create repository**
6. Açılan sayfadaki repo URL'sini kopyala (ör. `https://github.com/kullanici/iyievent.git`)

> Bu URL'yi bana ver → remote'u ekleyip push'u ben deneyeyim (ekranında bir
> GitHub giriş penceresi açılırsa onayla). Ya da aşağıdaki komutları kendi
> terminalinde çalıştır.

**Kendi terminalinde push (alternatif):**
```bash
git remote add origin https://github.com/KULLANICI/iyievent.git
git push -u origin main
```
(İlk push'ta GitHub girişi ister — tarayıcıdan onayla.)

---

## 2) Vercel'e bağla
1. https://vercel.com → GitHub ile giriş yap (yoksa ücretsiz hesap aç).
2. **Add New → Project → Import** → `iyievent` repo'sunu seç.
3. Framework otomatik **Next.js** algılanır. Build ayarlarına dokunma.
4. **Deploy'a BASMADAN ÖNCE** → **Environment Variables** bölümünü aç ve şunları ekle
   (değerleri sen giriyorsun — Supabase panelinden):

| Key | Değer |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rrlcvvymnaqlmaanolov.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role key) |
| `NEXT_PUBLIC_APP_URL` | (Vercel URL — aşağıya bak) |
| `EMAIL_FROM` | `bilgi@iyievent.com` |

> Opsiyonel (hazır olunca): `RESEND_API_KEY`, `NETGSM_*`, `PAYTR_*`, `NILVERA_API_KEY`.
> Girmezsen o servisler pasif/stub kalır, uygulama yine çalışır.

5. **Deploy**. ~2 dk sonra `https://iyievent-xxxx.vercel.app` gibi bir URL alırsın.

### NEXT_PUBLIC_APP_URL'i düzelt
İlk deploy'dan sonra gerçek Vercel URL'ini öğrenince:
- Vercel → Project → **Settings → Environment Variables** → `NEXT_PUBLIC_APP_URL`'i
  o URL yap (ör. `https://iyievent-xxxx.vercel.app`).
- **Deployments → son deploy → Redeploy** (env değişikliği için).

---

## 3) Supabase'i canlı domaine tanıt
Supabase → **Authentication → URL Configuration:**
- **Site URL:** Vercel URL'in (`https://iyievent-xxxx.vercel.app`)
- **Redirect URLs → Add:** `https://iyievent-xxxx.vercel.app/api/auth/callback`
- (localhost'takileri silme — dev için dursun.)

Böylece canlıda kayıt/giriş ve e-posta doğrulama linkleri doğru çalışır.

---

## 4) Canlıda test
1. `https://iyievent-xxxx.vercel.app` → landing açılır.
2. `.../giris` → yönetici e-postanla giriş → `/yonetim`.
3. Bir hizmet/lead ekle, yenile — kalıcı mı diye bak.

---

## Bundan sonra: otomatik deploy
Artık her `git push` (main dalına) **otomatik canlıya çıkar**. Ben bir değişiklik
yapınca commit + push edeceğim, Vercel saniyeler içinde yeni sürümü yayınlayacak.
İstersen "preview" için ayrı bir dal da kullanabiliriz (canlıyı bozmadan test).

## Özel alan adı (sonra)
Hazır olunca Vercel → **Settings → Domains**'den `iyievent.com` + alt alan adlarını
(`hesap.`, `yonetim.`) bağlarız; proxy.js zaten alt alan adı yönlendirmesine hazır.

## Güvenlik
- `.env.local` ve `.env*` repoda değil (`.gitignore`). Gizli anahtarlar sadece
  Vercel Environment Variables'da (sunucu tarafı) ve senin makinende.
- `SUPABASE_SERVICE_ROLE_KEY` sadece sunucuda kullanılır; `NEXT_PUBLIC_*` olanlar
  tarayıcıya açıktır (anon key zaten öyle tasarlanmış — sorun değil).
