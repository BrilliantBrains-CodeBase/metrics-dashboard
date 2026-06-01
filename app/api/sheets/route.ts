import { NextRequest } from 'next/server'

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const sheet = req.nextUrl.searchParams.get('sheet') // optional tab name
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  // Sanitize: strip trailing slashes/spaces that users accidentally paste from URLs
  const cleanId = (id ?? '').trim().replace(/\/+$/, '')

  if (!cleanId) return Response.json({ error: 'Missing spreadsheetId (id param)' }, { status: 400 })
  if (!apiKey) return Response.json({ error: 'GOOGLE_SHEETS_API_KEY not set in .env.local' }, { status: 500 })

  // Build range: "SheetName!A1:Z2000" or just "A1:Z2000" for first sheet
  const range = sheet ? `${encodeURIComponent(sheet)}!A1:Z2000` : 'A1:Z2000'
  const url = `${SHEETS_BASE}/${cleanId}/values/${range}?key=${apiKey}&valueRenderOption=FORMATTED_VALUE`

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    const json = await res.json()

    if (!res.ok) {
      return Response.json(
        { error: json.error?.message ?? `Sheets API error ${res.status}` },
        { status: res.status }
      )
    }

    // json.values is string[][]
    return Response.json({ values: json.values ?? [] })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 })
  }
}
