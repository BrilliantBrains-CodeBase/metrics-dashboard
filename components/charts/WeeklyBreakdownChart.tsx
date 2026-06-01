'use client'
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { WeekSummary } from '@/types'
import { fmt } from '@/lib/metrics'

interface Props {
  weeks: WeekSummary[]
  vertical: 'ecommerce' | 'hospital' | 'other'
}

function fmtY(v: number): string {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return String(v)
}

export default function WeeklyBreakdownChart({ weeks, vertical }: Props) {
  if (weeks.length === 0) return null

  const isEcom = vertical === 'ecommerce' || vertical === 'other'

  const data = weeks.map(w => ({
    name: w.label,
    ...(isEcom
      ? { Revenue: Math.round(w.revenue), ROAS: parseFloat(w.roas.toFixed(2)), CPA: Math.round(w.cpa) }
      : { Leads: w.leads, CPL: Math.round(w.cpl), 'Qual%': parseFloat(w.qualPercent.toFixed(1)) }
    ),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Breakdown</h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={fmtY}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => isEcom ? `${v}x` : `${v}%`}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v, name) => {
              const n = Number(v), s = String(name)
              if (s === 'Revenue' || s === 'CPA' || s === 'CPL') return [fmt(n, 'currency'), s]
              if (s === 'ROAS') return [`${n}x`, s]
              if (s === 'Qual%') return [`${n}%`, s]
              return [n.toLocaleString(), s]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {isEcom ? (
            <>
              <Bar yAxisId="left" dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} barSize={32} />
              <Line yAxisId="right" type="monotone" dataKey="ROAS" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            </>
          ) : (
            <>
              <Bar yAxisId="left" dataKey="Leads" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} barSize={32} />
              <Line yAxisId="right" type="monotone" dataKey="CPL" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
