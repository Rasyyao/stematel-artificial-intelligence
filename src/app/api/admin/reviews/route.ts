import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { submission_id, comment, status } = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('reviews')
    .insert({ submission_id, comment, status })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await admin
    .from('submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', submission_id)

  return Response.json(data, { status: 201 })
}
