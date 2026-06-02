export async function GET() {
  return Response.json({ hasApiKey: !!process.env.GOOGLE_SHEETS_API_KEY })
}
