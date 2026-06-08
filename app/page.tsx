'use client'
import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Brand, BrandData, DataSource, DateRange, EcomRow, HospitalRow, NavState, OtherRow, ShopifyRow, Vertical } from '@/types'
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
import AppSidebar from '@/components/shell/AppSidebar'
import TopBar from '@/components/shell/TopBar'
import ShopifyDashboard from '@/components/ecom/ShopifyDashboard'
import GoogleAdsPanel from '@/components/placeholders/GoogleAdsPanel'
import MetaAdsPanel from '@/components/placeholders/MetaAdsPanel'
import InteraktPanel from '@/components/placeholders/InteraktPanel'
import KpiCard from '@/components/KpiCard'

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultDataSourceFor(v: Vertical): NavState['dataSource'] {
  return v === 'ecommerce' ? 'shopify' : 'meta-ads'
}

function firstBrandInVertical(v: Vertical): Brand {
  return BRANDS.find((b) => b.vertical === v) ?? BRANDS[0]
}

// ── URL <-> state validators ──────────────────────────────────────────────────

function isVertical(v: string | null): v is Vertical {
  return v === 'ecommerce' || v === 'hospital' || v === 'other'
}

function isDataSource(s: string | null): s is DataSource {
  return s === 'shopify' || s === 'meta' || s === 'google-ads' || s === 'meta-ads' || s === 'interakt'
}

function isDateRange(r: string | null): r is DateRange {
  return r === 'yesterday' || r === '7d' || r === '30d' || r === '90d' || r === 'all'
}

// ── Fallback KPI view for hospital / other verticals ─────────────────────────

function LegacyKpiView({ allBrandData, navState, loading }: {
  allBrandData: Record<string, BrandData>
  navState:     NavState
  loading:      boolean
}) {
  const brand = BRANDS.find((b) => b.id === navState.brandId)
  const data  = brand ? allBrandData[brand.id] : undefined

  const kpis = useMemo(() => {
    if (!data || !brand) return []
    const rows  = filterByDateRange(data.rows, '30d')
    const mid   = Math.floor(rows.length / 2)
    const curr  = rows.slice(mid)
    const prev  = rows.slice(0, mid)

    if (brand.vertical === 'hospital') {
      const s = sumHospital(rows as HospitalRow[])
      const c = sumHospital(curr as HospitalRow[])
      const p = sumHospital(prev as HospitalRow[])
      return [
        { label: 'Total Leads',    value: fmt(s.leads,        'number'),   trend: growthPercent(c.leads,        p.leads),        highlight: true },
        { label: 'Quality Leads',  value: fmt(s.qualityLeads, 'number'),   trend: growthPercent(c.qualityLeads, p.qualityLeads) },
        { label: 'CPL',            value: fmt(s.cpl,          'currency'), trend: -growthPercent(c.cpl,         p.cpl) },
        { label: 'CPQL',           value: fmt(s.cpql,         'currency'), trend: -growthPercent(c.cpql,        p.cpql) },
        { label: 'Qual %',         value: fmt(s.qualPercent,  'percent'),  trend: growthPercent(c.qualPercent,  p.qualPercent) },
        { label: 'Ad Spend',       value: fmt(s.adSpend,      'currency') },
      ]
    }
    const s = sumOther(rows as OtherRow[])
    const c = sumOther(curr as OtherRow[])
    const p = sumOther(prev as OtherRow[])
    return [
      { label: 'Revenue',  value: fmt(s.revenue,     'currency'), trend: growthPercent(c.revenue,     p.revenue),     highlight: true },
      { label: 'Ad Spend', value: fmt(s.adSpend,     'currency') },
      { label: 'ROAS',     value: fmt(s.roas,        'ratio'),    trend: growthPercent(c.roas,        p.roas) },
      { label: 'CPA',      value: fmt(s.cpa,         'currency'), trend: -growthPercent(c.cpa,        p.cpa) },
    ]
  }, [data, brand])

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((k) => (
        <KpiCard key={k.label} label={k.label} value={k.value} trend={'trend' in k ? k.trend : undefined} highlight={k.highlight} />
      ))}
    </div>
  )
}

// ── Main dashboard shell ──────────────────────────────────────────────────────

function DashboardInner() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [navState, setNavState] = useState<NavState>(() => {
    const vertical   = isVertical(searchParams.get('vertical')) ? (searchParams.get('vertical') as Vertical) : 'ecommerce'
    const brandParam = searchParams.get('brand')
    const brand      = (brandParam && BRANDS.find((b) => b.id === brandParam && b.vertical === vertical))
      || firstBrandInVertical(vertical)
    const dataSource = isDataSource(searchParams.get('source')) ? (searchParams.get('source') as DataSource) : defaultDataSourceFor(vertical)
    return { vertical, brandId: brand.id, dataSource }
  })
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [dateRange,   setDateRange]     = useState<DateRange>(() => {
    const range = searchParams.get('range')
    return isDateRange(range) ? range : 'yesterday'
  })
  const [allBrandData, setAllBrandData] = useState<Record<string, BrandData>>({})
  const [loading,     setLoading]       = useState(false)
  const [missingApiKey, setMissingApiKey] = useState(false)
  const fetchedRef = useRef<Set<string>>(new Set())

  // Keep the URL in sync with navigation + date range so views are bookmarkable/shareable
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('vertical', navState.vertical)
    params.set('brand',    navState.brandId)
    params.set('source',   navState.dataSource)
    params.set('range',    dateRange)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [navState, dateRange, pathname, router])

  // Collapse sidebar on narrow screens on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // API key check
  useEffect(() => {
    fetch('/api/config-check')
      .then((r) => r.json())
      .then(({ hasApiKey }: { hasApiKey: boolean }) => { if (!hasApiKey) setMissingApiKey(true) })
      .catch(() => {})
  }, [])

  const verticalBrands = useMemo(
    () => BRANDS.filter((b) => b.vertical === navState.vertical),
    [navState.vertical]
  )

  // Fetch data for all brands in the active vertical
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
  }, [navState.vertical, verticalBrands])

  const selectedBrand = useMemo(
    () => BRANDS.find((b) => b.id === navState.brandId) ?? verticalBrands[0],
    [navState.brandId, verticalBrands]
  )

  const selectedData = selectedBrand ? allBrandData[selectedBrand.id] : undefined

  function handleNavChange(n: NavState) {
    setNavState(n)
  }

  // ── Content area ─────────────────────────────────────────────────────────────
  function renderContent() {
    const { vertical, dataSource } = navState

    if (vertical === 'ecommerce') {
      if (dataSource === 'shopify') {
        return (
          <ShopifyDashboard
            brand={selectedBrand}
            shopifyRows={selectedData?.shopifyRows ?? []}
            dateRange={dateRange}
            loading={loading || !selectedData}
          />
        )
      }
      if (dataSource === 'google-ads') return <GoogleAdsPanel />
      if (dataSource === 'meta-ads' || dataSource === 'meta') return <MetaAdsPanel />
      if (dataSource === 'interakt') return <InteraktPanel />
    }

    // hospital / other - show legacy KPI grid
    return (
      <LegacyKpiView
        allBrandData={allBrandData}
        navState={navState}
        loading={loading}
      />
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AppSidebar
        navState={navState}
        onNavChange={handleNavChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          vertical={navState.vertical}
          brandName={selectedBrand?.name ?? ''}
          dataSource={navState.dataSource}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          loading={loading}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-5">
          {/* API key warning */}
          {missingApiKey && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 font-bold text-sm mt-0.5 shrink-0">!</span>
              <p className="text-sm text-amber-800 flex-1">
                <strong>GOOGLE_SHEETS_API_KEY is not set</strong> - showing demo data.
                Add this key in Vercel Project Settings → Environment Variables.
              </p>
              <button onClick={() => setMissingApiKey(false)} className="text-amber-400 hover:text-amber-600 font-bold text-sm shrink-0">×</button>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// ── Suspense wrapper (useSearchParams requires one) ───────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  )
}
