'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Brand, DateRange, ShopifyRow } from '@/types'
import { ShopifyAnalyticsData } from '@/types/shopify-analytics'
import { fetchShopifyAnalytics, ShopifyAnalyticsResult } from '@/lib/sheets'
import { filterShopifyByDateRange, filterShopifyPreviousPeriod } from '@/lib/metrics'
import { assembleFromSheets, RawSheets } from '@/lib/shopify-multi-sheet-parser'
import ShopifyKpiRow from './ShopifyKpiRow'
import SalesBreakdownCard from './SalesBreakdownCard'
import SalesByProductChart from './SalesByProductChart'
import ConversionFunnelCard from './ConversionFunnelCard'
import SessionsByLocationTable from './SessionsByLocationTable'
import SessionsByReferrerTable from './SessionsByReferrerTable'
import SessionsByLandingPageTable from './SessionsByLandingPageTable'
import OrdersByHourChart from './OrdersByHourChart'

interface Props {
  brand:       Brand
  shopifyRows: ShopifyRow[]
  dateRange:   DateRange
  loading:     boolean   // true while time-series rows are still loading
}

export default function ShopifyDashboard({ brand, shopifyRows, dateRange, loading }: Props) {
  const [analytics, setAnalytics]               = useState<ShopifyAnalyticsData | null>(null)
  const [rawSheets, setRawSheets]               = useState<RawSheets | null>(null)
  const [dailyRows, setDailyRows]               = useState<ShopifyRow[]>([])
  const [analyticsError, setAnalyticsError]     = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const cacheRef       = useRef<Record<string, ShopifyAnalyticsResult>>({})
  const fetchingRef    = useRef<Set<string>>(new Set())
  const activeBrandRef = useRef('')

  useEffect(() => {
    if (!brand.id) return
    const brandId = brand.id
    activeBrandRef.current = brandId

    const cached = cacheRef.current[brandId]
    if (cached) {
      setAnalytics(cached.data)
      setRawSheets(cached.rawSheets)
      setDailyRows(cached.dailyRows)
      setAnalyticsError(cached.error)
      setAnalyticsLoading(false)
      return
    }
    setAnalyticsLoading(true)
    if (fetchingRef.current.has(brandId)) return
    fetchingRef.current.add(brandId)
    fetchShopifyAnalytics(brand).then((result) => {
      cacheRef.current[brandId] = result
      fetchingRef.current.delete(brandId)
      // Discard the result if the user has since switched to a different brand
      if (activeBrandRef.current === brandId) {
        setAnalytics(result.data)
        setRawSheets(result.rawSheets)
        setDailyRows(result.dailyRows)
        setAnalyticsError(result.error)
        setAnalyticsLoading(false)
      }
    })
  }, [brand.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // KPI strip sources from the Shopify Analytics Overview sheet for multi-sheet
  // brands; legacy single-sheet brands (e.g. Milkvilla) fall back to their
  // separate Shopify time-series sheet
  const usesOverviewForKpi = !!brand.shopifyOverviewSheet
  const kpiSourceRows = usesOverviewForKpi ? dailyRows : shopifyRows
  const filteredRows  = filterShopifyByDateRange(kpiSourceRows, dateRange)
  const previousRows  = filterShopifyPreviousPeriod(kpiSourceRows, dateRange)
  const kpiLoading    = usesOverviewForKpi ? analyticsLoading : loading

  // For multi-sheet brands every analytics card follows the period filter —
  // we re-assemble from the cached raw sheets using the selected dateRange.
  // For legacy single-sheet brands rawSheets is null and we fall back to the
  // fixed-period analytics snapshot.
  const filteredAnalytics = useMemo<ShopifyAnalyticsData | null>(() => {
    if (!rawSheets) return analytics
    return assembleFromSheets(
      rawSheets.overview,
      rawSheets.product,
      rawSheets.location,
      rawSheets.referrer,
      rawSheets.landingPage,
      dateRange,
    )
  }, [rawSheets, dateRange, analytics])

  return (
    <div className="space-y-4">
      {/* Row 1 - KPI strip */}
      <ShopifyKpiRow rows={filteredRows} previousRows={previousRows} dateRange={dateRange} loading={kpiLoading} />

      {analyticsError && !analyticsLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center gap-2">
          <span className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center text-lg font-bold">!</span>
          <p className="text-sm font-semibold text-gray-700">Unable to fetch data</p>
          <p className="text-xs text-gray-400 max-w-sm">
            We couldn&apos;t load Shopify Analytics for {brand.name}. The spreadsheet may not be shared
            with the dashboard&apos;s service account, or it&apos;s temporarily unavailable.
          </p>
        </div>
      ) : (
        <>
          {/* Row 2 - Sales breakdown + Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesBreakdownCard data={filteredAnalytics?.salesBreakdown ?? null} loading={analyticsLoading} />
            <SalesByProductChart products={filteredAnalytics?.salesByProduct ?? []} loading={analyticsLoading} />
          </div>

          {/* Row 3 - Conversion funnel + Sessions by location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConversionFunnelCard funnel={filteredAnalytics?.conversionFunnel ?? null} loading={analyticsLoading} />
            <SessionsByLocationTable rows={filteredAnalytics?.sessionsByLocation ?? []} loading={analyticsLoading} />
          </div>

          {/* Row 4 - Referrer + Landing page */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SessionsByReferrerTable rows={filteredAnalytics?.sessionsByReferrer ?? []} loading={analyticsLoading} />
            <SessionsByLandingPageTable rows={filteredAnalytics?.sessionsByLandingPage ?? []} loading={analyticsLoading} />
          </div>

          {/* Row 5 - Orders by hour */}
          <OrdersByHourChart hours={filteredAnalytics?.ordersByHour ?? []} loading={analyticsLoading} />
        </>
      )}
    </div>
  )
}
