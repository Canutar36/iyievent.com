-- ================================================
-- iyi event — TEK DOSYA KURULUM SQL (canonical)
-- Supabase Dashboard > SQL Editor > New query icine yapistirip RUN edin.
-- YENI/BOS bir projede BIR KEZ calistirin.
-- (Tablolar/indeksler "if not exists"; ancak politikalar tekrar calistirmada
--  "already exists" hatasi verebilir — bu durumda yeni proje ile bastan yapin.)
-- Icerik: Ana sema + ERP tablolari + RBAC + RLS duzeltme + storage bucket.
-- ================================================

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


-- ================================================
-- iyi event — ERP Şeması (supabase-schema.sql üzerine EK)
-- Yönetim paneli (yonetim.iyievent.com) için tablolar.
-- Supabase Dashboard > SQL Editor'de, ana şemadan SONRA çalıştırın.
-- ================================================

-- ========================
-- RBAC — profiles.role genişletme
-- Roller: musteri | satis | operasyon | muhasebe | yonetici
-- (eski 'admin' değerleri 'yonetici'ye taşınır)
-- ========================
update public.profiles set role = 'yonetici' where role = 'admin';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('musteri', 'satis', 'operasyon', 'muhasebe', 'yonetici'));

-- Personel mi? (RLS politikalarında kullanılır)
create or replace function public.is_personel()
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('satis', 'operasyon', 'muhasebe', 'yonetici')
  );
$$ language sql security definer stable;

-- Belirli rollerden biri mi?
create or replace function public.has_rol(roller text[])
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'yonetici' or p.role = any(roller))
  );
$$ language sql security definer stable;

-- ========================
-- HIZMETLER (Hizmet & Fiyat Kataloğu)
-- ========================
create table if not exists public.hizmetler (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  kategori text not null default 'bireysel'
    check (kategori in ('kurumsal', 'bireysel', 'tematik', 'cocuk', 'dini')),
  aciklama text,
  fiyatlandirma_tipi text not null default 'kisi_basi'
    check (fiyatlandirma_tipi in ('kisi_basi', 'sabit', 'kademeli')),
  birim_fiyat numeric(12,2) not null default 0,
  min_kisi integer default 0,
  gorsel_url text,
  aktif boolean not null default true,
  siralama integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kademeli fiyatlandırma aralıkları
create table if not exists public.hizmet_kademeleri (
  id uuid default uuid_generate_v4() primary key,
  hizmet_id uuid references public.hizmetler(id) on delete cascade not null,
  min_kisi integer not null default 0,
  max_kisi integer,                    -- null = üst sınırsız
  birim_fiyat numeric(12,2) not null default 0,
  siralama integer default 0
);

-- ========================
-- EKSTRALAR (add-on'lar: dondurma arabası, şarkıcı, vb.)
-- ========================
create table if not exists public.ekstralar (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  grup text default 'Genel',           -- İkram, Eğlence, Teknik, vb.
  aciklama text,
  birim text not null default 'adet' check (birim in ('adet', 'kisi', 'sabit')),
  birim_fiyat numeric(12,2) not null default 0,
  gorsel_url text,
  aktif boolean not null default true,
  siralama integer default 0,
  created_at timestamptz default now()
);

-- ========================
-- TEKLIFLER (Canlı Teklif Builder çıktısı)
-- ========================
create table if not exists public.teklifler (
  id uuid default uuid_generate_v4() primary key,
  teklif_no text unique,
  -- Kime? (lead veya kayıtlı müşteri; ikisi de opsiyonel — hızlı teklif)
  lead_id uuid,                        -- Faz 2'de public.leadler(id) FK'sı eklenecek
  musteri_id uuid references public.profiles(id) on delete set null,
  musteri_ad text,                     -- lead/müşteri yoksa serbest metin
  musteri_telefon text,
  musteri_email text,
  -- Ne?
  hizmet_id uuid references public.hizmetler(id) on delete set null,
  hizmet_ad text,                      -- anlık kopya (katalog değişse de teklif sabit)
  kategori text,
  kisi_sayisi integer default 0,
  -- Tutarlar
  ara_toplam numeric(12,2) not null default 0,
  ekstra_toplam numeric(12,2) not null default 0,
  indirim numeric(12,2) not null default 0,
  toplam numeric(12,2) not null default 0,
  -- Durum & yaşam döngüsü
  durum text not null default 'taslak'
    check (durum in ('taslak', 'gonderildi', 'goruldu', 'kabul', 'red', 'etkinlige_donustu')),
  gecerlilik_tarihi date,
  notlar text,
  pdf_url text,
  -- Bağlantılar
  hazirlayan_id uuid references public.profiles(id) on delete set null,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  -- Zaman damgaları
  gonderim_tarihi timestamptz,
  goruldu_tarihi timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Teklif satır kalemleri (hizmet + seçilen ekstralar)
create table if not exists public.teklif_kalemleri (
  id uuid default uuid_generate_v4() primary key,
  teklif_id uuid references public.teklifler(id) on delete cascade not null,
  tur text not null default 'ekstra' check (tur in ('hizmet', 'ekstra')),
  kaynak_id uuid,                      -- hizmet_id / ekstra_id (referans, silinirse kalır)
  ad text not null,
  birim text,
  adet numeric(12,2) default 1,
  birim_fiyat numeric(12,2) default 0,
  tutar numeric(12,2) not null default 0,
  siralama integer default 0
);

-- ========================
-- İNDEKSLER
-- ========================
create index if not exists idx_hizmet_kademe_hizmet on public.hizmet_kademeleri(hizmet_id);
create index if not exists idx_teklif_kalem_teklif on public.teklif_kalemleri(teklif_id);
create index if not exists idx_teklif_musteri on public.teklifler(musteri_id);
create index if not exists idx_teklif_durum on public.teklifler(durum);

-- ========================
-- ROW LEVEL SECURITY
-- Katalog & teklifler: yalnızca personel yönetir. Müşteri erişimi yok
-- (portal self-servis teklifi ileride ayrı politika ile eklenecek).
-- ========================
alter table public.hizmetler enable row level security;
alter table public.hizmet_kademeleri enable row level security;
alter table public.ekstralar enable row level security;
alter table public.teklifler enable row level security;
alter table public.teklif_kalemleri enable row level security;

create policy "Personel hizmetleri yonetir" on public.hizmetler for all using (public.is_personel());
create policy "Personel kademeleri yonetir" on public.hizmet_kademeleri for all using (public.is_personel());
create policy "Personel ekstralari yonetir" on public.ekstralar for all using (public.is_personel());
create policy "Satis teklifleri yonetir" on public.teklifler for all using (public.has_rol(array['satis']));
create policy "Satis teklif kalemlerini yonetir" on public.teklif_kalemleri for all using (public.has_rol(array['satis']));

-- ================================================
-- FAZ 2 — Müşteri İlişkileri (Lead / CRM / Takvim / Şablon)
-- ================================================

-- ========================
-- LEADLER (E-Marketing — potansiyel müşteri havuzu)
-- ========================
create table if not exists public.leadler (
  id uuid default uuid_generate_v4() primary key,
  tip text not null default 'b2c' check (tip in ('b2b', 'b2c')),
  ad_unvan text not null,               -- kişi adı ya da firma ünvanı
  yetkili_kisi text,                    -- b2b'de irtibat kişisi
  telefon text,
  email text,
  adres text,
  vergi_no text,
  vergi_dairesi text,
  ilgilenilen_etkinlik text,
  kaynak text default 'manuel',         -- form | manuel | referans | reklam
  durum text not null default 'yeni'
    check (durum in ('yeni', 'iletisimde', 'teklif', 'kazanildi', 'kaybedildi')),
  durum_notu text,                      -- serbest, uzun görüşme notları
  sorumlu_id uuid references public.profiles(id) on delete set null,
  tanitim_maili_gonderildi boolean default false,
  tanitim_maili_tarihi timestamptz,
  -- Web formundan geldiyse
  talep_id uuid references public.talepler(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- teklifler.lead_id artık leadler'e bağlanır
alter table public.teklifler drop constraint if exists teklifler_lead_id_fkey;
alter table public.teklifler
  add constraint teklifler_lead_id_fkey
  foreign key (lead_id) references public.leadler(id) on delete set null;

-- ========================
-- CRM ETKİLEŞİMLER (görüşme geçmişi)
-- ========================
create table if not exists public.crm_etkilesimler (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leadler(id) on delete cascade,
  musteri_id uuid references public.profiles(id) on delete cascade,
  tur text not null default 'not' check (tur in ('telefon', 'mail', 'toplanti', 'not', 'whatsapp')),
  ozet text not null,
  personel_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ========================
-- RANDEVULAR (Takvim)
-- ========================
create table if not exists public.randevular (
  id uuid default uuid_generate_v4() primary key,
  baslik text not null,
  tur text not null default 'gorusme' check (tur in ('gorusme', 'etkinlik', 'hatirlatma', 'is')),
  lead_id uuid references public.leadler(id) on delete set null,
  musteri_id uuid references public.profiles(id) on delete set null,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  musteri_ad text,
  musteri_email text,
  tarih date not null,
  baslangic_saat time,
  bitis_saat time,
  konum text,
  atanan_id uuid references public.profiles(id) on delete set null,
  durum text not null default 'planlandi' check (durum in ('planlandi', 'tamamlandi', 'iptal')),
  mail_gonderildi boolean default false,
  notlar text,
  created_at timestamptz default now()
);

-- ========================
-- SABLONLAR (E-posta / To-do / Sözleşme şablonları)
-- ========================
create table if not exists public.sablonlar (
  id uuid default uuid_generate_v4() primary key,
  tur text not null default 'email' check (tur in ('email', 'todo', 'sozlesme')),
  anahtar text unique,                  -- 'tanitim', 'randevu', 'tesekkur' vb.
  ad text not null,
  konu text,                            -- e-posta konusu
  icerik text,                          -- HTML/metin gövde ({{degisken}} yer tutucular)
  aktif boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- İndeksler
create index if not exists idx_lead_sorumlu on public.leadler(sorumlu_id);
create index if not exists idx_lead_durum on public.leadler(durum);
create index if not exists idx_crm_lead on public.crm_etkilesimler(lead_id);
create index if not exists idx_randevu_tarih on public.randevular(tarih);

-- RLS
alter table public.leadler enable row level security;
alter table public.crm_etkilesimler enable row level security;
alter table public.randevular enable row level security;
alter table public.sablonlar enable row level security;

create policy "Satis leadleri yonetir" on public.leadler for all using (public.has_rol(array['satis']));
create policy "Personel etkilesimleri yonetir" on public.crm_etkilesimler for all using (public.is_personel());
create policy "Personel randevulari yonetir" on public.randevular for all using (public.is_personel());
create policy "Personel sablonlari gorur" on public.sablonlar for select using (public.is_personel());
create policy "Yonetici sablonlari yonetir" on public.sablonlar for all using (public.has_rol(array[]::text[]));

-- ================================================
-- FAZ 3 — Operasyon (To-Do / Kaynaklar)
-- ================================================

-- ========================
-- GÖREV ŞABLONLARI (etkinlik türüne göre hazır checklist)
-- ========================
create table if not exists public.todo_sablonlari (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  hizmet_id uuid references public.hizmetler(id) on delete set null,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.todo_sablon_kalemleri (
  id uuid default uuid_generate_v4() primary key,
  sablon_id uuid references public.todo_sablonlari(id) on delete cascade not null,
  baslik text not null,
  grup text default 'Genel',
  ekstra_id uuid references public.ekstralar(id) on delete set null, -- bu ekstra seçilince eklenir
  siralama integer default 0
);

-- ========================
-- GÖREVLER (etkinliğe bağlı yapılacaklar)
-- ========================
create table if not exists public.gorevler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  baslik text not null,
  grup text default 'Genel',
  durum text not null default 'bekliyor' check (durum in ('bekliyor', 'yapiliyor', 'tamam')),
  atanan_id uuid references public.profiles(id) on delete set null,
  son_tarih date,
  kaynak text default 'manuel' check (kaynak in ('sablon', 'ekstra', 'manuel')),
  ekstra_id uuid references public.ekstralar(id) on delete set null,
  siralama integer default 0,
  created_at timestamptz default now()
);

-- ========================
-- TEDARİKÇİLER
-- ========================
create table if not exists public.tedarikciler (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  kategori text default 'Genel',      -- Catering, Ses/Işık, Çadır, İkram, Çiçek...
  yetkili text,
  telefon text,
  email text,
  notlar text,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

-- ========================
-- ENVANTER / EKİPMAN
-- ========================
create table if not exists public.envanter (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  kategori text default 'Genel',      -- Masa, Sandalye, LED Ekran, Truss...
  adet_toplam integer default 0,
  birim text default 'adet',
  gunluk_kira numeric(12,2) default 0,
  notlar text,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.envanter_rezervasyon (
  id uuid default uuid_generate_v4() primary key,
  envanter_id uuid references public.envanter(id) on delete cascade not null,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  baslangic date,
  bitis date,
  adet integer default 1,
  created_at timestamptz default now()
);

-- ========================
-- PERSONEL / HOST HAVUZU
-- ========================
create table if not exists public.personel (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  rol_gorev text default 'Host',      -- Host, Şef, DJ, Garson, Koordinatör...
  telefon text,
  email text,
  profile_id uuid references public.profiles(id) on delete set null, -- girişli personelse
  gunluk_ucret numeric(12,2) default 0,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.gorevlendirmeler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete cascade not null,
  personel_id uuid references public.personel(id) on delete cascade not null,
  gorev text,
  tarih date,
  ucret numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- İndeksler
create index if not exists idx_gorev_etkinlik on public.gorevler(etkinlik_id);
create index if not exists idx_sablon_kalem on public.todo_sablon_kalemleri(sablon_id);
create index if not exists idx_env_rez_etkinlik on public.envanter_rezervasyon(etkinlik_id);
create index if not exists idx_gorevlendirme_etkinlik on public.gorevlendirmeler(etkinlik_id);

-- RLS
alter table public.todo_sablonlari enable row level security;
alter table public.todo_sablon_kalemleri enable row level security;
alter table public.gorevler enable row level security;
alter table public.tedarikciler enable row level security;
alter table public.envanter enable row level security;
alter table public.envanter_rezervasyon enable row level security;
alter table public.personel enable row level security;
alter table public.gorevlendirmeler enable row level security;

create policy "Personel todo sablon yonetir" on public.todo_sablonlari for all using (public.is_personel());
create policy "Personel todo sablon kalem yonetir" on public.todo_sablon_kalemleri for all using (public.is_personel());
create policy "Personel gorevleri yonetir" on public.gorevler for all using (public.is_personel());
create policy "Personel tedarikci yonetir" on public.tedarikciler for all using (public.is_personel());
create policy "Personel envanter yonetir" on public.envanter for all using (public.is_personel());
create policy "Personel env rez yonetir" on public.envanter_rezervasyon for all using (public.is_personel());
create policy "Personel personel yonetir" on public.personel for all using (public.is_personel());
create policy "Personel gorevlendirme yonetir" on public.gorevlendirmeler for all using (public.is_personel());

-- ================================================
-- FAZ 4 — Finans (Ön Muhasebe / Nilvera e-Fatura)
-- ================================================

-- ========================
-- CARİLER (müşteri & tedarikçi cari hesapları)
-- ========================
create table if not exists public.cariler (
  id uuid default uuid_generate_v4() primary key,
  unvan text not null,
  tip text not null default 'musteri' check (tip in ('musteri', 'tedarikci')),
  musteri_id uuid references public.profiles(id) on delete set null,
  lead_id uuid references public.leadler(id) on delete set null,
  tedarikci_id uuid references public.tedarikciler(id) on delete set null,
  vergi_no text,
  vergi_dairesi text,
  telefon text,
  email text,
  adres text,
  -- bakiye: (+) bizden alacaklı / (-) bize borçlu — hareketlerden hesaplanır, cache
  bakiye numeric(14,2) default 0,
  created_at timestamptz default now()
);

-- ========================
-- KASA / BANKA HESAPLARI
-- ========================
create table if not exists public.kasa_hesaplari (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  tip text not null default 'kasa' check (tip in ('kasa', 'banka', 'pos')),
  para_birimi text default 'TRY',
  bakiye numeric(14,2) default 0,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.kasa_hareketleri (
  id uuid default uuid_generate_v4() primary key,
  kasa_id uuid references public.kasa_hesaplari(id) on delete cascade not null,
  tur text not null check (tur in ('giris', 'cikis')),
  tutar numeric(14,2) not null,
  tarih date not null default current_date,
  kategori text,
  aciklama text,
  ref_tur text,   -- tahsilat | gider | fatura | manuel
  ref_id uuid,
  created_at timestamptz default now()
);

-- ========================
-- FATURALAR (Nilvera e-Fatura/e-Arşiv)
-- ========================
create table if not exists public.faturalar (
  id uuid default uuid_generate_v4() primary key,
  fatura_no text,
  cari_id uuid references public.cariler(id) on delete set null,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  tur text not null default 'satis' check (tur in ('satis', 'iade')),
  tarih date not null default current_date,
  kdv_haric numeric(14,2) not null default 0,
  kdv numeric(14,2) not null default 0,
  toplam numeric(14,2) not null default 0,
  durum text not null default 'taslak' check (durum in ('taslak', 'kesildi', 'iptal')),
  -- Nilvera
  nilvera_uuid text,
  nilvera_durum text,          -- gonderildi | onaylandi | reddedildi | hata
  fatura_tipi text default 'e_arsiv' check (fatura_tipi in ('e_fatura', 'e_arsiv')),
  pdf_url text,
  aciklama text,
  created_at timestamptz default now()
);

create table if not exists public.fatura_kalemleri (
  id uuid default uuid_generate_v4() primary key,
  fatura_id uuid references public.faturalar(id) on delete cascade not null,
  ad text not null,
  adet numeric(12,2) default 1,
  birim text default 'adet',
  birim_fiyat numeric(14,2) default 0,
  kdv_orani integer default 20,
  tutar numeric(14,2) default 0,
  siralama integer default 0
);

-- ========================
-- TAHSİLATLAR (gelen ödemeler)
-- ========================
create table if not exists public.tahsilatlar (
  id uuid default uuid_generate_v4() primary key,
  cari_id uuid references public.cariler(id) on delete set null,
  fatura_id uuid references public.faturalar(id) on delete set null,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  tutar numeric(14,2) not null,
  tarih date not null default current_date,
  yontem text not null default 'havale' check (yontem in ('nakit', 'havale', 'kredi_karti', 'paytr', 'cek')),
  kasa_id uuid references public.kasa_hesaplari(id) on delete set null,
  aciklama text,
  odeme_id uuid references public.odemeler(id) on delete set null, -- PayTR bağlantısı
  created_at timestamptz default now()
);

-- ========================
-- GİDERLER
-- ========================
create table if not exists public.giderler (
  id uuid default uuid_generate_v4() primary key,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  tedarikci_id uuid references public.tedarikciler(id) on delete set null,
  cari_id uuid references public.cariler(id) on delete set null,
  kategori text default 'Genel',
  aciklama text,
  tutar numeric(14,2) not null,
  tarih date not null default current_date,
  kasa_id uuid references public.kasa_hesaplari(id) on delete set null,
  fatura_no text,
  durum text not null default 'bekliyor' check (durum in ('bekliyor', 'odendi')),
  created_at timestamptz default now()
);

-- İndeksler
create index if not exists idx_fatura_cari on public.faturalar(cari_id);
create index if not exists idx_fatura_etkinlik on public.faturalar(etkinlik_id);
create index if not exists idx_kasa_hareket_kasa on public.kasa_hareketleri(kasa_id);
create index if not exists idx_tahsilat_cari on public.tahsilatlar(cari_id);
create index if not exists idx_tahsilat_etkinlik on public.tahsilatlar(etkinlik_id);
create index if not exists idx_gider_etkinlik on public.giderler(etkinlik_id);

-- RLS — finans yalnızca muhasebe & yönetici
alter table public.cariler enable row level security;
alter table public.kasa_hesaplari enable row level security;
alter table public.kasa_hareketleri enable row level security;
alter table public.faturalar enable row level security;
alter table public.fatura_kalemleri enable row level security;
alter table public.tahsilatlar enable row level security;
alter table public.giderler enable row level security;

create policy "Muhasebe cari yonetir" on public.cariler for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe kasa yonetir" on public.kasa_hesaplari for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe kasa hareket yonetir" on public.kasa_hareketleri for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe fatura yonetir" on public.faturalar for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe fatura kalem yonetir" on public.fatura_kalemleri for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe tahsilat yonetir" on public.tahsilatlar for all using (public.has_rol(array['muhasebe']));
create policy "Muhasebe gider yonetir" on public.giderler for all using (public.has_rol(array['muhasebe']));

-- ================================================
-- FAZ 5 — Sözleşme / Aktivite (Audit)
-- ================================================

-- ========================
-- SÖZLEŞMELER (teklif → sözleşme → imza)
-- ========================
create table if not exists public.sozlesmeler (
  id uuid default uuid_generate_v4() primary key,
  sozlesme_no text,
  teklif_id uuid references public.teklifler(id) on delete set null,
  etkinlik_id uuid references public.etkinlikler(id) on delete set null,
  musteri_id uuid references public.profiles(id) on delete set null,
  cari_id uuid references public.cariler(id) on delete set null,
  musteri_ad text,
  baslik text not null,
  tutar numeric(14,2) default 0,
  durum text not null default 'taslak' check (durum in ('taslak', 'gonderildi', 'imzalandi', 'iptal')),
  -- imzalı belge (belgeler.islak_imza) bağlantısı
  belge_id uuid references public.belgeler(id) on delete set null,
  gonderim_tarihi timestamptz,
  imza_tarihi timestamptz,
  notlar text,
  created_at timestamptz default now()
);

-- ========================
-- AKTİVİTELER (audit log — kim ne yaptı)
-- ========================
create table if not exists public.aktiviteler (
  id uuid default uuid_generate_v4() primary key,
  personel_id uuid references public.profiles(id) on delete set null,
  personel_ad text,
  eylem text not null,            -- 'teklif_olusturuldu', 'fatura_kesildi' vb.
  ozet text not null,
  hedef_tur text,                 -- teklif | fatura | lead | etkinlik ...
  hedef_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_sozlesme_etkinlik on public.sozlesmeler(etkinlik_id);
create index if not exists idx_aktivite_tarih on public.aktiviteler(created_at desc);

alter table public.sozlesmeler enable row level security;
alter table public.aktiviteler enable row level security;

create policy "Personel sozlesme yonetir" on public.sozlesmeler for all using (public.is_personel());
create policy "Personel aktivite gorur" on public.aktiviteler for select using (public.is_personel());
create policy "Personel aktivite ekler" on public.aktiviteler for insert with check (public.is_personel());

-- ================================================
-- FAZ 6 — Dijital Pazarlama (Kampanya / İçerik Takvimi)
-- ================================================

-- ========================
-- KAMPANYALAR (toplu e-posta / SMS)
-- ========================
create table if not exists public.kampanyalar (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  kanal text not null default 'email' check (kanal in ('email', 'sms')),
  hedef_segment text not null default 'tumu' check (hedef_segment in ('tumu', 'b2b', 'b2c')),
  sablon_id uuid references public.sablonlar(id) on delete set null,
  konu text,
  icerik text,
  durum text not null default 'taslak' check (durum in ('taslak', 'planlandi', 'gonderildi')),
  alici_sayisi integer default 0,
  acilma_sayisi integer default 0,
  tiklama_sayisi integer default 0,
  donusum_sayisi integer default 0,
  gonderim_tarihi timestamptz,
  olusturan_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ========================
-- İÇERİK TAKVİMİ (sosyal medya gönderi planlama)
-- ========================
create table if not exists public.icerik_takvimi (
  id uuid default uuid_generate_v4() primary key,
  baslik text not null,
  platform text not null default 'instagram' check (platform in ('instagram', 'facebook', 'linkedin', 'tiktok', 'youtube')),
  tip text not null default 'gonderi' check (tip in ('gonderi', 'reel', 'hikaye', 'etkinlik_duyuru')),
  tarih date not null,
  durum text not null default 'fikir' check (durum in ('fikir', 'tasarim', 'onay', 'yayinlandi')),
  notlar text,
  gorsel_url text,
  sorumlu_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_kampanya_durum on public.kampanyalar(durum);
create index if not exists idx_icerik_tarih on public.icerik_takvimi(tarih);

alter table public.kampanyalar enable row level security;
alter table public.icerik_takvimi enable row level security;

create policy "Satis kampanya yonetir" on public.kampanyalar for all using (public.has_rol(array['satis']));
create policy "Satis icerik yonetir" on public.icerik_takvimi for all using (public.has_rol(array['satis']));

-- ================================================
-- FAZ 7 — Ölçekleme & Telemarketing (22k+ İSO datası)
-- ================================================

-- leadler'e ölçekleme + telemarketing alanları
alter table public.leadler add column if not exists il text;
alter table public.leadler add column if not exists ilce text;
alter table public.leadler add column if not exists sektor text;                 -- faaliyet alanı / NACE
alter table public.leadler add column if not exists arama_durumu text default 'aranmadi';
alter table public.leadler add column if not exists son_arama_tarihi timestamptz;
alter table public.leadler add column if not exists geri_arama_tarihi date;
alter table public.leadler add column if not exists arayan_id uuid references public.profiles(id) on delete set null;

-- arama_durumu değer kısıtı
alter table public.leadler drop constraint if exists leadler_arama_durumu_check;
alter table public.leadler add constraint leadler_arama_durumu_check
  check (arama_durumu in ('aranmadi', 'ulasildi', 'mesgul', 'ulasilamadi', 'ilgilenmiyor', 'randevu', 'geri_ara'));

-- Toplu içe aktarmada mükerrer engelleme (telefon dolu olanlar tekil) — upsert on_conflict için
create unique index if not exists uq_lead_telefon on public.leadler (telefon) where telefon is not null;

-- Hızlı filtreleme/arama indeksleri (22k+ satırda sunucu-taraflı sorgular için)
create index if not exists idx_lead_il on public.leadler (il);
create index if not exists idx_lead_sektor on public.leadler (sektor);
create index if not exists idx_lead_arama_durumu on public.leadler (arama_durumu);
create index if not exists idx_lead_geri_arama on public.leadler (geri_arama_tarihi);
create index if not exists idx_lead_created on public.leadler (created_at desc);
-- Ünvan/e-posta metin araması için trigram (opsiyonel ama önerilir)
create extension if not exists pg_trgm;
create index if not exists idx_lead_unvan_trgm on public.leadler using gin (ad_unvan gin_trgm_ops);

-- ================================================
-- RBAC DÜZELTME — eski 'admin' politikaları → personel/yönetici
-- (Ana şemadaki role='admin' kontrolleri, göç sonrası çalışmaz;
--  is_personel()/has_rol() ile yeniden oluşturulur. Bu bölüm en sonda,
--  is_personel() tanımlandıktan SONRA çalışır.)
-- ================================================

-- PROFILES: personel tüm profilleri görür/yönetir
drop policy if exists "Admin herkesi gorebilir" on public.profiles;
create policy "Personel tum profilleri gorur" on public.profiles for all using (public.is_personel());

-- ETKINLIKLER
drop policy if exists "Admin tum etkinlikleri gorebilir" on public.etkinlikler;
create policy "Personel tum etkinlikleri yonetir" on public.etkinlikler for all using (public.is_personel());

-- MISAFIRLER
drop policy if exists "Admin tum misafirleri gorebilir" on public.misafirler;
create policy "Personel tum misafirleri yonetir" on public.misafirler for all using (public.is_personel());

-- ODEMELER (PayTR) — finans + operasyon görebilsin
drop policy if exists "Admin tum odemeleri gorebilir" on public.odemeler;
create policy "Personel tum odemeleri yonetir" on public.odemeler for all using (public.is_personel());

-- BELGELER
drop policy if exists "Admin tum belgeleri yonetebilir" on public.belgeler;
create policy "Personel tum belgeleri yonetir" on public.belgeler for all using (public.is_personel());

-- DEGERLENDIRMELER
drop policy if exists "Admin tum degerlendirmeleri gorebilir" on public.degerlendirmeler;
create policy "Personel tum degerlendirmeleri gorur" on public.degerlendirmeler for all using (public.is_personel());

-- BILDIRIMLER — personel bildirim oluşturabilir
drop policy if exists "Admin bildirim olusturabilir" on public.bildirimler;
create policy "Personel bildirim olusturabilir" on public.bildirimler for insert with check (public.is_personel());

-- ETKINLIK GORSELLERI
drop policy if exists "Admin tum fotograflari yonetebilir" on public.etkinlik_gorselleri;
create policy "Personel tum fotograflari yonetir" on public.etkinlik_gorselleri for all using (public.is_personel());

-- TALEPLER
drop policy if exists "Admin tum talepleri gorebilir" on public.talepler;
create policy "Personel tum talepleri yonetir" on public.talepler for all using (public.is_personel());

-- ================================================
-- STORAGE — belgeler bucket politikaları (bucket'ı Dashboard'dan
--  ya da aşağıdaki insert ile oluşturun; sonra bu politikalar çalışır)
-- ================================================
insert into storage.buckets (id, name, public)
  values ('belgeler', 'belgeler', false)
  on conflict (id) do nothing;

drop policy if exists "Personel belgeler bucket yonetir" on storage.objects;
create policy "Personel belgeler bucket yonetir" on storage.objects for all
  using (bucket_id = 'belgeler' and public.is_personel());

-- Müşteri kendi etkinliğinin dosyalarını okuyabilir/yükleyebilir (klasör = etkinlik_id)
drop policy if exists "Musteri kendi belgelerini gorur" on storage.objects;
create policy "Musteri kendi belgelerini gorur" on storage.objects for select
  using (
    bucket_id = 'belgeler' and exists (
      select 1 from public.etkinlikler e
      where e.musteri_id = auth.uid()
        and (storage.foldername(name))[1] = e.id::text
    )
  );
