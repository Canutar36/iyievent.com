-- ================================================
-- iyi event — Supabase Veritabanı Şeması
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- ================================================

-- Uzantılar
create extension if not exists "uuid-ossp";

-- ========================
-- PROFILES (kullanıcı profili, auth.users'ı genişletir)
-- ========================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'musteri' check (role in ('musteri', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Yeni kayıt olunduğunda otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================
-- ETKINLIKLER (eventler)
-- ========================
create table if not exists public.etkinlikler (
  id uuid default uuid_generate_v4() primary key,
  musteri_id uuid references public.profiles(id) on delete cascade not null,
  ad text not null,
  tur text not null, -- Dugun, Gala, Ozel Davet, Destination
  tarih date,
  saat time,
  mekan_adi text,
  mekan_adres text,
  tahmini_misafir_sayisi integer,
  durum text not null default 'talep' check (durum in ('talep', 'planlama', 'onaylandi', 'tamamlandi', 'iptal')),
  notlar text,
  -- Finansal
  toplam_tutar numeric(12,2),
  odenen_tutar numeric(12,2) default 0,
  -- Google Calendar
  google_event_id text,
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- TALEPLER (iletişim formu)
-- ========================
create table if not exists public.talepler (
  id uuid default uuid_generate_v4() primary key,
  ad_soyad text not null,
  email text not null,
  telefon text not null,
  etkinlik_turu text,
  tahmini_misafir text,
  butce text,
  mesaj text,
  durum text not null default 'yeni' check (durum in ('yeni', 'inceleniyor', 'etkinlige_donustu', 'reddedildi')),
  -- Dönüştürüldüğünde bağlantı
  etkinlik_id uuid references public.etkinlikler(id),
  created_at timestamptz default now()
);

-- ========================
-- MISAFIRLER (davetliler)
-- ========================
create table if not exists public.misafirler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  ad_soyad text not null,
  email text,
  telefon text,
  grup text default 'Genel', -- Aile, Is, Arkadas vb.
  davetiye_gonderildi boolean default false,
  davetiye_gonderim_tarihi timestamptz,
  yanit text check (yanit in ('bekliyor', 'katilacak', 'katilmayacak', 'belirsiz')) default 'bekliyor',
  qr_kod text unique default uuid_generate_v4()::text,
  notlar text,
  created_at timestamptz default now()
);

-- ========================
-- ODEMELER
-- ========================
create table if not exists public.odemeler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  tutar numeric(12,2) not null,
  aciklama text, -- Kapora, Kalan Odeme, vb.
  durum text not null default 'bekliyor' check (durum in ('bekliyor', 'tamamlandi', 'basarisiz', 'iade')),
  -- PayTR
  paytr_token text,
  paytr_merchant_oid text unique,
  paytr_response jsonb,
  odeme_tarihi timestamptz,
  created_at timestamptz default now()
);

-- ========================
-- BELGELER (sozlesmeler, dosyalar)
-- ========================
create table if not exists public.belgeler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  ad text not null,
  aciklama text,
  tur text not null default 'sozlesme' check (tur in ('sozlesme', 'islak_imza', 'fatura', 'diger')),
  -- Supabase Storage'daki dosya yolu
  dosya_yolu text not null,
  dosya_boyutu integer,
  dosya_turu text,
  -- Durum
  durum text not null default 'bekliyor' check (durum in ('bekliyor', 'yuklendi', 'onaylandi')),
  -- Admin mi yükledi, müşteri mi?
  yukleyen_rol text default 'admin' check (yukleyen_rol in ('admin', 'musteri')),
  yukleyen_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ========================
-- ETKINLIK GORSELLERI (Galeri & Fotoğraf Paylaşımı)
-- ========================
create table if not exists public.etkinlik_gorselleri (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  dosya_yolu text not null, -- Supabase Storage yolu
  dosya_adi text,
  yukleyen_tip text not null check (yukleyen_tip in ('admin', 'misafir')),
  yukleyen_ad text, -- Misafir ise ad soyad
  created_at timestamptz default now()
);

-- ========================
-- DEGERLENDIRMELER
-- ========================
create table if not exists public.degerlendirmeler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null unique,
  musteri_id uuid references public.profiles(id) on delete cascade not null,
  puan integer not null check (puan between 1 and 5),
  yorum text,
  yayinla boolean default false,
  created_at timestamptz default now()
);

-- ========================
-- BILDIRIMLER
-- ========================
create table if not exists public.bildirimler (
  id uuid default uuid_generate_v4() primary key,
  kullanici_id uuid references public.profiles(id) on delete cascade not null,
  baslik text not null,
  mesaj text not null,
  tur text default 'bilgi' check (tur in ('bilgi', 'uyari', 'basari', 'odeme', 'belge')),
  okundu boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================

-- Profiles: herkes kendi profilini okuyabilir/güncelleyebilir
alter table public.profiles enable row level security;
create policy "Kullanici kendi profilini gorebilir" on public.profiles for select using (auth.uid() = id);
create policy "Kullanici kendi profilini guncelleyebilir" on public.profiles for update using (auth.uid() = id);
create policy "Admin herkesi gorebilir" on public.profiles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Etkinlikler: müşteri kendi etkinliklerini görür; admin hepsini
alter table public.etkinlikler enable row level security;
create policy "Musteri kendi etkinliklerini gorebilir" on public.etkinlikler for select using (musteri_id = auth.uid());
create policy "Admin tum etkinlikleri gorebilir" on public.etkinlikler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Misafirler
alter table public.misafirler enable row level security;
create policy "Musteri kendi etkinliginin misafirlerini gorebilir" on public.misafirler for all using (
  exists (select 1 from public.etkinlikler e where e.id = etkinlik_id and e.musteri_id = auth.uid())
);
create policy "Admin tum misafirleri gorebilir" on public.misafirler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Ödemeler
alter table public.odemeler enable row level security;
create policy "Musteri kendi odemelerini gorebilir" on public.odemeler for select using (
  exists (select 1 from public.etkinlikler e where e.id = etkinlik_id and e.musteri_id = auth.uid())
);
create policy "Admin tum odemeleri gorebilir" on public.odemeler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Belgeler
alter table public.belgeler enable row level security;
create policy "Musteri kendi belgelerini gorebilir" on public.belgeler for select using (
  exists (select 1 from public.etkinlikler e where e.id = etkinlik_id and e.musteri_id = auth.uid())
);
create policy "Musteri islak imza yukleyebilir" on public.belgeler for insert with check (
  tur = 'islak_imza' and
  exists (select 1 from public.etkinlikler e where e.id = etkinlik_id and e.musteri_id = auth.uid())
);
create policy "Admin tum belgeleri yonetebilir" on public.belgeler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Değerlendirmeler
alter table public.degerlendirmeler enable row level security;
create policy "Musteri kendi degerlendirmesini yapabilir" on public.degerlendirmeler for all using (
  musteri_id = auth.uid()
);
create policy "Admin tum degerlendirmeleri gorebilir" on public.degerlendirmeler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Yayinlanan degerlendirmeler herkese acik" on public.degerlendirmeler for select using (yayinla = true);

-- Bildirimler
alter table public.bildirimler enable row level security;
create policy "Kullanici kendi bildirimlerini gorebilir" on public.bildirimler for all using (
  kullanici_id = auth.uid()
);
create policy "Admin bildirim olusturabilir" on public.bildirimler for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Etkinlik Görselleri
alter table public.etkinlik_gorselleri enable row level security;
create policy "Musteri kendi etkinliginin fotograflarini gorebilir" on public.etkinlik_gorselleri for select using (
  exists (select 1 from public.etkinlikler e where e.id = etkinlik_id and e.musteri_id = auth.uid())
);
create policy "Misafirler fotograf yukleyebilir" on public.etkinlik_gorselleri for insert with check (true);
create policy "Admin tum fotograflari yonetebilir" on public.etkinlik_gorselleri for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Talepler (sadece admin)
alter table public.talepler enable row level security;
create policy "Admin tum talepleri gorebilir" on public.talepler for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Herkes talep olusturabilir" on public.talepler for insert with check (true);

-- ========================
-- STORAGE BUCKET (belgeler icin)
-- ========================
-- Supabase Dashboard > Storage'da "belgeler" adında bir bucket oluşturun (private)
-- insert into storage.buckets (id, name, public) values ('belgeler', 'belgeler', false);
