'use client'
import { useMemo } from 'react'
import { EcomRow, DateRange } from '@/types'
import { filterMetaByMonthPrefix, sumEcom } from '@/lib/metrics'
import FbAdsCard from './FbAdsCard'
import FbCompletionsCard from './FbCompletionsCard'
import MetaOnlyGrid from './MetaOnlyGrid'

interface Props {
  metaRows: EcomRow[]
  dateRange: DateRange
}

function monthPrefix(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function MetaGrid({ metaRows, dateRange }: Props) {
  const derived = useMemo(() => {
    const thisMonthSum = sumEcom(filterMetaByMonthPrefix(metaRows, monthPrefix(0)))
    const lastMonthSum = sumEcom(filterMetaByMonthPrefix(metaRows, monthPrefix(-1)))
    return {
      adSpend: thisMonthSum.adSpend,
      metaRevenue: thisMonthSum.revenue,
      roas: thisMonthSum.roas,
      spendDelta: thisMonthSum.adSpend - lastMonthSum.adSpend,
      metaRevDelta: thisMonthSum.revenue - lastMonthSum.revenue,
      completions: thisMonthSum.purchases,
      cac: thisMonthSum.cpa,
      completionsDelta: thisMonthSum.purchases - lastMonthSum.purchases,
      cacDelta: thisMonthSum.cpa - lastMonthSum.cpa,
    }
  }, [metaRows])

  const period = 'this month'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8">
          <FbAdsCard
            adSpend={derived.adSpend}
            revenue={derived.metaRevenue}
            roas={derived.roas}
            spendDelta={derived.spendDelta}
            revenueDelta={derived.metaRevDelta}
            period={period}
          />
        </div>
        <div className="md:col-span-4">
          <FbCompletionsCard
            completions={derived.completions}
            cac={derived.cac}
            completionsDelta={derived.completionsDelta}
            cacDelta={derived.cacDelta}
            period={period}
          />
        </div>
      </div>
      <MetaOnlyGrid metaRows={metaRows} dateRange={dateRange} />
    </div>
  )
}
