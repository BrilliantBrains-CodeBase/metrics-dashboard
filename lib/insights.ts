import { BrandData, Vertical } from '@/types'
import { filterByDateRange, sumEcom, sumHospital, sumOther, avg, growthPercent, fmt } from './metrics'
import { EcomRow, HospitalRow, OtherRow, DateRange } from '@/types'

export interface Insight {
  type: 'positive' | 'negative' | 'neutral'
  text: string
}

export function generateInsights(
  selectedBrand: BrandData,
  allBrands: BrandData[],
  vertical: Vertical,
  dateRange: DateRange
): Insight[] {
  const insights: Insight[] = []

  if (vertical === 'ecommerce') {
    const selRows = filterByDateRange(selectedBrand.rows, dateRange) as EcomRow[]
    const sel = sumEcom(selRows)
    const allSums = allBrands.map((b) => sumEcom(filterByDateRange(b.rows, dateRange) as EcomRow[]))
    const vertAvgRoas = avg(allSums.map((s) => s.roas))
    const vertAvgCpa = avg(allSums.map((s) => s.cpa))
    const vertAvgCr = avg(allSums.map((s) => s.cr))
    const vertAvgRevenue = avg(allSums.map((s) => s.revenue))

    // ROAS vs average
    if (vertAvgRoas > 0) {
      const diff = ((sel.roas - vertAvgRoas) / vertAvgRoas) * 100
      if (Math.abs(diff) > 10) {
        insights.push({
          type: diff > 0 ? 'positive' : 'negative',
          text: `${selectedBrand.brand.name}'s ROAS (${fmt(sel.roas, 'ratio')}) is ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the eCommerce vertical average of ${fmt(vertAvgRoas, 'ratio')}.`,
        })
      }
    }

    // CPA vs average
    if (vertAvgCpa > 0) {
      const diff = ((sel.cpa - vertAvgCpa) / vertAvgCpa) * 100
      if (Math.abs(diff) > 10) {
        insights.push({
          type: diff < 0 ? 'positive' : 'negative',
          text: `CPA of ${fmt(sel.cpa, 'currency')} is ${Math.abs(diff).toFixed(0)}% ${diff < 0 ? 'lower' : 'higher'} than vertical average (${fmt(vertAvgCpa, 'currency')}) — ${diff < 0 ? 'strong efficiency' : 'review campaign targeting'}.`,
        })
      }
    }

    // Revenue vs average
    if (vertAvgRevenue > 0) {
      const diff = ((sel.revenue - vertAvgRevenue) / vertAvgRevenue) * 100
      if (Math.abs(diff) > 15) {
        insights.push({
          type: diff > 0 ? 'positive' : 'neutral',
          text: `Revenue (${fmt(sel.revenue, 'currency')}) is ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the vertical average.`,
        })
      }
    }

    // Top ROAS brand
    const topRoasBrand = allBrands[allSums.findIndex((s) => s.roas === Math.max(...allSums.map((x) => x.roas)))]
    if (topRoasBrand && topRoasBrand.brand.id !== selectedBrand.brand.id) {
      const topRoas = Math.max(...allSums.map((x) => x.roas))
      insights.push({
        type: 'neutral',
        text: `${topRoasBrand.brand.name} leads the vertical with the highest ROAS of ${fmt(topRoas, 'ratio')}.`,
      })
    }

    // CR insight
    if (vertAvgCr > 0) {
      const diff = ((sel.cr - vertAvgCr) / vertAvgCr) * 100
      if (Math.abs(diff) > 15) {
        insights.push({
          type: diff > 0 ? 'positive' : 'negative',
          text: `Conversion rate (${fmt(sel.cr, 'percent')}) is ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the eCommerce average of ${fmt(vertAvgCr, 'percent')}.`,
        })
      }
    }

    // Period growth
    if (dateRange !== 'all') {
      const halfRows = selRows.slice(Math.floor(selRows.length / 2))
      const firstRows = selRows.slice(0, Math.floor(selRows.length / 2))
      const curr = sumEcom(halfRows)
      const prev = sumEcom(firstRows)
      const growth = growthPercent(curr.revenue, prev.revenue)
      if (Math.abs(growth) > 5) {
        insights.push({
          type: growth > 0 ? 'positive' : 'negative',
          text: `Revenue ${growth > 0 ? 'grew' : 'declined'} ${Math.abs(growth).toFixed(0)}% in the second half of the selected period.`,
        })
      }
    }
  }

  if (vertical === 'hospital') {
    const selRows = filterByDateRange(selectedBrand.rows, dateRange) as HospitalRow[]
    const sel = sumHospital(selRows)
    const allSums = allBrands.map((b) => sumHospital(filterByDateRange(b.rows, dateRange) as HospitalRow[]))
    const vertAvgCpl = avg(allSums.map((s) => s.cpl))
    const vertAvgCpql = avg(allSums.map((s) => s.cpql))
    const vertAvgQual = avg(allSums.map((s) => s.qualPercent))
    const vertAvgLeads = avg(allSums.map((s) => s.leads))

    // CPL vs average
    if (vertAvgCpl > 0) {
      const diff = ((sel.cpl - vertAvgCpl) / vertAvgCpl) * 100
      if (Math.abs(diff) > 10) {
        insights.push({
          type: diff < 0 ? 'positive' : 'negative',
          text: `CPL of ${fmt(sel.cpl, 'currency')} is ${Math.abs(diff).toFixed(0)}% ${diff < 0 ? 'below' : 'above'} the Hospital vertical average of ${fmt(vertAvgCpl, 'currency')}.`,
        })
      }
    }

    // CPQL vs average
    if (vertAvgCpql > 0) {
      const diff = ((sel.cpql - vertAvgCpql) / vertAvgCpql) * 100
      if (Math.abs(diff) > 10) {
        insights.push({
          type: diff < 0 ? 'positive' : 'negative',
          text: `CPQL (${fmt(sel.cpql, 'currency')}) is ${Math.abs(diff).toFixed(0)}% ${diff < 0 ? 'below' : 'above'} vertical average — ${diff < 0 ? 'excellent lead quality efficiency' : 'lead quality needs attention'}.`,
        })
      }
    }

    // Qual% vs average
    if (vertAvgQual > 0) {
      const diff = ((sel.qualPercent - vertAvgQual) / vertAvgQual) * 100
      if (Math.abs(diff) > 10) {
        insights.push({
          type: diff > 0 ? 'positive' : 'negative',
          text: `Lead quality rate (${fmt(sel.qualPercent, 'percent')}) is ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the vertical average of ${fmt(vertAvgQual, 'percent')}.`,
        })
      }
    }

    // Top leads brand
    const topLeadsBrand = allBrands[allSums.findIndex((s) => s.leads === Math.max(...allSums.map((x) => x.leads)))]
    if (topLeadsBrand && topLeadsBrand.brand.id !== selectedBrand.brand.id) {
      insights.push({
        type: 'neutral',
        text: `${topLeadsBrand.brand.name} generated the most leads in the Hospital vertical.`,
      })
    }

    // Leads vs average
    if (vertAvgLeads > 0) {
      const diff = ((sel.leads - vertAvgLeads) / vertAvgLeads) * 100
      if (Math.abs(diff) > 15) {
        insights.push({
          type: diff > 0 ? 'positive' : 'neutral',
          text: `Total leads (${sel.leads.toLocaleString()}) are ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the Hospital vertical average.`,
        })
      }
    }
  }

  if (vertical === 'other') {
    const selRows = filterByDateRange(selectedBrand.rows, dateRange) as OtherRow[]
    const sel = sumOther(selRows)
    const allSums = allBrands.map((b) => sumOther(filterByDateRange(b.rows, dateRange) as OtherRow[]))
    const vertAvgRoas = avg(allSums.map((s) => s.roas))

    if (vertAvgRoas > 0) {
      const diff = ((sel.roas - vertAvgRoas) / vertAvgRoas) * 100
      insights.push({
        type: diff > 0 ? 'positive' : diff < -10 ? 'negative' : 'neutral',
        text: `ROAS of ${fmt(sel.roas, 'ratio')} is ${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} the Other vertical average.`,
      })
    }
  }

  return insights.slice(0, 5)
}
