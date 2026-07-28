-- ============================================================
-- HİZMET KATALOĞU & EKSTRA LİSTESİ
-- Bu betiği Supabase SQL Editor'a yapıştırarak çalıştırın.
-- Mevcut verileri silmez, sadece yeni kayıt ekler.
-- ============================================================

-- ============================================================
-- HİZMETLER (Kategori bazlı)
-- ============================================================

-- KURUMSAL
INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES
('Kurumsal Gala Gecesi', 'kurumsal', 'Sahne, prodüksiyon, ikram ve VIP karşılama dahil lüks gala organizasyonu.', 'kisi_basi', 2500, 100, true, 1),
('Şirket Yemeği & Davet', 'kurumsal', 'Restoran veya salonda kurumsal yemek organizasyonu, menü ve servis dahil.', 'kisi_basi', 1200, 20, true, 2),
('Ürün Tanıtım Lansmanı', 'kurumsal', 'Ürün lansmanı için sahne, teknik ekipman, ikram ve medya daveti.', 'sabit', 85000, 0, true, 3),
('Bayi Toplantısı & Motivasyon', 'kurumsal', 'Toplantı salonu, teknik ekipman, kahve molası ve akşam yemeği dahil.', 'kisi_basi', 800, 30, true, 4),
('Ödül Töreni', 'kurumsal', 'Sahne tasarımı, altın kaplama ödüller, konuk sunucu ve galalar.', 'kisi_basi', 1800, 50, true, 5),
('Yılbaşı Partisi', 'kurumsal', 'Sezon sonu kutlaması, dekor, canlı müzik ve ikram paketi.', 'kisi_basi', 950, 40, true, 6),
('Bayram Kutlaması & Kokteyl', 'kurumsal', 'Resmi bayram kutlaması için kokteyl düzeni ve ikram.', 'kisi_basi', 600, 30, true, 7),
('Toplantı & Konferans', 'kurumsal', 'Tam donanımlı toplantı salonu, projeksiyon, ses sistemi ve kahve molası.', 'kisi_basi', 350, 20, true, 8),
('Networking Kokteyli', 'kurumsal', 'Ayakta kokteyl düzeni, hafif ikram ve networking alanı tasarımı.', 'kisi_basi', 500, 30, true, 9),
('Fuar & Stand Organizasyonu', 'kurumsal', 'Stand tasarımı, kurulum, teknik ekipman ve personel desteği.', 'sabit', 120000, 0, true, 10),
('Kapanış Kokteyli / After Party', 'kurumsal', 'Etkinlik sonrası kutlama kokteyli, DJ ve hafif ikram.', 'kisi_basi', 700, 30, true, 11);

-- BİREYSEL & ÖZEL GÜN
INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES
('Düğün Organizasyonu', 'bireysel', 'Konsept tasarım, gelin damat hazırlığı, mekan süsleme, koordinasyon ve tüm gün yönetim.', 'kisi_basi', 3500, 50, true, 1),
('Nikah Töreni & Tören Sonrası Kokteyl', 'bireysel', 'Nikah alanı süsleme, kokteyl düzeni, fotoğraf çekimi ve koordinasyon.', 'kisi_basi', 1500, 30, true, 2),
('Nişan Töreni', 'bireysel', 'Nişan alanı süsleme, tepsiler, ikram ve koordinasyon.', 'kisi_basi', 1200, 20, true, 3),
('Kına Gecesi', 'bireysel', 'Geleneksel kına gecesi organizasyonu, bindallı, kına tahtı ve ikram.', 'kisi_basi', 800, 30, true, 4),
('Evlilik Teklifi Kurgusu', 'bireysel', 'Özel mekanda dekorasyon, çiçek, fotoğraf ve video çekimi dahil romantik kurgu.', 'sabit', 28000, 0, true, 5),
('Doğum Günü Partisi (Yetişkin)', 'bireysel', 'Tema dekorasyon, pasta, ikram ve eğlence organizasyonu.', 'kisi_basi', 500, 20, true, 6),
('Mezuniyet Kutlaması', 'bireysel', 'Mezuniyet partisi dekoru, ikram ve fotoğraf köşesi.', 'kisi_basi', 450, 20, true, 7),
('Baby Shower', 'bireysel', 'Bebek karşılama partisi dekoru, ikram ve oyunlar.', 'kisi_basi', 350, 15, true, 8),
('Cenaze Yemeği & Taziye', 'bireysel', 'Taziye evi düzeni, yemek ikramı ve koordinasyon.', 'kisi_basi', 200, 30, true, 9),
('Özel Yıldönümü Kutlaması', 'bireysel', 'Romantik akşam yemeği, çiçek ve özel dekorasyon.', 'sabit', 15000, 0, true, 10),
('Diş Buğdayı', 'bireysel', 'Geleneksel diş buğdayı töreni, ikram ve süsleme.', 'kisi_basi', 400, 20, true, 11),
('Kına Gecesi (Modern)', 'bireysel', 'Modern konsept kına gecesi, LED dekor, DJ ve özel ikram.', 'kisi_basi', 1000, 30, true, 12);

-- TEMATİK & AÇIK HAVA
INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES
('Lüks Bohem Piknik', 'tematik', 'Sahilde veya ormanda yer minderleri, ahşap masalar, şık catering ve dekor.', 'kisi_basi', 1200, 10, true, 1),
('Kır Düğünü', 'tematik', 'Açık hava düğünü, çiçek duvarı, doğal dekor ve yemek servisi.', 'kisi_basi', 2800, 50, true, 2),
('Sahil Partisi', 'tematik', 'Sahil şeridinde kokteyl düzeni, sandalye ve şemsiye, hafif ikram.', 'kisi_basi', 700, 20, true, 3),
('Bahçe Partisi', 'tematik', 'Açık bahçede tema partisi, dekor, bahçe mobilyası ve ikram.', 'kisi_basi', 600, 20, true, 4),
('Yoga & Wellness Etkinliği', 'tematik', 'Açık havada yoga seansı, wellness ikramları ve meditasyon alanı.', 'kisi_basi', 300, 10, true, 5),
('Fotoğraf Çekimi Organizasyonu', 'tematik', 'Düğün, nişan veya özel gün fotoğraf çekimi için mekan ve konsept tasarımı.', 'sabit', 12000, 0, true, 6),
('Vintage / Retro Partisi', 'tematik', '70'ler, 80'ler veya 90'lar temalı parti, dekor ve müzik.', 'kisi_basi', 550, 20, true, 7),
('Hollywood / Red Carpet Partisi', 'tematik', 'Kırmızı halı, spotlight, film yıldızı temalı dekor ve ikram.', 'kisi_basi', 750, 25, true, 8),
('Casablanca / Oriental Partisi', 'tematik', 'Fas temalı dekor, nargile köşesi, oryantal müzik ve özel ikram.', 'kisi_basi', 650, 20, true, 9),
('Masal & Peri Temalı Parti', 'tematik', 'Peri kostümleri, sihirbaz gösterisi, temalı pasta ve dekor.', 'kisi_basi', 500, 15, true, 10),
('Gastronomi & Tadım Etkinliği', 'tematik', 'Şef eşliğinde yemek tadımı, şarap eşleştirme ve sohbet.', 'kisi_basi', 900, 15, true, 11),
('Kamp & Outdoor Etkinliği', 'tematik', 'Kamp kurulumu, mangal, açık hava sineması ve outdoor aktiviteler.', 'kisi_basi', 450, 15, true, 12);

-- ÇOCUK
INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES
('Çocuk Doğum Günü Partisi', 'cocuk', 'Tema dekorasyon, palyaço, sihirbaz, pasta ve hediyelikler.', 'kisi_basi', 350, 10, true, 1),
('Palyaço & Eğlence Paketi', 'cocuk', 'Palyaço, yüz boyama, balon Heykel ve oyunlar.', 'sabit', 8000, 0, true, 2),
('Masal Kahramanları Partisi', 'cocuk', 'Kostümlü karakterler, hikaye anlatımı ve temalı ikram.', 'kisi_basi', 400, 10, true, 3),
('Bilim & Teknoloji Partisi', 'cocuk', 'Deneyler, robotik atölye ve STEM aktiviteleri.', 'kisi_basi', 450, 10, true, 4),
('Su Parkı & Yaz Partisi', 'cocuk', 'Su oyunları, şişeme havuz, su tabancası ve soğuk ikramlar.', 'kisi_basi', 300, 15, true, 5),
('Okul Etkinliği & Mezuniyet', 'cocuk', 'Okul bahçesinde etkinlik, sahne, ses ve ikram organizasyonu.', 'kisi_basi', 200, 30, true, 6),
('Sünnet Düğünü', 'cocuk', 'Sünnet töreni, taht süsleme, davul zurna ve konvoy organizasyonu.', 'kisi_basi', 500, 30, true, 7),
('Çocuk Tiyatrosu & Gösteri', 'cocuk', 'Çocuklara yönelik interaktif tiyatro veya kukla gösterisi.', 'sabit', 15000, 0, true, 8),
('Ata Binme & Çiftlik Ziyareti', 'cocuk', 'Çiftlikte at binme, hayvan besleme ve doğa aktiviteleri.', 'kisi_basi', 250, 10, true, 9),
('Bisiklet & Paten Etkinliği', 'cocuk', 'Güvenli alanda bisiklet/paten turu, mini yarışlar.', 'kisi_basi', 200, 10, true, 10);

-- DİNİ & GELENEKSEL
INSERT INTO hizmetler (ad, kategori, aciklama, fiyatlandirma_tipi, birim_fiyat, min_kisi, aktif, siralama) VALUES
('İftar Daveti & Organizasyonu', 'dini', 'Bahçe veya salonda iftar yemeği, sofra düzeni, davet ve ikram.', 'kisi_basi', 500, 30, true, 1),
('Sahur Daveti', 'dini', 'Sahur yemeği organizasyonu, sofra düzeni ve ikram.', 'kisi_basi', 350, 20, true, 2),
('Aşure Günü Dağıtımı', 'dini', 'Aşure pişirme, paketleme ve dağıtımı, süsleme.', 'kisi_basi', 50, 50, true, 3),
('Kandil Kutlaması', 'dini', 'Kandil gecesi özel program, ikram ve sohbet organizasyonu.', 'kisi_basi', 200, 20, true, 4),
('Mevlid-i Şerif Programı', 'dini', 'Mevlid okuma programı, ikram ve davet organizasyonu.', 'kisi_basi', 150, 20, true, 5),
('Kına Gecesi (Dini)', 'dini', 'Dini vecibeler eşliğinde kına gecesi, ilahi ve ikram.', 'kisi_basi', 600, 25, true, 6),
('Cenaze Yemeği', 'dini', 'Cenaze sonrası taziye yemeği, sofra düzeni ve servis.', 'kisi_basi', 150, 40, true, 7),
('Mezarlık Ziyareti & Mevlüt', 'dini', 'Mezarlık ziyareti koordinasyonu, mevlüt okuma ve ikram.', 'sabit', 5000, 0, true, 8),
('Hatim Daveti', 'dini', 'Hatim duası programı, ikram ve davet organizasyonu.', 'kisi_basi', 120, 20, true, 9),
('Hayır Çadırı Kurulumu', 'dini', 'Çadır kurulumu, sofra, ikram ve gönüllü organizasyonu.', 'sabit', 25000, 0, true, 10),
('İlahi Grubu & Semazen Gösterisi', 'dini', 'Profesyonel ilahi grubu veya semazen gösterisi organizasyonu.', 'sabit', 18000, 0, true, 11),
('Düğün Takviye (Dini Tören)', 'dini', 'Dini nikah töreni, hoca daveti ve dini vecibe organizasyonu.', 'sabit', 8000, 0, true, 12);


-- ============================================================
-- EKSTRALAR (Grup bazlı)
-- ============================================================

-- İKRAM
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('Dondurma Arabası', 'İkram', 'Taze dondurma servisi yapan dekoratif arabası.', 'sabit', 15000, true, 1),
('Patlamış Mısır Standı', 'İkram', 'Sıcak patlamış mısır servisi.', 'sabit', 8000, true, 2),
('Pamuk Şeker Standı', 'İkram', 'Renkli pamuk şeker yapımı ve servisi.', 'sabit', 6000, true, 3),
('Makarna Standı', 'İkram', 'Taze makarna çeşitleri sunumu.', 'sabit', 12000, true, 4),
('Kokteyl İkramı', 'İkram', 'Ayakta kokteyl düzeni, meze ve hafif atıştırmalık.', 'kisi', 250, true, 5),
('Turkish Coffee Corner', 'İkram', 'Özel Türk kahvesi köşesi, lokum ve kurabiye.', 'kisi', 80, true, 6),
('Çikolata Fountain', 'İkram', 'Çikolata şelalesi, meyve ve kurabiye dalama.', 'sabit', 10000, true, 7),
('Meyve Tabağı & Taze Sıkma', 'İkram', 'Mevsim meyveleri ve taze sıkma meyve suyu istasyonu.', 'kisi', 120, true, 8),
('Kuru Pasta & Kurabiye', 'İkram', 'El yapımı kuru pasta ve kurabiye çeşitleri.', 'kisi', 60, true, 9),
('Tuzlu Atıştırmalık', 'İkram', 'Çerez, cips ve tuzlu çubuk karışımı.', 'kisi', 40, true, 10),
('Waffle & Crepe İstasyonu', 'İkram', 'Canlı waffle ve crepe yapımı.', 'sabit', 12000, true, 11),
('Bubble Tea İstasyonu', 'İkram', 'Renkli bubble tea çeşitleri.', 'kisi', 100, true, 12),
('Tavuklu/Sebzeli Çubuklar', 'İkram', 'Izgara tavuk ve sebze çubukları, dip soslar.', 'kisi', 90, true, 13);

-- EĞLENCE
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('Şarkıcı / Canlı Müzik', 'Eğlence', 'Profesyonel solo şarkıcı veya duo canlı performans.', 'sabit', 35000, true, 1),
('DJ Performansı', 'Eğlence', 'Profesyonel DJ, ses sistemi ve ışık dahil.', 'sabit', 20000, true, 2),
('Düğün Orkestrası', 'Eğlence', '6-12 kişilik canlı orkestra, repertuvar ve ekipman.', 'sabit', 65000, true, 3),
('Palyaço', 'Eğlence', 'Çocuk partileri için profesyonel palyaço.', 'sabit', 6000, true, 4),
('Yüz Boyama', 'Eğlence', 'Profesyonel yüz boyama sanatçısı.', 'sabit', 5000, true, 5),
('Sihirbaz Gösterisi', 'Eğlence', 'Profesyonel sahne sihirbazı gösterisi.', 'sabit', 15000, true, 6),
('Bubble Show', 'Eğlence', 'Büyük balon gösterisi, çocuklara yönelik.', 'sabit', 8000, true, 7),
('Ateş Şov', 'Eğlence', 'Profesyonel ateş dansçısı gösterisi.', 'sabit', 25000, true, 8),
('LED Gösteri', 'Eğlence', 'LED kostümlü dansçılar, UV show.', 'sabit', 30000, true, 9),
('Havai Fişek Gösterisi', 'Eğlence', 'Profesyonel havai fişek gösterisi, 5-10 dakika.', 'sabit', 45000, true, 10),
('Confeti Makinesi', 'Eğlence', 'Konfeti ve streamer efekti makinesi.', 'sabit', 4000, true, 11),
('Oryantal Dansçı', 'Eğlence', 'Profesyonel oryantal dans performansı.', 'sabit', 12000, true, 12),
('Davul & Zurna', 'Eğlence', 'Geleneksel davul zurna ekibi.', 'sabit', 8000, true, 13),
('Müzik Grubu / Band', 'Eğlence', 'Canlı müzik grubu, rock/pop/jazz repertuvar.', 'sabit', 45000, true, 14),
('Karaoke İstasyonu', 'Eğlence', 'Karaoke sistemi, ekran ve mikrofon.', 'sabit', 7000, true, 15);

-- TEKNİK
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('Ses Sistemi (Küçük)', 'Teknik', '100 kişiye kadar ses sistemi, 2 hoparlör ve mikrofon.', 'sabit', 8000, true, 1),
('Ses Sistemi (Büyük)', 'Teknik', '200+ kişiye kadar profesyonel ses sistemi.', 'sabit', 20000, true, 2),
('Işıklandırma Paketi', 'Teknik', 'Sahne ve dans alanı için temel ışıklandırma.', 'sabit', 12000, true, 3),
('LED Ekran', 'Teknik', 'P3 LED ekran, sunum ve video gösterimi için.', 'adet', 12000, true, 4),
('Sahne Kurulumu', 'Teknik', 'Modüler sahne, 4x6m, korkuluk dahil.', 'sabit', 25000, true, 5),
('Projeksiyon Sistemi', 'Teknik', 'Full HD projeksiyon ve perde.', 'sabit', 10000, true, 6),
('Jeneratör', 'Teknik', 'Dış mekan için mobil jeneratör, 30 kVA.', 'sabit', 8000, true, 7),
('Klima / Isıtıcı', 'Teknik', 'Sıcak veya soğuk hava için mobil iklimlendirme.', 'sabit', 6000, true, 8),
('Wi-Fi Hotspot', 'Teknik', 'Etkinlik alanı için özel Wi-Fi noktası.', 'sabit', 5000, true, 9),
('Çevirmenlik Sistemi', 'Teknik', 'Simultane çevirmenlik için kabin ve kulaklık seti.', 'sabit', 15000, true, 10),
('Lazer Gösteri', 'Teknik', 'Dış mekan lazer gösteri sistemi.', 'sabit', 35000, true, 11),
('Pyrotechnic (Volkan)', 'Teknik', 'Sahne volkan efekti, soğuk kıvılcım.', 'adet', 3000, true, 12);

-- PRODÜKSİYON
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('Profesyonel Fotoğrafçı', 'Prodüksiyon', 'Tam gün fotoğraf çekimi, 500+ fotoğraf, dijital albüm.', 'sabit', 18000, true, 1),
('Profesyonel Videograf', 'Prodüksiyon', 'Tam gün video çekimi, kurgu ve montaj dahil.', 'sabit', 25000, true, 2),
('Drone Çekimi', 'Prodüksiyon', 'Havadan fotoğraf ve video çekimi.', 'sabit', 8000, true, 3),
('Fotoğraf Köşesi (Selfie)', 'Prodüksiyon', 'Özel tasarım selfie köşesi, aksesuarlar dahil.', 'sabit', 10000, true, 4),
('Anı Defteri & Kalem Seti', 'Prodüksiyon', 'Lüks anı defteri ve kalemi, misafirler için.', 'sabit', 2500, true, 5),
('Davetiye Tasarımı & Basım', 'Prodüksiyon', 'Özel tasarım davetiye, dijital veya basılı.', 'adet', 50, true, 6),
('Magnet Hediye', 'Prodüksiyon', 'Anı magnet, misafirlere hediye.', 'adet', 25, true, 7),
('LED Neon Tabela', 'Prodüksiyon', 'Özel tasarım neon tabela, isim veya tarih.', 'sabit', 12000, true, 8),
('Kına Paketi', 'Prodüksiyon', 'Kına gecesi için kına, mendil ve aksesuar paketi.', 'adet', 150, true, 9),
('Nikah Şekeri', 'Prodüksiyon', 'Özel tasarım nikah şekeri, kutlama hediyeliği.', 'adet', 30, true, 10),
('Video Mapping', 'Prodüksiyon', 'Bina veya yüzeye yansıtmalı video gösterisi.', 'sabit', 40000, true, 11);

-- DEKOR
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('Masa Süsleme (Standart)', 'Dekor', 'Runner, çiçek aranjmanı ve şamdan.', 'adet', 500, true, 1),
('Masa Süsleme (Premium)', 'Dekor', 'Lüks çiçek, kristal şamdan ve aksesuar.', 'adet', 1200, true, 2),
('Sandalye Giydirme', 'Dekor', 'Kumaş giydirme ve kurdele.', 'adet', 100, true, 3),
('Çiçek Duvarı', 'Dekor', 'Canlı veya yapay çiçeklerden dekoratif duvar.', 'sabit', 15000, true, 4),
('Gelin Yolu (Aisle)', 'Dekor', 'Gelin yolu için çiçek ve kumaş dekorasyonu.', 'sabit', 12000, true, 5),
('Nikah Masası Süsleme', 'Dekor', 'Özel nikah masası dekoru, çiçek ve aksesuar.', 'sabit', 8000, true, 6),
('Balon Süsleme', 'Dekor', 'Tema renklerinde balon dekorasyonu.', 'sabit', 5000, true, 7),
('Giriş Takı', 'Dekor', 'Davetiyeli giriş kapısı, çiçek ve ışık.', 'sabit', 10000, true, 8),
('Tavan Süsleme', 'Dekor', 'Sarkıt çiçek, balon veya kumaş tavan dekoru.', 'sabit', 18000, true, 9),
('Düğün Tagı / Backdrop', 'Dekor', 'Özel tasarım fotoğraf arka planı.', 'sabit', 8000, true, 10),
('Kumaş Drape', 'Dekor', 'Tavan ve duvar için kumaş süsleme.', 'sabit', 7000, true, 11),
('Mum & Işık Süsleme', 'Dekor', 'LED mum ve ip lamba süsleme.', 'sabit', 4000, true, 12);

-- LOJİSTİK & DİĞER
INSERT INTO ekstralar (ad, grup, aciklama, birim, birim_fiyat, aktif, siralama) VALUES
('VIP Transfer (Binek)', 'Lojistik', 'Lüks binek araçla transfer, saatlik.', 'sabit', 5000, true, 1),
('VIP Transfer (Minibüs)', 'Lojistik', 'Minibüs ile grup transferi, saatlik.', 'sabit', 8000, true, 2),
('Otobüs / Midibüs', 'Lojistik', '46-54 kişilik otobüs, saatlik.', 'sabit', 15000, true, 3),
('Otopark Hizmeti', 'Lojistik', 'Vale ve otopark organizasyonu.', 'sabit', 6000, true, 4),
('Güvenlik Hizmeti', 'Lojistik', 'Profesyonel güvenlik personeli, saatlik.', 'kisi', 500, true, 5),
('Sağlık Ekibi', 'Lojistik', 'İlk yardım ve sağlık personeli.', 'sabit', 5000, true, 6),
('Çocuk Bakıcı', 'Lojistik', 'Profesyonel çocuk bakıcısı, saatlik.', 'kisi', 300, true, 7),
('Evcil Hayvan Bakıcısı', 'Lojistik', 'Evcil haytan bakımı ve koruma.', 'sabit', 4000, true, 8),
('Vale Park Hizmeti', 'Lojistik', 'Misafir araçları için vale hizmeti.', 'kisi', 200, true, 9),
('Taşıma & Kurulum', 'Lojistik', 'Ekipman taşıma ve kurulum hizmeti.', 'sabit', 5000, true, 10),
('Temizlik Hizmeti', 'Lojistik', 'Etkinlik sonrası temizlik organizasyonu.', 'sabit', 4000, true, 11);

-- Tamamlandı mesajı
DO $$ BEGIN RAISE NOTICE '=== HİZMET KATALOĞU VE EKSTRA LİSTESİ OLUŞTURULDU ==='; END $$;
