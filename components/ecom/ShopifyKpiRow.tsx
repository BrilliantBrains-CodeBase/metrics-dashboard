'use client'
import { DateRange, ShopifyRow } from '@/types'
import { fmt, growthPercent, sumShopify } from '@/lib/metrics'

const COMPARISON_LABEL: Record<DateRange, string> = {
  yesterday: 'vs day before',
  '7d':      'vs previous 7 days',
  '30d':     'vs previous 30 days',
  '90d':     'vs previous 90 days',
  all:       '',
}

interface Props {
  rows:         ShopifyRow[]
  previousRows: ShopifyRow[]
  dateRange:    DateRange
  loading:      boolean
}

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-dashed border-gray-100 pb-1.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function ShopifyKpiRow({ rows, previousRows, dateRange, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-400">
        No Shopify data for this period
      </div>
    )
  }

  const s = sumShopify(rows)
  const p = sumShopify(previousRows)
  const comparisonLabel = COMPARISON_LABEL[dateRange]
  const hasComparison = previousRows.length > 0 && comparisonLabel !== ''

  function trend(curr: number, prev: number): string | undefined {
    if (!hasComparison) return undefined
    const pct = growthPercent(curr, prev)
    const sign = pct > 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}% ${comparisonLabel}`
  }

  const tiles = [
    { label: 'Gross Sales',  value: fmt(s.grossSales, 'currency'), sub: trend(s.grossSales, p.grossSales) },
    { label: 'Net Sales',    value: fmt(s.netSales,   'currency'), sub: trend(s.netSales,   p.netSales) },
    { label: 'Total Orders', value: fmt(s.orders,     'number'),   sub: trend(s.orders,     p.orders) },
    { label: 'Returns',      value: fmt(s.returns,    'currency'), sub: undefined },
    { label: 'AOV',          value: fmt(s.aov,        'currency'), sub: trend(s.aov,        p.aov) },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {tiles.map((t) => (
        <KpiTile key={t.label} label={t.label} value={t.value} sub={t.sub} />
      ))}
    </div>
  )
}
