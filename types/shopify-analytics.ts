export interface SalesBreakdown {
  grossSales: number
  discounts:  number
  returns:    number
  netSales:   number
  shipping:   number
  taxes:      number
  totalSales: number
}

export interface ProductSalesRow {
  productName: string
  variant:     string
  collection:  string
  revenue:     number
  units:       number
}

export interface FunnelStep {
  count: number
  rate:  number   // 0–1 decimal (fraction of sessions)
}

export interface ConversionFunnel {
  sessions:          FunnelStep
  addedToCart:       FunnelStep
  reachedCheckout:   FunnelStep
  completedCheckout: FunnelStep
}

export interface LocationRow {
  country:  string
  state:    string
  city:     string
  sessions: number
}

export interface ReferrerRow {
  source:   string
  sessions: number
}

export interface LandingPageRow {
  pageType: string
  url:      string
  sessions: number
}

export interface HourlyOrdersRow {
  hour:   number   // 0–23
  orders: number
}

export interface ShopifyAnalyticsData {
  dateFrom:              string
  dateTo:                string
  salesBreakdown:        SalesBreakdown
  salesByProduct:        ProductSalesRow[]
  conversionFunnel:      ConversionFunnel
  sessionsByLocation:    LocationRow[]
  sessionsByReferrer:    ReferrerRow[]
  sessionsByLandingPage: LandingPageRow[]
  ordersByHour:          HourlyOrdersRow[]
}
