import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  return NextResponse.redirect(new URL('/admin/login', request.url))
}
