'use client'

import { cn } from '@/lib/utils'

interface RangeSliderProps {
  label: string
  minValue?: number | string
  maxValue?: number | string
  onChange: (min: string, max: string) => void
  unit?: string
  className?: string
}

export function RangeSlider({
  label,
  minValue = '',
  maxValue = '',
  onChange,
  unit,
  className,
}: RangeSliderProps) {
  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={minValue}
            onChange={(e) => onChange(e.target.value, String(maxValue))}
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {unit}
            </span>
          )}
        </div>
        <span className="text-gray-400">–</span>
        <div className="relative flex-1">
          <input
            type="number"
            value={maxValue}
            onChange={(e) => onChange(String(minValue), e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
