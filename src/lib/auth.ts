import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'lks_admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lks2026admin'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)
  return session?.value === 'authenticated'
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD
}

export { ADMIN_COOKIE, ADMIN_PASSWORD }
