'use client'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { AnyRow, Vertical } from '@/types'
import { filterByDateRange } from '@/lib/metrics'
import { DateRange } from '@/types'

interface Props {
  rows: AnyRow[]
  vertical: Vertical
  brandName: string
  dateRange: DateRange
}

function getMetric(row: AnyRow, vertical: Vertical): number {
  if (vertical === 'ecommerce') return (row as { revenue: number }).revenue ?? 0
  if (vertical === 'hospital') return (row as { leads: number }).leads ?? 0
  return (row as { revenue: number }).revenue ?? 0
}

function metricLabel(vertical: Vertical): string {
  if (vertical === 'ecommerce') return 'Revenue'
  if (vertical === 'hospital') return 'Leads'
  return 'Revenue'
}

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatYAxis(v: number): string {
  if (v >= 100000) return `${(v / 100000).toFixed(0)}L`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return String(v)
}

export default function TrendLine({ rows, vertical, brandName, dateRange }: Props) {
  const filtered = filterByDateRange(rows, dateRange)
  const data = filtered.map((r) => ({
    date: formatDate(r.date),
    value: getMetric(r, vertical),
  }))

  const label = metricLabel(vertical)
  const color = vertical === 'hospital' ? '#6366f1' : '#10b981'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        {brandName} - {label} Trend
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v) => {
              const val = Number(v)
              return vertical === 'ecommerce'
                ? [`₹${val.toLocaleString('en-IN')}`, label]
                : [val.toLocaleString(), label]
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
