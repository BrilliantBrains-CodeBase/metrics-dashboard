'use client'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

interface CompBarEntry {
  name: string
  value: number
  isSelected: boolean
}

interface Props {
  data: CompBarEntry[]
  title: string
  unit?: 'currency' | 'percent' | 'ratio' | 'number'
  lowerIsBetter?: boolean
}

function fmtLabel(v: number, unit: Props['unit']): string {
  if (unit === 'currency') {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`
    return `₹${v.toFixed(0)}`
  }
  if (unit === 'percent') return `${v.toFixed(1)}%`
  if (unit === 'ratio') return `${v.toFixed(2)}x`
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toFixed(0)
}

export default function VerticalCompBar({ data, title, unit = 'number', lowerIsBetter = false }: Props) {
  if (data.length === 0) return null

  const values = data.map((d) => d.value)
  const best = lowerIsBetter ? Math.min(...values) : Math.max(...values)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmtLabel(v, unit)}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v) => [fmtLabel(Number(v), unit), title]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.isSelected
                    ? '#6366f1'
                    : entry.value === best
                    ? '#10b981'
                    : '#e5e7eb'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Best</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-200 inline-block" /> Others</span>
      </div>
    </div>
  )
}
