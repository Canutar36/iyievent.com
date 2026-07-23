import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { appendToSheet } from '@/lib/google'

/**
 * POST /api/sheets
 * Talep formunu hem Supabase'e hem Google Sheets'e kaydeder
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { ad_soyad, email, telefon, etkinlik_turu, tahmini_misafir, butce, mesaj } = body

    // Validasyon
    if (!ad_soyad || !email || !telefon) {
      return NextResponse.json(
        { error: 'Ad soyad, e-posta ve telefon zorunludur.' },
        { status: 400 }
      )
    }

    // 1. Supabase'e kaydet (service role ile — RLS bypass)
    const supabase = createServiceClient()
    const { data: talep, error: dbError } = await supabase
      .from('talepler')
      .insert({
        ad_soyad,
        email,
        telefon,
        etkinlik_turu,
        tahmini_misafir,
        butce,
        mesaj,
        durum: 'yeni',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB kayıt hatası:', dbError)
      // DB hatası olsa bile kullanıcıya hata gösterme — Sheets'e kayıt deniyoruz
    }

    // 2. Google Sheets'e kaydet (arka planda, hata olursa sessizce geçer)
    appendToSheet({ ad_soyad, email, telefon, etkinlik_turu, tahmini_misafir, butce, mesaj })
      .catch(err => console.error('Sheets kayıt hatası (non-fatal):', err))

    return NextResponse.json({
      success: true,
      message: 'Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.',
      talepId: talep?.id,
    })
  } catch (error) {
    console.error('API hatası:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
