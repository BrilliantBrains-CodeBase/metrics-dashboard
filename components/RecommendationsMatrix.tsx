import { ReportRec } from '@/types'

interface Props {
  recs: ReportRec[]
}

const impactColor = {
  High: 'bg-indigo-100 text-indigo-700',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-gray-100 text-gray-500',
}

const effortColor = {
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-amber-50 text-amber-600',
  Low: 'bg-emerald-50 text-emerald-700',
}

function RecCard({ rec }: { rec: ReportRec }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow">
      <p className="text-sm font-semibold text-gray-900 leading-snug">{rec.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{rec.why}</p>
      <div className="flex gap-1.5 mt-1 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${impactColor[rec.impact]}`}>
          {rec.impact} impact
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${effortColor[rec.effort]}`}>
          {rec.effort} effort
        </span>
      </div>
    </div>
  )
}

export default function RecommendationsMatrix({ recs }: Props) {
  if (recs.length === 0) return null

  // Bucket into quadrants
  const doFirst = recs.filter(r => r.impact === 'High' && r.effort === 'Low')
  const planNext = recs.filter(r => r.impact === 'High' && r.effort !== 'Low')
  const optional = recs.filter(r => r.impact !== 'High' && r.effort === 'Low')
  const deprioritize = recs.filter(r => r.impact !== 'High' && r.effort !== 'Low')

  const sections = [
    { label: 'Do first', sub: 'High impact, low effort', recs: doFirst, accent: 'border-indigo-200 bg-indigo-50/40' },
    { label: 'Plan for next sprint', sub: 'High impact, higher effort', recs: planNext, accent: 'border-amber-200 bg-amber-50/30' },
    { label: 'Do if time allows', sub: 'Lower impact, low effort', recs: optional, accent: 'border-gray-200 bg-gray-50/60' },
    { label: 'Deprioritize', sub: 'Lower impact, higher effort', recs: deprioritize, accent: 'border-gray-100 bg-white' },
  ].filter(s => s.recs.length > 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Recommendations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.label} className={`rounded-xl border p-4 ${section.accent}`}>
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{section.label}</p>
              <p className="text-xs text-gray-400">{section.sub}</p>
            </div>
            <div className="space-y-2.5">
              {section.recs.map((rec, i) => <RecCard key={i} rec={rec} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
