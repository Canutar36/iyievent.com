import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { verifyPayTRCallback } from '@/lib/paytr'

/**
 * POST /api/odeme/callback
 * PayTR'dan gelen ödeme sonucu bildirimi (webhook)
 * Bu endpoint PayTR tarafından çağrılır — JWT auth yok, hash doğrulaması var
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const body = Object.fromEntries(formData.entries())

    const { merchant_oid, status, total_amount, payment_type } = body

    // Hash doğrulama — PayTR güvenliği
    const isValid = verifyPayTRCallback(body)
    if (!isValid) {
      console.error('PayTR callback hash doğrulama başarısız:', merchant_oid)
      return new Response('INVALID_HASH', { status: 400 })
    }

    const supabase = createServiceClient()

    // Ödeme kaydını bul
    const { data: odeme, error } = await supabase
      .from('odemeler')
      .select('*, etkinlikler(id, musteri_id, toplam_tutar, odenen_tutar, ad)')
      .eq('paytr_merchant_oid', merchant_oid)
      .single()

    if (error || !odeme) {
      console.error('Ödeme kaydı bulunamadı:', merchant_oid)
      return new Response('OK') // PayTR'a "anladım" demek gerekiyor
    }

    const yeniDurum = status === 'success' ? 'tamamlandi' : 'basarisiz'

    // Ödeme durumunu güncelle
    await supabase
      .from('odemeler')
      .update({
        durum: yeniDurum,
        paytr_response: body,
        odeme_tarihi: status === 'success' ? new Date().toISOString() : null,
      })
      .eq('id', odeme.id)

    // Başarılı ödeme → etkinlik odenen_tutar güncelle
    if (status === 'success') {
      const yeniOdenen = (odeme.etkinlikler.odenen_tutar || 0) + (total_amount / 100)
      await supabase
        .from('etkinlikler')
        .update({ odenen_tutar: yeniOdenen })
        .eq('id', odeme.etkinlikler.id)

      // Müşteriye bildirim oluştur
      await supabase
        .from('bildirimler')
        .insert({
          kullanici_id: odeme.etkinlikler.musteri_id,
          baslik: 'Ödemeniz Alındı',
          mesaj: `${odeme.etkinlikler.ad} etkinliğine ait ${(total_amount / 100).toLocaleString('tr-TR')} ₺ ödemesi başarıyla alındı.`,
          tur: 'odeme',
          link: `/musteri/etkinlik/${odeme.etkinlikler.id}/odeme`,
        })
    }

    // PayTR'ın beklediği yanıt
    return new Response('OK')
  } catch (error) {
    console.error('PayTR callback hatası:', error)
    return new Response('OK') // Her durumda OK dön, PayTR tekrar dener
  }
}
