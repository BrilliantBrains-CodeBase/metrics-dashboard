import { ShopifyAnalyticsData } from '@/types/shopify-analytics'
export type { ShopifyAnalyticsData }

export type Vertical = 'ecommerce' | 'hospital' | 'other'

export type DataSource = 'shopify' | 'meta' | 'google-ads' | 'meta-ads' | 'interakt'

export interface NavState {
  vertical:   Vertical
  brandId:    string
  dataSource: DataSource
}

export interface Brand {
  id: string
  name: string
  vertical: Vertical
  /** Meta Ads sheet — Google Sheets spreadsheet ID */
  spreadsheetId: string
  sheetName?: string
  /** Shopify sheet — ecommerce only, default data source */
  shopifySpreadsheetId?: string
  shopifySheetName?: string
  /** Shopify Analytics snapshot tab — defaults to "Shopify Analytics" */
  shopifyAnalyticsSheetName?: string
  /** Multi-sheet Shopify Analytics (separate spreadsheet with one sheet per section) */
  shopifyAnalyticsSpreadsheetId?: string
  shopifyOverviewSheet?:          string
  shopifyProductSheet?:           string
  shopifyLocationSheet?:          string
  shopifyReferrerSheet?:          string
  shopifyLandingPageSheet?:       string
}

export interface EcomRow {
  date: string
  adSpend: number
  revenue: number
  impressions: number
  clicks: number
  atc: number
  purchases: number
  roas: number
  cpa: number
  cr: number
  ctr: number
  aov: number
}

export interface ShopifyRow {
  date: string
  totalSales: number
  grossSales: number
  discounts: number
  returns: number
  netSales: number
  orders: number
  aov: number
}

export interface HospitalRow {
  date: string
  adSpend: number
  impressions: number
  clicks: number
  leads: number
  qualityLeads: number
  cpm: number
  cpc: number
  ctr: number
  cr: number
  cpl: number
  qualPercent: number
  cpql: number
}

export interface OtherRow {
  date: string
  adSpend: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
  cpa: number
  ctr: number
}

export type AnyRow = EcomRow | HospitalRow | OtherRow | ShopifyRow

export interface BrandData {
  brand: Brand
  rows: AnyRow[]
  shopifyRows: ShopifyRow[]
  shopifyAnalytics?: ShopifyAnalyticsData
  error?: string
}

export type DateRange = 'yesterday' | '7d' | '30d' | '90d' | 'all'

export type ViewMode = 'overview' | 'report'

export interface WeekSummary {
  label: string
  revenue: number
  adSpend: number
  roas: number
  cpa: number
  purchases: number
  leads: number
  cpl: number
  cpql: number
  qualPercent: number
}

export interface MetricDelta {
  label: string
  h1: number
  h2: number
  changePct: number
  format: 'currency' | 'ratio' | 'percent' | 'number'
  higherIsBetter: boolean
}

export interface DayPoint {
  label: string
  primary: number
  secondary: number
  adSpend: number
}

export interface ReportRec {
  title: string
  why: string
  impact: 'High' | 'Medium' | 'Low'
  effort: 'High' | 'Medium' | 'Low'
}

export interface PeriodTarget {
  metric: string
  current: number
  target: number
  format: 'currency' | 'ratio' | 'percent' | 'number'
  higherIsBetter: boolean
}
