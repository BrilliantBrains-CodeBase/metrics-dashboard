'use client'
import { Brand, NavState } from '@/types'
import SidebarDataSourceList from './SidebarDataSourceList'

interface Props {
  brand:       Brand
  navState:    NavState
  onNavChange: (n: NavState) => void
  collapsed:   boolean
}

export default function SidebarBrandItem({ brand, navState, onNavChange, collapsed }: Props) {
  const isActive = navState.brandId === brand.id

  return (
    <div>
      <button
        onClick={() => onNavChange({ vertical: brand.vertical, brandId: brand.id, dataSource: 'shopify' })}
        title={collapsed ? brand.name : undefined}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <span
          className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase ${
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {brand.name.slice(0, 2)}
        </span>
        {!collapsed && (
          <span className="truncate">{brand.name}</span>
        )}
      </button>

      {isActive && (
        <SidebarDataSourceList
          vertical={brand.vertical}
          activeSource={navState.dataSource}
          onSourceChange={(ds) => onNavChange({ ...navState, dataSource: ds })}
          collapsed={collapsed}
        />
      )}
    </div>
  )
}
