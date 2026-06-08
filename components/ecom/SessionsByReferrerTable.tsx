'use client'
import { useState } from 'react'
import { ReferrerRow } from '@/types/shopify-analytics'

const DEFAULT_VISIBLE = 5

interface Props {
  rows:    ReferrerRow[]
  loading: boolean
}

export default function SessionsByReferrerTable({ rows, loading }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (loading) return <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />

  if (!rows || rows.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-32">
      No referrer data
    </div>
  )

  const max     = rows[0]?.sessions ?? 1
  const visible = expanded ? rows : rows.slice(0, DEFAULT_VISIBLE)
  const hidden  = rows.length - DEFAULT_VISIBLE

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-dashed border-gray-100">
        Sessions by social referrer
      </h3>
      <div className="space-y-3">
        {visible.map((r, i) => {
          const pct = (r.sessions / max) * 100
          return (
            <div key={i}>
              <p className="text-xs text-gray-500 mb-1">{r.source}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right shrink-0">{r.sessions}</span>
              </div>
            </div>
          )
        })}
      </div>
      {rows.length > DEFAULT_VISIBLE && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full text-xs font-medium text-indigo-500 hover:text-indigo-700 py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50/50 transition-colors"
        >
          {expanded ? 'View less' : `View ${hidden} more`}
        </button>
      )}
    </div>
  )
}
