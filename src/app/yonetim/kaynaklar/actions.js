'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

// Tip → tablo eşlemesi ve izinli alanlar
const TABLOLAR = {
  tedarikci: {
    tablo: 'tedarikciler',
    alanlar: ['ad', 'kategori', 'yetkili', 'telefon', 'email', 'notlar', 'aktif'],
  },
  envanter: {
    tablo: 'envanter',
    alanlar: ['ad', 'kategori', 'adet_toplam', 'birim', 'gunluk_kira', 'notlar', 'aktif'],
  },
  personel: {
    tablo: 'personel',
    alanlar: ['ad', 'rol_gorev', 'telefon', 'email', 'gunluk_ucret', 'aktif'],
  },
}

function temizle(tip, veri) {
  const conf = TABLOLAR[tip]
  const kayit = {}
  for (const a of conf.alanlar) {
    let v = veri[a]
    if (['adet_toplam'].includes(a)) v = Number(v) || 0
    if (['gunluk_kira', 'gunluk_ucret'].includes(a)) v = Number(v) || 0
    if (a === 'aktif') v = veri[a] !== false
    kayit[a] = v === '' ? null : v
  }
  return kayit
}

export async function kaynakKaydet(tip, veri) {
  const conf = TABLOLAR[tip]
  if (!conf) return { ok: false, error: 'Geçersiz tip.' }
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!veri.ad?.trim()) return { ok: false, error: 'Ad zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: veri.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = temizle(tip, veri)
  if (veri.id) {
    const { error } = await supabase.from(conf.tablo).update(kayit).eq('id', veri.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/yonetim/kaynaklar')
    return { ok: true, id: veri.id }
  }
  const { data, error } = await supabase.from(conf.tablo).insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/kaynaklar')
  return { ok: true, id: data.id }
}

export async function kaynakSil(tip, id) {
  const conf = TABLOLAR[tip]
  if (!conf) return { ok: false, error: 'Geçersiz tip.' }
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from(conf.tablo).delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/kaynaklar')
  return { ok: true }
}
