import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
  if (type !== 'datasets' && type !== 'notebooks') {
    return Response.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (type === 'datasets' && !(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const safeName = file.name.replace(/\s+/g, '_')
  const pathname = `${type}/${Date.now()}_${safeName}`

  const blob = await put(pathname, file, { access: 'public' })

  return Response.json({
    file_path: blob.url,
    file_name: file.name,
    file_size: file.size,
  })
}
