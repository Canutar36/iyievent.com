-- Müşterilerin kendi etkinlik taleplerini oluşturmasına izin ver
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Musteri kendi etkinliklerini olusturabilir' AND tablename = 'etkinlikler'
  ) THEN
    create policy "Musteri kendi etkinliklerini olusturabilir"
      on public.etkinlikler
      for insert
      to authenticated
      with check (musteri_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '=== ETKINLIK INSERT IZNI EKLENDI ==='; END $$;
