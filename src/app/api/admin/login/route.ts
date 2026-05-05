import { cookies } from 'next/headers'
import { type NextRequest } from 'next/server'
import { ADMIN_COOKIE, ADMIN_PASSWORD } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Password salah' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return Response.json({ success: true })
}
