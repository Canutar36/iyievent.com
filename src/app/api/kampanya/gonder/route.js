import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendKampanyaEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'

const CHUNK = 500 // her istekte işlenecek alıcı sayısı

/**
 * POST /api/kampanya/gonder
 * Body: { kampanyaId, offset, toplam? }
 * Kampanyayı parça parça gönderir; client bu endpoint'i offset artırarak
 * tekrar çağırır (ilerleme çubuğu). 22k+ alıcı tarayıcıyı/sunucuyu kilitlemez.
 */
export async function POST(request) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return NextResponse.json({ ok: false, error: g.error }, { status: 403 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ ok: false, error: 'Geçersiz istek.' }, { status: 400 }) }
  const { kampanyaId, offset = 0, toplam = 0 } = body

  // Dev önizleme: gerçek gönderim yok, ilerlemeyi simüle et
  if (isDevPreview()) {
    const islenen = Math.min(CHUNK, Math.max(0, toplam - offset))
    const yeniOffset = offset + islenen
    return NextResponse.json({ ok: true, demo: true, gonderilen: islenen, toplamGonderilen: yeniOffset, bitti: yeniOffset >= toplam })
  }

  const supabase = createServiceClient()
  const { data: k, error: kErr } = await supabase.from('kampanyalar').select('*').eq('id', kampanyaId).single()
  if (kErr || !k) return NextResponse.json({ ok: false, error: 'Kampanya bulunamadı.' }, { status: 404 })

  // Segmentteki alıcıları parça olarak çek
  let q = supabase.from('leadler').select('email, telefon')
  if (k.hedef_segment !== 'tumu') q = q.eq('tip', k.hedef_segment)
  const alan = k.kanal === 'sms' ? 'telefon' : 'email'
  q = q.not(alan, 'is', null).order('created_at', { ascending: true }).range(offset, offset + CHUNK - 1)
  const { data: rows, error: rErr } = await q
  if (rErr) return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 })

  const alicilar = (rows || []).map(r => r[alan]).filter(Boolean)
  try {
    if (alicilar.length) {
      if (k.kanal === 'sms') await sendSMS(alicilar, k.icerik || k.konu || '')
      else await sendKampanyaEmail({ emails: alicilar, konu: k.konu, baslik: k.ad, icerik: k.icerik })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Gönderim hatası: ' + e.message }, { status: 500 })
  }

  const toplamGonderilen = offset + alicilar.length
  const bitti = (rows || []).length < CHUNK
  if (bitti) {
    await supabase.from('kampanyalar').update({ durum: 'gonderildi', alici_sayisi: toplamGonderilen, gonderim_tarihi: new Date().toISOString() }).eq('id', kampanyaId)
  }
  return NextResponse.json({ ok: true, gonderilen: alicilar.length, toplamGonderilen, bitti })
}
