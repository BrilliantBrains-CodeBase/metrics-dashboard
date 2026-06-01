'use client'
import { Brand } from '@/types'

interface Props {
  brands: Brand[]
  selected: Brand | null
  onChange: (b: Brand) => void
}

export default function BrandSelector({ brands, selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-500 shrink-0">Brand</span>
      <div className="relative">
        <select
          value={selected?.id ?? ''}
          onChange={(e) => {
            const brand = brands.find((b) => b.id === e.target.value)
            if (brand) onChange(brand)
          }}
          className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-semibold text-gray-800 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 hover:border-gray-300 transition-colors min-w-[200px]"
        >
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
