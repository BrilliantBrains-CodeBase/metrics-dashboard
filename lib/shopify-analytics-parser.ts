import {
  ShopifyAnalyticsData, SalesBreakdown, ProductSalesRow,
  ConversionFunnel, LocationRow, ReferrerRow, LandingPageRow, HourlyOrdersRow,
} from '@/types/shopify-analytics'

type RawSheet = string[][]

const SECTION = {
  SALES_BREAKDOWN:      '[SECTION] Sales Breakdown',
  SALES_BY_PRODUCT:     '[SECTION] Sales By Product',
  CONVERSION_FUNNEL:    '[SECTION] Conversion Funnel',
  SESSIONS_BY_LOCATION: '[SECTION] Sessions By Location',
  SESSIONS_BY_REFERRER: '[SECTION] Sessions By Referrer',
  SESSIONS_BY_LANDING:  '[SECTION] Sessions By Landing Page',
  ORDERS_BY_HOUR:       '[SECTION] Orders By Hour',
} as const

const META = {
  DATE_FROM: '[META] Date From',
  DATE_TO:   '[META] Date To',
} as const

function nVal(v: unknown): number {
  if (v === undefined || v === null || String(v).trim() === '') return 0
  const num = parseFloat(String(v).replace(/[₹$,% x]/g, '').trim())
  return isNaN(num) ? 0 : num
}

function parseRate(v: unknown): number {
  const s = String(v ?? '').trim()
  if (!s) return 0
  if (s.endsWith('%')) return parseFloat(s) / 100
  const f = parseFloat(s)
  if (isNaN(f)) return 0
  return f > 1 ? f / 100 : f
}

function normKey(k: string): string {
  return k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findSectionStart(raw: RawSheet, sentinel: string): number {
  for (let i = 0; i < raw.length; i++) {
    if ((raw[i][0] ?? '').trim() === sentinel) return i + 1
  }
  return -1
}

function extractSection(raw: RawSheet, startIdx: number): RawSheet {
  if (startIdx < 0 || startIdx >= raw.length) return []
  const result: RawSheet = [raw[startIdx]]
  for (let i = startIdx + 1; i < raw.length; i++) {
    const first = (raw[i][0] ?? '').trim()
    if (first.startsWith('[SECTION]') || first.startsWith('[META]')) break
    result.push(raw[i])
  }
  return result
}

function parseSalesBreakdown(section: RawSheet): SalesBreakdown {
  if (section.length < 2) return { grossSales: 0, discounts: 0, returns: 0, netSales: 0, shipping: 0, taxes: 0, totalSales: 0 }
  const headers = section[0].map(normKey)
  const data = section[1] ?? []
  const get = (key: string) => nVal(data[headers.indexOf(key)])
  return {
    grossSales: get('grosssales'),
    discounts:  Math.abs(get('discounts')),
    returns:    Math.abs(get('returns')),
    netSales:   get('netsales'),
    shipping:   get('shipping') || get('shippingcharges'),
    taxes:      get('taxes') || get('tax'),
    totalSales: get('totalsales'),
  }
}

function parseSalesByProduct(section: RawSheet): ProductSalesRow[] {
  if (section.length < 2) return []
  const headers = section[0].map(normKey)
  return section.slice(1)
    .filter(row => row.some(c => c.trim() !== ''))
    .map(row => {
      const get = (key: string) => (row[headers.indexOf(key)] ?? '').trim()
      return {
        productName: get('productname') || get('product'),
        variant:     get('variant') || '',
        collection:  get('collection') || '',
        revenue:     nVal(get('revenue') || get('sales')),
        units:       nVal(get('units') || get('qty') || get('quantity')),
      }
    })
    .filter(r => r.productName)
}

function parseConversionFunnel(section: RawSheet): ConversionFunnel {
  if (section.length < 2) return {
    sessions: { count: 0, rate: 1 },
    addedToCart: { count: 0, rate: 0 },
    reachedCheckout: { count: 0, rate: 0 },
    completedCheckout: { count: 0, rate: 0 },
  }
  const headers = section[0].map(normKey)
  const countIdx = headers.indexOf('count')
  const rateIdx  = headers.indexOf('rate')
  const stageIdx = headers.indexOf('stage')

  const rows = section.slice(1).filter(r => r.some(c => c.trim() !== ''))
  const get = (row: string[]) => ({
    count: nVal(row[countIdx]),
    rate:  parseRate(row[rateIdx]),
  })

  const find = (keyword: string) =>
    rows.find(r => normKey(r[stageIdx] ?? '').includes(keyword))

  const sessions = find('session') ?? rows[0]
  const atc      = find('addedtocart') ?? find('addto') ?? rows[1]
  const checkout = find('reachedcheck') ?? find('checkout') ?? rows[2]
  const complete = find('completedcheck') ?? find('complete') ?? rows[3]

  return {
    sessions:          sessions ? get(sessions) : { count: 0, rate: 1 },
    addedToCart:       atc      ? get(atc)      : { count: 0, rate: 0 },
    reachedCheckout:   checkout ? get(checkout) : { count: 0, rate: 0 },
    completedCheckout: complete ? get(complete) : { count: 0, rate: 0 },
  }
}

function parseSessionsByLocation(section: RawSheet): LocationRow[] {
  if (section.length < 2) return []
  const headers = section[0].map(normKey)
  return section.slice(1)
    .filter(row => row.some(c => c.trim() !== ''))
    .map(row => {
      const get = (key: string) => (row[headers.indexOf(key)] ?? '').trim()
      return {
        country:  get('country'),
        state:    get('state') || get('region') || '',
        city:     get('city') || '',
        sessions: nVal(get('sessions') || get('session')),
      }
    })
    .filter(r => r.country || r.sessions > 0)
}

function parseSessionsByReferrer(section: RawSheet): ReferrerRow[] {
  if (section.length < 2) return []
  const headers = section[0].map(normKey)
  return section.slice(1)
    .filter(row => row.some(c => c.trim() !== ''))
    .map(row => {
      const get = (key: string) => (row[headers.indexOf(key)] ?? '').trim()
      return {
        source:   get('source') || get('referrer') || get('socialreferrer'),
        sessions: nVal(get('sessions') || get('session')),
      }
    })
    .filter(r => r.source)
}

function parseSessionsByLandingPage(section: RawSheet): LandingPageRow[] {
  if (section.length < 2) return []
  const headers = section[0].map(normKey)
  return section.slice(1)
    .filter(row => row.some(c => c.trim() !== ''))
    .map(row => {
      const get = (key: string) => (row[headers.indexOf(key)] ?? '').trim()
      return {
        pageType: get('pagetype') || get('type') || '',
        url:      get('url') || get('path') || get('landingpage') || '',
        sessions: nVal(get('sessions') || get('session')),
      }
    })
    .filter(r => r.url || r.sessions > 0)
}

function parseOrdersByHour(section: RawSheet): HourlyOrdersRow[] {
  if (section.length < 2) return Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 }))
  const headers = section[0].map(normKey)
  const hourIdx   = headers.indexOf('hour')
  const ordersIdx = headers.indexOf('orders')

  const map = new Map<number, number>()
  section.slice(1)
    .filter(row => row.some(c => c.trim() !== ''))
    .forEach(row => {
      const h = nVal(row[hourIdx])
      const o = nVal(row[ordersIdx])
      if (h >= 0 && h <= 23) map.set(h, o)
    })

  return Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: map.get(i) ?? 0 }))
}

export function parseShopifyAnalyticsSheet(raw: RawSheet): ShopifyAnalyticsData {
  let dateFrom = ''
  let dateTo   = ''
  for (const row of raw) {
    if ((row[0] ?? '').trim() === META.DATE_FROM) dateFrom = (row[1] ?? '').trim()
    if ((row[0] ?? '').trim() === META.DATE_TO)   dateTo   = (row[1] ?? '').trim()
  }

  const breakdownStart = findSectionStart(raw, SECTION.SALES_BREAKDOWN)
  const productStart   = findSectionStart(raw, SECTION.SALES_BY_PRODUCT)
  const funnelStart    = findSectionStart(raw, SECTION.CONVERSION_FUNNEL)
  const locationStart  = findSectionStart(raw, SECTION.SESSIONS_BY_LOCATION)
  const referrerStart  = findSectionStart(raw, SECTION.SESSIONS_BY_REFERRER)
  const landingStart   = findSectionStart(raw, SECTION.SESSIONS_BY_LANDING)
  const hourStart      = findSectionStart(raw, SECTION.ORDERS_BY_HOUR)

  return {
    dateFrom,
    dateTo,
    salesBreakdown:        parseSalesBreakdown(extractSection(raw, breakdownStart)),
    salesByProduct:        parseSalesByProduct(extractSection(raw, productStart)),
    conversionFunnel:      parseConversionFunnel(extractSection(raw, funnelStart)),
    sessionsByLocation:    parseSessionsByLocation(extractSection(raw, locationStart)),
    sessionsByReferrer:    parseSessionsByReferrer(extractSection(raw, referrerStart)),
    sessionsByLandingPage: parseSessionsByLandingPage(extractSection(raw, landingStart)),
    ordersByHour:          parseOrdersByHour(extractSection(raw, hourStart)),
  }
}

// ── Mock analytics data (shown when the Shopify Analytics tab is missing) ────
export function generateMockShopifyAnalytics(brandName: string): ShopifyAnalyticsData {
  const seed = brandName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  let s = seed
  function rand(base: number, variance: number): number {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return base + ((s >>> 0) / 0xffffffff) * variance * 2 - variance
  }

  const grossSales = Math.round(rand(48000, 12000))
  const discounts  = Math.round(rand(3000, 800))
  const returns    = Math.round(rand(500, 200))
  const netSales   = grossSales - discounts - returns
  const shipping   = 0
  const taxes      = Math.round(netSales * 0.03)
  const totalSales = netSales + shipping + taxes

  const sessions      = Math.round(rand(1100, 200))
  const atcCount      = Math.round(sessions * Math.max(0.03, rand(0.05, 0.02)))
  const checkCount    = Math.round(atcCount * Math.max(0.2, rand(0.37, 0.1)))
  const completeCount = Math.round(checkCount * Math.max(0, rand(0.15, 0.08)))

  const products = [
    'Jade Toe Strap', 'Olivia Toe Strap', 'Chloe Tan', 'Chloe Black',
    'Stylus Toe Strap', 'Emma White', 'Sofia Block', 'Maya Slip',
  ]

  const collections = ['All Day Comfort', 'Best Sellers', 'New Arrivals']

  return {
    dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    dateTo:   new Date().toISOString().slice(0, 10),
    salesBreakdown: { grossSales, discounts, returns, netSales, shipping, taxes, totalSales },
    salesByProduct: products.map((p, i) => ({
      productName: p,
      variant:     '',
      collection:  collections[i % collections.length],
      revenue:     Math.round(rand(11000, 4000) * (1 - i * 0.08)),
      units:       Math.round(rand(40, 15) * (1 - i * 0.08)),
    })),
    conversionFunnel: {
      sessions:          { count: sessions,      rate: 1 },
      addedToCart:       { count: atcCount,       rate: sessions > 0 ? atcCount / sessions : 0 },
      reachedCheckout:   { count: checkCount,     rate: sessions > 0 ? checkCount / sessions : 0 },
      completedCheckout: { count: completeCount,  rate: sessions > 0 ? completeCount / sessions : 0 },
    },
    sessionsByLocation: [
      { country: 'India', state: 'Karnataka',  city: 'Bengaluru', sessions: Math.round(rand(140, 30)) },
      { country: 'India', state: 'Telangana',  city: 'Hyderabad', sessions: Math.round(rand(110, 25)) },
      { country: 'India', state: 'Maharashtra',city: 'Mumbai',    sessions: Math.round(rand(105, 20)) },
      { country: 'India', state: 'Tamil Nadu', city: 'Chennai',   sessions: Math.round(rand(85, 15)) },
      { country: 'India', state: '',           city: '',          sessions: Math.round(rand(55, 10)) },
    ],
    sessionsByReferrer: [
      { source: 'Instagram',  sessions: Math.round(rand(280, 60)) },
      { source: 'Facebook',   sessions: Math.round(rand(150, 40)) },
      { source: 'Pinterest',  sessions: Math.round(rand(60, 20)) },
      { source: 'YouTube',    sessions: Math.round(rand(30, 15)) },
    ],
    sessionsByLandingPage: [
      { pageType: 'Collection', url: '/collections/all-day-comfort', sessions: Math.round(rand(370, 80)) },
      { pageType: 'Collection', url: '/collections/best-sellers',    sessions: Math.round(rand(280, 60)) },
      { pageType: 'Collection', url: '/collections/new-arrivals',    sessions: Math.round(rand(85, 20)) },
      { pageType: 'Homepage',   url: '/',                            sessions: Math.round(rand(80, 20)) },
      { pageType: 'Product',    url: '/products/jade-toe-strap',     sessions: Math.round(rand(48, 15)) },
      { pageType: 'Product',    url: '/products/olivia-toe-strap',   sessions: Math.round(rand(35, 12)) },
      { pageType: 'Product',    url: '/products/chloe-tan',          sessions: Math.round(rand(30, 10)) },
    ],
    ordersByHour: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: h < 6 ? Math.round(rand(1, 1))
            : h < 10 ? Math.round(rand(3, 2))
            : h < 14 ? Math.round(rand(6, 2))
            : h < 18 ? Math.round(rand(8, 3))
            : h < 22 ? Math.round(rand(5, 2))
            : Math.round(rand(2, 1)),
    })),
  }
}
