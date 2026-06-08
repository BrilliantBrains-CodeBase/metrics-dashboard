'use client'
import { SalesBreakdown } from '@/types/shopify-analytics'
import { fmt } from '@/lib/metrics'

interface Props {
  data:    SalesBreakdown | null
  loading: boolean
}

export default function SalesBreakdownCard({ data, loading }: Props) {
  if (loading) return <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />

  if (!data) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-40">
      No sales breakdown data
    </div>
  )

  const rows: { label: string; value: number; highlight?: boolean; negative?: boolean }[] = [
    { label: 'Gross Sales',  value: data.grossSales },
    { label: 'Discounts',    value: -data.discounts,  negative: true },
    { label: 'Returns',      value: -data.returns,    negative: true },
    { label: 'Net Sales',    value: data.netSales,    highlight: true },
    { label: 'Shipping',     value: data.shipping },
    { label: 'Return Fees',  value: 0 },
    { label: 'Taxes',        value: data.taxes },
    { label: 'Total Sales',  value: data.totalSales,  highlight: true },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-dashed border-gray-100">
        Total sales breakdown
      </h3>
      <div className="space-y-0.5">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              row.highlight ? 'bg-gray-50' : i % 2 === 0 ? '' : ''
            }`}
          >
            <span className={`text-sm ${row.highlight ? 'font-semibold text-gray-800' : 'text-blue-600'}`}>
              {row.label}
            </span>
            <span className={`text-sm font-semibold tabular-nums ${
              row.negative ? 'text-red-500' : row.highlight ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {row.value < 0
                ? `-${fmt(Math.abs(row.value), 'currency')}`
                : fmt(row.value, 'currency')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
