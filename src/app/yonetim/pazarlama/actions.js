'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendKampanyaEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

/** Segmente uyan lead'leri getirir (kanal alanı dolu olanlar). */
async function segmentAlicilari(supabase, kanal, segment) {
  let q = supabase.from('leadler').select('email, telefon, tip')
  if (segment !== 'tumu') q = q.eq('tip', segment)
  const { data } = await q
  const alan = kanal === 'sms' ? 'telefon' : 'email'
  return (data || []).map(l => l[alan]).filter(Boolean)
}

// ---------- KAMPANYALAR ----------

export async function kampanyaKaydet(k) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!k.ad?.trim()) return { ok: false, error: 'Kampanya adı zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: k.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    ad: k.ad, kanal: k.kanal || 'email', hedef_segment: k.hedef_segment || 'tumu',
    sablon_id: k.sablon_id || null, konu: k.konu || null, icerik: k.icerik || null,
    durum: k.durum || 'taslak',
  }
  if (k.id) {
    await supabase.from('kampanyalar').update(kayit).eq('id', k.id)
    revalidatePath('/yonetim/pazarlama'); return { ok: true, id: k.id }
  }
  const { data, error } = await supabase.from('kampanyalar').insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/pazarlama'); return { ok: true, id: data.id }
}

export async function kampanyaGonder(kampanyaId, veri = {}) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }

  if (isDevPreview()) {
    const alici = Number(veri.alici_sayisi) || 0
    return { ok: true, demo: true, alici_sayisi: alici, gonderim_tarihi: new Date().toISOString() }
  }

  const supabase = createServiceClient()
  const { data: k } = await supabase.from('kampanyalar').select('*').eq('id', kampanyaId).single()
  if (!k) return { ok: false, error: 'Kampanya bulunamadı.' }
  if (k.durum === 'gonderildi') return { ok: false, error: 'Kampanya zaten gönderilmiş.' }

  const alicilar = await segmentAlicilari(supabase, k.kanal, k.hedef_segment)
  if (alicilar.length === 0) return { ok: false, error: 'Segmentte alıcı bulunamadı.' }

  try {
    if (k.kanal === 'sms') {
      await sendSMS(alicilar, k.icerik || k.konu || '')
    } else {
      await sendKampanyaEmail({ emails: alicilar, konu: k.konu, baslik: k.ad, icerik: k.icerik })
    }
  } catch (e) {
    return { ok: false, error: 'Gönderim hatası: ' + e.message }
  }

  const guncelle = { durum: 'gonderildi', alici_sayisi: alicilar.length, gonderim_tarihi: new Date().toISOString() }
  await supabase.from('kampanyalar').update(guncelle).eq('id', kampanyaId)
  await logAktivite({ eylem: 'kampanya_gonderildi', ozet: `${k.ad} — ${alicilar.length} alıcı (${k.kanal})`, hedefTur: 'kampanya', hedefId: kampanyaId })

  revalidatePath('/yonetim/pazarlama')
  return { ok: true, alici_sayisi: alicilar.length, gonderim_tarihi: guncelle.gonderim_tarihi }
}

export async function kampanyaSil(id) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('kampanyalar').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/pazarlama'); return { ok: true }
}

// ---------- İÇERİK TAKVİMİ ----------

export async function icerikKaydet(icerik) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!icerik.baslik?.trim() || !icerik.tarih) return { ok: false, error: 'Başlık ve tarih zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: icerik.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    baslik: icerik.baslik, platform: icerik.platform || 'instagram', tip: icerik.tip || 'gonderi',
    tarih: icerik.tarih, durum: icerik.durum || 'fikir', notlar: icerik.notlar || null,
  }
  if (icerik.id) {
    await supabase.from('icerik_takvimi').update(kayit).eq('id', icerik.id)
    revalidatePath('/yonetim/pazarlama'); return { ok: true, id: icerik.id }
  }
  const { data, error } = await supabase.from('icerik_takvimi').insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/pazarlama'); return { ok: true, id: data.id }
}

export async function icerikSil(id) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('icerik_takvimi').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/pazarlama'); return { ok: true }
}
