'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendTanitimEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function leadKaydet(lead) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true, id: lead.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    tip: lead.tip || 'b2c',
    ad_unvan: lead.ad_unvan,
    yetkili_kisi: lead.yetkili_kisi || null,
    telefon: lead.telefon || null,
    email: lead.email || null,
    adres: lead.adres || null,
    vergi_no: lead.vergi_no || null,
    vergi_dairesi: lead.vergi_dairesi || null,
    ilgilenilen_etkinlik: lead.ilgilenilen_etkinlik || null,
    kaynak: lead.kaynak || 'manuel',
    durum: lead.durum || 'yeni',
    updated_at: new Date().toISOString(),
  }
  if (lead.id) {
    const { error } = await supabase.from('leadler').update(kayit).eq('id', lead.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/yonetim/leadler')
    return { ok: true, id: lead.id }
  }
  const { data, error } = await supabase.from('leadler').insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/leadler')
  return { ok: true, id: data.id }
}

export async function leadSil(id) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('leadler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/leadler')
  return { ok: true }
}

export async function durumNotuGuncelle(id, durum_notu, durum) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const guncelle = { durum_notu, updated_at: new Date().toISOString() }
  if (durum) guncelle.durum = durum
  const { error } = await supabase.from('leadler').update(guncelle).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/leadler')
  return { ok: true }
}

export async function etkilesimEkle(leadId, tur, ozet) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!ozet?.trim()) return { ok: false, error: 'Özet boş olamaz.' }
  if (isDevPreview()) return { ok: true, demo: true, id: 'demo-' + Date.now(), created_at: new Date().toISOString() }
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('crm_etkilesimler')
    .insert({ lead_id: leadId, tur, ozet }).select('*').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/leadler')
  return { ok: true, etkilesim: data }
}

export async function tanitimMailiGonder(leadId, email, ad) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!email) return { ok: false, error: 'Bu lead için e-posta adresi yok.' }
  if (isDevPreview()) return { ok: true, demo: true }

  try {
    await sendTanitimEmail({ email, ad })
  } catch (e) {
    return { ok: false, error: 'Mail gönderilemedi: ' + e.message }
  }
  const supabase = createServiceClient()
  await supabase.from('leadler')
    .update({ tanitim_maili_gonderildi: true, tanitim_maili_tarihi: new Date().toISOString() })
    .eq('id', leadId)
  await supabase.from('crm_etkilesimler').insert({ lead_id: leadId, tur: 'mail', ozet: 'Tanıtım e-postası gönderildi.' })
  revalidatePath('/yonetim/leadler')
  return { ok: true }
}

/**
 * Toplu içe aktarma — bir chunk (parça) lead kaydeder.
 * Client dosyayı parse edip 1000'erlik parçalar halinde bu action'ı çağırır.
 * Mükerrer (aynı telefon) kayıtlar DB'de uq_lead_telefon ile atlanır (upsert ignore).
 * @param {Array<object>} kayitlar
 */
export async function leadleriIceAktar(kayitlar) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!Array.isArray(kayitlar) || kayitlar.length === 0) return { ok: false, error: 'Boş parça.' }
  if (kayitlar.length > 2000) return { ok: false, error: 'Parça çok büyük (max 2000).' }

  // Normalize
  const temiz = kayitlar
    .map(k => ({
      tip: k.tip === 'b2c' ? 'b2c' : 'b2b',
      ad_unvan: String(k.ad_unvan || '').trim(),
      yetkili_kisi: k.yetkili_kisi || null,
      telefon: k.telefon ? String(k.telefon).trim() : null,
      email: k.email ? String(k.email).trim() : null,
      il: k.il || null, ilce: k.ilce || null, sektor: k.sektor || null,
      vergi_no: k.vergi_no ? String(k.vergi_no).trim() : null,
      vergi_dairesi: k.vergi_dairesi || null,
      adres: k.adres || null,
      kaynak: 'iso',
    }))
    .filter(k => k.ad_unvan)

  if (temiz.length === 0) return { ok: false, error: 'Geçerli kayıt yok (ad/ünvan zorunlu).' }
  if (isDevPreview()) return { ok: true, demo: true, eklenen: temiz.length }

  const supabase = createServiceClient()
  // Telefonu olanları upsert (dedup), olmayanları normal insert
  const telefonlu = temiz.filter(k => k.telefon)
  const telefonsuz = temiz.filter(k => !k.telefon)
  let eklenen = 0
  if (telefonlu.length) {
    const { error, count } = await supabase.from('leadler').upsert(telefonlu, { onConflict: 'telefon', ignoreDuplicates: true, count: 'exact' })
    if (error) return { ok: false, error: error.message }
    eklenen += count ?? telefonlu.length
  }
  if (telefonsuz.length) {
    const { error } = await supabase.from('leadler').insert(telefonsuz)
    if (!error) eklenen += telefonsuz.length
  }
  return { ok: true, eklenen }
}
