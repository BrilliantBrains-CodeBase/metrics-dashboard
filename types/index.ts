export type Vertical = 'ecommerce' | 'hospital' | 'other'

export interface Brand {
  id: string
  name: string
  vertical: Vertical
  /** Google Sheets spreadsheet ID (from the URL: /spreadsheets/d/{ID}/edit) */
  spreadsheetId: string
  /** Sheet/tab name — defaults to the first visible sheet */
  sheetName?: string
  /** 1-based row number where column headers live — defaults to auto-detect */
  headerRow?: number
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

export type AnyRow = EcomRow | HospitalRow | OtherRow

export interface BrandData {
  brand: Brand
  rows: AnyRow[]
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
