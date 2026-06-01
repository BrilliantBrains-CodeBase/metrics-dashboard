'use client'
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { DayPoint } from '@/types'

interface Props {
  points: DayPoint[]
  primaryLabel: string
  secondaryLabel: string
  secondaryUnit: 'ratio' | 'currency' | 'percent'
  vertical: 'ecommerce' | 'hospital' | 'other'
}

function fmtCurrency(v: number): string {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return `${v.toFixed(0)}`
}

function fmtSecondary(v: number, unit: Props['secondaryUnit']): string {
  if (unit === 'ratio') return `${v.toFixed(2)}x`
  if (unit === 'currency') return `${fmtCurrency(v)}`
  return `${v.toFixed(1)}%`
}

export default function DailyPerformanceChart({ points, primaryLabel, secondaryLabel, secondaryUnit }: Props) {
  if (points.length === 0) return null

  const avgSecondary = points.reduce((s, p) => s + p.secondary, 0) / points.length

  const data = points.map(p => ({
    day: p.label,
    [primaryLabel]: Math.round(p.primary),
    [secondaryLabel]: parseFloat(p.secondary.toFixed(2)),
  }))

  // Color secondary line dots: red if below 75% of avg, green if above 125%
  const getDotColor = (val: number) => {
    if (val < avgSecondary * 0.75) return '#ef4444'
    if (val > avgSecondary * 1.25) return '#10b981'
    return '#6366f1'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Daily {secondaryLabel} vs {primaryLabel}</h3>
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Above avg
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Below avg
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data.length / 8)}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={fmtCurrency}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => fmtSecondary(v, secondaryUnit)}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v, name) => {
              const n = Number(v), s = String(name)
              if (s === primaryLabel) return [fmtCurrency(n), s]
              return [fmtSecondary(n, secondaryUnit), s]
            }}
          />
          <ReferenceLine
            yAxisId="right"
            y={parseFloat(avgSecondary.toFixed(2))}
            stroke="#d1d5db"
            strokeDasharray="4 3"
            label={{ value: `Avg ${fmtSecondary(avgSecondary, secondaryUnit)}`, position: 'right', fontSize: 9, fill: '#9ca3af' }}
          />
          <Bar yAxisId="left" dataKey={primaryLabel} fill="#e0e7ff" radius={[2, 2, 0, 0]} barSize={8} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={secondaryLabel}
            stroke="#6366f1"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props
              const color = getDotColor(payload[secondaryLabel])
              return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill={color} stroke="white" strokeWidth={1} />
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
