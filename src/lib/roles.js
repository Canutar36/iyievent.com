/**
 * Rol & yetki tanımları (RBAC).
 *
 * profiles.role değerleri: musteri | satis | operasyon | muhasebe | yonetici
 *  - yonetici : tam yetki (eski 'admin')
 *  - satis    : teklif, lead/e-marketing, katalog görüntüleme, takvim
 *  - operasyon: etkinlik, to-do, kaynak yönetimi, müşteri dosya merkezi, takvim
 *  - muhasebe : cari, kasa, fatura, tahsilat, gider
 *  - musteri  : sadece portal (/musteri)
 */

export const PERSONEL_ROLLER = ['satis', 'operasyon', 'muhasebe', 'yonetici']

// Geriye dönük uyum: eski 'admin' rolü yonetici gibi davranır.
export function normalizeRol(rol) {
  return rol === 'admin' ? 'yonetici' : rol
}

/** Kullanıcı personel (yönetim paneline erişebilir) mi? */
export function isPersonel(rol) {
  return PERSONEL_ROLLER.includes(normalizeRol(rol))
}

/** Kullanıcı tam yetkili yönetici mi? */
export function isYonetici(rol) {
  return normalizeRol(rol) === 'yonetici'
}

/**
 * Modül bazlı erişim haritası.
 * yonetici her yere erişir; diğerleri sadece listelenen modüllere.
 */
const MODUL_YETKI = {
  kokpit: ['satis', 'operasyon', 'muhasebe', 'yonetici'],
  katalog: ['satis', 'operasyon', 'yonetici'],
  teklif: ['satis', 'yonetici'],
  teklifler: ['satis', 'yonetici'],
  leadler: ['satis', 'yonetici'],
  pazarlama: ['satis', 'yonetici'],
  crm: ['satis', 'operasyon', 'yonetici'],
  musteriler: ['satis', 'operasyon', 'muhasebe', 'yonetici'],
  etkinlikler: ['operasyon', 'satis', 'yonetici'],
  takvim: ['satis', 'operasyon', 'muhasebe', 'yonetici'],
  todo: ['operasyon', 'yonetici'],
  kaynaklar: ['operasyon', 'yonetici'],
  muhasebe: ['muhasebe', 'yonetici'],
  faturalar: ['muhasebe', 'yonetici'],
  odemeler: ['muhasebe', 'yonetici'],
  giderler: ['muhasebe', 'yonetici'],
  sablonlar: ['yonetici'],
  raporlar: ['muhasebe', 'yonetici'],
  ayarlar: ['yonetici'],
}

/** Bir rolün belirli bir modüle erişimi var mı? */
export function yetki(rol, modul) {
  const r = normalizeRol(rol)
  if (r === 'yonetici') return true
  return (MODUL_YETKI[modul] || []).includes(r)
}
