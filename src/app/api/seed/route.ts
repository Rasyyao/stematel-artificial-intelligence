import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { error: annError } = await admin.from('announcements').insert([
    {
      title: 'Selamat datang di platform latihan LKS Nasional 2026!',
      content: 'Persiapkan dirimu untuk eksibisi AI Jawa Tengah. Upload notebook latihanmu secara rutin dan pantau progresmu di sini.',
      pinned: true,
    },
    {
      title: 'Cara submit notebook',
      content: 'Klik tombol "Submit Notebook" di halaman utama, isi form, lalu upload file .ipynb kamu. Admin akan memberikan review segera.',
      pinned: false,
    },
    {
      title: 'Dataset latihan tersedia',
      content: 'Dataset untuk latihan sudah tersedia. Download di bagian Dataset pada halaman utama, lalu mulai eksplorasi datamu.',
      pinned: false,
    },
  ])

  if (annError) return Response.json({ error: annError.message }, { status: 500 })

  return Response.json({ success: true, seeded: ['announcements'] })
}
