'use client'
import { DateRange } from '@/types'

const OPTIONS: { id: DateRange; label: string }[] = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'all', label: 'All time' },
]

interface Props {
  selected: DateRange
  onChange: (r: DateRange) => void
}

export default function DateRangeFilter({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500">Period</span>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
              selected === opt.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
