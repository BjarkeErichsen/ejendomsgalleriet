'use client'

import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: { value: string; label: string }[]
  activeTab: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.value
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
