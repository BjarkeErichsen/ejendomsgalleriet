'use client'

import { SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SortDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
        Sortér efter:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700 cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
