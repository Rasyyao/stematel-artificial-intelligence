import { type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, dataset:datasets(title, category)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { student_name, title, dataset_id, notes, file_path, file_name, file_size } = body

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      student_name,
      title,
      dataset_id: dataset_id || null,
      notes: notes || null,
      file_path,
      file_name,
      file_size: file_size || 0,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
