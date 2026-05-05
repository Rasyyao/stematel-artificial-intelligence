import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient, supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, pinned } = await request.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('announcements')
    .insert({ title, content, pinned: pinned ?? false })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
