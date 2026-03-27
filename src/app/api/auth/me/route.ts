import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Decodificar payload del JWT
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'))

    // Verificar expiración
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      const response = NextResponse.json({ user: null }, { status: 401 })
      response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
      return response
    }

    // El JWT solo tiene sub, correo y rol
    // nombre y apellido vienen del AuthContext (guardados en el login)
    const user = {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
