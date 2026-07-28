-- ============================================================
-- BİLDİRİM SİSTEMİ
-- ============================================================

-- RLS: Personel tüm bildirimleri okuyabilir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Personel bildirimleri okuyabilir' AND tablename = 'bildirimler'
  ) THEN
    create policy "Personel bildirimleri okuyabilir"
      on public.bildirimler for select to authenticated
      using (public.is_personel());
  END IF;
END $$;

-- RLS: Sistem bildirim oluşturabilir (service role ile)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Sistem bildirim olusturabilir' AND tablename = 'bildirimler'
  ) THEN
    create policy "Sistem bildirim olusturabilir"
      on public.bildirimler for insert to authenticated
      with check (true);
  END IF;
END $$;

-- RLS: Personel kendi bildirimlerini okundu olarak isaretleyebilir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Personel bildirim guncelleyebilir' AND tablename = 'bildirimler'
  ) THEN
    create policy "Personel bildirim guncelleyebilir"
      on public.bildirimler for update to authenticated
      using (public.is_personel());
  END IF;
END $$;

-- Yeni etkinlik talebi geldiğinde otomatik bildirim oluşturma fonksiyonu
create or replace function public.etkinlik_talep_bildirim()
returns trigger as $$
begin
  insert into public.bildirimler (kullanici_id, baslik, mesaj, tur, link)
  select
    p.id,
    'Yeni Etkinlik Talebi',
    coalesce((select full_name from public.profiles where id = new.musteri_id), 'Bilinmeyen Müşteri') || ' — ' || coalesce(new.ad, 'Etkinlik talebi'),
    'bilgi',
    '/yonetim/etkinlikler'
  from public.profiles p
  where p.role in ('yonetici', 'admin', 'satis', 'operasyon');
  return new;
end;
$$ language plpgsql security definer;

-- Tetikleyici: etkinlikler tablosuna yeni kayıt eklendiğinde
drop trigger if exists on_etkinlik_talep on public.etkinlikler;
create trigger on_etkinlik_talep
  after insert on public.etkinlikler
  for each row execute function public.etkinlik_talep_bildirim();

-- Otomatik bildirim fonksiyonu için izin
grant execute on function public.etkinlik_talep_bildirim() to authenticated;

DO $$ BEGIN RAISE NOTICE '=== BILDIRIM SISTEMI KURULDU ==='; END $$;
