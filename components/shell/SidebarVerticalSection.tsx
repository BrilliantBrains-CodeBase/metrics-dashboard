'use client'
import { useState } from 'react'
import { Brand, NavState, Vertical } from '@/types'
import SidebarBrandItem from './SidebarBrandItem'

const VERTICAL_LABELS: Record<Vertical, string> = {
  ecommerce: 'Ecommerce',
  hospital:  'Healthcare',
  other:     'Other',
}

interface Props {
  vertical:    Vertical
  brands:      Brand[]
  navState:    NavState
  onNavChange: (n: NavState) => void
  collapsed:   boolean
}

export default function SidebarVerticalSection({ vertical, brands, navState, onNavChange, collapsed }: Props) {
  const [isExpanded, setIsExpanded] = useState(navState.vertical === vertical)

  if (brands.length === 0) return null

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
            {VERTICAL_LABELS[vertical]}
          </span>
          <svg
            className={`w-3 h-3 text-gray-300 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {(isExpanded || collapsed) && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {brands.map((brand) => (
            <SidebarBrandItem
              key={brand.id}
              brand={brand}
              navState={navState}
              onNavChange={onNavChange}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
