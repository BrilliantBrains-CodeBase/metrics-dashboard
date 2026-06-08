import { fmtDelta, fmt } from '@/lib/metrics'

interface Props {
  completions: number
  cac: number
  completionsDelta: number
  cacDelta: number
  period: string
}

export default function FbCompletionsCard({ completions, cac, completionsDelta, cacDelta, period }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#1B2447]">Facebook Ads Completions</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{period}</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-4xl font-bold text-[#1B2447]">{completions.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Completions</p>
          <span className={`text-xs font-semibold ${completionsDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {completionsDelta >= 0 ? '+' : ''}{Math.round(completionsDelta)} vs last month
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-4xl font-bold text-[#1B2447]">{fmt(cac, 'currency')}</p>
          <p className="text-xs text-gray-400">CAC</p>
          <span className={`text-xs font-semibold ${cacDelta <= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fmtDelta(cacDelta, 'currency')} vs last month
          </span>
        </div>
      </div>
    </div>
  )
}
