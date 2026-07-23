'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

function teklifNo() {
  const d = new Date()
  const y = d.getFullYear()
  const rnd = Math.floor(1000 + Math.random() * 9000)
  return `TKF-${y}-${rnd}`
}

/**
 * Yeni teklif kaydeder (Teklif Builder'dan).
 * @param {object} t - { musteri_ad, musteri_telefon, musteri_email, hizmet_id, hizmet_ad,
 *   kategori, kisi_sayisi, ara_toplam, ekstra_toplam, indirim, toplam, notlar, kalemler[] }
 */
export async function teklifKaydet(t) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }

  const no = teklifNo()
  if (isDevPreview()) return { ok: true, demo: true, id: 'demo-' + Date.now(), teklif_no: no }

  const supabase = createServiceClient()
  const { data: teklif, error } = await supabase.from('teklifler').insert({
    teklif_no: no,
    musteri_ad: t.musteri_ad || null,
    musteri_telefon: t.musteri_telefon || null,
    musteri_email: t.musteri_email || null,
    hizmet_id: t.hizmet_id || null,
    hizmet_ad: t.hizmet_ad || null,
    kategori: t.kategori || null,
    kisi_sayisi: Number(t.kisi_sayisi) || 0,
    ara_toplam: Number(t.ara_toplam) || 0,
    ekstra_toplam: Number(t.ekstra_toplam) || 0,
    indirim: Number(t.indirim) || 0,
    toplam: Number(t.toplam) || 0,
    durum: 'taslak',
    notlar: t.notlar || null,
    hazirlayan_id: g.rol && !isDevPreview() ? undefined : undefined,
  }).select('id, teklif_no').single()

  if (error) return { ok: false, error: error.message }

  const kalemler = (t.kalemler || []).map((k, i) => ({
    teklif_id: teklif.id,
    tur: k.tur,
    ad: k.ad,
    birim: k.birim,
    adet: Number(k.adet) || 1,
    birim_fiyat: Number(k.birim_fiyat) || 0,
    tutar: Number(k.tutar) || 0,
    siralama: i,
  }))
  if (kalemler.length) await supabase.from('teklif_kalemleri').insert(kalemler)

  await logAktivite({ eylem: 'teklif_olusturuldu', ozet: `${teklif.teklif_no} — ${t.musteri_ad || 'müşteri'} (${Number(t.toplam).toLocaleString('tr-TR')} ₺)`, hedefTur: 'teklif', hedefId: teklif.id })

  revalidatePath('/yonetim/teklifler')
  return { ok: true, id: teklif.id, teklif_no: teklif.teklif_no }
}

/** Teklif durumunu günceller. */
export async function teklifDurumGuncelle(id, durum) {
  const gecerli = ['taslak', 'gonderildi', 'goruldu', 'kabul', 'red', 'etkinlige_donustu']
  if (!gecerli.includes(durum)) return { ok: false, error: 'Geçersiz durum.' }
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const guncelleme = { durum }
  if (durum === 'gonderildi') guncelleme.gonderim_tarihi = new Date().toISOString()
  const { error } = await supabase.from('teklifler').update(guncelleme).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/yonetim/teklifler')
  return { ok: true }
}
