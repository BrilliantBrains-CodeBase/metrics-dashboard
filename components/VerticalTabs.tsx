'use client'
import { Vertical } from '@/types'

const TABS: { id: Vertical; label: string }[] = [
  { id: 'ecommerce', label: 'eCommerce' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'other', label: 'Other' },
]

interface Props {
  selected: Vertical
  onChange: (v: Vertical) => void
}

export default function VerticalTabs({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
            selected === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
