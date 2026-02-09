'use client'

import { useFilters } from '@/hooks/useFilters'
import { USAGE_TYPES, REGIONS, FACILITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  onRemove: () => void
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm text-blue-800">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
        aria-label={`Fjern ${label}`}
      >
        <svg
          className="h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

function findLabel(
  value: string,
  options: readonly { value: string; label: string }[]
): string {
  return options.find((o) => o.value === value)?.label ?? value
}

interface FilterChipsProps {
  className?: string
}

export function FilterChips({ className }: FilterChipsProps) {
  const { filters, setFilters, resetFilters } = useFilters()

  const chips: { key: string; label: string; onRemove: () => void }[] = []

  // Usage chips
  if (filters.usage?.length) {
    for (const val of filters.usage) {
      chips.push({
        key: `usage-${val}`,
        label: findLabel(val, USAGE_TYPES),
        onRemove: () =>
          setFilters({
            usage: filters.usage!.filter((v) => v !== val),
          }),
      })
    }
  }

  // Region chips
  if (filters.regions?.length) {
    for (const val of filters.regions) {
      chips.push({
        key: `region-${val}`,
        label: findLabel(val, REGIONS),
        onRemove: () =>
          setFilters({
            regions: filters.regions!.filter((v) => v !== val),
          }),
      })
    }
  }

  // Area range chip
  if (filters.minArea || filters.maxArea) {
    const parts: string[] = []
    if (filters.minArea) parts.push(`fra ${filters.minArea}`)
    if (filters.maxArea) parts.push(`til ${filters.maxArea}`)
    chips.push({
      key: 'area',
      label: `Areal: ${parts.join(' ')} m²`,
      onRemove: () => setFilters({ minArea: undefined, maxArea: undefined }),
    })
  }

  // Price range chip
  if (filters.minPrice || filters.maxPrice) {
    const parts: string[] = []
    if (filters.minPrice) parts.push(`fra ${filters.minPrice.toLocaleString('da-DK')}`)
    if (filters.maxPrice) parts.push(`til ${filters.maxPrice.toLocaleString('da-DK')}`)
    chips.push({
      key: 'price',
      label: `Pris: ${parts.join(' ')} DKK`,
      onRemove: () => setFilters({ minPrice: undefined, maxPrice: undefined }),
    })
  }

  // Yield range chip
  if (filters.minYield || filters.maxYield) {
    const parts: string[] = []
    if (filters.minYield) parts.push(`fra ${filters.minYield}`)
    if (filters.maxYield) parts.push(`til ${filters.maxYield}`)
    chips.push({
      key: 'yield',
      label: `Afkast: ${parts.join(' ')}%`,
      onRemove: () => setFilters({ minYield: undefined, maxYield: undefined }),
    })
  }

  // Facility chips
  if (filters.facilities?.length) {
    for (const val of filters.facilities) {
      chips.push({
        key: `facility-${val}`,
        label: findLabel(val, FACILITIES),
        onRemove: () =>
          setFilters({
            facilities: filters.facilities!.filter((v) => v !== val),
          }),
      })
    }
  }

  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-blue-700 transition-colors ml-1"
        >
          Ryd alle
        </button>
      )}
    </div>
  )
}
