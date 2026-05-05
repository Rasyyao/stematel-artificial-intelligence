import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from('announcements').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
