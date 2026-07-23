import { NextResponse } from 'next/server'

export async function POST(request) {
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/musteri/etkinlikler?status=fail`, 303)
}
