// Kept as a legacy fallback — not used by the main data path anymore.
// Main data flow: app/api/sheets/route.ts
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new Response('Missing url param', { status: 400 })
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) return new Response(`Upstream error: ${res.status}`, { status: 502 })
    const text = await res.text()
    return new Response(text, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } })
  } catch (err) {
    return new Response(`Fetch failed: ${String(err)}`, { status: 502 })
  }
}
