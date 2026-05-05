import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured. Add it to your environment variables.' },
      { status: 500 },
    )
  }

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

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const pathname = `${type}/${Date.now()}_${safeName}`

    const blob = await put(pathname, file, {
      access: 'public',
      multipart: true,
    })

    return Response.json({
      file_path: blob.url,
      file_name: file.name,
      file_size: file.size,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
