'use client'
import { useMemo } from 'react'
import { EcomRow, DateRange } from '@/types'
import { filterByDateRange, sumEcom, fmt, fmtDelta } from '@/lib/metrics'

interface Props {
  googleRows: EcomRow[]
  dateRange: DateRange
}

function MetricCard({
  label, value, delta, deltaType, highlight,
}: {
  label: string
  value: string
  delta: number
  deltaType: 'currency' | 'number'
  highlight?: boolean
}) {
  const positive = delta >= 0
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 shadow-sm ${highlight ? 'bg-sky-50 border-sky-200' : 'bg-white border-gray-100'}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-sky-700' : 'text-[#1B2447]'}`}>{value}</p>
      <span className={`text-xs font-semibold self-start ${positive ? 'text-green-600' : 'text-red-500'}`}>
        {fmtDelta(delta, deltaType)} vs prior period
      </span>
    </div>
  )
}

export default function GoogleAdsGrid({ googleRows, dateRange }: Props) {
  const { s, deltas } = useMemo(() => {
    const rows = filterByDateRange(googleRows as never[], dateRange) as EcomRow[]
    const mid = Math.floor(rows.length / 2)
    const s = sumEcom(rows)
    const h1 = sumEcom(rows.slice(0, mid))
    const h2 = sumEcom(rows.slice(mid))
    return {
      s,
      deltas: {
        revenue: h2.revenue - h1.revenue,
        adSpend: h2.adSpend - h1.adSpend,
        roas: h2.roas - h1.roas,
        purchases: h2.purchases - h1.purchases,
        cpa: h2.cpa - h1.cpa,
        ctr: h2.ctr - h1.ctr,
      },
    }
  }, [googleRows, dateRange])

  if (googleRows.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
        <div className="flex justify-center gap-1.5 mb-3">
          {['#4285F4', '#EA4335', '#FBBC05', '#34A853'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <p className="text-sm font-semibold text-gray-500">Google Ads not connected</p>
        <p className="text-xs text-gray-400 mt-1">Add <code className="font-mono bg-gray-100 px-1 rounded">googleAdsSpreadsheetId</code> to <code className="font-mono bg-gray-100 px-1 rounded">config/brands.ts</code></p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard label="Revenue"     value={fmt(s.revenue, 'currency')}     delta={deltas.revenue}   deltaType="currency" highlight />
      <MetricCard label="Ad Spend"    value={fmt(s.adSpend, 'currency')}     delta={deltas.adSpend}   deltaType="currency" />
      <MetricCard label="ROAS"        value={`${s.roas.toFixed(2)}x`}        delta={deltas.roas}      deltaType="number" />
      <MetricCard label="Conversions" value={s.purchases.toLocaleString()}   delta={deltas.purchases} deltaType="number" />
      <MetricCard label="CPA"         value={fmt(s.cpa, 'currency')}         delta={-deltas.cpa}      deltaType="currency" />
      <MetricCard label="CTR"         value={`${s.ctr.toFixed(2)}%`}         delta={deltas.ctr}       deltaType="number" />
    </div>
  )
}
