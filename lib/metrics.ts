import { AnyRow, EcomRow, HospitalRow, OtherRow, ShopifyRow, DateRange, Vertical } from '@/types'

export function filterByDateRange(rows: AnyRow[], range: DateRange): AnyRow[] {
  if (range === 'all') return rows
  if (range === 'yesterday') {
    const y = new Date()
    y.setDate(y.getDate() - 1)
    const yStr = y.toISOString().slice(0, 10)
    return rows.filter((r) => r.date === yStr)
  }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return rows.filter((r) => new Date(r.date) >= cutoff)
}

export function sumEcom(rows: EcomRow[]) {
  const totAdSpend = rows.reduce((s, r) => s + r.adSpend, 0)
  const totRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totPurchases = rows.reduce((s, r) => s + r.purchases, 0)
  const totClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  const totAtc = rows.reduce((s, r) => s + r.atc, 0)
  return {
    adSpend: totAdSpend,
    revenue: totRevenue,
    roas: totAdSpend > 0 ? totRevenue / totAdSpend : 0,
    cpa: totPurchases > 0 ? totAdSpend / totPurchases : 0,
    cr: totClicks > 0 ? (totPurchases / totClicks) * 100 : 0,
    ctr: totImpressions > 0 ? (totClicks / totImpressions) * 100 : 0,
    aov: totPurchases > 0 ? totRevenue / totPurchases : 0,
    purchases: totPurchases,
    impressions: totImpressions,
    clicks: totClicks,
    atc: totAtc,
  }
}

export function sumHospital(rows: HospitalRow[]) {
  const totAdSpend = rows.reduce((s, r) => s + r.adSpend, 0)
  const totLeads = rows.reduce((s, r) => s + r.leads, 0)
  const totQualLeads = rows.reduce((s, r) => s + r.qualityLeads, 0)
  const totClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  return {
    adSpend: totAdSpend,
    leads: totLeads,
    qualityLeads: totQualLeads,
    cpl: totLeads > 0 ? totAdSpend / totLeads : 0,
    cpql: totQualLeads > 0 ? totAdSpend / totQualLeads : 0,
    qualPercent: totLeads > 0 ? (totQualLeads / totLeads) * 100 : 0,
    ctr: totImpressions > 0 ? (totClicks / totImpressions) * 100 : 0,
    cr: totClicks > 0 ? (totLeads / totClicks) * 100 : 0,
    cpm: totImpressions > 0 ? (totAdSpend / totImpressions) * 1000 : 0,
    cpc: totClicks > 0 ? totAdSpend / totClicks : 0,
    impressions: totImpressions,
    clicks: totClicks,
  }
}

export function sumOther(rows: OtherRow[]) {
  const totAdSpend = rows.reduce((s, r) => s + r.adSpend, 0)
  const totRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totConversions = rows.reduce((s, r) => s + r.conversions, 0)
  const totClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  return {
    adSpend: totAdSpend,
    revenue: totRevenue,
    roas: totAdSpend > 0 ? totRevenue / totAdSpend : 0,
    cpa: totConversions > 0 ? totAdSpend / totConversions : 0,
    ctr: totImpressions > 0 ? (totClicks / totImpressions) * 100 : 0,
    conversions: totConversions,
    impressions: totImpressions,
    clicks: totClicks,
  }
}

export function sumShopify(rows: ShopifyRow[]) {
  const totTotalSales  = rows.reduce((s, r) => s + r.totalSales, 0)
  const totGrossSales  = rows.reduce((s, r) => s + r.grossSales, 0)
  const totDiscounts   = rows.reduce((s, r) => s + r.discounts, 0)
  const totReturns     = rows.reduce((s, r) => s + r.returns, 0)
  const totNetSales    = rows.reduce((s, r) => s + r.netSales, 0)
  const totOrders      = rows.reduce((s, r) => s + r.orders, 0)
  return {
    totalSales:    totTotalSales,
    grossSales:    totGrossSales,
    discounts:     totDiscounts,
    returns:       totReturns,
    netSales:      totNetSales,
    orders:        totOrders,
    aov:           totOrders > 0 ? totTotalSales / totOrders : 0,
    discountRate:  totGrossSales > 0 ? (totDiscounts / totGrossSales) * 100 : 0,
    returnRate:    totGrossSales > 0 ? (totReturns  / totGrossSales) * 100 : 0,
  }
}

export function filterShopifyByDateRange(rows: ShopifyRow[], range: DateRange): ShopifyRow[] {
  if (range === 'all') return rows
  if (range === 'yesterday') {
    const y = new Date()
    y.setDate(y.getDate() - 1)
    const yStr = y.toISOString().slice(0, 10)
    return rows.filter((r) => r.date === yStr)
  }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return rows.filter((r) => new Date(r.date) >= cutoff)
}

export function growthPercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

export function fmt(n: number, type: 'currency' | 'percent' | 'ratio' | 'number' = 'number'): string {
  if (type === 'currency') {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toFixed(0)}`
  }
  if (type === 'percent') return `${n.toFixed(2)}%`
  if (type === 'ratio') return `${n.toFixed(2)}x`
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toFixed(0)
}

export function getVerticalTrendKey(vertical: Vertical): string {
  if (vertical === 'ecommerce') return 'revenue'
  if (vertical === 'hospital') return 'leads'
  return 'revenue'
}
