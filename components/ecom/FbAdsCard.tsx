import { fmtDelta, fmt } from '@/lib/metrics'

interface Props {
  adSpend: number
  revenue: number
  roas: number
  spendDelta: number
  revenueDelta: number
  period: string
}

function DeltaChip({ delta, type }: { delta: number; type: 'currency' | 'number' }) {
  const positive = delta >= 0
  return (
    <span className={`text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {fmtDelta(delta, type)} vs last month
    </span>
  )
}

export default function FbAdsCard({ adSpend, revenue, roas, spendDelta, revenueDelta, period }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#1B2447]">Facebook Ads</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{period}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium">Spend</p>
          <p className="text-3xl font-bold text-[#1B2447]">{fmt(adSpend, 'currency')}</p>
          <DeltaChip delta={spendDelta} type="currency" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 font-medium">Revenue</p>
          <p className="text-3xl font-bold text-[#1B2447]">{fmt(revenue, 'currency')}</p>
          <DeltaChip delta={revenueDelta} type="currency" />
        </div>

        <div className="flex flex-col gap-1 justify-center items-center bg-indigo-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 font-medium">ROAS</p>
          <p className="text-3xl font-bold text-indigo-700">{roas.toFixed(2)}x</p>
          <p className="text-xs text-indigo-400">return on spend</p>
        </div>
      </div>
    </div>
  )
}
