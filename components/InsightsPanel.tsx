import { Insight } from '@/lib/insights'

interface Props {
  insights: Insight[]
  loading?: boolean
}

const typeMap = {
  positive: { label: '+', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  negative: { label: '-', cls: 'text-red-600 bg-red-50 border-red-200' },
  neutral:  { label: 'i', cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
}

export default function InsightsPanel({ insights, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Key Insights</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-gray-400">No significant insights for this period.</p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((ins, i) => {
            const { label, cls } = typeMap[ins.type]
            return (
              <li
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${cls}`}
              >
                <span className="font-bold text-xs leading-none mt-0.5 w-3 shrink-0 text-center">{label}</span>
                <span dangerouslySetInnerHTML={{ __html: ins.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
