'use client'
import { NavState, Vertical } from '@/types'
import { BRANDS } from '@/config/brands'
import SidebarVerticalSection from './SidebarVerticalSection'

const VERTICALS: Vertical[] = ['ecommerce', 'hospital', 'other']

interface Props {
  navState:    NavState
  onNavChange: (n: NavState) => void
  isOpen:      boolean
  onToggle:    () => void
}

export default function AppSidebar({ navState, onNavChange, isOpen, onToggle }: Props) {
  return (
    <aside
      className={`shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-200 overflow-hidden ${
        isOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Logo strip */}
      <div className={`shrink-0 flex items-center gap-2.5 px-4 h-14 border-b border-gray-50 ${isOpen ? '' : 'justify-center'}`}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        {isOpen && (
          <span className="text-sm font-bold text-gray-900 truncate">Performance</span>
        )}
      </div>

      {/* Scrollable brand list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
        {VERTICALS.map((v) => (
          <SidebarVerticalSection
            key={v}
            vertical={v}
            brands={BRANDS.filter((b) => b.vertical === v)}
            navState={navState}
            onNavChange={onNavChange}
            collapsed={!isOpen}
          />
        ))}
      </div>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-gray-50 p-2">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-sm ${
            isOpen ? '' : 'justify-center'
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {isOpen && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
