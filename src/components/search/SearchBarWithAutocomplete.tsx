'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { searchLocations } from '@/lib/dawa'

interface LocationSuggestion {
  text: string
  type: 'adresse' | 'postnummer' | 'by'
  data: { postalCode?: string; city?: string; street?: string; region?: string }
}

interface SearchBarWithAutocompleteProps {
  initialQuery?: string
  onSearch?: (query: string) => void
  className?: string
  /** If true, renders as a standalone hero search (larger styling) */
  hero?: boolean
}

export function SearchBarWithAutocomplete({
  initialQuery = '',
  onSearch,
  className,
  hero = false,
}: SearchBarWithAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const results = await searchLocations(q, 7)
      const mapped: LocationSuggestion[] = results.map(r => {
        const d = r.data as Record<string, unknown>
        return {
          text: r.text,
          type: r.type,
          data: {
            postalCode: d.postalCode as string | undefined,
            city: d.city as string | undefined,
            street: d.street as string | undefined,
            region: d.region as string | undefined,
          },
        }
      })
      setSuggestions(mapped)
      setIsOpen(mapped.length > 0)
      setLoading(false)
      setHighlightIndex(-1)
    }, 200)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    doSearch(val)
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setIsOpen(false)
    const trimmed = query.trim()
    if (onSearch) {
      onSearch(trimmed)
    } else {
      router.push(`/soeg?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleSelect(suggestion: LocationSuggestion) {
    setIsOpen(false)
    setHighlightIndex(-1)

    // Navigate to search with the selected suggestion
    const params = new URLSearchParams()
    if (suggestion.type === 'postnummer' && suggestion.data.postalCode) {
      params.set('q', `${suggestion.data.postalCode} ${suggestion.data.city || ''}`.trim())
    } else {
      params.set('q', suggestion.text)
    }

    if (onSearch) {
      onSearch(params.get('q') || '')
      setQuery(params.get('q') || '')
    } else {
      router.push(`/soeg?${params.toString()}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0) {
        handleSelect(suggestions[highlightIndex])
      } else {
        handleSubmit()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightIndex(-1)
    }
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const typeIcons: Record<string, string> = {
    adresse: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    postnummer: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    by: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  }

  const typeLabels: Record<string, string> = {
    adresse: 'Adresse',
    postnummer: 'Postnummer',
    by: 'By',
  }

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div className={cn(
          'flex items-stretch overflow-hidden border border-gray-200',
          hero ? 'rounded-lg shadow-xl' : 'rounded-lg shadow-lg'
        )}>
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
              placeholder="Søg på adresse, by eller postnummer..."
              className={cn(
                'w-full h-full pl-12 pr-4 text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0',
                hero ? 'py-4 text-lg bg-white' : 'py-3 text-base bg-white'
              )}
              autoComplete="off"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-700" />
              </div>
            )}
          </div>
          <button
            type="submit"
            className={cn(
              'flex items-center gap-2 bg-blue-700 text-white font-medium hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2',
              hero ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
            )}
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span className="hidden sm:inline">Søg</span>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-72 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const iconPath = typeIcons[suggestion.type] || typeIcons.adresse
            return (
              <button
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                type="button"
                className={cn(
                  'w-full text-left px-4 py-3 text-sm transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0',
                  index === highlightIndex
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <svg
                  className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{suggestion.text}</span>
                  <span className="text-xs text-gray-400">{typeLabels[suggestion.type]}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
