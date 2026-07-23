'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendSozlesmeEmail } from '@/lib/email'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

function sozlesmeNo() {
  return `SZL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
}

export async function sozlesmeKaydet(s) {
  const g = await rolGuard(['satis', 'operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!s.baslik?.trim()) return { ok: false, error: 'Başlık zorunlu.' }
  const no = s.sozlesme_no || sozlesmeNo()
  if (isDevPreview()) return { ok: true, demo: true, id: s.id || 'demo-' + Date.now(), sozlesme_no: no }

  const supabase = createServiceClient()
  const kayit = {
    sozlesme_no: no, teklif_id: s.teklif_id || null, etkinlik_id: s.etkinlik_id || null,
    musteri_ad: s.musteri_ad || null, baslik: s.baslik, tutar: Number(s.tutar) || 0,
    durum: s.durum || 'taslak', notlar: s.notlar || null,
  }
  if (s.id) {
    await supabase.from('sozlesmeler').update(kayit).eq('id', s.id)
    revalidatePath('/yonetim/sozlesmeler'); return { ok: true, id: s.id, sozlesme_no: no }
  }
  const { data, error } = await supabase.from('sozlesmeler').insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/sozlesmeler'); return { ok: true, id: data.id, sozlesme_no: no }
}

export async function sozlesmeDurumGuncelle(id, durum, bilgi = {}) {
  const gecerli = ['taslak', 'gonderildi', 'imzalandi', 'iptal']
  if (!gecerli.includes(durum)) return { ok: false, error: 'Geçersiz durum.' }
  const g = await rolGuard(['satis', 'operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const guncelle = { durum }
  if (durum === 'gonderildi') guncelle.gonderim_tarihi = new Date().toISOString()
  if (durum === 'imzalandi') guncelle.imza_tarihi = new Date().toISOString()
  const { error } = await supabase.from('sozlesmeler').update(guncelle).eq('id', id)
  if (error) return { ok: false, error: error.message }

  // Gönderildi ise müşteriye bilgi maili
  if (durum === 'gonderildi' && bilgi.email) {
    try { await sendSozlesmeEmail({ email: bilgi.email, etkinlikAd: bilgi.etkinlikAd || bilgi.baslik, belgeAd: bilgi.baslik }) } catch {}
  }
  await logAktivite({ eylem: 'sozlesme_durum', ozet: `${bilgi.baslik || 'Sözleşme'} → ${durum}`, hedefTur: 'sozlesme', hedefId: id })

  revalidatePath('/yonetim/sozlesmeler'); return { ok: true }
}

export async function sozlesmeSil(id) {
  const g = await rolGuard(['satis', 'operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('sozlesmeler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/sozlesmeler'); return { ok: true }
}
