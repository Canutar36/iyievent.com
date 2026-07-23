/**
 * Fiyat motoru — Hizmet Kataloğu, Teklif Builder ve (ileride) portal self-servis
 * aynı hesaplamayı kullanır.
 *
 * Hizmet fiyatlandırma tipleri:
 *  - kisi_basi : birim_fiyat × kişi sayısı
 *  - sabit     : birim_fiyat (kişi sayısından bağımsız)
 *  - kademeli  : kişi sayısının düştüğü kademenin birim_fiyat'ı × kişi sayısı
 *
 * Ekstra birimleri:
 *  - adet : birim_fiyat × adet
 *  - kisi : birim_fiyat × kişi sayısı
 *  - sabit: birim_fiyat
 */

/** Bir hizmetin belirli kişi sayısındaki taban fiyatı. */
export function hizmetFiyati(hizmet, kisiSayisi = 0) {
  if (!hizmet) return 0
  const kisi = Math.max(0, Number(kisiSayisi) || 0)
  const birim = Number(hizmet.birim_fiyat) || 0

  switch (hizmet.fiyatlandirma_tipi) {
    case 'sabit':
      return birim
    case 'kademeli': {
      const kademeler = hizmet.kademeler || hizmet.hizmet_kademeleri || []
      const kademe = kademeler.find(k =>
        kisi >= (Number(k.min_kisi) || 0) &&
        (k.max_kisi == null || kisi <= Number(k.max_kisi))
      )
      const kademeBirim = kademe ? Number(kademe.birim_fiyat) || 0 : birim
      return kademeBirim * kisi
    }
    case 'kisi_basi':
    default:
      return birim * kisi
  }
}

/** Bir ekstranın fiyatı. */
export function ekstraFiyati(ekstra, kisiSayisi = 0, adet = 1) {
  if (!ekstra) return 0
  const birim = Number(ekstra.birim_fiyat) || 0
  const kisi = Math.max(0, Number(kisiSayisi) || 0)
  const ad = Math.max(1, Number(adet) || 1)

  switch (ekstra.birim) {
    case 'kisi':
      return birim * kisi
    case 'sabit':
      return birim
    case 'adet':
    default:
      return birim * ad
  }
}

/**
 * Tüm teklifi hesaplar.
 * @param {object} p
 * @param {object} p.hizmet
 * @param {number} p.kisiSayisi
 * @param {Array<{ekstra:object, adet?:number}>} [p.secilenEkstralar]
 * @param {number} [p.indirim] - tutar (₺)
 * @returns {{ araToplam:number, ekstraToplam:number, indirim:number, toplam:number, kalemler:Array }}
 */
export function teklifHesapla({ hizmet, kisiSayisi = 0, secilenEkstralar = [], indirim = 0 }) {
  const kalemler = []

  const araToplam = hizmetFiyati(hizmet, kisiSayisi)
  if (hizmet) {
    kalemler.push({
      tur: 'hizmet',
      ad: hizmet.ad,
      birim: hizmet.fiyatlandirma_tipi === 'kisi_basi' ? 'kisi' : 'sabit',
      adet: hizmet.fiyatlandirma_tipi === 'sabit' ? 1 : Number(kisiSayisi) || 0,
      birim_fiyat: hizmet.fiyatlandirma_tipi === 'sabit' ? araToplam : (Number(kisiSayisi) ? araToplam / Number(kisiSayisi) : 0),
      tutar: araToplam,
    })
  }

  let ekstraToplam = 0
  for (const { ekstra, adet = 1 } of secilenEkstralar) {
    const tutar = ekstraFiyati(ekstra, kisiSayisi, adet)
    ekstraToplam += tutar
    kalemler.push({
      tur: 'ekstra',
      ad: ekstra.ad,
      birim: ekstra.birim,
      adet: ekstra.birim === 'kisi' ? Number(kisiSayisi) || 0 : (ekstra.birim === 'sabit' ? 1 : adet),
      birim_fiyat: Number(ekstra.birim_fiyat) || 0,
      tutar,
    })
  }

  const ind = Math.max(0, Number(indirim) || 0)
  const toplam = Math.max(0, araToplam + ekstraToplam - ind)

  return { araToplam, ekstraToplam, indirim: ind, toplam, kalemler }
}

/** ₺ biçimlendirme yardımcı. */
export function tl(n) {
  return Number(n || 0).toLocaleString('tr-TR') + ' ₺'
}
