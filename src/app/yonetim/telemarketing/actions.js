'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

// sonuç → { arama_durumu, lead durumu (varsa), etiket }
const SONUC = {
  ulasildi: { arama: 'ulasildi', durum: 'iletisimde', etiket: 'Ulaşıldı — İlgilendi' },
  randevu: { arama: 'randevu', durum: 'iletisimde', etiket: 'Randevu alındı' },
  mesgul: { arama: 'mesgul', etiket: 'Meşgul' },
  geri_ara: { arama: 'geri_ara', etiket: 'Geri aranacak' },
  ulasilamadi: { arama: 'ulasilamadi', etiket: 'Ulaşılamadı' },
  ilgilenmiyor: { arama: 'ilgilenmiyor', durum: 'kaybedildi', etiket: 'İlgilenmiyor' },
}

/**
 * Bir arama sonucunu kaydeder: lead.arama_durumu + son_arama_tarihi güncellenir,
 * CRM'e görüşme kaydı düşülür. geri_ara ise geri_arama_tarihi set edilir.
 */
export async function telemarketingSonuc(leadId, sonuc, { not = '', geriTarih = null } = {}) {
  const s = SONUC[sonuc]
  if (!s) return { ok: false, error: 'Geçersiz sonuç.' }
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const guncelle = { arama_durumu: s.arama, son_arama_tarihi: new Date().toISOString() }
  if (s.durum) guncelle.durum = s.durum
  guncelle.geri_arama_tarihi = sonuc === 'geri_ara' ? (geriTarih || null) : null

  const { error } = await supabase.from('leadler').update(guncelle).eq('id', leadId)
  if (error) return { ok: false, error: error.message }

  const ozet = `📞 ${s.etiket}${not ? ' — ' + not : ''}${sonuc === 'geri_ara' && geriTarih ? ` (${geriTarih})` : ''}`
  await supabase.from('crm_etkilesimler').insert({ lead_id: leadId, tur: 'telefon', ozet })

  revalidatePath('/yonetim/telemarketing')
  return { ok: true }
}
