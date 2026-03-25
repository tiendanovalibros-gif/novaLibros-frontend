import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('auth_token', token, {
    httpOnly: true,           // JS del cliente no puede leerla
    secure: process.env.NODE_ENV === 'production',  // solo HTTPS en prod
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  return response
}
