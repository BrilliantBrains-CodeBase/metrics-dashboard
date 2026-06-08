'use client'
import { useState } from 'react'
import { ProductSalesRow } from '@/types/shopify-analytics'
import { fmt } from '@/lib/metrics'

const DEFAULT_VISIBLE = 5

interface Props {
  products: ProductSalesRow[]
  loading:  boolean
}

export default function SalesByProductChart({ products, loading }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (loading) return <div className="h-72 rounded-2xl bg-gray-100 animate-pulse" />

  if (!products || products.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-40">
      No product sales data
    </div>
  )

  const sorted  = [...products].sort((a, b) => b.revenue - a.revenue)
  const max     = sorted[0]?.revenue ?? 1
  const visible = expanded ? sorted : sorted.slice(0, DEFAULT_VISIBLE)
  const hidden  = sorted.length - DEFAULT_VISIBLE

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-dashed border-gray-100">
        Total sales by product
      </h3>
      <div className="space-y-3">
        {visible.map((p) => {
          const pct   = (p.revenue / max) * 100
          const label = [p.productName, p.collection].filter(Boolean).join(' · ')
          return (
            <div key={`${p.productName}-${p.variant}`}>
              <p className="text-xs text-gray-500 mb-1 truncate">{label}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-14 text-right shrink-0">
                  {fmt(p.revenue, 'currency')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {sorted.length > DEFAULT_VISIBLE && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full text-xs font-medium text-indigo-500 hover:text-indigo-700 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50/50 transition-colors"
        >
          {expanded ? 'View less' : `View ${hidden} more`}
        </button>
      )}
    </div>
  )
}
