'use client'
import { ConversionFunnel } from '@/types/shopify-analytics'

interface Props {
  funnel:  ConversionFunnel | null
  loading: boolean
}

const STEPS: { key: keyof ConversionFunnel; label: string }[] = [
  { key: 'sessions',          label: 'Sessions'           },
  { key: 'addedToCart',       label: 'Added to cart'      },
  { key: 'reachedCheckout',   label: 'Reached checkout'   },
  { key: 'completedCheckout', label: 'Completed checkout' },
]

function fmtNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(Math.round(n))
}

export default function ConversionFunnelCard({ funnel, loading }: Props) {
  if (loading) return <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />

  if (!funnel) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-40">
      No conversion data
    </div>
  )

  const sessionCount = funnel.sessions.count || 1
  const overallRate  = funnel.completedCheckout.count / sessionCount

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-1 pb-2 border-b border-dashed border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Conversion rate breakdown</h3>
      </div>

      <p className="text-2xl font-bold text-gray-900 mb-4">
        {(overallRate * 100).toFixed(2)}%
      </p>

      {/* Step columns */}
      <div className="grid grid-cols-4 gap-1 mb-4">
        {STEPS.map((step) => {
          const data = funnel[step.key]
          return (
            <div key={step.key} className="text-center px-1 border-r border-gray-100 last:border-none">
              <p className="text-[10px] text-gray-400 truncate mb-1">{step.label}</p>
              <p className="text-xs font-semibold text-gray-500">
                {(data.rate * 100).toFixed(2)}%
              </p>
              <p className="text-sm font-bold text-gray-900">{fmtNum(data.count)}</p>
            </div>
          )
        })}
      </div>

      {/* Mini funnel bars */}
      <div className="space-y-1.5">
        {STEPS.map((step) => {
          const data = funnel[step.key]
          const pct  = (data.count / sessionCount) * 100
          return (
            <div key={step.key} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-24 shrink-0 truncate">{step.label}</span>
              <div className="flex-1 h-5 rounded bg-blue-100 overflow-hidden relative">
                <div
                  className="h-full rounded bg-blue-500 transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 w-8 text-right shrink-0">
                {fmtNum(data.count)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
