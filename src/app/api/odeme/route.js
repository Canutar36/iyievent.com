import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createPayTRToken } from '@/lib/paytr'
import { headers } from 'next/headers'

/**
 * POST /api/odeme
 * PayTR iframe token oluşturur
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const headersList = await headers()

    // Auth kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
    }

    const { etkinlikId, odemeId, tutar } = await request.json()

    // Ödemeyi ve etkinliği kontrol et
    const { data: odeme, error: odemeError } = await supabase
      .from('odemeler')
      .select('*, etkinlikler(musteri_id, ad)')
      .eq('id', odemeId)
      .single()

    if (odemeError || !odeme || odeme.etkinlikler.musteri_id !== user.id) {
      return NextResponse.json({ error: 'Ödeme bulunamadı.' }, { status: 404 })
    }

    // Profil bilgilerini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    // Kullanıcı IP'sini al
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    // Benzersiz sipariş ID'si
    const merchantOid = `IYI-${odemeId.slice(0, 8)}-${Date.now()}`

    // PayTR token oluştur
    const { token, iframeUrl } = await createPayTRToken({
      merchantOid,
      email: user.email,
      paymentAmount: Math.round(tutar * 100), // kuruşa çevir
      userIp: ip,
      userName: profile?.full_name || user.email,
      userPhone: profile?.phone || '05000000000',
      basketItems: [[odeme.aciklama || 'Etkinlik Hizmeti', tutar.toFixed(2), 1]],
    })

    // PayTR token'ı DB'ye kaydet
    await supabase
      .from('odemeler')
      .update({ paytr_token: token, paytr_merchant_oid: merchantOid })
      .eq('id', odemeId)

    return NextResponse.json({ success: true, iframeUrl })
  } catch (error) {
    console.error('Ödeme API hatası:', error)
    return NextResponse.json(
      { error: error.message || 'Ödeme başlatılamadı.' },
      { status: 500 }
    )
  }
}
