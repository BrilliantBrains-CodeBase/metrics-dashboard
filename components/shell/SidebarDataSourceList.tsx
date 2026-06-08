'use client'
import Image from 'next/image'
import { DataSource, Vertical } from '@/types'

const SOURCES: Record<Vertical, { id: DataSource; label: string; logo: string }[]> = {
  ecommerce: [
    { id: 'shopify',    label: 'Shopify',    logo: '/logos/shopify.svg' },
    { id: 'google-ads', label: 'Google Ads', logo: '/logos/google-ads.svg' },
    { id: 'meta-ads',   label: 'Meta Ads',   logo: '/logos/meta.svg' },
    { id: 'interakt',   label: 'Interakt',   logo: '/logos/whatsapp.svg' },
  ],
  hospital: [{ id: 'meta-ads', label: 'Meta Ads', logo: '/logos/meta.svg' }],
  other:    [{ id: 'meta-ads', label: 'Meta Ads', logo: '/logos/meta.svg' }],
}

interface Props {
  vertical:       Vertical
  activeSource:   DataSource
  onSourceChange: (ds: DataSource) => void
  collapsed:      boolean
}

export default function SidebarDataSourceList({ vertical, activeSource, onSourceChange, collapsed }: Props) {
  const sources = SOURCES[vertical]
  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {sources.map((src) => {
        const active = activeSource === src.id
        return (
          <button
            key={src.id}
            onClick={() => onSourceChange(src.id)}
            title={collapsed ? src.label : undefined}
            className={`flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            } ${collapsed ? 'justify-center' : 'pl-8'}`}
          >
            <span className="shrink-0 w-4 h-4 rounded overflow-hidden flex items-center justify-center bg-white">
              <Image src={src.logo} alt="" width={16} height={16} className="w-full h-full object-contain" />
            </span>
            {!collapsed && <span>{src.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
