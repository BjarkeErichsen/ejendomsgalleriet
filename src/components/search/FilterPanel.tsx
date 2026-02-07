'use client'

import { useState, useCallback } from 'react'
import { useFilters } from '@/hooks/useFilters'
import { USAGE_TYPES, REGIONS, FACILITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { RangeSlider } from '@/components/ui/RangeSlider'
import { Button } from '@/components/ui/Button'

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({ title, defaultOpen = false, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-gray-900 hover:text-green-700 transition-colors"
      >
        <span>{title}</span>
        <span className="text-lg leading-none text-gray-500">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

interface CheckboxGroupProps {
  options: readonly { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}

function CheckboxGroup({ options, selected, onChange }: CheckboxGroupProps) {
  const toggle = useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value))
      } else {
        onChange([...selected, value])
      }
    },
    [selected, onChange]
  )

  return (
    <div className="space-y-1.5 max-h-60 overflow-y-auto">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
        >
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
            className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}

interface FilterPanelProps {
  className?: string
}

export function FilterPanel({ className }: FilterPanelProps) {
  const { filters, setFilters, resetFilters } = useFilters()

  const selectedUsage = filters.usage ?? []
  const selectedRegions = filters.regions ?? []
  const selectedFacilities = filters.facilities ?? []

  function handleApply() {
    // Filters are already applied via URL params on each change,
    // but this explicit button triggers a page=1 reset
    setFilters({ page: 1 })
  }

  return (
    <aside className={cn('w-full', className)}>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Filtre</h2>

        <FilterSection title="Anvendelser" defaultOpen>
          <CheckboxGroup
            options={USAGE_TYPES}
            selected={selectedUsage}
            onChange={(values) => setFilters({ usage: values.length ? values : undefined })}
          />
        </FilterSection>

        <FilterSection title="Beliggenhed" defaultOpen>
          <CheckboxGroup
            options={REGIONS}
            selected={selectedRegions}
            onChange={(values) => setFilters({ regions: values.length ? values : undefined })}
          />
        </FilterSection>

        <FilterSection title="Etageareal">
          <RangeSlider
            label=""
            minValue={filters.minArea ?? ''}
            maxValue={filters.maxArea ?? ''}
            onChange={(min, max) =>
              setFilters({
                minArea: min ? Number(min) : undefined,
                maxArea: max ? Number(max) : undefined,
              })
            }
            unit="m²"
          />
        </FilterSection>

        <FilterSection title="Grundareal">
          <RangeSlider
            label=""
            minValue={filters.minArea ?? ''}
            maxValue={filters.maxArea ?? ''}
            onChange={(min, max) =>
              setFilters({
                minArea: min ? Number(min) : undefined,
                maxArea: max ? Number(max) : undefined,
              })
            }
            unit="m²"
          />
        </FilterSection>

        <FilterSection title="Pris">
          <RangeSlider
            label=""
            minValue={filters.minPrice ?? ''}
            maxValue={filters.maxPrice ?? ''}
            onChange={(min, max) =>
              setFilters({
                minPrice: min ? Number(min) : undefined,
                maxPrice: max ? Number(max) : undefined,
              })
            }
            unit="DKK"
          />
        </FilterSection>

        <FilterSection title="Afkast">
          <RangeSlider
            label=""
            minValue={filters.minYield ?? ''}
            maxValue={filters.maxYield ?? ''}
            onChange={(min, max) =>
              setFilters({
                minYield: min ? Number(min) : undefined,
                maxYield: max ? Number(max) : undefined,
              })
            }
            unit="%"
          />
        </FilterSection>

        <FilterSection title="Faciliteter">
          <CheckboxGroup
            options={FACILITIES}
            selected={selectedFacilities}
            onChange={(values) => setFilters({ facilities: values.length ? values : undefined })}
          />
        </FilterSection>

        <div className="mt-4 space-y-2">
          <Button variant="primary" size="md" className="w-full" onClick={handleApply}>
            Søg
          </Button>
          <button
            type="button"
            onClick={resetFilters}
            className="w-full text-center text-sm text-gray-500 hover:text-green-700 transition-colors py-1"
          >
            Ryd filter
          </button>
        </div>
      </div>
    </aside>
  )
}
