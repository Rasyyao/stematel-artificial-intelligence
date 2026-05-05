import { type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, category, description, file_path, file_name, file_size } = body

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('datasets')
    .insert({
      title,
      category: category || 'General',
      description: description || '',
      file_path,
      file_name,
      file_size: file_size || 0,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
