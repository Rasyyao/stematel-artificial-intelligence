import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: submission, error } = await admin
    .from('submissions')
    .select('file_path, file_name')
    .eq('id', id)
    .single()

  if (error || !submission) return Response.json({ error: 'Not found' }, { status: 404 })

  try {
    const res = await fetch(submission.file_path)
    if (!res.ok) throw new Error('Blob fetch failed')
    const content = await res.text()
    return new Response(content, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${submission.file_name}"`,
      },
    })
  } catch {
    return Response.json({ error: 'Failed to load notebook' }, { status: 500 })
  }
}
