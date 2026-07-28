# Google OAuth Kurulum Rehberi

## 1. Google Cloud Console'da Proje Oluştur

1. https://console.cloud.google.com adresine git
2. Sol üstten proje seç → **New Project**
3. Proje adı: `iyievent` → **Create**
4. Oluşturulan projeyi seç

## 2. OAuth Consent Screen Ayarla

1. Sol menüden **APIs & Services** → **OAuth consent screen**
2. **User Type: External** → **Create**
3. Doldur:
   - App name: `iyi event`
   - User support email: `bilgi@iyievent.com`
   - Developer contact: `bilgi@iyievent.com`
4. **Save and Continue**
5. **Scopes** → **Add or Remove Scopes** → `email` ve `profile` ekle → **Save and Continue**
6. **Test users** → `bilgi@iyievent.com` ekle (test aşamasında)
7. **Save and Continue** → **Back to Dashboard**

## 3. OAuth Credentials Oluştur

1. Sol menüden **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `iyievent-web`
5. **Authorized redirect URIs** → **+ Add URI**:
   ```
   https://rrlcvvymnaqlmaanolov.supabase.co/auth/v1/callback
   ```
6. **Create**
7. **Client ID** ve **Client Secret** değerlerini kopyala

## 4. Supabase'de Google Provider'ını Etkinleştir

1. https://supabase.com/dashboard adresine git
2. Projeni seç (`rrlcvvymnaqlmaolanov`)
3. Sol menüden **Authentication** → **Providers**
4. **Google**'ı bul → **Enable**
5. **Client ID** ve **Client Secret** değerlerini yapıştır
6. **Save**

## 5. Supabase'de Redirect URL Ekle

1. **Authentication** → **URL Configuration**
2. **Redirect URLs** → **Add URL**:
   ```
   https://hesap.iyievent.com/api/auth/callback
   ```
3. **Save**

## 6. Supabase'de Site URL Güncelle

1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://hesap.iyievent.com`

## Test

1. `hesap.iyievent.com/giris` adresine git
2. "Google ile Giriş Yap" butonuna tıkla
3. Google hesabınla giriş yap
4. Başarıyla `hesap.iyievent.com/musteri/etkinlikler` adresine yönlendirilmelisin

## Notlar

- Test modunda (publish edilmemiş uygulama) sadece test users giriş yapabilir
- Publish etmek için **OAuth consent screen** → **Publish App** de
- production'da Google review gerekebilir (openid, email, profile scope'ları için genelde gerekmez)
