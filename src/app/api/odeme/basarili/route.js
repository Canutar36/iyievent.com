import { NextResponse } from 'next/server'

export async function POST(request) {
  const origin = new URL(request.url).origin
  // PayTR POST ile yönlendirir, müşteri panelindeki etkinlikler sayfasına atıyoruz
  return NextResponse.redirect(`${origin}/musteri/etkinlikler?status=success`, 303)
}
