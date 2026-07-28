-- RLS politikalari zaten mevcut, atlaniyor.

-- ============================================================
-- ADIM 2: ESKİ VERİLERİ TEMİZLE (isteğe bağlı, idempotent)
-- ============================================================
TRUNCATE TABLE hizmetler RESTART IDENTITY CASCADE;
TRUNCATE TABLE ekstralar RESTART IDENTITY CASCADE;


-- ============================================================
-- ADIM 3: HİZMETLER
-- ============================================================

INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES

-- KURUMSAL
('Kurumsal Gala Gecesi', 'kurumsal', 'Sahne, prodüksiyon, ikram ve VIP karsilama dahil luks gala organizasyonu.', 'kisi_basi', 2500, 100, true, 1),
('Sirket Yemegi & Davet', 'kurumsal', 'Restoran veya salonda kurumsal yemek organizasyonu, menu ve servis dahil.', 'kisi_basi', 1200, 20, true, 2),
('Urun Tanitim Lansmani', 'kurumsal', 'Urun lansmani icin sahne, teknik ekipman, ikram ve medya daveti.', 'sabit', 85000, 0, true, 3),
('Bayi Toplantisi & Motivasyon', 'kurumsal', 'Toplanti salonu, teknik ekipman, kahve molasi ve aksam yemegi dahil.', 'kisi_basi', 800, 30, true, 4),
('Odul Toreni', 'kurumsal', 'Sahne tasarimi, altin kaplama oduller, konuk sunucu ve galalar.', 'kisi_basi', 1800, 50, true, 5),
('Yilbasi Partisi', 'kurumsal', 'Sezon sonu kutlamasi, dekor, canli muzik ve ikram paketi.', 'kisi_basi', 950, 40, true, 6),
('Bayram Kutlamasi & Kokteyl', 'kurumsal', 'Resmi bayram kutlamasi icin kokteyl duzeni ve ikram.', 'kisi_basi', 600, 30, true, 7),
('Toplanti & Konferans', 'kurumsal', 'Tam donanimli toplanti salonu, projeksiyon, ses sistemi ve kahve molası.', 'kisi_basi', 350, 20, true, 8),
('Networking Kokteyli', 'kurumsal', 'Ayakta kokteyl duzeni, hafif ikram ve networking alani tasarimi.', 'kisi_basi', 500, 30, true, 9),
('Fuar & Stand Organizasyonu', 'kurumsal', 'Stand tasarimi, kurulum, teknik ekipman ve personel destegi.', 'sabit', 120000, 0, true, 10),
('Kapanis Kokteyli / After Party', 'kurumsal', 'Etkinlik sonrasi kutlama kokteyli, DJ ve hafif ikram.', 'kisi_basi', 700, 30, true, 11),

-- BIREYSEL & OZEL GUN
('Dugun Organizasyonu', 'bireysel', 'Konsept tasarim, gelin damat hazirligi, mekan susleme, koordinasyon ve tum gun yonetim.', 'kisi_basi', 3500, 50, true, 1),
('Nikah Toreni & Tore Sonrasi Kokteyl', 'bireysel', 'Nikah alani susleme, kokteyl duzeni, fotograf cekimi ve koordinasyon.', 'kisi_basi', 1500, 30, true, 2),
('Nisan Toreni', 'bireysel', 'Nisan alani susleme, tepsiler, ikram ve koordinasyon.', 'kisi_basi', 1200, 20, true, 3),
('Kina Gecesi', 'bireysel', 'Geleneksel kina gecesi organizasyonu, bindalli, kina tahti ve ikram.', 'kisi_basi', 800, 30, true, 4),
('Evlilik Teklifi Kurgusu', 'bireysel', 'Ozel mekanda dekorasyon, cicek, fotograf ve video cekimi dahil romantik kurgu.', 'sabit', 28000, 0, true, 5),
('Dogum Gunu Partisi (Yetiskin)', 'bireysel', 'Tema dekorasyon, pasta, ikram ve eglence organizasyonu.', 'kisi_basi', 500, 20, true, 6),
('Mezuniyet Kutlamasi', 'bireysel', 'Mezuniyet partisi dekoru, ikram ve fotograf kosesi.', 'kisi_basi', 450, 20, true, 7),
('Baby Shower', 'bireysel', 'Bebek karsilama partisi dekoru, ikram ve oyunlar.', 'kisi_basi', 350, 15, true, 8),
('Cenaze Yemegi & Taziye', 'bireysel', 'Taziye evi duzeni, yemek ikrami ve koordinasyon.', 'kisi_basi', 200, 30, true, 9),
('Ozel Yildonumu Kutlamasi', 'bireysel', 'Romantik aksam yemegi, cicek ve ozel dekorasyon.', 'sabit', 15000, 0, true, 10),
('Dis Bugdayi', 'bireysel', 'Geleneksel dis bugdayi toreni, ikram ve susleme.', 'kisi_basi', 400, 20, true, 11),
('Kina Gecesi (Modern)', 'bireysel', 'Modern konsept kina gecesi, LED dekor, DJ ve ozel ikram.', 'kisi_basi', 1000, 30, true, 12),

-- TEMATIK & ACIK HAVA
('Luks Bohem Piknik', 'tematik', 'Sahilde veya ormanda yer minderleri, ahshap masalar, sik catering ve dekor.', 'kisi_basi', 1200, 10, true, 1),
('Kir Dugunu', 'tematik', 'Acik hava dugunu, cicek duvari, dogal dekor ve yemek servisi.', 'kisi_basi', 2800, 50, true, 2),
('Sahil Partisi', 'tematik', 'Sahil seridinde kokteyl duzeni, sandalye ve semsiye, hafif ikram.', 'kisi_basi', 700, 20, true, 3),
('Bahce Partisi', 'tematik', 'Acik bahcede tema partisi, dekor, bahce mobilyasi ve ikram.', 'kisi_basi', 600, 20, true, 4),
('Yoga & Wellness Etkinligi', 'tematik', 'Acik havada yoga seansi, wellness ikramlari ve meditasyon alani.', 'kisi_basi', 300, 10, true, 5),
('Fotograf Cekimi Organizasyonu', 'tematik', 'Dugun, nisan veya ozel gun fotograf cekimi icin mekan ve konsept tasarimi.', 'sabit', 12000, 0, true, 6),
('Vintage / Retro Partisi', 'tematik', '70ler, 80ler veya 90lar temali parti, dekor ve muzik.', 'kisi_basi', 550, 20, true, 7),
('Hollywood / Red Carpet Partisi', 'tematik', 'Kirmizi hali, spotlight, film yildizi temali dekor ve ikram.', 'kisi_basi', 750, 25, true, 8),
('Casablanca / Oriental Partisi', 'tematik', 'Fas temali dekor, nargile kosesi, oryantal muzik ve ozel ikram.', 'kisi_basi', 650, 20, true, 9),
('Masal & Peri Temali Parti', 'tematik', 'Peri kostumleri, sihirbaz gosterisi, temali pasta ve dekor.', 'kisi_basi', 500, 15, true, 10),
('Gastronomi & Tadim Etkinligi', 'tematik', 'Sef esliginde yemek tadimi, sarap eslestirme ve sohbet.', 'kisi_basi', 900, 15, true, 11),
('Kamp & Outdoor Etkinligi', 'tematik', 'Kamp kurulumu, mangal, acik hava sinemasi ve outdoor aktiviteler.', 'kisi_basi', 450, 15, true, 12),

-- COCUK
('Cocuk Dogum Gunu Partisi', 'cocuk', 'Tema dekorasyon, palyaco, sihirbaz, pasta ve hediyelikler.', 'kisi_basi', 350, 10, true, 1),
('Palyaco & Eglence Paketi', 'cocuk', 'Palyaco, yuz boyama, balon Heykel ve oyunlar.', 'sabit', 8000, 0, true, 2),
('Masal Kahramanlari Partisi', 'cocuk', 'Kostumlu karakterler, hikaye anlatimi ve temali ikram.', 'kisi_basi', 400, 10, true, 3),
('Bilim & Teknoloji Partisi', 'cocuk', 'Deneyler, robotik atolye ve STEM aktiviteleri.', 'kisi_basi', 450, 10, true, 4),
('Su Parki & Yaz Partisi', 'cocuk', 'Su oyunlari, sisme havuz, su tabancasi ve soguk ikramlar.', 'kisi_basi', 300, 15, true, 5),
('Okul Etkinligi & Mezuniyet', 'cocuk', 'Okul bahcesinde etkinlik, sahne, ses ve ikram organizasyonu.', 'kisi_basi', 200, 30, true, 6),
('Sunnet Dugunu', 'cocuk', 'Sunnet toreni, taht susleme, davul zurna ve konvoy organizasyonu.', 'kisi_basi', 500, 30, true, 7),
('Cocuk Tiyatrosu & Gosteri', 'cocuk', 'Cocuklara yonelik interaktif tiyatro veya kukla gosterisi.', 'sabit', 15000, 0, true, 8),
('Ata Binme & Ciftlik Ziyareti', 'cocuk', 'Ciftlikte at binme, hayvan besleme ve doga aktiviteleri.', 'kisi_basi', 250, 10, true, 9),
('Bisiklet & Paten Etkinligi', 'cocuk', 'Guvenli alanda bisiklet/paten turu, mini yarismalar.', 'kisi_basi', 200, 10, true, 10),

-- DINI & GELENEKSEL
('Iftar Daveti & Organizasyonu', 'dini', 'Bahce veya salonda iftar yemegi, sofra duzeni, davet ve ikram.', 'kisi_basi', 500, 30, true, 1),
('Sahur Daveti', 'dini', 'Sahur yemegi organizasyonu, sofra duzeni ve ikram.', 'kisi_basi', 350, 20, true, 2),
('Asure Gunu Dagitimi', 'dini', 'Asure pisirme, paketleme ve dagitimi, susleme.', 'kisi_basi', 50, 50, true, 3),
('Kandil Kutlamasi', 'dini', 'Kandil gecesi ozel program, ikram ve sohbet organizasyonu.', 'kisi_basi', 200, 20, true, 4),
('Mevlid-i Serif Programi', 'dini', 'Mevlid okuma programi, ikram ve davet organizasyonu.', 'kisi_basi', 150, 20, true, 5),
('Kina Gecesi (Dini)', 'dini', 'Dini vecibeler esliginde kina gecesi, ilahi ve ikram.', 'kisi_basi', 600, 25, true, 6),
('Cenaze Yemegi', 'dini', 'Cenaze sonrasi taziye yemegi, sofra duzeni ve servis.', 'kisi_basi', 150, 40, true, 7),
('Mezarlik Ziyareti & Mevlut', 'dini', 'Mezarlik ziyareti koordinasyonu, mevlut okuma ve ikram.', 'sabit', 5000, 0, true, 8),
('Hatim Daveti', 'dini', 'Hatim duasi programi, ikram ve davet organizasyonu.', 'kisi_basi', 120, 20, true, 9),
('Hayir Cadirı Kurulumu', 'dini', 'Cadir kurulumu, sofra, ikram ve gonullu organizasyonu.', 'sabit', 25000, 0, true, 10),
('Ilahi Grubu & Semazen Gosterisi', 'dini', 'Profesyonel ilahi grubu veya semazen gosterisi organizasyonu.', 'sabit', 18000, 0, true, 11),
('Dugun Takviye (Dini Toren)', 'dini', 'Dini nikah toreni, hoca daveti ve dini vecibe organizasyonu.', 'sabit', 8000, 0, true, 12);


-- ============================================================
-- ADIM 4: EKSTRALAR
-- ============================================================

INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES

-- IKRAM
('Dondurma Arabasi', 'Ikram', 'Taze dondurma servisi yapan dekoratif arabasi.', 'sabit', 15000, true, 1),
('Patlamis Misir Standi', 'Ikram', 'Sicak patlamis misir servisi.', 'sabit', 8000, true, 2),
('Pamuk Seker Standi', 'Ikram', 'Renkli pamuk seker yapimi ve servisi.', 'sabit', 6000, true, 3),
('Makarna Standi', 'Ikram', 'Taze makarna cesitleri sunumu.', 'sabit', 12000, true, 4),
('Kokteyl Ikrami', 'Ikram', 'Ayakta kokteyl duzeni, meze ve hafif atistirmalik.', 'kisi', 250, true, 5),
('Turkish Coffee Corner', 'Ikram', 'Ozel Turk kahvesi kosesi, lokum ve kurabiye.', 'kisi', 80, true, 6),
('Cikolata Fountain', 'Ikram', 'Cikolata selesi, meyve ve kurabiye dalama.', 'sabit', 10000, true, 7),
('Meyve Tabagi & Taze Sıkma', 'Ikram', 'Mevsim meyveleri ve taze sikma meyve suyu istasyonu.', 'kisi', 120, true, 8),
('Kuru Pasta & Kurabiye', 'Ikram', 'El yapimi kuru pasta ve kurabiye cesitleri.', 'kisi', 60, true, 9),
('Tuzlu Atistirmalik', 'Ikram', 'Cerez, cips ve tuzlu cubuk karisimi.', 'kisi', 40, true, 10),
('Waffle & Crepe Istasyonu', 'Ikram', 'Canli waffle ve crepe yapimi.', 'sabit', 12000, true, 11),
('Bubble Tea Istasyonu', 'Ikram', 'Renkli bubble tea cesitleri.', 'kisi', 100, true, 12),
('Tavuklu/Sebzeli Cubuklar', 'Ikram', 'Izgara tavuk ve sebze cubuklari, dip soslar.', 'kisi', 90, true, 13),

-- EGLENE
('Sarkici / Canli Muzik', 'Eglence', 'Profesyonel sarkici veya duo canli performans.', 'sabit', 35000, true, 1),
('DJ Performansi', 'Eglence', 'Profesyonel DJ, ses sistemi ve isik dahil.', 'sabit', 20000, true, 2),
('Dugun Orkestrasi', 'Eglence', '6-12 kisilik canli orkestra, repertuvar ve ekipman.', 'sabit', 65000, true, 3),
('Palyaco', 'Eglence', 'Cocuk partileri icin profesyonel palyaco.', 'sabit', 6000, true, 4),
('Yuz Boyama', 'Eglence', 'Profesyonel yuz boyama sanatcisi.', 'sabit', 5000, true, 5),
('Sihirbaz Gosterisi', 'Eglence', 'Profesyonel sahne sihirbazi gosterisi.', 'sabit', 15000, true, 6),
('Bubble Show', 'Eglence', 'Buyuk balon gosterisi, cocuklara yonelik.', 'sabit', 8000, true, 7),
('Ates Sav', 'Eglence', 'Profesyonel ates dancisi gosterisi.', 'sabit', 25000, true, 8),
('LED Gosteri', 'Eglence', 'LED kostumlu dancilar, UV show.', 'sabit', 30000, true, 9),
('Havai Fisek Gosterisi', 'Eglence', 'Profesyonel havai fisek gosterisi, 5-10 dakika.', 'sabit', 45000, true, 10),
('Confeti Makinesi', 'Eglence', 'Konfeti ve streamer efekti makinesi.', 'sabit', 4000, true, 11),
('Oryantal Danci', 'Eglence', 'Profesyonel oryantal dans performansi.', 'sabit', 12000, true, 12),
('Davul & Zurna', 'Eglence', 'Geleneksel davul zurna ekibi.', 'sabit', 8000, true, 13),
('Muzik Grubu / Band', 'Eglence', 'Canli muzik grubu, rock/pop/jazz repertuvar.', 'sabit', 45000, true, 14),
('Karaoke Istasyonu', 'Eglence', 'Karaoke sistemi, ekran ve mikrofon.', 'sabit', 7000, true, 15),

-- TEKNIK
('Ses Sistemi (Kucuk)', 'Teknik', '100 kisiye kadar ses sistemi, 2 hoparlor ve mikrofon.', 'sabit', 8000, true, 1),
('Ses Sistemi (Buyuk)', 'Teknik', '200+ kisiye kadar profesyonel ses sistemi.', 'sabit', 20000, true, 2),
('Isiklandirma Paketi', 'Teknik', 'Sahne ve dans alani icin temel isiklandirma.', 'sabit', 12000, true, 3),
('LED Ekran', 'Teknik', 'P3 LED ekran, sunum ve video gosterimi icin.', 'adet', 12000, true, 4),
('Sahne Kurulumu', 'Teknik', 'Moduler sahne, 4x6m, korkuluk dahil.', 'sabit', 25000, true, 5),
('Projeksiyon Sistemi', 'Teknik', 'Full HD projeksiyon ve perde.', 'sabit', 10000, true, 6),
('Jenerator', 'Teknik', 'Dis mekan icin mobil jenerator, 30 kVA.', 'sabit', 8000, true, 7),
('Klima / Isitici', 'Teknik', 'Sicak veya soguk hava icin mobil iklimlendirme.', 'sabit', 6000, true, 8),
('Wi-Fi Hotspot', 'Teknik', 'Etkinlik alani icin ozel Wi-Fi noktasi.', 'sabit', 5000, true, 9),
('Cevirmenlik Sistemi', 'Teknik', 'Simultane cevirmenlik icin kabin ve kulaklik seti.', 'sabit', 15000, true, 10),
('Lazer Gosteri', 'Teknik', 'Dis mekan lazer gosteri sistemi.', 'sabit', 35000, true, 11),
('Pyrotechnic (Volkan)', 'Teknik', 'Sahne volkan efekti, soguk kivilcim.', 'adet', 3000, true, 12),

-- PRODUKSIYON
('Profesyonel Fotografci', 'Uretim', 'Tam gun fotograf cekimi, 500+ fotograf, dijital album.', 'sabit', 18000, true, 1),
('Profesyonel Videograf', 'Uretim', 'Tam gun video cekimi, kurgu ve montaj dahil.', 'sabit', 25000, true, 2),
('Drone Cekimi', 'Uretim', 'Havadan fotograf ve video cekimi.', 'sabit', 8000, true, 3),
('Fotograf Kosesi (Selfie)', 'Uretim', 'Ozel tasarim selfie kosesi, aksesuarlar dahil.', 'sabit', 10000, true, 4),
('Ani Defteri & Kalem Seti', 'Uretim', 'Luks ani defteri ve kalemi, misafirler icin.', 'sabit', 2500, true, 5),
('Davetiye Tasarimi & Basim', 'Uretim', 'Ozel tasarim davetiye, dijital veya basili.', 'adet', 50, true, 6),
('Magnet Hediye', 'Uretim', 'Ani magnet, misafirlere hediye.', 'adet', 25, true, 7),
('LED Neon Tabela', 'Uretim', 'Ozel tasarim neon tabela, isim veya tarih.', 'sabit', 12000, true, 8),
('Kina Paketi', 'Uretim', 'Kina gecesi icin kina, mendil ve aksesuar paketi.', 'adet', 150, true, 9),
('Nikah Sekeri', 'Uretim', 'Ozel tasarim nikah sekeri, kutlama hediyeligi.', 'adet', 30, true, 10),
('Video Mapping', 'Uretim', 'Bina veya yuzeye yansitmali video gosterisi.', 'sabit', 40000, true, 11),

-- DEKOR
('Masa Susleme (Standart)', 'Dekor', 'Runner, cicek aranjmani ve samdan.', 'adet', 500, true, 1),
('Masa Susleme (Premium)', 'Dekor', 'Luks cicek, kristal samdan ve aksesuar.', 'adet', 1200, true, 2),
('Sandalye Giydirme', 'Dekor', 'Kumas giydirme ve kurdele.', 'adet', 100, true, 3),
('Cicek Duvari', 'Dekor', 'Canli veya yapay ciceklerden dekoratif duvar.', 'sabit', 15000, true, 4),
('Gelin Yolu', 'Dekor', 'Gelin yolu icin cicek ve kumas dekorasyonu.', 'sabit', 12000, true, 5),
('Nikah Masi Susleme', 'Dekor', 'Ozel nikah masasi dekoru, cicek ve aksesuar.', 'sabit', 8000, true, 6),
('Balon Susleme', 'Dekor', 'Tema renklerinde balon dekorasyonu.', 'sabit', 5000, true, 7),
('Giris Taki', 'Dekor', 'Davetiyeli giris kapisi, cicek ve isik.', 'sabit', 10000, true, 8),
('Tavan Susleme', 'Dekor', 'Sarkit cicek, balon veya kumas tavan dekoru.', 'sabit', 18000, true, 9),
('Dugun Tagi / Backdrop', 'Dekor', 'Ozel tasarim fotograf arka plani.', 'sabit', 8000, true, 10),
('Kumas Drape', 'Dekor', 'Tavan ve duvar icin kumas susleme.', 'sabit', 7000, true, 11),
('Mum & Isik Susleme', 'Dekor', 'LED mum ve ip lamba susleme.', 'sabit', 4000, true, 12),

-- LOGISTIK
('VIP Transfer (Binek)', 'Logistik', 'Luks binek aracla transfer, saatlik.', 'sabit', 5000, true, 1),
('VIP Transfer (Minibus)', 'Logistik', 'Minibus ile grup transferi, saatlik.', 'sabit', 8000, true, 2),
('Otobus / Midibus', 'Logistik', '46-54 kisilik otobus, saatlik.', 'sabit', 15000, true, 3),
('Otopark Hizmeti', 'Logistik', 'Vale ve otopark organizasyonu.', 'sabit', 6000, true, 4),
('Guvenlik Hizmeti', 'Logistik', 'Profesyonel guvenlik personeli, saatlik.', 'kisi', 500, true, 5),
('Saglik Ekibi', 'Logistik', 'Ilk yardim ve saglik personeli.', 'sabit', 5000, true, 6),
('Cocuk Bakici', 'Logistik', 'Profesyonel cocuk bakicisi, saatlik.', 'kisi', 300, true, 7),
('Evcil Hayvan Bakicisi', 'Logistik', 'Evcil haytan bakimi ve koruma.', 'sabit', 4000, true, 8),
('Vale Park Hizmeti', 'Logistik', 'Misafir araclari icin vale hizmeti.', 'kisi', 200, true, 9),
('Tasima & Kurulum', 'Logistik', 'Ekipman tasima ve kurulum hizmeti.', 'sabit', 5000, true, 10),
('Temizlik Hizmeti', 'Logistik', 'Etkinlik sonrasi temizlik organizasyonu.', 'sabit', 4000, true, 11);


-- ============================================================
-- TAMAM
-- ============================================================
DO $$ BEGIN RAISE NOTICE '=== TUM HIZMETLER VE EKSTRALAR BASARIYLA EKLENDI ==='; END $$;
