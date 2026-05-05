export async function POST() {
  return Response.json({ error: 'Use /api/upload instead' }, { status: 410 })
}
