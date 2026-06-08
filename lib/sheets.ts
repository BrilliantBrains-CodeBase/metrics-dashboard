import { Brand, EcomRow, HospitalRow, OtherRow, AnyRow, ShopifyRow, BrandData } from '@/types'
import { ShopifyAnalyticsData } from '@/types/shopify-analytics'
import { parseShopifyAnalyticsSheet, generateMockShopifyAnalytics } from '@/lib/shopify-analytics-parser'
import { assembleFromSheets, parseOverviewSheetToRows } from '@/lib/shopify-multi-sheet-parser'

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

function parseShopifyRow(raw: Record<string, string>): ShopifyRow {
  const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [normalizeKey(k), v]))
  const orders = n(pick(r, 'totalorders', 'orders', 'ordercount'))
  const grossSales = n(pick(r, 'grosssales'))
  const netSales = n(pick(r, 'netsales'))
  const totalSales = n(pick(r, 'totalsales')) || netSales || grossSales
  return {
    date:       normalizeDate(pick(r, 'date', 'day')),
    totalSales,
    grossSales,
    discounts:  Math.abs(n(pick(r, 'discounts', 'discount'))),
    returns:    Math.abs(n(pick(r, 'returns', 'refunds', 'return'))),
    netSales,
    orders,
    aov:        n(pick(r, 'aov', 'averageordervalue', 'avgordervalue')) || (orders > 0 ? totalSales / orders : 0),
  }
}

// ── Raw sheet fetch (returns string[][] without parsing) ─────────────────────
async function fetchSheetRaw(id: string, sheetName: string): Promise<string[][]> {
  const params = new URLSearchParams({ id: id.trim(), sheet: sheetName })
  const res = await fetch(`/api/sheets?${params}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Sheets error ${res.status}`)
  return json.values ?? []
}

// ── Sheets API fetch ──────────────────────────────────────────────────────────
async function fetchSheetRowsById(id: string, sheetName?: string, debugLabel?: string): Promise<Record<string, string>[]> {
  const cleanId = id.trim().replace(/\/+$/, '')
  const params = new URLSearchParams({ id: cleanId })
  if (sheetName) params.set('sheet', sheetName)
  const res = await fetch(`/api/sheets?${params}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Sheets API error ${res.status}`)
  return parseRawRows(json.values ?? [], debugLabel)
}

// ── Shared raw-rows parser ────────────────────────────────────────────────────
function parseRawRows(raw: string[][], debugLabel?: string): Record<string, string>[] {
  if (raw.length === 0) return []

  let headerIdx = 0
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const first = (raw[i][0] ?? '').trim()
    if (first === '') continue
    if (isNaN(Number(first)) && !/^\d{1,2}[\/\-]\d{1,2}/.test(first)) {
      headerIdx = i
      break
    }
  }

  const headers = raw[headerIdx].map((h) => h.trim())

  if (process.env.NODE_ENV === 'development' && debugLabel) {
    console.log(`[${debugLabel}] header row ${headerIdx + 1}:`, headers)
  }

  const dateColIdx = headers.findIndex((h) => h.trim().toLowerCase() === 'date')

  return raw.slice(headerIdx + 1)
    .filter((row) => {
      if (row.every((c) => !c || c.trim() === '')) return false
      if (dateColIdx >= 0) {
        const dateCell = (row[dateColIdx] ?? '').trim()
        if (!dateCell) return false
        const isNumeric = /^\d{1,2}$/.test(dateCell) && parseInt(dateCell, 10) >= 1
        const isDateLike = /^\d{4}/.test(dateCell) || /^\d{1,2}[\/\-]/.test(dateCell)
        if (!isNumeric && !isDateLike) return false
      }
      return true
    })
    .map((row) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { if (h) obj[h] = (row[i] ?? '').trim() })
      return obj
    })
}

async function fetchSheetRows(brand: Brand): Promise<Record<string, string>[]> {
  const cleanId = brand.spreadsheetId.trim().replace(/\/+$/, '')
  const params = new URLSearchParams({ id: cleanId })
  if (brand.sheetName) params.set('sheet', brand.sheetName)
  const res = await fetch(`/api/sheets?${params}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `Sheets API error ${res.status}`)
  return parseRawRows(json.values ?? [], brand.name)
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchBrandData(brand: Brand): Promise<Pick<BrandData, 'rows' | 'shopifyRows'>> {
  const cleanMetaId = brand.spreadsheetId.trim().replace(/\/+$/, '')
  const cleanShopifyId = (brand.shopifySpreadsheetId ?? '').trim().replace(/\/+$/, '')

  const [metaRows, shopifyRows] = await Promise.all([
    cleanMetaId
      ? fetchSheetRows(brand)
          .then((rawRows) => {
            const parsed =
              brand.vertical === 'ecommerce' ? rawRows.map(parseEcomRow)
              : brand.vertical === 'hospital' ? rawRows.map(parseHospitalRow)
              : rawRows.map(parseOtherRow)
            const withDate = parsed.filter((r) => r.date)
            return withDate.length > 0 ? withDate : generateMockData(brand)
          })
          .catch((err) => {
            console.error(`[${brand.name}] Meta fetch failed:`, err)
            return generateMockData(brand)
          })
      : Promise.resolve(generateMockData(brand)),

    cleanShopifyId
      ? fetchSheetRowsById(cleanShopifyId, brand.shopifySheetName, brand.name + ' (Shopify)')
          .then((rawRows) => {
            const parsed = rawRows.map(parseShopifyRow).filter((r) => r.date)
            return parsed
          })
          .catch((err) => {
            console.error(`[${brand.name}] Shopify fetch failed:`, err)
            return [] as ShopifyRow[]
          })
      : Promise.resolve([] as ShopifyRow[]),
  ])

  return { rows: metaRows, shopifyRows }
}

export interface ShopifyAnalyticsResult {
  data:      ShopifyAnalyticsData
  // Raw per-sheet data for multi-sheet brands; null for single-sheet/legacy brands.
  // Stored so ShopifyDashboard can re-assemble with a different dateRange client-side
  // without re-fetching.
  rawSheets: import('@/lib/shopify-multi-sheet-parser').RawSheets | null
  // Daily Shopify rows powering the KPI strip — sourced from the Overview sheet
  // for multi-sheet brands; empty for single-sheet/legacy brands (KPI strip then
  // falls back to the brand's separate "Shopify" time-series sheet, if any).
  dailyRows: ShopifyRow[]
  // true when a configured spreadsheet failed to load (permissions, network, etc.)
  // false when the brand simply has no spreadsheet configured (intentional demo data)
  error:     boolean
}

// ── Multi-sheet Shopify Analytics fetch ───────────────────────────────────────
async function fetchShopifyAnalyticsMultiSheet(brand: Brand): Promise<ShopifyAnalyticsResult> {
  const id = (brand.shopifyAnalyticsSpreadsheetId ?? brand.shopifySpreadsheetId ?? '').trim()
  if (!id) return { data: generateMockShopifyAnalytics(brand.name), rawSheets: null, dailyRows: [], error: false }

  try {
    const [overview, product, location, referrer, landingPage] = await Promise.all([
      fetchSheetRaw(id, brand.shopifyOverviewSheet    ?? 'Overview'),
      fetchSheetRaw(id, brand.shopifyProductSheet     ?? 'Product Performance'),
      fetchSheetRaw(id, brand.shopifyLocationSheet    ?? 'Sessions by Location'),
      fetchSheetRaw(id, brand.shopifyReferrerSheet    ?? 'Sessions by Referrer'),
      fetchSheetRaw(id, brand.shopifyLandingPageSheet ?? 'Sessions by Landing Page'),
    ])
    return {
      data:      assembleFromSheets(overview, product, location, referrer, landingPage),
      rawSheets: { overview, product, location, referrer, landingPage },
      dailyRows: parseOverviewSheetToRows(overview),
      error:     false,
    }
  } catch (err) {
    console.error(`[${brand.name}] Multi-sheet Shopify Analytics fetch failed:`, err)
    return { data: generateMockShopifyAnalytics(brand.name), rawSheets: null, dailyRows: [], error: true }
  }
}

// ── Shopify Analytics snapshot fetch ─────────────────────────────────────────
export async function fetchShopifyAnalytics(brand: Brand): Promise<ShopifyAnalyticsResult> {
  // Multi-sheet path (brands with per-section sheet tabs)
  if (brand.shopifyOverviewSheet) {
    return fetchShopifyAnalyticsMultiSheet(brand)
  }

  const id = (brand.shopifySpreadsheetId ?? '').trim()
  if (!id) return { data: generateMockShopifyAnalytics(brand.name), rawSheets: null, dailyRows: [], error: false }

  try {
    const sheetName = brand.shopifyAnalyticsSheetName ?? 'Shopify Analytics'
    const params = new URLSearchParams({ id, sheet: sheetName })
    const res = await fetch(`/api/sheets?${params}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? `Sheets error ${res.status}`)
    const raw: string[][] = json.values ?? []
    if (raw.length === 0) return { data: generateMockShopifyAnalytics(brand.name), rawSheets: null, dailyRows: [], error: false }
    return { data: parseShopifyAnalyticsSheet(raw), rawSheets: null, dailyRows: [], error: false }
  } catch (err) {
    console.error(`[${brand.name}] Shopify Analytics fetch failed:`, err)
    return { data: generateMockShopifyAnalytics(brand.name), rawSheets: null, dailyRows: [], error: true }
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
