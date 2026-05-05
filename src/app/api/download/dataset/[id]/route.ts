import { type NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: dataset, error } = await supabase
    .from('datasets')
    .select('file_path, file_name')
    .eq('id', id)
    .single()

  if (error || !dataset) return Response.json({ error: 'Not found' }, { status: 404 })

  const res = await fetch(dataset.file_path, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

  if (!res.ok) return Response.json({ error: 'Failed to fetch file' }, { status: 502 })

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
  const body = await res.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${dataset.file_name}"`,
    },
  })
}
