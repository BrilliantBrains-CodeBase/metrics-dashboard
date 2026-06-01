import { Brand, EcomRow, HospitalRow, OtherRow, AnyRow } from '@/types'

// ── Number normalizer ─────────────────────────────────────────────────────────
function n(v: unknown): number {
  if (v === undefined || v === null || String(v).trim() === '') return 0
  const num = parseFloat(String(v).replace(/[₹$,% x]/g, '').trim())
  return isNaN(num) ? 0 : num
}

// ── Date normalizer ───────────────────────────────────────────────────────────
// Handles: ISO (2024-01-15), day numbers (1–31), DD/MM/YYYY, DD-MM-YYYY
// Day numbers are mapped to the most-recently-completed month (so day 1 = last month's 1st
// if today is early in the current month, otherwise current month's 1st).
function normalizeDate(raw: string): string {
  const s = raw.trim()
  if (!s) return ''

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)

  // Day number 1–31 (bare integer, no letters)
  if (/^\d{1,2}$/.test(s)) {
    const day = parseInt(s, 10)
    if (day >= 1 && day <= 31) {
      const now = new Date()
      // If today is before this day number, the data belongs to last month
      const monthOffset = now.getDate() < day ? -1 : 0
      const ref = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
      const maxDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
      if (day > maxDay) return ''
      return `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // Fallback: let JS parse it
  const parsed = new Date(s)
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

  return '' // Unparseable — row will be filtered out
}

// ── Column-name normalizer (strips spaces/symbols, lowercase) ─────────────────
function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

// ── Pick first matching key from a normalized row object ──────────────────────
function pick(r: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (r[k] !== undefined && r[k] !== '') return r[k]
  }
  return ''
}

// ── Row parsers ───────────────────────────────────────────────────────────────
function parseEcomRow(raw: Record<string, string>): EcomRow {
  const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [normalizeKey(k), v]))
  return {
    date:        normalizeDate(pick(r, 'date')),
    adSpend:     n(pick(r, 'adspend', 'spend', 'cost', 'amountspent')),
    revenue:     n(pick(r, 'revenue', 'purchasevalue', 'purchaseconversionvalue', 'sales')),
    impressions: n(pick(r, 'impressions', 'impr')),
    clicks:      n(pick(r, 'clicks', 'linkclicks')),
    atc:         n(pick(r, 'atc', 'addtocart', 'addstocart')),
    purchases:   n(pick(r, 'purchases', 'orders', 'conversions')),
    roas:        n(pick(r, 'roas', 'purchaseroas', 'returnofadspend')),
    cpa:         n(pick(r, 'cpa', 'costperresult', 'costperpurchase')),
    cr:          n(pick(r, 'cr', 'conversionrate', 'purchaserate')),
    ctr:         n(pick(r, 'ctr', 'clickthroughrate')),
    aov:         n(pick(r, 'aov', 'averageordervalue', 'avgordervalue')),
  }
}

function parseHospitalRow(raw: Record<string, string>): HospitalRow {
  const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [normalizeKey(k), v]))
  return {
    date:         normalizeDate(pick(r, 'date')),
    adSpend:      n(pick(r, 'adspend', 'spend', 'cost', 'amountspent')),
    impressions:  n(pick(r, 'impressions', 'impr')),
    clicks:       n(pick(r, 'clicks', 'linkclicks')),
    leads:        n(pick(r, 'leads', 'totalleads', 'results')),
    qualityLeads: n(pick(r, 'qualityleads', 'qualleads', 'ql', 'qualifiedleads')),
    cpm:          n(pick(r, 'cpm', 'costper1000impressions')),
    cpc:          n(pick(r, 'cpc', 'costperclick', 'costperlinkclick')),
    ctr:          n(pick(r, 'ctr', 'clickthroughrate')),
    cr:           n(pick(r, 'cr', 'clicktolead', 'leadrate')),
    cpl:          n(pick(r, 'cpl', 'costperlead', 'costperresult')),
    qualPercent:  n(pick(r, 'qual', 'qualpercent', 'qualityrate', 'qualrate', 'qualitypercent')),
    cpql:         n(pick(r, 'cpql', 'costperqualitylead', 'costperqualifiedlead')),
  }
}

function parseOtherRow(raw: Record<string, string>): OtherRow {
  const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [normalizeKey(k), v]))
  return {
    date:        normalizeDate(pick(r, 'date')),
    adSpend:     n(pick(r, 'adspend', 'spend', 'cost', 'amountspent')),
    revenue:     n(pick(r, 'revenue', 'purchasevalue', 'sales')),
    impressions: n(pick(r, 'impressions', 'impr')),
    clicks:      n(pick(r, 'clicks', 'linkclicks')),
    conversions: n(pick(r, 'conversions', 'purchases', 'results')),
    roas:        n(pick(r, 'roas', 'purchaseroas')),
    cpa:         n(pick(r, 'cpa', 'costperresult')),
    ctr:         n(pick(r, 'ctr', 'clickthroughrate')),
  }
}

// ── Sheets API fetch ──────────────────────────────────────────────────────────
// Returns an array of row objects keyed by header values.
// Auto-detects which row contains the headers (first row with a non-empty first cell
// that looks like a column label, not a date or number).
async function fetchSheetRows(brand: Brand): Promise<Record<string, string>[]> {
  const cleanId = brand.spreadsheetId.trim().replace(/\/+$/, '')
  const params = new URLSearchParams({ id: cleanId })
  if (brand.sheetName) params.set('sheet', brand.sheetName)

  const res = await fetch(`/api/sheets?${params}`)
  const json = await res.json()

  if (!res.ok) throw new Error(json.error ?? `Sheets API error ${res.status}`)

  const raw: string[][] = json.values ?? []
  if (raw.length === 0) return []

  // Find the header row: first row whose first non-empty cell is a text label (not a date/number)
  let headerIdx = 0
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const first = (raw[i][0] ?? '').trim()
    if (first === '') continue
    // If it looks like a label (not a date, not a pure number), use it as the header row
    const looksLikeLabel = isNaN(Number(first)) && !/^\d{1,2}[\/\-]\d{1,2}/.test(first)
    if (looksLikeLabel) {
      headerIdx = i
      break
    }
  }

  const headers = raw[headerIdx].map((h) => h.trim())

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${brand.name}] header row ${headerIdx + 1}:`, headers)
  }

  // Find the index of the "Date" column so we can filter junk rows
  const dateColIdx = headers.findIndex((h) => h.trim().toLowerCase() === 'date')

  return raw.slice(headerIdx + 1)
    .filter((row) => {
      // Drop fully empty rows
      if (row.every((c) => !c || c.trim() === '')) return false
      // Drop label/aggregate rows (Date cell must be a number or a parseable date, not text)
      if (dateColIdx >= 0) {
        const dateCell = (row[dateColIdx] ?? '').trim()
        if (!dateCell) return false
        // Keep rows where date cell is a number (1–31) or an ISO-like date
        const isNumeric = /^\d{1,2}$/.test(dateCell) && parseInt(dateCell, 10) >= 1
        const isDateLike = /^\d{4}/.test(dateCell) || /^\d{1,2}[\/\-]/.test(dateCell)
        if (!isNumeric && !isDateLike) return false
      }
      return true
    })
    .map((row) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        if (h) obj[h] = (row[i] ?? '').trim()
      })
      return obj
    })
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchBrandData(brand: Brand): Promise<AnyRow[]> {
  const cleanId = brand.spreadsheetId.trim().replace(/\/+$/, '')
  if (!cleanId) return generateMockData(brand)

  try {
    const rows = await fetchSheetRows(brand)
    if (rows.length === 0) return generateMockData(brand)

    let parsed: AnyRow[]
    if (brand.vertical === 'ecommerce') parsed = rows.map(parseEcomRow)
    else if (brand.vertical === 'hospital') parsed = rows.map(parseHospitalRow)
    else parsed = rows.map(parseOtherRow)

    // Only keep rows that have a date value
    const withDate = parsed.filter((r) => r.date && r.date.length > 0)
    return withDate.length > 0 ? withDate : generateMockData(brand)
  } catch (err) {
    console.error(`[${brand.name}] Sheets fetch failed:`, err)
    return generateMockData(brand)
  }
}

// ── Mock data (shown when spreadsheetId is empty) ────────────────────────────
function generateMockData(brand: Brand): AnyRow[] {
  const seed = brand.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  let s = seed

  function rand(base: number, variance: number): number {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const t = (s >>> 0) / 0xffffffff
    return base + t * variance * 2 - variance
  }

  const rows: AnyRow[] = []
  const today = new Date()

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]

    if (brand.vertical === 'ecommerce') {
      const adSpend = Math.max(1000, Math.round(rand(15000, 5000)))
      const roas = Math.max(0.5, parseFloat(rand(3.2, 0.8).toFixed(2)))
      const revenue = Math.round(adSpend * roas)
      const impressions = Math.max(1000, Math.round(rand(80000, 20000)))
      const clicks = Math.round(impressions * Math.max(0.005, rand(0.025, 0.008)))
      const purchases = Math.max(1, Math.round(clicks * Math.max(0.005, rand(0.03, 0.01))))
      rows.push({
        date, adSpend, revenue, impressions, clicks,
        atc: Math.round(purchases * Math.max(1.5, rand(3, 0.5))),
        purchases, roas,
        cpa: parseFloat((adSpend / purchases).toFixed(2)),
        cr: parseFloat((purchases / clicks * 100).toFixed(2)),
        ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
        aov: parseFloat((revenue / purchases).toFixed(2)),
      })
    } else if (brand.vertical === 'hospital') {
      const adSpend = Math.max(1000, Math.round(rand(12000, 4000)))
      const impressions = Math.max(1000, Math.round(rand(60000, 15000)))
      const clicks = Math.round(impressions * Math.max(0.005, rand(0.022, 0.006)))
      const leads = Math.max(1, Math.round(clicks * Math.max(0.02, rand(0.08, 0.03))))
      const qualPercent = Math.max(5, Math.min(80, parseFloat(rand(35, 10).toFixed(1))))
      const qualityLeads = Math.max(1, Math.round(leads * qualPercent / 100))
      rows.push({
        date, adSpend, impressions, clicks, leads, qualityLeads,
        cpm: parseFloat((adSpend / impressions * 1000).toFixed(2)),
        cpc: parseFloat((adSpend / clicks).toFixed(2)),
        ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
        cr: parseFloat((leads / clicks * 100).toFixed(2)),
        cpl: parseFloat((adSpend / leads).toFixed(2)),
        qualPercent,
        cpql: parseFloat((adSpend / qualityLeads).toFixed(2)),
      })
    } else {
      const adSpend = Math.max(1000, Math.round(rand(10000, 3000)))
      const roas = Math.max(0.5, parseFloat(rand(2.5, 0.7).toFixed(2)))
      const impressions = Math.max(1000, Math.round(rand(50000, 15000)))
      const clicks = Math.round(impressions * Math.max(0.005, rand(0.02, 0.007)))
      const conversions = Math.max(1, Math.round(clicks * Math.max(0.005, rand(0.025, 0.008))))
      rows.push({
        date, adSpend, revenue: Math.round(adSpend * roas), impressions, clicks, conversions,
        roas,
        cpa: parseFloat((adSpend / conversions).toFixed(2)),
        ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
      })
    }
  }
  return rows
}
