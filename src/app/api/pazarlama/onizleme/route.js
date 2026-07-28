import { tanitimEmailHtml } from '@/lib/email'
import { rolGuard } from '@/lib/guard'

/**
 * GET /api/pazarlama/onizleme?ad=...
 * Tanıtım e-postasının HTML önizlemesi (toplu göndermeden önce kontrol için).
 * Yalnızca personel erişebilir.
 */
export async function GET(request) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return new Response('Yetkisiz.', { status: 403 })

  const { searchParams } = new URL(request.url)
  const ad = searchParams.get('ad') || 'Örnek Firma A.Ş.'

  return new Response(tanitimEmailHtml(ad), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
