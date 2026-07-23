import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendDavetiyeEmail } from '@/lib/email'
import { sendDavetiyeSMS } from '@/lib/sms'

/**
 * POST /api/davetiye
 * Seçili misafirlere e-posta ve/veya SMS davetiye gönderir
 * Body: { etkinlikId, misafirIds: string[], kanal: 'email'|'sms'|'her_ikisi' }
 */
export async function POST(request) {
  try {
    const supabase = await createClient()

    // Auth kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
    }

    const { etkinlikId, misafirIds, kanal = 'email' } = await request.json()

    if (!etkinlikId || !misafirIds?.length) {
      return NextResponse.json({ error: 'Etkinlik ID ve misafir listesi zorunludur.' }, { status: 400 })
    }

    // Etkinliği al ve yetki kontrolü yap
    const { data: etkinlik, error: etkinlikError } = await supabase
      .from('etkinlikler')
      .select('*')
      .eq('id', etkinlikId)
      .eq('musteri_id', user.id)
      .single()

    if (etkinlikError || !etkinlik) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 })
    }

    // Seçili misafirleri al
    const { data: misafirler, error: misafirError } = await supabase
      .from('misafirler')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .in('id', misafirIds)

    if (misafirError || !misafirler?.length) {
      return NextResponse.json({ error: 'Misafirler bulunamadı.' }, { status: 404 })
    }

    const sonuclar = {
      basarili: 0,
      basarisiz: 0,
      hatalar: [],
    }

    // Her misafir için gönderim
    for (const misafir of misafirler) {
      try {
        if ((kanal === 'email' || kanal === 'her_ikisi') && misafir.email) {
          await sendDavetiyeEmail({ misafir, etkinlik })
        }
        if ((kanal === 'sms' || kanal === 'her_ikisi') && misafir.telefon) {
          await sendDavetiyeSMS({ misafir, etkinlik })
        }

        // Gönderim tarihini güncelle
        await supabase
          .from('misafirler')
          .update({
            davetiye_gonderildi: true,
            davetiye_gonderim_tarihi: new Date().toISOString(),
          })
          .eq('id', misafir.id)

        sonuclar.basarili++
      } catch (err) {
        console.error(`Davetiye hatası (${misafir.ad_soyad}):`, err)
        sonuclar.basarisiz++
        sonuclar.hatalar.push({ misafir: misafir.ad_soyad, hata: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      mesaj: `${sonuclar.basarili} davetiye gönderildi.${sonuclar.basarisiz > 0 ? ` ${sonuclar.basarisiz} gönderilemedi.` : ''}`,
      ...sonuclar,
    })
  } catch (error) {
    console.error('Davetiye API hatası:', error)
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
