'use client'
import { DataSource, DateRange, Vertical } from '@/types'
import DateRangeFilter from '@/components/DateRangeFilter'

const VERTICAL_LABELS: Record<Vertical, string> = {
  ecommerce: 'Ecommerce',
  hospital:  'Healthcare',
  other:     'Other',
}

const SOURCE_LABELS: Record<DataSource, string> = {
  'shopify':    'Shopify',
  'meta':       'Meta Ads',
  'google-ads': 'Google Ads',
  'meta-ads':   'Meta Ads',
  'interakt':   'Interakt',
}

interface Props {
  vertical:          Vertical
  brandName:         string
  dataSource:        DataSource
  dateRange:         DateRange
  onDateRangeChange: (r: DateRange) => void
  loading:           boolean
  onMenuToggle:      () => void
}

export default function TopBar({ vertical, brandName, dataSource, dateRange, onDateRangeChange, loading, onMenuToggle }: Props) {
  return (
    <header className="shrink-0 h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-4">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-50"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-gray-400 shrink-0">{VERTICAL_LABELS[vertical]}</span>
        <span className="text-gray-200">/</span>
        <span className="text-gray-700 font-medium truncate">{brandName}</span>
        <span className="text-gray-200">/</span>
        <span className="text-blue-600 font-semibold shrink-0">{SOURCE_LABELS[dataSource]}</span>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Loading indicator */}
      {loading && (
        <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Loading…
        </span>
      )}

      {/* Date range filter */}
      <div className="shrink-0">
        <DateRangeFilter selected={dateRange} onChange={onDateRangeChange} />
      </div>
    </header>
  )
}
