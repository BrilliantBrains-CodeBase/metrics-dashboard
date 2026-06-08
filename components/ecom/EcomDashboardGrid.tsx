'use client'
import { useMemo } from 'react'
import { ShopifyRow, EcomRow, DateRange } from '@/types'
import {
  filterShopifyToday, filterShopifyYesterday, filterByMonthPrefix, filterMetaByMonthPrefix,
  filterShopifyByDateRange, filterByDateRange,
  sumShopify, sumEcom, computeMonthlyProjection,
} from '@/lib/metrics'
import TodayCard from './TodayCard'
import FbAdsCard from './FbAdsCard'
import RevenueCard from './RevenueCard'
import OrdersCard from './OrdersCard'
import FbCompletionsCard from './FbCompletionsCard'
import CancellationsCard from './CancellationsCard'

interface Props {
  shopifyRows: ShopifyRow[]
  metaRows: EcomRow[]
  dateRange: DateRange
  brandName: string
}

function monthPrefix(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function EcomDashboardGrid({ shopifyRows, metaRows, dateRange, brandName }: Props) {
  const derived = useMemo(() => {
    const thisMonth = monthPrefix(0)
    const lastMonth = monthPrefix(-1)

    // Today / Yesterday
    const todayRows = filterShopifyToday(shopifyRows)
    const yesterdayRows = filterShopifyYesterday(shopifyRows)
    const todaySum = sumShopify(todayRows)
    const yesterdaySum = sumShopify(yesterdayRows)
    const hasToday = todayRows.length > 0

    // Monthly Shopify
    const thisMonthShopify = filterByMonthPrefix(shopifyRows, thisMonth)
    const lastMonthShopify = filterByMonthPrefix(shopifyRows, lastMonth)
    const thisMonthShopifySum = sumShopify(thisMonthShopify)
    const lastMonthShopifySum = sumShopify(lastMonthShopify)

    // Monthly projection
    const projection = computeMonthlyProjection(shopifyRows)

    // Period-filtered sparkline rows
    const sparkRows = filterShopifyByDateRange(shopifyRows, dateRange)

    // Half-period delta for revenue card
    const halfRows = filterShopifyByDateRange(shopifyRows, dateRange)
    const mid = Math.floor(halfRows.length / 2)
    const h1Rev = sumShopify(halfRows.slice(0, mid)).netSales
    const h2Rev = sumShopify(halfRows.slice(mid)).netSales
    const revDelta = h2Rev - h1Rev

    // Monthly Meta
    const thisMonthMeta = filterMetaByMonthPrefix(metaRows, thisMonth)
    const lastMonthMeta = filterMetaByMonthPrefix(metaRows, lastMonth)
    const thisMetaSum = sumEcom(thisMonthMeta)
    const lastMetaSum = sumEcom(lastMonthMeta)

    // AOV prior period for gauge
    const priorHalfRows = filterShopifyByDateRange(shopifyRows, dateRange).slice(0, mid)
    const priorAov = sumShopify(priorHalfRows).aov

    return {
      // Today card
      todayRevenue: todaySum.netSales,
      todayOrders: todaySum.orders,
      revDeltaVsYesterday: todaySum.netSales - yesterdaySum.netSales,
      ordersDeltaVsYesterday: todaySum.orders - yesterdaySum.orders,
      hasToday,

      // FB Ads card
      adSpend: thisMetaSum.adSpend,
      metaRevenue: thisMetaSum.revenue,
      roas: thisMetaSum.roas,
      spendDelta: thisMetaSum.adSpend - lastMetaSum.adSpend,
      metaRevDelta: thisMetaSum.revenue - lastMetaSum.revenue,

      // Revenue card
      revenueTotal: projection.total,
      projected: projection.projected,
      progressPct: projection.progressPct,
      revDelta,
      sparkRows,

      // Orders card
      orders: thisMonthShopifySum.orders,
      aov: thisMonthShopifySum.aov,
      ordersDelta: thisMonthShopifySum.orders - lastMonthShopifySum.orders,
      aovDelta: thisMonthShopifySum.aov - lastMonthShopifySum.aov,
      priorAov,

      // FB Completions card
      completions: thisMetaSum.purchases,
      cac: thisMetaSum.cpa,
      completionsDelta: thisMetaSum.purchases - lastMetaSum.purchases,
      cacDelta: thisMetaSum.cpa - lastMetaSum.cpa,

      // Cancellations card
      deductionOrders: thisMonthShopifySum.orders,
      returns: thisMonthShopifySum.returns,
      returnRate: thisMonthShopifySum.returnRate,
      deductionOrdersDelta: thisMonthShopifySum.orders - lastMonthShopifySum.orders,
      discounts: thisMonthShopifySum.discounts,
      discountRate: thisMonthShopifySum.discountRate,
    }
  }, [shopifyRows, metaRows, dateRange])

  const period = 'this month'

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Row 1 */}
      <div className="md:col-span-3">
        <TodayCard
          revenue={derived.todayRevenue}
          orders={derived.todayOrders}
          revDelta={derived.revDeltaVsYesterday}
          ordersDelta={derived.ordersDeltaVsYesterday}
          hasData={derived.hasToday}
        />
      </div>

      <div className="md:col-span-6">
        <FbAdsCard
          adSpend={derived.adSpend}
          revenue={derived.metaRevenue}
          roas={derived.roas}
          spendDelta={derived.spendDelta}
          revenueDelta={derived.metaRevDelta}
          period={period}
        />
      </div>

      <div className="md:col-span-3 md:row-span-2 flex flex-col">
        <CancellationsCard
          orders={derived.deductionOrders}
          returns={derived.returns}
          returnRate={derived.returnRate}
          ordersDelta={derived.deductionOrdersDelta}
          discounts={derived.discounts}
          discountRate={derived.discountRate}
        />
      </div>

      {/* Row 2 — 3 equal cards in cols 1-9; cols 10-12 are held by Deductions (row-span-2) */}
      <div className="md:col-span-3">
        <RevenueCard
          total={derived.revenueTotal}
          projected={derived.projected}
          progressPct={derived.progressPct}
          delta={derived.revDelta}
          sparkRows={derived.sparkRows}
          period={period}
        />
      </div>

      <div className="md:col-span-3">
        <OrdersCard
          orders={derived.orders}
          aov={derived.aov}
          ordersDelta={derived.ordersDelta}
          aovDelta={derived.aovDelta}
          priorAov={derived.priorAov}
          period={period}
        />
      </div>

      <div className="md:col-span-3">
        <FbCompletionsCard
          completions={derived.completions}
          cac={derived.cac}
          completionsDelta={derived.completionsDelta}
          cacDelta={derived.cacDelta}
          period={period}
        />
      </div>
    </div>
  )
}
