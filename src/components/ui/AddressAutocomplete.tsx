'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DawaAddressSuggestion } from '@/lib/dawa'
import { searchAddresses, parseDawaAddress, getAddressDetails } from '@/lib/dawa'
import type { ParsedAddress } from '@/lib/dawa'

interface AddressAutocompleteProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onAddressSelect: (address: ParsedAddress) => void
  required?: boolean
  className?: string
}

export function AddressAutocomplete({
  label,
  placeholder = 'Skriv og vælg adresse fra listen',
  value,
  onChange,
  onAddressSelect,
  required,
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<DawaAddressSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Debounced search
  const doSearch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(query, 7)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setLoading(false)
      setHighlightIndex(-1)
    }, 200)
  }, [])

  // Handle input change
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    doSearch(val)
  }

  // Handle suggestion select
  async function handleSelect(suggestion: DawaAddressSuggestion) {
    const parsed = parseDawaAddress(suggestion)

    // Fetch coordinates
    const details = await getAddressDetails(suggestion.adresse.id)
    if (details?.adgangsadresse?.koordinater) {
      parsed.longitude = details.adgangsadresse.koordinater[0]
      parsed.latitude = details.adgangsadresse.koordinater[1]
    }

    onChange(parsed.street)
    onAddressSelect(parsed)
    setSuggestions([])
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[highlightIndex])
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-green-700" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.adresse.id}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-2',
                index === highlightIndex
                  ? 'bg-green-50 text-green-900'
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span>{suggestion.tekst}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
