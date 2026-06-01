import { MetricDelta } from '@/types'
import { fmt } from '@/lib/metrics'

interface Props {
  deltas: MetricDelta[]
}

export default function HalfComparison({ deltas }: Props) {
  if (deltas.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">First Half vs Second Half</h3>
        <div className="flex gap-3 text-xs text-gray-400">
          <span className="px-2 py-0.5 bg-gray-100 rounded-md">H1</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md font-medium">H2</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {deltas.map((d) => {
          const improving = d.higherIsBetter ? d.changePct > 0 : d.changePct < 0
          const neutral = Math.abs(d.changePct) < 3
          const absPct = Math.abs(d.changePct)

          return (
            <div
              key={d.label}
              className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1.5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{d.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 line-through">{fmt(d.h1, d.format)}</span>
                <span className="text-sm font-bold text-gray-900">{fmt(d.h2, d.format)}</span>
              </div>
              {!neutral && (
                <span
                  className={`text-xs font-semibold self-start px-1.5 py-0.5 rounded ${
                    improving
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  }`}
                >
                  {d.changePct > 0 ? '+' : ''}{absPct.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
