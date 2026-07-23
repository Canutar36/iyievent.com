/**
 * Rol & yetki tanımları (RBAC) + Süper-admin (sistem sahibi) katmanı.
 *
 * profiles.role değerleri: musteri | satis | operasyon | muhasebe | yonetici
 *  - yonetici : tam yetki (tüm modüller)
 *  - satis    : teklif, lead/e-marketing, telemarketing, katalog, takvim
 *  - operasyon: etkinlik, to-do, kaynak yönetimi, müşteri dosya merkezi, takvim
 *  - muhasebe : cari, kasa, fatura, tahsilat, gider, raporlar
 *  - musteri  : sadece portal (/musteri)
 *
 * SÜPER-ADMIN (sistem sahibi): tek bir e-posta (bilgi@iyievent.com). yonetici
 * yetkilerine ek olarak KULLANICI & ROL yönetimi (Ayarlar) yalnızca ona açıktır.
 * Diğer yöneticiler personel ekleyemez / rol değiştiremez.
 */

export const PERSONEL_ROLLER = ['satis', 'operasyon', 'muhasebe', 'yonetici']

/** Sistem sahibinin e-postası (env ile değiştirilebilir). */
export const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'bilgi@iyievent.com').toLowerCase()

/** Verilen e-posta sistem sahibi mi? */
export function isSuperAdmin(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL
}

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
  // Satış hattı
  teklif: ['satis', 'yonetici'],
  teklifler: ['satis', 'yonetici'],
  sozlesmeler: ['satis', 'operasyon', 'yonetici'],
  katalog: ['satis', 'operasyon', 'yonetici'],
  // CRM
  leadler: ['satis', 'yonetici'],
  telemarketing: ['satis', 'yonetici'],
  talepler: ['satis', 'operasyon', 'yonetici'],
  pazarlama: ['satis', 'yonetici'],
  crm: ['satis', 'operasyon', 'yonetici'],
  musteriler: ['satis', 'operasyon', 'muhasebe', 'yonetici'],
  // Operasyon
  etkinlikler: ['operasyon', 'satis', 'yonetici'],
  todo: ['operasyon', 'yonetici'],
  takvim: ['satis', 'operasyon', 'muhasebe', 'yonetici'],
  kaynaklar: ['operasyon', 'yonetici'],
  // Finans
  muhasebe: ['muhasebe', 'yonetici'],
  faturalar: ['muhasebe', 'yonetici'],
  odemeler: ['muhasebe', 'yonetici'],
  giderler: ['muhasebe', 'yonetici'],
  raporlar: ['muhasebe', 'yonetici'],
  // Sistem
  sablonlar: ['yonetici'],
  ayarlar: ['yonetici'], // ek olarak süper-admin kontrolü sayfada yapılır
}

/** Bir rolün belirli bir modüle erişimi var mı? */
export function yetki(rol, modul) {
  const r = normalizeRol(rol)
  if (r === 'yonetici') return true
  return (MODUL_YETKI[modul] || []).includes(r)
}

/**
 * /yonetim/... yolundan modül anahtarını çıkarır (proxy erişim kontrolü için).
 * ör. /yonetim/muhasebe → 'muhasebe', /yonetim/teklif/yeni → 'teklif',
 *     /yonetim/leadler/ice-aktar → 'leadler', /yonetim → 'kokpit'
 */
export function yoldanModul(path) {
  const p = path.replace(/\/+$/, '')
  if (p === '/yonetim' || p === '/yonetim/') return 'kokpit'
  const parca = p.split('/')[2] // /yonetim/<parca>/...
  return parca || 'kokpit'
}
