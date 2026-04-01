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

    // Llamar al backend para obtener los datos completos del usuario
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const userResponse = await fetch(`${backendUrl}/users/${payload.sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      // Si falla la llamada al backend, devolver datos básicos del JWT
      const user = {
        id: payload.sub,
        correo: payload.correo,
        rol: payload.rol,
      }
      return NextResponse.json({ user }, { status: 200 })
    }

    const userData = await userResponse.json()

    // Devolver datos completos del usuario
    const user = {
      id: userData.id,
      correo: userData.correo,
      nombre: userData.nombre,
      apellido: userData.apellido,
      rol: userData.rol,
      fechaNacimiento: userData.fechaNacimiento,
      genero: userData.genero,
      telefono: userData.telefono,
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error en /api/auth/me:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
