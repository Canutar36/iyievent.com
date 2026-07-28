-- ============================================================
-- HİZMET & EKSTRA OKUMA İZNİ (RLS Düzeltmesi)
-- Mevcut personel politikalarını bozmadan, tüm authenticated
-- kullanıcıların hizmet ve ekstraları okumasına izin verir.
-- ============================================================

-- Hizmetleri okuma izni (aktif olanlar)
create policy "Musteriler hizmetleri okuyabilir"
  on public.hizmetler
  for select
  to authenticated
  using (aktif = true);

-- Ekstraları okuma izni (aktif olanlar)
create policy "Musteriler ekstralari okuyabilir"
  on public.ekstralar
  for select
  to authenticated
  using (aktif = true);

-- Tamamlandı
DO $$ BEGIN RAISE NOTICE '=== HİZMET & EKSTRA OKUMA İZNİ EKLENDİ ==='; END $$;
