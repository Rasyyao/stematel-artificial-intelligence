import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { del } from '@vercel/blob'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()

  const { data: dataset } = await admin.from('datasets').select('file_path').eq('id', id).single()
  if (dataset?.file_path) {
    try { await del(dataset.file_path) } catch {}
  }

  const { error } = await admin.from('datasets').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
