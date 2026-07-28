'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { sendEtkinlikDurumEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

const DURUM_LABEL = {
  talep: 'Talep',
  planlama: 'Planlama',
  onaylandi: 'Onaylandı',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

export async function etkinlikDurumGuncelle(id, yeniDurum) {
  const gecerli = ['talep', 'planlama', 'onaylandi', 'tamamlandi', 'iptal']
  if (!gecerli.includes(yeniDurum)) return { ok: false, error: 'Geçersiz durum.' }

  const supabase = createServiceClient()

  // Etkinliği ve müşteri bilgisini çek
  const { data: etkinlik, error: fetchError } = await supabase
    .from('etkinlikler')
    .select('*, musteri:profiles!etkinlikler_musteri_id_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (fetchError || !etkinlik) return { ok: false, error: 'Etkinlik bulunamadı.' }

  // Durumu güncelle
  const { error: updateError } = await supabase
    .from('etkinlikler')
    .update({ durum: yeniDurum })
    .eq('id', id)

  if (updateError) return { ok: false, error: updateError.message }

  // Email gönder (hata olsa bile devam et)
  const musteriEmail = etkinlik.musteri?.email
  const musteriAd = etkinlik.musteri?.full_name
  if (musteriEmail && DURUM_LABEL[yeniDurum]) {
    try {
      await sendEtkinlikDurumEmail({
        email: musteriEmail,
        musteriAd,
        etkinlikAd: etkinlik.ad || 'Etkinlik',
        durum: yeniDurum,
      })
    } catch (emailErr) {
      console.error('Email gönderilemedi:', emailErr)
    }
  }

  revalidatePath('/yonetim/etkinlikler')
  return { ok: true, mesaj: `${DURUM_LABEL[yeniDurum]} durumuna güncellendi.` }
}
