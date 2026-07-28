-- ============================================================
-- MÜŞTERİ PORTALI İÇİN EKSİK SÜTUN KONTROLÜ
-- Bu betiği Supabase SQL Editor'a yapıştırarak çalıştırın.
-- Mevcut tabloları bozmaz, sadece eksik sütunları ekler.
-- ============================================================

-- 1. TEKLİFLER TABLOSU — eksik sütunları ekle
DO $$
BEGIN
  -- toplam_tutar sütunu (mevcut: toplam)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teklifler' AND column_name = 'toplam_tutar') THEN
    ALTER TABLE teklifler ADD COLUMN toplam_tutar numeric(12,2) DEFAULT 0;
    -- Mevcut toplam verisini kopyala
    UPDATE teklifler SET toplam_tutar = toplam WHERE toplam_tutar IS NULL OR toplam_tutar = 0;
    RAISE NOTICE 'teklifler: toplam_tutar sütunu eklendi';
  ELSE
    RAISE NOTICE 'teklifler: toplam_tutar zaten mevcut';
  END IF;

  -- gecerlilik_tarihi sütunu (zaten ERP şemasında var, kontrol et)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teklifler' AND column_name = 'gecerlilik_tarihi') THEN
    ALTER TABLE teklifler ADD COLUMN gecerlilik_tarihi date;
    RAISE NOTICE 'teklifler: gecerlilik_tarihi sütunu eklendi';
  END IF;
END $$;

-- 2. TEKLİF KALEMLERİ TABLOSU — eksik sütunları ekle
DO $$
BEGIN
  -- hizmet_adi sütunu (mevcut: ad)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teklif_kalemleri' AND column_name = 'hizmet_adi') THEN
    ALTER TABLE teklif_kalemleri ADD COLUMN hizmet_adi text;
    -- Mevcut ad verisini kopyala
    UPDATE teklif_kalemleri SET hizmet_adi = ad WHERE hizmet_adi IS NULL;
    RAISE NOTICE 'teklif_kalemleri: hizmet_adi sütunu eklendi';
  ELSE
    RAISE NOTICE 'teklif_kalemleri: hizmet_adi zaten mevcut';
  END IF;

  -- miktar sütunu (mevcut: adet)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teklif_kalemleri' AND column_name = 'miktar') THEN
    ALTER TABLE teklif_kalemleri ADD COLUMN miktar numeric(12,2) DEFAULT 1;
    -- Mevcut adet verisini kopyala
    UPDATE teklif_kalemleri SET miktar = adet WHERE miktar IS NULL OR miktar = 0;
    RAISE NOTICE 'teklif_kalemleri: miktar sütunu eklendi';
  ELSE
    RAISE NOTICE 'teklif_kalemleri: miktar zaten mevcut';
  END IF;

  -- toplam sütunu (mevcut: tutar)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teklif_kalemleri' AND column_name = 'toplam') THEN
    ALTER TABLE teklif_kalemleri ADD COLUMN toplam numeric(12,2) DEFAULT 0;
    -- Mevcut tutar verisini kopyala
    UPDATE teklif_kalemleri SET toplam = tutar WHERE toplam IS NULL OR toplam = 0;
    RAISE NOTICE 'teklif_kalemleri: toplam sütunu eklendi';
  ELSE
    RAISE NOTICE 'teklif_kalemleri: toplam zaten mevcut';
  END IF;
END $$;

-- 3. SÖZLEŞMELER TABLOSU — eksik sütunları ekle
DO $$
BEGIN
  -- ad sütunu (mevcut: baslik)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sozlesmeler' AND column_name = 'ad') THEN
    ALTER TABLE sozlesmeler ADD COLUMN ad text;
    -- Mevcut baslik verisini kopyala
    UPDATE sozlesmeler SET ad = baslik WHERE ad IS NULL;
    RAISE NOTICE 'sozlesmeler: ad sütunu eklendi';
  ELSE
    RAISE NOTICE 'sozlesmeler: ad zaten mevcut';
  END IF;

  -- dosya_yolu sütunu (mevcut: belge_id referansı)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sozlesmeler' AND column_name = 'dosya_yolu') THEN
    ALTER TABLE sozlesmeler ADD COLUMN dosya_yolu text;
    RAISE NOTICE 'sozlesmeler: dosya_yolu sütunu eklendi';
  ELSE
    RAISE NOTICE 'sozlesmeler: dosya_yolu zaten mevcut';
  END IF;
END $$;

-- 4. FATURALAR TABLOSU — eksik sütunları ekle
DO $$
BEGIN
  -- toplam_tutar sütunu (mevcut: toplam)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faturalar' AND column_name = 'toplam_tutar') THEN
    ALTER TABLE faturalar ADD COLUMN toplam_tutar numeric(12,2) DEFAULT 0;
    -- Mevcut toplam verisini kopyala
    UPDATE faturalar SET toplam_tutar = toplam WHERE toplam_tutar IS NULL OR toplam_tutar = 0;
    RAISE NOTICE 'faturalar: toplam_tutar sütunu eklendi';
  ELSE
    RAISE NOTICE 'faturalar: toplam_tutar zaten mevcut';
  END IF;

  -- dosya_yolu sütunu (mevcut: pdf_url)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faturalar' AND column_name = 'dosya_yolu') THEN
    ALTER TABLE faturalar ADD COLUMN dosya_yolu text;
    -- Mevcut pdf_url verisini kopyala
    UPDATE faturalar SET dosya_yolu = pdf_url WHERE dosya_yolu IS NULL;
    RAISE NOTICE 'faturalar: dosya_yolu sütunu eklendi';
  ELSE
    RAISE NOTICE 'faturalar: dosya_yolu zaten mevcut';
  END IF;

  -- musteri_id sütunu (eğer yoksa)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faturalar' AND column_name = 'musteri_id') THEN
    ALTER TABLE faturalar ADD COLUMN musteri_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'faturalar: musteri_id sütunu eklendi';
  ELSE
    RAISE NOTICE 'faturalar: musteri_id zaten mevcut';
  END IF;
END $$;

-- 5. FATURA KALEMLERİ TABLOSU — eksik sütunları ekle
DO $$
BEGIN
  -- aciklama sütunu (mevcut: ad)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fatura_kalemleri' AND column_name = 'aciklama') THEN
    ALTER TABLE fatura_kalemleri ADD COLUMN aciklama text;
    -- Mevcut ad verisini kopyala
    UPDATE fatura_kalemleri SET aciklama = ad WHERE aciklama IS NULL;
    RAISE NOTICE 'fatura_kalemleri: aciklama sütunu eklendi';
  ELSE
    RAISE NOTICE 'fatura_kalemleri: aciklama zaten mevcut';
  END IF;

  -- miktar sütunu (mevcut: adet)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fatura_kalemleri' AND column_name = 'miktar') THEN
    ALTER TABLE fatura_kalemleri ADD COLUMN miktar numeric(12,2) DEFAULT 1;
    -- Mevcut adet verisini kopyala
    UPDATE fatura_kalemleri SET miktar = adet WHERE miktar IS NULL OR miktar = 0;
    RAISE NOTICE 'fatura_kalemleri: miktar sütunu eklendi';
  ELSE
    RAISE NOTICE 'fatura_kalemleri: miktar zaten mevcut';
  END IF;
END $$;

-- ============================================================
-- SONUÇ KONTROL
-- ============================================================
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('teklifler', 'teklif_kalemleri', 'sozlesmeler', 'faturalar', 'fatura_kalemleri')
ORDER BY table_name, ordinal_position;

-- Tamamlandı mesajı
DO $$ BEGIN RAISE NOTICE '=== MÜŞTERİ PORTALI SÜTUN KONTROLÜ TAMAMLANDI ==='; END $$;
