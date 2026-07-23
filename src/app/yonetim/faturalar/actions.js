'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { eFaturaKes as nilveraKes, eFaturaDurum } from '@/lib/nilvera'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

/** KDV'yi kalemlerden hesapla. */
function hesapla(kalemler) {
  let haric = 0, kdv = 0
  for (const k of kalemler || []) {
    const tutar = (Number(k.adet) || 1) * (Number(k.birim_fiyat) || 0)
    haric += tutar
    kdv += tutar * ((Number(k.kdv_orani) || 20) / 100)
  }
  return { kdv_haric: Math.round(haric * 100) / 100, kdv: Math.round(kdv * 100) / 100, toplam: Math.round((haric + kdv) * 100) / 100 }
}

/** Fatura taslağı oluştur/güncelle. */
export async function faturaKaydet(fatura) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  const { kdv_haric, kdv, toplam } = hesapla(fatura.kalemler)

  if (isDevPreview()) {
    return { ok: true, demo: true, id: fatura.id || 'demo-' + Date.now(), kdv_haric, kdv, toplam }
  }

  const supabase = createServiceClient()
  const kayit = {
    cari_id: fatura.cari_id || null, etkinlik_id: fatura.etkinlik_id || null,
    tur: fatura.tur || 'satis', tarih: fatura.tarih || new Date().toISOString().slice(0, 10),
    kdv_haric, kdv, toplam, fatura_tipi: fatura.fatura_tipi || 'e_arsiv',
    aciklama: fatura.aciklama || null, durum: 'taslak',
  }
  let faturaId = fatura.id
  if (faturaId) {
    await supabase.from('faturalar').update(kayit).eq('id', faturaId)
    await supabase.from('fatura_kalemleri').delete().eq('fatura_id', faturaId)
  } else {
    const { data, error } = await supabase.from('faturalar').insert(kayit).select('id').single()
    if (error) return { ok: false, error: error.message }
    faturaId = data.id
  }
  const kalemler = (fatura.kalemler || []).map((k, i) => ({
    fatura_id: faturaId, ad: k.ad, adet: Number(k.adet) || 1, birim: k.birim || 'adet',
    birim_fiyat: Number(k.birim_fiyat) || 0, kdv_orani: Number(k.kdv_orani) || 20,
    tutar: (Number(k.adet) || 1) * (Number(k.birim_fiyat) || 0), siralama: i,
  }))
  if (kalemler.length) await supabase.from('fatura_kalemleri').insert(kalemler)

  revalidatePath('/yonetim/faturalar')
  return { ok: true, id: faturaId, kdv_haric, kdv, toplam }
}

/** Faturayı Nilvera üzerinden e-Fatura/e-Arşiv olarak keser. */
export async function faturaKes(faturaId) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }

  if (isDevPreview()) {
    const sonuc = await nilveraKes({ fatura_no: null })
    return { ok: true, demo: true, fatura_no: sonuc.faturaNo, nilvera_uuid: sonuc.uuid, nilvera_durum: 'onaylandi', durum: 'kesildi' }
  }

  const supabase = createServiceClient()
  const { data: fatura, error } = await supabase.from('faturalar').select('*, cariler(*), fatura_kalemleri(*)').eq('id', faturaId).single()
  if (error || !fatura) return { ok: false, error: 'Fatura bulunamadı.' }
  if (fatura.durum === 'kesildi') return { ok: false, error: 'Fatura zaten kesilmiş.' }

  let sonuc
  try {
    sonuc = await nilveraKes({
      fatura_no: fatura.fatura_no, tarih: fatura.tarih, tur: fatura.tur, fatura_tipi: fatura.fatura_tipi,
      cari: fatura.cariler, kalemler: fatura.fatura_kalemleri, kdv_haric: fatura.kdv_haric, kdv: fatura.kdv, toplam: fatura.toplam,
    })
  } catch (e) {
    return { ok: false, error: 'Nilvera hatası: ' + e.message }
  }

  await supabase.from('faturalar').update({
    fatura_no: sonuc.faturaNo, nilvera_uuid: sonuc.uuid, nilvera_durum: sonuc.durum || 'gonderildi',
    pdf_url: sonuc.pdfUrl || null, durum: 'kesildi',
  }).eq('id', faturaId)

  await logAktivite({ eylem: 'fatura_kesildi', ozet: `${sonuc.faturaNo} — ${fatura.cariler?.unvan || 'cari'} (${Number(fatura.toplam).toLocaleString('tr-TR')} ₺)`, hedefTur: 'fatura', hedefId: faturaId })

  revalidatePath('/yonetim/faturalar')
  return { ok: true, fatura_no: sonuc.faturaNo, nilvera_uuid: sonuc.uuid, nilvera_durum: sonuc.durum, durum: 'kesildi' }
}

export async function faturaDurumSorgula(uuid) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, durum: 'onaylandi' }
  try {
    const { durum } = await eFaturaDurum(uuid)
    return { ok: true, durum }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function faturaSil(id) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('faturalar').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/faturalar')
  return { ok: true }
}
