'use client'
import { useMemo } from 'react'
import { ShopifyRow, DateRange } from '@/types'
import {
  filterShopifyToday,
  filterShopifyYesterday,
  filterByMonthPrefix,
  filterShopifyByDateRange,
  sumShopify,
  computeMonthlyProjection,
} from '@/lib/metrics'
import TodayCard from './TodayCard'
import RevenueCard from './RevenueCard'
import OrdersCard from './OrdersCard'
import CancellationsCard from './CancellationsCard'

interface Props {
  shopifyRows: ShopifyRow[]
  dateRange: DateRange
}

function monthPrefix(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function ShopifyGrid({ shopifyRows, dateRange }: Props) {
  const derived = useMemo(() => {
    const thisMonth = monthPrefix(0)
    const lastMonth = monthPrefix(-1)

    const todayRows = filterShopifyToday(shopifyRows)
    const yesterdayRows = filterShopifyYesterday(shopifyRows)
    const todaySum = sumShopify(todayRows)
    const yesterdaySum = sumShopify(yesterdayRows)

    const thisMonthRows = filterByMonthPrefix(shopifyRows, thisMonth)
    const lastMonthRows = filterByMonthPrefix(shopifyRows, lastMonth)
    const thisMonthSum = sumShopify(thisMonthRows)
    const lastMonthSum = sumShopify(lastMonthRows)

    const projection = computeMonthlyProjection(shopifyRows)

    const sparkRows = filterShopifyByDateRange(shopifyRows, dateRange)
    const mid = Math.floor(sparkRows.length / 2)
    const h1Rev = sumShopify(sparkRows.slice(0, mid)).netSales
    const h2Rev = sumShopify(sparkRows.slice(mid)).netSales
    const priorAov = sumShopify(sparkRows.slice(0, mid)).aov

    return {
      todayRevenue: todaySum.netSales,
      todayOrders: todaySum.orders,
      revDeltaVsYesterday: todaySum.netSales - yesterdaySum.netSales,
      ordersDeltaVsYesterday: todaySum.orders - yesterdaySum.orders,
      hasToday: todayRows.length > 0,

      revenueTotal: projection.total,
      projected: projection.projected,
      progressPct: projection.progressPct,
      revDelta: h2Rev - h1Rev,
      sparkRows,

      orders: thisMonthSum.orders,
      aov: thisMonthSum.aov,
      ordersDelta: thisMonthSum.orders - lastMonthSum.orders,
      aovDelta: thisMonthSum.aov - lastMonthSum.aov,
      priorAov,

      deductionOrders: thisMonthSum.orders,
      returns: thisMonthSum.returns,
      returnRate: thisMonthSum.returnRate,
      deductionOrdersDelta: thisMonthSum.orders - lastMonthSum.orders,
      discounts: thisMonthSum.discounts,
      discountRate: thisMonthSum.discountRate,
    }
  }, [shopifyRows, dateRange])

  const period = 'this month'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <TodayCard
        revenue={derived.todayRevenue}
        orders={derived.todayOrders}
        revDelta={derived.revDeltaVsYesterday}
        ordersDelta={derived.ordersDeltaVsYesterday}
        hasData={derived.hasToday}
      />
      <RevenueCard
        total={derived.revenueTotal}
        projected={derived.projected}
        progressPct={derived.progressPct}
        delta={derived.revDelta}
        sparkRows={derived.sparkRows}
        period={period}
      />
      <OrdersCard
        orders={derived.orders}
        aov={derived.aov}
        ordersDelta={derived.ordersDelta}
        aovDelta={derived.aovDelta}
        priorAov={derived.priorAov}
        period={period}
      />
      <CancellationsCard
        orders={derived.deductionOrders}
        returns={derived.returns}
        returnRate={derived.returnRate}
        ordersDelta={derived.deductionOrdersDelta}
        discounts={derived.discounts}
        discountRate={derived.discountRate}
      />
    </div>
  )
}
