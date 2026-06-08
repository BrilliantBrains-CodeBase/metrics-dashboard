import {
  ShopifyAnalyticsData, SalesBreakdown, ProductSalesRow,
  ConversionFunnel, LocationRow, ReferrerRow, LandingPageRow,
} from '@/types/shopify-analytics'
import { ShopifyRow, DateRange } from '@/types'

type Raw = string[][]

export type RawSheets = {
  overview:    Raw
  product:     Raw
  location:    Raw
  referrer:    Raw
  landingPage: Raw
}

// Build a YYYY-MM-DD string from local calendar date, avoiding UTC conversion
// artefacts that arise when using toISOString() after setHours(0,0,0,0).
function localDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function filterRawByDate(raw: Raw, range: DateRange): Raw {
  if (range === 'all' || raw.length <= 1) return raw

  const hdrs    = (raw[0] ?? []).map(normKey)
  const dateIdx = hdrs.indexOf('date')
  if (dateIdx < 0) return raw

  let keep: (row: string[]) => boolean

  if (range === 'yesterday') {
    const y = new Date()
    y.setDate(y.getDate() - 1)
    const yStr = localDateStr(y)
    keep = (row) => normalizeDate(row[dateIdx] ?? '') === yStr
  } else {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = localDateStr(cutoff)
    keep = (row) => {
      const d = normalizeDate(row[dateIdx] ?? '')
      return d !== '' && d >= cutoffStr   // YYYY-MM-DD strings sort lexicographically
    }
  }

  return [raw[0], ...raw.slice(1).filter(keep)]
}

function n(v: unknown): number {
  if (!v && v !== 0) return 0
  const num = parseFloat(String(v).replace(/[₹$, ]/g, '').trim())
  return isNaN(num) ? 0 : num
}

function normalizeDate(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const parsed = new Date(s)
  return isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

function normKey(k: string): string {
  return k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function headers(raw: Raw): string[] {
  return (raw[0] ?? []).map(normKey)
}

function dataRows(raw: Raw): string[][] {
  return raw.slice(1).filter(r => r.some(c => c.trim() !== ''))
}

function get(row: string[], hdrs: string[], key: string): string {
  const idx = hdrs.indexOf(key)
  return idx >= 0 ? (row[idx] ?? '').trim() : ''
}

// ── Overview sheet → salesBreakdown + conversionFunnel ────────────────────────

export function parseOverviewSheet(raw: Raw): {
  salesBreakdown: SalesBreakdown
  conversionFunnel: ConversionFunnel
} {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  let grossSales = 0, discounts = 0, returns = 0, netSales = 0, totalSales = 0
  let sessions = 0, orders = 0

  for (const row of rows) {
    grossSales += n(get(row, hdrs, 'grosssales'))
    discounts  += Math.abs(n(get(row, hdrs, 'discounts')))
    returns    += Math.abs(n(get(row, hdrs, 'returns')))
    netSales   += n(get(row, hdrs, 'netsales'))
    totalSales += n(get(row, hdrs, 'totalsales'))
    sessions   += n(get(row, hdrs, 'totalsessions') || get(row, hdrs, 'sessions'))
    orders     += n(get(row, hdrs, 'orders'))
  }

  const cr = sessions > 0 ? orders / sessions : 0

  return {
    salesBreakdown: {
      grossSales,
      discounts,
      returns,
      netSales,
      shipping: 0,
      taxes: 0,
      totalSales,
    },
    conversionFunnel: {
      sessions:          { count: sessions, rate: 1 },
      addedToCart:       { count: 0,        rate: 0 },
      reachedCheckout:   { count: 0,        rate: 0 },
      completedCheckout: { count: orders,   rate: cr },
    },
  }
}

// ── Overview sheet → daily ShopifyRow[] (powers the KPI strip) ────────────────

export function parseOverviewSheetToRows(raw: Raw): ShopifyRow[] {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  return rows
    .map((row): ShopifyRow => {
      const orders     = n(get(row, hdrs, 'orders'))
      const grossSales = n(get(row, hdrs, 'grosssales'))
      const netSales   = n(get(row, hdrs, 'netsales'))
      const totalSales = n(get(row, hdrs, 'totalsales')) || netSales || grossSales
      return {
        date:       normalizeDate(get(row, hdrs, 'date')),
        totalSales,
        grossSales,
        discounts:  Math.abs(n(get(row, hdrs, 'discounts'))),
        returns:    Math.abs(n(get(row, hdrs, 'returns'))),
        netSales,
        orders,
        aov:        n(get(row, hdrs, 'aov')) || (orders > 0 ? totalSales / orders : 0),
      }
    })
    .filter((r) => r.date)
}

// ── Product Performance sheet → salesByProduct ────────────────────────────────

export function parseProductSheet(raw: Raw): ProductSalesRow[] {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  const map = new Map<string, { revenue: number; units: number }>()

  for (const row of rows) {
    const product = get(row, hdrs, 'product').trim()
    if (!product || product.toLowerCase() === 'unknown') continue

    const revenue = n(get(row, hdrs, 'netsales') || get(row, hdrs, 'totalsales'))
    const units   = n(get(row, hdrs, 'orders'))

    const existing = map.get(product) ?? { revenue: 0, units: 0 }
    map.set(product, { revenue: existing.revenue + revenue, units: existing.units + units })
  }

  return Array.from(map.entries())
    .map(([productName, { revenue, units }]) => ({
      productName,
      variant:    '',
      collection: '',
      revenue,
      units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ── Sessions by Location sheet → sessionsByLocation ───────────────────────────

export function parseLocationSheet(raw: Raw): LocationRow[] {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  const map = new Map<string, number>()
  const meta = new Map<string, { country: string; state: string; city: string }>()

  for (const row of rows) {
    const country = get(row, hdrs, 'country')
    const state   = get(row, hdrs, 'sessionregion') || get(row, hdrs, 'region') || get(row, hdrs, 'state') || ''
    const city    = get(row, hdrs, 'sessioncity')   || get(row, hdrs, 'city')   || ''
    const sess    = n(get(row, hdrs, 'sessions'))

    const key = `${country}|${state}|${city}`
    map.set(key, (map.get(key) ?? 0) + sess)
    if (!meta.has(key)) meta.set(key, { country, state, city })
  }

  return Array.from(map.entries())
    .map(([key, sessions]) => ({ ...meta.get(key)!, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
}

// ── Sessions by Referrer sheet → sessionsByReferrer ───────────────────────────

export function parseReferrerSheet(raw: Raw): ReferrerRow[] {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  const map = new Map<string, number>()

  for (const row of rows) {
    const source = get(row, hdrs, 'referrersource') || get(row, hdrs, 'source') || get(row, hdrs, 'referrer') || 'direct'
    const sess   = n(get(row, hdrs, 'sessions'))
    map.set(source, (map.get(source) ?? 0) + sess)
  }

  return Array.from(map.entries())
    .map(([source, sessions]) => ({ source, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
}

// ── Sessions by Landing Page sheet → sessionsByLandingPage ───────────────────

export function parseLandingPageSheet(raw: Raw): LandingPageRow[] {
  const hdrs = headers(raw)
  const rows = dataRows(raw)

  const map   = new Map<string, number>()
  const ptype = new Map<string, string>()

  for (const row of rows) {
    const pageType = get(row, hdrs, 'landingpagetype') || get(row, hdrs, 'pagetype') || ''
    const url      = get(row, hdrs, 'landingpagepath') || get(row, hdrs, 'landingpage') || get(row, hdrs, 'url') || get(row, hdrs, 'path') || ''
    const sess     = n(get(row, hdrs, 'session') || get(row, hdrs, 'sessions'))

    if (!url) continue
    map.set(url, (map.get(url) ?? 0) + sess)
    if (!ptype.has(url)) ptype.set(url, pageType)
  }

  return Array.from(map.entries())
    .map(([url, sessions]) => ({ pageType: ptype.get(url) ?? '', url, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
}

// ── Top-level assembler ───────────────────────────────────────────────────────

export function assembleFromSheets(
  overviewRaw:     Raw,
  productRaw:      Raw,
  locationRaw:     Raw,
  referrerRaw:     Raw,
  landingPageRaw:  Raw,
  dateRange:       DateRange = 'all',
): ShopifyAnalyticsData {
  const fov = filterRawByDate(overviewRaw,    dateRange)
  const fpd = filterRawByDate(productRaw,     dateRange)
  const flc = filterRawByDate(locationRaw,    dateRange)
  const frf = filterRawByDate(referrerRaw,    dateRange)
  const flp = filterRawByDate(landingPageRaw, dateRange)

  const { salesBreakdown, conversionFunnel } = parseOverviewSheet(fov)

  return {
    dateFrom: '',
    dateTo:   '',
    salesBreakdown,
    salesByProduct:        parseProductSheet(fpd),
    conversionFunnel,
    sessionsByLocation:    parseLocationSheet(flc),
    sessionsByReferrer:    parseReferrerSheet(frf),
    sessionsByLandingPage: parseLandingPageSheet(flp),
    ordersByHour:          Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 })),
  }
}
