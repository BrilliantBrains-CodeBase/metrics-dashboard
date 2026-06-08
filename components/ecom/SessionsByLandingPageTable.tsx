'use client'
import { useState } from 'react'
import { LandingPageRow } from '@/types/shopify-analytics'

const DEFAULT_VISIBLE = 5

interface Props {
  rows:    LandingPageRow[]
  loading: boolean
}

export default function SessionsByLandingPageTable({ rows, loading }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (loading) return <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />

  if (!rows || rows.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-32">
      No landing page data
    </div>
  )

  const visible = expanded ? rows : rows.slice(0, DEFAULT_VISIBLE)
  const hidden  = rows.length - DEFAULT_VISIBLE

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-dashed border-gray-100">
        Sessions by landing page
      </h3>
      <div className="space-y-0.5">
        {visible.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${i % 2 === 0 ? 'bg-gray-50/60' : ''}`}
          >
            <span className="text-xs text-gray-400 font-medium w-4 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              {r.pageType && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">{r.pageType}</p>
              )}
              <p className="text-xs text-gray-600 truncate">{r.url}</p>
            </div>
            <span className="text-sm font-bold text-gray-800 shrink-0">{r.sessions}</span>
          </div>
        ))}
      </div>
      {rows.length > DEFAULT_VISIBLE && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-xs font-medium text-indigo-500 hover:text-indigo-700 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50/50 transition-colors"
        >
          {expanded ? 'View less' : `View ${hidden} more`}
        </button>
      )}
    </div>
  )
}
