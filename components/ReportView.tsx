'use client'
import { useMemo } from 'react'
import { BrandData, Vertical, DateRange, EcomRow, HospitalRow, OtherRow } from '@/types'
import { filterByDateRange, sumEcom, sumHospital, sumOther, fmt, growthPercent } from '@/lib/metrics'
import {
  getWeeklyBreakdown,
  getHalfComparison,
  getDailyPoints,
  getRecommendations,
  getNextTargets,
} from '@/lib/report'
import WeeklyBreakdownChart from './charts/WeeklyBreakdownChart'
import DailyPerformanceChart from './charts/DailyPerformanceChart'
import HalfComparison from './HalfComparison'
import RecommendationsMatrix from './RecommendationsMatrix'

interface Props {
  selectedData: BrandData
  vertical: Vertical
  dateRange: DateRange
}

// ── Executive summary banner ──────────────────────────────────────────────────
function ExecSummary({ selectedData, vertical, dateRange }: Props) {
  const rows = filterByDateRange(selectedData.rows, dateRange)
  const mid = Math.floor(rows.length / 2)
  const h2 = rows.slice(mid)

  if (vertical === 'ecommerce') {
    const total = sumEcom(rows as EcomRow[])
    const s2 = sumEcom(h2 as EcomRow[])
    const roasTrend = growthPercent(s2.roas, sumEcom(rows.slice(0, mid) as EcomRow[]).roas)
    const win = roasTrend > 0
      ? `ROAS improved ${roasTrend.toFixed(0)}% in the second half, peaking at ${fmt(s2.roas, 'ratio')}.`
      : `Revenue hit ${fmt(total.revenue, 'currency')} — campaign is delivering positive returns.`
    const concern = s2.aov < sumEcom(rows.slice(0, mid) as EcomRow[]).aov * 0.8
      ? 'AOV compressed in H2 — the algorithm is converting more but at smaller basket sizes.'
      : total.cpa > 500
      ? `CPA of ${fmt(total.cpa, 'currency')} is elevated — creative or audience refresh may be due.`
      : 'No major concerns this period.'

    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>{selectedData.brand.name}</strong> delivered {fmt(total.revenue, 'currency')} revenue on {fmt(total.adSpend, 'currency')} spend
            ({fmt(total.roas, 'ratio')} ROAS) with {total.purchases.toLocaleString()} purchases at {fmt(total.aov, 'currency')} AOV.
          </p>
        </div>
        <div className="flex sm:flex-col gap-3 sm:gap-2 sm:min-w-[220px]">
          <div className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-emerald-100 flex-1">
            <span className="text-emerald-600 font-bold text-sm mt-0.5">+</span>
            <p className="text-xs text-gray-600 leading-snug">{win}</p>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100 flex-1">
            <span className="text-amber-500 font-bold text-sm mt-0.5">!</span>
            <p className="text-xs text-gray-600 leading-snug">{concern}</p>
          </div>
        </div>
      </div>
    )
  }

  if (vertical === 'hospital') {
    const total = sumHospital(rows as HospitalRow[])
    const s2 = sumHospital(h2 as HospitalRow[])
    const s1 = sumHospital(rows.slice(0, mid) as HospitalRow[])
    const cplTrend = growthPercent(s2.cpl, s1.cpl)
    const win = cplTrend < -10
      ? `CPL improved ${Math.abs(cplTrend).toFixed(0)}% in the second half.`
      : `${total.leads} leads generated with ${total.qualityLeads} qualifying (${total.qualPercent.toFixed(1)}% qual rate).`
    const concern = total.qualPercent < 30
      ? `Lead quality at ${total.qualPercent.toFixed(1)}% is below the 30% target.`
      : 'Lead quality is within acceptable range.'

    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>{selectedData.brand.name}</strong> generated {total.leads.toLocaleString()} leads
            ({total.qualityLeads} quality) on {fmt(total.adSpend, 'currency')} spend.
            CPL: {fmt(total.cpl, 'currency')}. CPQL: {fmt(total.cpql, 'currency')}.
          </p>
        </div>
        <div className="flex sm:flex-col gap-3 sm:gap-2 sm:min-w-[220px]">
          <div className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-emerald-100 flex-1">
            <span className="text-emerald-600 font-bold text-sm mt-0.5">+</span>
            <p className="text-xs text-gray-600 leading-snug">{win}</p>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100 flex-1">
            <span className="text-amber-500 font-bold text-sm mt-0.5">!</span>
            <p className="text-xs text-gray-600 leading-snug">{concern}</p>
          </div>
        </div>
      </div>
    )
  }

  const total = sumOther(rows as OtherRow[])
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
      <p className="text-sm text-gray-700">
        <strong>{selectedData.brand.name}</strong>: {fmt(total.revenue, 'currency')} revenue,
        {fmt(total.roas, 'ratio')} ROAS, {fmt(total.cpa, 'currency')} CPA,
        {total.conversions.toLocaleString()} conversions.
      </p>
    </div>
  )
}

// ── Next period targets ───────────────────────────────────────────────────────
function TargetsSection({ rows, vertical }: { rows: BrandData['rows'], vertical: Vertical }) {
  const targets = getNextTargets(rows, vertical)
  if (targets.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Next Period Targets</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {targets.map((t) => {
          const progress = t.higherIsBetter
            ? Math.min((t.current / t.target) * 100, 100)
            : Math.min((t.target / t.current) * 100, 100)
          const onTrack = progress >= 80

          return (
            <div key={t.metric} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t.metric}</p>
              <p className="text-sm font-bold text-gray-900">{fmt(t.current, t.format)}</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${onTrack ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Target: <span className="font-semibold text-gray-600">{fmt(t.target, t.format)}</span>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main report view ──────────────────────────────────────────────────────────
export default function ReportView({ selectedData, vertical, dateRange }: Props) {
  const rows = useMemo(
    () => filterByDateRange(selectedData.rows, dateRange),
    [selectedData.rows, dateRange]
  )

  const weeks = useMemo(() => getWeeklyBreakdown(rows, vertical), [rows, vertical])
  const deltas = useMemo(() => getHalfComparison(rows, vertical), [rows, vertical])
  const dailyPoints = useMemo(() => getDailyPoints(rows, vertical), [rows, vertical])
  const recs = useMemo(() => getRecommendations(rows, vertical), [rows, vertical])

  const isEcom = vertical === 'ecommerce' || vertical === 'other'

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
        No data available for this period.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ExecSummary selectedData={selectedData} vertical={vertical} dateRange={dateRange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WeeklyBreakdownChart weeks={weeks} vertical={vertical} />
        <HalfComparison deltas={deltas} />
      </div>

      <DailyPerformanceChart
        points={dailyPoints}
        primaryLabel={isEcom ? 'Revenue' : 'Leads'}
        secondaryLabel={isEcom ? 'ROAS' : 'CPL'}
        secondaryUnit={isEcom ? 'ratio' : 'currency'}
        vertical={vertical}
      />

      <RecommendationsMatrix recs={recs} />

      <TargetsSection rows={rows} vertical={vertical} />
    </div>
  )
}
