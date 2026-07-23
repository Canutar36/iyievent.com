'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendRandevuEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function randevuOlustur(r) {
  const g = await rolGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (!r.baslik || !r.tarih) return { ok: false, error: 'Başlık ve tarih zorunlu.' }

  if (isDevPreview()) {
    return { ok: true, demo: true, id: 'demo-' + Date.now(), mailGonderildi: !!(r.mail_gonder && r.musteri_email) }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('randevular').insert({
    baslik: r.baslik,
    tur: r.tur || 'gorusme',
    lead_id: r.lead_id || null,
    musteri_ad: r.musteri_ad || null,
    musteri_email: r.musteri_email || null,
    tarih: r.tarih,
    baslangic_saat: r.baslangic_saat || null,
    bitis_saat: r.bitis_saat || null,
    konum: r.konum || null,
    notlar: r.notlar || null,
    durum: 'planlandi',
  }).select('*').single()
  if (error) return { ok: false, error: error.message }

  let mailGonderildi = false
  if (r.mail_gonder && r.musteri_email) {
    try {
      await sendRandevuEmail({ email: r.musteri_email, ad: r.musteri_ad, tarih: r.tarih, saat: r.baslangic_saat, konum: r.konum })
      await supabase.from('randevular').update({ mail_gonderildi: true }).eq('id', data.id)
      mailGonderildi = true
    } catch (e) {
      // Randevu oluştu ama mail gitmedi — sessiz geç, uyarı döndür
      revalidatePath('/yonetim/takvim')
      return { ok: true, randevu: data, mailUyari: 'Randevu oluştu ancak mail gönderilemedi: ' + e.message }
    }
  }

  revalidatePath('/yonetim/takvim')
  return { ok: true, randevu: { ...data, mail_gonderildi: mailGonderildi }, mailGonderildi }
}

export async function randevuDurumGuncelle(id, durum) {
  const gecerli = ['planlandi', 'tamamlandi', 'iptal']
  if (!gecerli.includes(durum)) return { ok: false, error: 'Geçersiz durum.' }
  const g = await rolGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('randevular').update({ durum }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/takvim')
  return { ok: true }
}

export async function randevuSil(id) {
  const g = await rolGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('randevular').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/takvim')
  return { ok: true }
}
