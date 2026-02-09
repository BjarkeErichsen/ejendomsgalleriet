'use client'

import { useState, FormEvent } from 'react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  initialQuery?: string
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ initialQuery = '', onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="flex items-stretch rounded-lg shadow-lg overflow-hidden border border-gray-200">
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søg på adresse, by eller postnummer..."
            className="w-full h-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-700 text-white px-8 py-4 text-lg font-medium hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
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
  )
}
