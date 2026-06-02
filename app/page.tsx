'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Brand, BrandData, DataSource, DateRange, EcomRow, HospitalRow, OtherRow, ShopifyRow, Vertical, ViewMode } from '@/types'
import { BRANDS } from '@/config/brands'
import { fetchBrandData } from '@/lib/sheets'
import {
  filterByDateRange,
  filterShopifyByDateRange,
  sumEcom,
  sumHospital,
  sumOther,
  sumShopify,
  fmt,
  growthPercent,
} from '@/lib/metrics'
import { generateInsights } from '@/lib/insights'
import VerticalTabs from '@/components/VerticalTabs'
import BrandSelector from '@/components/BrandSelector'
import DateRangeFilter from '@/components/DateRangeFilter'
import KpiCard from '@/components/KpiCard'
import InsightsPanel from '@/components/InsightsPanel'
import TrendLine from '@/components/charts/TrendLine'
import VerticalCompBar from '@/components/charts/VerticalCompBar'
import ReportView from '@/components/ReportView'

export default function Dashboard() {
  const [vertical, setVertical] = useState<Vertical>('ecommerce')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [dataSource, setDataSource] = useState<DataSource>('shopify')
  const [allBrandData, setAllBrandData] = useState<Record<string, BrandData>>({})
  const [loading, setLoading] = useState(false)
  const [missingApiKey, setMissingApiKey] = useState(false)

  useEffect(() => {
    fetch('/api/config-check')
      .then((r) => r.json())
      .then(({ hasApiKey }: { hasApiKey: boolean }) => {
        if (!hasApiKey) setMissingApiKey(true)
      })
      .catch(() => {})
  }, [])

  const verticalBrands = useMemo(
    () => BRANDS.filter((b) => b.vertical === vertical),
    [vertical]
  )

  const [selectedBrand, setSelectedBrand] = useState<Brand>(verticalBrands[0])
  // Track which brand IDs have been fetched (or are in-flight) to avoid duplicate requests
  const fetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setSelectedBrand(verticalBrands[0])
  }, [vertical, verticalBrands])

  useEffect(() => {
    const uncached = verticalBrands.filter((b) => !fetchedRef.current.has(b.id))
    if (uncached.length === 0) return

    uncached.forEach((b) => fetchedRef.current.add(b.id))
    setLoading(true)

    Promise.all(
      uncached.map(async (brand) => {
        const { rows, shopifyRows } = await fetchBrandData(brand)
        return { brand, rows, shopifyRows }
      })
    ).then((results) => {
      setAllBrandData((prev) => {
        const next = { ...prev }
        results.forEach(({ brand, rows, shopifyRows }) => {
          next[brand.id] = { brand, rows, shopifyRows }
        })
        return next
      })
      setLoading(false)
    })
  }, [vertical, verticalBrands])

  const verticalData = useMemo(
    () => verticalBrands.map((b) => allBrandData[b.id]).filter(Boolean) as BrandData[],
    [verticalBrands, allBrandData]
  )

  const selectedData = selectedBrand ? allBrandData[selectedBrand.id] : undefined

  const kpis = useMemo(() => {
    if (!selectedData) return []

    // Shopify source (ecommerce only)
    if (vertical === 'ecommerce' && dataSource === 'shopify') {
      const shopifyRows = filterShopifyByDateRange(selectedData.shopifyRows ?? [], dateRange)
      if (shopifyRows.length === 0) {
        return [{ label: 'Shopify', value: 'No data', highlight: false }]
      }
      const mid = Math.floor(shopifyRows.length / 2)
      const s = sumShopify(shopifyRows)
      const c = sumShopify(shopifyRows.slice(mid))
      const p = sumShopify(shopifyRows.slice(0, mid))
      return [
        { label: 'Revenue', value: fmt(s.revenue, 'currency'), trend: growthPercent(c.revenue, p.revenue), highlight: true },
        { label: 'Orders', value: fmt(s.orders, 'number'), trend: growthPercent(c.orders, p.orders) },
        { label: 'AOV', value: fmt(s.aov, 'currency'), trend: growthPercent(c.aov, p.aov) },
        { label: 'Cancellations', value: fmt(s.cancellations, 'number'), trend: -growthPercent(c.cancellations, p.cancellations) },
        { label: 'Cancel Rate', value: fmt(s.cancellationRate, 'percent'), trend: -growthPercent(c.cancellationRate, p.cancellationRate) },
        { label: 'Total Customers', value: fmt(s.totalCustomers, 'number'), trend: growthPercent(c.totalCustomers, p.totalCustomers) },
      ]
    }

    const rows = filterByDateRange(selectedData.rows, dateRange)
    const mid = Math.floor(rows.length / 2)
    const curr = rows.slice(mid)
    const prev = rows.slice(0, mid)

    if (vertical === 'ecommerce') {
      const s = sumEcom(rows as EcomRow[])
      const c = sumEcom(curr as EcomRow[])
      const p = sumEcom(prev as EcomRow[])
      return [
        { label: 'Revenue', value: fmt(s.revenue, 'currency'), trend: growthPercent(c.revenue, p.revenue), highlight: true },
        { label: 'Ad Spend', value: fmt(s.adSpend, 'currency') },
        { label: 'ROAS', value: fmt(s.roas, 'ratio'), trend: growthPercent(c.roas, p.roas) },
        { label: 'CPA', value: fmt(s.cpa, 'currency'), trend: -growthPercent(c.cpa, p.cpa) },
        { label: 'Purchases', value: fmt(s.purchases, 'number'), trend: growthPercent(c.purchases, p.purchases) },
        { label: 'Conv. Rate', value: fmt(s.cr, 'percent'), trend: growthPercent(c.cr, p.cr) },
        { label: 'CTR', value: fmt(s.ctr, 'percent'), trend: growthPercent(c.ctr, p.ctr) },
        { label: 'AOV', value: fmt(s.aov, 'currency'), trend: growthPercent(c.aov, p.aov) },
      ]
    }

    if (vertical === 'hospital') {
      const s = sumHospital(rows as HospitalRow[])
      const c = sumHospital(curr as HospitalRow[])
      const p = sumHospital(prev as HospitalRow[])
      return [
        { label: 'Total Leads', value: fmt(s.leads, 'number'), trend: growthPercent(c.leads, p.leads), highlight: true },
        { label: 'Quality Leads', value: fmt(s.qualityLeads, 'number'), trend: growthPercent(c.qualityLeads, p.qualityLeads) },
        { label: 'CPL', value: fmt(s.cpl, 'currency'), trend: -growthPercent(c.cpl, p.cpl) },
        { label: 'CPQL', value: fmt(s.cpql, 'currency'), trend: -growthPercent(c.cpql, p.cpql) },
        { label: 'Qual %', value: fmt(s.qualPercent, 'percent'), trend: growthPercent(c.qualPercent, p.qualPercent) },
        { label: 'Ad Spend', value: fmt(s.adSpend, 'currency') },
        { label: 'CTR', value: fmt(s.ctr, 'percent'), trend: growthPercent(c.ctr, p.ctr) },
        { label: 'CR (Click to Lead)', value: fmt(s.cr, 'percent'), trend: growthPercent(c.cr, p.cr) },
      ]
    }

    const s = sumOther(rows as OtherRow[])
    const c = sumOther(curr as OtherRow[])
    const p = sumOther(prev as OtherRow[])
    return [
      { label: 'Revenue', value: fmt(s.revenue, 'currency'), trend: growthPercent(c.revenue, p.revenue), highlight: true },
      { label: 'Ad Spend', value: fmt(s.adSpend, 'currency') },
      { label: 'ROAS', value: fmt(s.roas, 'ratio'), trend: growthPercent(c.roas, p.roas) },
      { label: 'CPA', value: fmt(s.cpa, 'currency'), trend: -growthPercent(c.cpa, p.cpa) },
      { label: 'Conversions', value: fmt(s.conversions, 'number'), trend: growthPercent(c.conversions, p.conversions) },
      { label: 'CTR', value: fmt(s.ctr, 'percent'), trend: growthPercent(c.ctr, p.ctr) },
    ]
  }, [selectedData, dateRange, vertical, dataSource])

  const compCharts = useMemo(() => {
    if (verticalData.length === 0) return []

    const summarize = (bd: BrandData) => {
      const rows = filterByDateRange(bd.rows, dateRange)
      if (vertical === 'ecommerce') return sumEcom(rows as EcomRow[]) as Record<string, number>
      if (vertical === 'hospital') return sumHospital(rows as HospitalRow[]) as Record<string, number>
      return sumOther(rows as OtherRow[]) as Record<string, number>
    }

    const summaries = verticalData.map((bd) => ({ brand: bd.brand, s: summarize(bd) }))

    const makeData = (key: string) =>
      summaries.map(({ brand, s }) => ({
        name: brand.name,
        value: s[key] ?? 0,
        isSelected: brand.id === selectedBrand?.id,
      }))

    if (vertical === 'ecommerce') {
      return [
        { title: 'ROAS by Brand', data: makeData('roas'), unit: 'ratio' as const },
        { title: 'Revenue by Brand', data: makeData('revenue'), unit: 'currency' as const },
        { title: 'CPA by Brand', data: makeData('cpa'), unit: 'currency' as const, lowerIsBetter: true },
        { title: 'Conv. Rate by Brand', data: makeData('cr'), unit: 'percent' as const },
      ]
    }
    if (vertical === 'hospital') {
      return [
        { title: 'CPL by Brand', data: makeData('cpl'), unit: 'currency' as const, lowerIsBetter: true },
        { title: 'Total Leads by Brand', data: makeData('leads'), unit: 'number' as const },
        { title: 'CPQL by Brand', data: makeData('cpql'), unit: 'currency' as const, lowerIsBetter: true },
        { title: 'Qual % by Brand', data: makeData('qualPercent'), unit: 'percent' as const },
      ]
    }
    return [
      { title: 'ROAS by Brand', data: makeData('roas'), unit: 'ratio' as const },
      { title: 'Revenue by Brand', data: makeData('revenue'), unit: 'currency' as const },
      { title: 'CPA by Brand', data: makeData('cpa'), unit: 'currency' as const, lowerIsBetter: true },
    ]
  }, [verticalData, vertical, dateRange, selectedBrand])

  const insights = useMemo(() => {
    if (!selectedData || verticalData.length === 0) return []
    return generateInsights(selectedData, verticalData, vertical, dateRange)
  }, [selectedData, verticalData, vertical, dateRange])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ad performance across verticals</p>
        </div>
        {loading && (
          <span className="text-xs text-indigo-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Loading data…
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* API key warning */}
        {missingApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-500 font-bold text-sm mt-0.5 shrink-0">!</span>
            <div className="text-sm text-amber-800">
              <strong>GOOGLE_SHEETS_API_KEY is not set</strong> — all brands are showing demo data.
              Add this environment variable in your deployment settings, then redeploy.
              <span className="block text-xs text-amber-600 mt-0.5">
                Vercel: Project Settings &gt; Environment Variables &gt; Add GOOGLE_SHEETS_API_KEY
              </span>
            </div>
            <button
              onClick={() => setMissingApiKey(false)}
              className="ml-auto text-amber-400 hover:text-amber-600 text-sm font-bold shrink-0"
            >
              x
            </button>
          </div>
        )}

        {/* Row 1: Brand selector + data source toggle (ecommerce only) */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <BrandSelector
            brands={verticalBrands}
            selected={selectedBrand}
            onChange={setSelectedBrand}
          />
          {vertical === 'ecommerce' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Source</span>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {(['shopify', 'meta'] as DataSource[]).map((src) => (
                  <button
                    key={src}
                    onClick={() => setDataSource(src)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 capitalize ${
                      dataSource === src
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {src === 'shopify' ? 'Shopify' : 'Meta Ads'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Vertical tabs + view toggle */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <VerticalTabs selected={vertical} onChange={setVertical} />
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['overview', 'report'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                {mode === 'overview' ? 'Overview' : 'Report'}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Period filter */}
        <DateRangeFilter selected={dateRange} onChange={setDateRange} />

        {/* Overview view */}
        {viewMode === 'overview' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <KpiCard
                    key={kpi.label}
                    label={kpi.label}
                    value={kpi.value}
                    trend={'trend' in kpi ? kpi.trend : undefined}
                    highlight={kpi.highlight}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedData && (
                <TrendLine
                  rows={selectedData.rows}
                  vertical={vertical}
                  brandName={selectedBrand?.name ?? ''}
                  dateRange={dateRange}
                />
              )}
              {compCharts[0] && (
                <VerticalCompBar
                  title={compCharts[0].title}
                  data={compCharts[0].data}
                  unit={compCharts[0].unit}
                  lowerIsBetter={compCharts[0].lowerIsBetter}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compCharts.slice(1).map((chart) => (
                <VerticalCompBar
                  key={chart.title}
                  title={chart.title}
                  data={chart.data}
                  unit={chart.unit}
                  lowerIsBetter={chart.lowerIsBetter}
                />
              ))}
            </div>

            <InsightsPanel insights={insights} loading={loading} />
          </>
        )}

        {/* Report view */}
        {viewMode === 'report' && selectedData && !loading && (
          <ReportView
            selectedData={selectedData}
            vertical={vertical}
            dateRange={dateRange}
          />
        )}
        {viewMode === 'report' && loading && (
          <div className="space-y-4">
            {[200, 280, 200].map((h, i) => (
              <div key={i} className={`h-${h === 200 ? '48' : '64'} rounded-2xl bg-gray-100 animate-pulse`} />
            ))}
          </div>
        )}

        {missingApiKey && (
          <div className="text-center text-xs text-gray-300 pb-4">
            Brands without a spreadsheet ID show demo data. Set{' '}
            <code className="font-mono">GOOGLE_SHEETS_API_KEY</code> and add spreadsheet IDs in{' '}
            <code className="font-mono">config/brands.ts</code> to load real data.
          </div>
        )}
      </div>
    </main>
  )
}
