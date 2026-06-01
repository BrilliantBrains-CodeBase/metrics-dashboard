import {
  AnyRow, EcomRow, HospitalRow, OtherRow, Vertical,
  WeekSummary, MetricDelta, DayPoint, ReportRec, PeriodTarget,
} from '@/types'
import { sumEcom, sumHospital, sumOther, avg, growthPercent } from './metrics'

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortedByDate(rows: AnyRow[]): AnyRow[] {
  return [...rows].sort((a, b) => a.date.localeCompare(b.date))
}

function chunks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ── Weekly breakdown ──────────────────────────────────────────────────────────

export function getWeeklyBreakdown(rows: AnyRow[], vertical: Vertical): WeekSummary[] {
  const sorted = sortedByDate(rows)
  return chunks(sorted, 7).map((chunk, i) => {
    if (vertical === 'ecommerce') {
      const s = sumEcom(chunk as EcomRow[])
      return {
        label: `Week ${i + 1}`,
        revenue: s.revenue, adSpend: s.adSpend, roas: s.roas,
        cpa: s.cpa, purchases: s.purchases,
        leads: 0, cpl: 0, cpql: 0, qualPercent: 0,
      }
    }
    if (vertical === 'hospital') {
      const s = sumHospital(chunk as HospitalRow[])
      return {
        label: `Week ${i + 1}`,
        revenue: 0, adSpend: s.adSpend, roas: 0, cpa: 0, purchases: 0,
        leads: s.leads, cpl: s.cpl, cpql: s.cpql, qualPercent: s.qualPercent,
      }
    }
    const s = sumOther(chunk as OtherRow[])
    return {
      label: `Week ${i + 1}`,
      revenue: s.revenue, adSpend: s.adSpend, roas: s.roas,
      cpa: s.cpa, purchases: s.conversions,
      leads: 0, cpl: 0, cpql: 0, qualPercent: 0,
    }
  })
}

// ── H1 vs H2 comparison ───────────────────────────────────────────────────────

export function getHalfComparison(rows: AnyRow[], vertical: Vertical): MetricDelta[] {
  const sorted = sortedByDate(rows)
  const mid = Math.floor(sorted.length / 2)
  const h1 = sorted.slice(0, mid)
  const h2 = sorted.slice(mid)

  const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100)

  if (vertical === 'ecommerce') {
    const a = sumEcom(h1 as EcomRow[])
    const b = sumEcom(h2 as EcomRow[])
    return [
      { label: 'Revenue',   h1: a.revenue,   h2: b.revenue,   changePct: pct(b.revenue,   a.revenue),   format: 'currency', higherIsBetter: true  },
      { label: 'ROAS',      h1: a.roas,      h2: b.roas,      changePct: pct(b.roas,      a.roas),      format: 'ratio',    higherIsBetter: true  },
      { label: 'CPA',       h1: a.cpa,       h2: b.cpa,       changePct: pct(b.cpa,       a.cpa),       format: 'currency', higherIsBetter: false },
      { label: 'Purchases', h1: a.purchases, h2: b.purchases, changePct: pct(b.purchases, a.purchases), format: 'number',   higherIsBetter: true  },
      { label: 'Conv. Rate',h1: a.cr,        h2: b.cr,        changePct: pct(b.cr,        a.cr),        format: 'percent',  higherIsBetter: true  },
      { label: 'AOV',       h1: a.aov,       h2: b.aov,       changePct: pct(b.aov,       a.aov),       format: 'currency', higherIsBetter: true  },
      { label: 'CTR',       h1: a.ctr,       h2: b.ctr,       changePct: pct(b.ctr,       a.ctr),       format: 'percent',  higherIsBetter: true  },
      { label: 'Ad Spend',  h1: a.adSpend,   h2: b.adSpend,   changePct: pct(b.adSpend,   a.adSpend),   format: 'currency', higherIsBetter: false },
    ]
  }
  if (vertical === 'hospital') {
    const a = sumHospital(h1 as HospitalRow[])
    const b = sumHospital(h2 as HospitalRow[])
    return [
      { label: 'Leads',        h1: a.leads,        h2: b.leads,        changePct: pct(b.leads,        a.leads),        format: 'number',   higherIsBetter: true  },
      { label: 'Quality Leads',h1: a.qualityLeads, h2: b.qualityLeads, changePct: pct(b.qualityLeads, a.qualityLeads), format: 'number',   higherIsBetter: true  },
      { label: 'CPL',          h1: a.cpl,          h2: b.cpl,          changePct: pct(b.cpl,          a.cpl),          format: 'currency', higherIsBetter: false },
      { label: 'CPQL',         h1: a.cpql,         h2: b.cpql,         changePct: pct(b.cpql,         a.cpql),         format: 'currency', higherIsBetter: false },
      { label: 'Qual %',       h1: a.qualPercent,  h2: b.qualPercent,  changePct: pct(b.qualPercent,  a.qualPercent),  format: 'percent',  higherIsBetter: true  },
      { label: 'CTR',          h1: a.ctr,          h2: b.ctr,          changePct: pct(b.ctr,          a.ctr),          format: 'percent',  higherIsBetter: true  },
      { label: 'Ad Spend',     h1: a.adSpend,      h2: b.adSpend,      changePct: pct(b.adSpend,      a.adSpend),      format: 'currency', higherIsBetter: false },
    ]
  }
  const a = sumOther(h1 as OtherRow[])
  const b = sumOther(h2 as OtherRow[])
  return [
    { label: 'Revenue',     h1: a.revenue,     h2: b.revenue,     changePct: pct(b.revenue,     a.revenue),     format: 'currency', higherIsBetter: true  },
    { label: 'ROAS',        h1: a.roas,        h2: b.roas,        changePct: pct(b.roas,        a.roas),        format: 'ratio',    higherIsBetter: true  },
    { label: 'CPA',         h1: a.cpa,         h2: b.cpa,         changePct: pct(b.cpa,         a.cpa),         format: 'currency', higherIsBetter: false },
    { label: 'Conversions', h1: a.conversions, h2: b.conversions, changePct: pct(b.conversions, a.conversions), format: 'number',   higherIsBetter: true  },
  ]
}

// ── Daily points ──────────────────────────────────────────────────────────────
// primary = revenue (ecom) or leads (hospital), secondary = roas (ecom) or cpl (hospital)

export function getDailyPoints(rows: AnyRow[], vertical: Vertical): DayPoint[] {
  const sorted = sortedByDate(rows)
  return sorted.map((r, i) => {
    const label = r.date ? r.date.slice(8) : `D${i + 1}` // extract day number from ISO date
    if (vertical === 'ecommerce') {
      const e = r as EcomRow
      return { label, primary: e.revenue, secondary: e.roas, adSpend: e.adSpend }
    }
    if (vertical === 'hospital') {
      const h = r as HospitalRow
      return { label, primary: h.leads, secondary: h.cpl, adSpend: h.adSpend }
    }
    const o = r as OtherRow
    return { label, primary: o.revenue, secondary: o.roas, adSpend: o.adSpend }
  })
}

// ── Recommendations ───────────────────────────────────────────────────────────

export function getRecommendations(rows: AnyRow[], vertical: Vertical): ReportRec[] {
  const sorted = sortedByDate(rows)
  const mid = Math.floor(sorted.length / 2)
  const h1 = sorted.slice(0, mid)
  const h2 = sorted.slice(mid)
  const recs: ReportRec[] = []

  if (vertical === 'ecommerce') {
    const total = sumEcom(sorted as EcomRow[])
    const s1 = sumEcom(h1 as EcomRow[])
    const s2 = sumEcom(h2 as EcomRow[])
    const weeks = getWeeklyBreakdown(sorted, 'ecommerce')
    const weekRoas = weeks.map(w => w.roas)
    const minWeekRoas = Math.min(...weekRoas)
    const maxWeekRoas = Math.max(...weekRoas)

    // Algorithm learning / positive momentum
    if (s2.cpa < s1.cpa * 0.75) {
      recs.push({
        title: 'Do not reset the campaign',
        why: `CPA dropped ${Math.round((1 - s2.cpa / s1.cpa) * 100)}% in the second half — the algorithm has learned. Resetting loses this purchase signal.`,
        impact: 'High', effort: 'Low',
      })
    }

    // Scale opportunity
    if (total.roas > 3 && s2.roas > s1.roas) {
      recs.push({
        title: 'Increase budget — ROAS supports scaling',
        why: `Overall ROAS is ${total.roas.toFixed(2)}x and improving. Budget increases of 20-30% are likely to remain profitable.`,
        impact: 'High', effort: 'Low',
      })
    }

    // AOV compression
    if (s2.aov < s1.aov * 0.8) {
      recs.push({
        title: 'Audit product mix driving H2 purchases',
        why: `AOV fell ${Math.round((1 - s2.aov / s1.aov) * 100)}% in H2 (from ${Math.round(s1.aov)} to ${Math.round(s2.aov)}). Algorithm may be over-indexing on low-ticket SKUs. Shift creative to feature higher-margin products.`,
        impact: 'High', effort: 'Medium',
      })
    }

    // Mid-period dip
    if (minWeekRoas < total.roas * 0.8) {
      const dipWeek = weekRoas.indexOf(minWeekRoas) + 1
      recs.push({
        title: `Schedule creative refresh before Week ${dipWeek}`,
        why: `ROAS dipped to ${minWeekRoas.toFixed(2)}x in Week ${dipWeek} vs ${total.roas.toFixed(2)}x average. Pre-planned creative rotation at this point prevents the mid-period performance valley.`,
        impact: 'Medium', effort: 'Low',
      })
    }

    // Spend spike detection
    const dailySpends = (sorted as EcomRow[]).map(r => r.adSpend)
    const avgSpend = avg(dailySpends)
    const maxSpend = Math.max(...dailySpends)
    if (maxSpend > avgSpend * 1.8) {
      recs.push({
        title: 'Cap daily spend to prevent month-end flush',
        why: `Peak single-day spend (${Math.round(maxSpend / 1000)}K) was ${Math.round(maxSpend / avgSpend)}x the daily average. End-of-month budget acceleration shows diminishing returns.`,
        impact: 'Medium', effort: 'Low',
      })
    }

    // High ROAS days pattern
    if (maxWeekRoas > total.roas * 1.2) {
      recs.push({
        title: 'Investigate high-ROAS day triggers',
        why: `Peak weekly ROAS (${maxWeekRoas.toFixed(2)}x in Week ${weekRoas.indexOf(maxWeekRoas) + 1}) is significantly above average. Identifying the creative, audience, or day-of-week driver lets you replicate these spikes.`,
        impact: 'Medium', effort: 'Medium',
      })
    }
  }

  if (vertical === 'hospital') {
    const total = sumHospital(sorted as HospitalRow[])
    const s1 = sumHospital(h1 as HospitalRow[])
    const s2 = sumHospital(h2 as HospitalRow[])

    if (total.qualPercent < 30) {
      recs.push({
        title: 'Improve lead quality targeting',
        why: `Qual% is ${total.qualPercent.toFixed(1)}% — below the 30% threshold. Review audience targeting, ad messaging, and form questions to attract more qualified prospects.`,
        impact: 'High', effort: 'Medium',
      })
    }
    if (s2.cpql < s1.cpql * 0.8) {
      recs.push({
        title: 'Scale budget — CPQL improving',
        why: `CPQL dropped ${Math.round((1 - s2.cpql / s1.cpql) * 100)}% in the second half. Campaign efficiency is building — support it with incremental budget.`,
        impact: 'High', effort: 'Low',
      })
    }
    if (s2.leads > s1.leads * 1.3 && s2.qualPercent < s1.qualPercent) {
      recs.push({
        title: 'Volume is up but quality is down — rebalance targeting',
        why: `Lead volume grew but Qual% fell in H2. The algorithm may be broadening to easier-to-convert but less qualified audiences. Tighten targeting or add qualification questions to the lead form.`,
        impact: 'High', effort: 'Medium',
      })
    }
    if (total.cpl > 500) {
      recs.push({
        title: 'Test new ad formats to reduce CPL',
        why: `CPL of ${Math.round(total.cpl)} is above target. Test video vs. static creatives and compare CPL by placement (Feed vs. Stories vs. Reels).`,
        impact: 'Medium', effort: 'Medium',
      })
    }
  }

  return recs.slice(0, 6)
}

// ── Next period targets ───────────────────────────────────────────────────────

export function getNextTargets(rows: AnyRow[], vertical: Vertical): PeriodTarget[] {
  const sorted = sortedByDate(rows)
  const mid = Math.floor(sorted.length / 2)
  const h2 = sorted.slice(mid)

  if (vertical === 'ecommerce') {
    const total = sumEcom(sorted as EcomRow[])
    const s2 = sumEcom(h2 as EcomRow[])
    // Target = extrapolate H2 trajectory with modest uplift
    return [
      { metric: 'Revenue',   current: total.revenue,   target: total.revenue * 1.25,  format: 'currency', higherIsBetter: true  },
      { metric: 'ROAS',      current: total.roas,      target: Math.max(total.roas * 1.1, s2.roas), format: 'ratio', higherIsBetter: true },
      { metric: 'CPA',       current: total.cpa,       target: total.cpa * 0.85,      format: 'currency', higherIsBetter: false },
      { metric: 'Purchases', current: total.purchases, target: Math.round(total.purchases * 1.25), format: 'number', higherIsBetter: true },
      { metric: 'AOV',       current: total.aov,       target: Math.max(total.aov * 1.15, (h2 as EcomRow[])[0]?.aov ?? total.aov), format: 'currency', higherIsBetter: true },
    ]
  }
  if (vertical === 'hospital') {
    const total = sumHospital(sorted as HospitalRow[])
    return [
      { metric: 'Leads',        current: total.leads,        target: Math.round(total.leads * 1.2),        format: 'number',   higherIsBetter: true  },
      { metric: 'Quality Leads',current: total.qualityLeads, target: Math.round(total.qualityLeads * 1.25),format: 'number',   higherIsBetter: true  },
      { metric: 'CPL',          current: total.cpl,          target: total.cpl * 0.85,                     format: 'currency', higherIsBetter: false },
      { metric: 'CPQL',         current: total.cpql,         target: total.cpql * 0.85,                    format: 'currency', higherIsBetter: false },
      { metric: 'Qual %',       current: total.qualPercent,  target: Math.min(total.qualPercent * 1.15, 60),format: 'percent', higherIsBetter: true  },
    ]
  }
  const total = sumOther(sorted as OtherRow[])
  return [
    { metric: 'Revenue',     current: total.revenue,     target: total.revenue * 1.2,     format: 'currency', higherIsBetter: true  },
    { metric: 'ROAS',        current: total.roas,        target: total.roas * 1.1,        format: 'ratio',    higherIsBetter: true  },
    { metric: 'CPA',         current: total.cpa,         target: total.cpa * 0.85,        format: 'currency', higherIsBetter: false },
    { metric: 'Conversions', current: total.conversions, target: Math.round(total.conversions * 1.2), format: 'number', higherIsBetter: true },
  ]
}
