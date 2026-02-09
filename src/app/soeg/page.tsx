'use client'

import { Suspense, useState } from 'react'
import { useFilters } from '@/hooks/useFilters'
import { useListings } from '@/hooks/useListings'
import { Tabs } from '@/components/ui/Tabs'
import { FilterPanel } from '@/components/search/FilterPanel'
import { FilterChips } from '@/components/search/FilterChips'
import { SortDropdown } from '@/components/search/SortDropdown'
import { SearchBarWithAutocomplete } from '@/components/search/SearchBarWithAutocomplete'
import { PropertyGrid } from '@/components/listings/PropertyGrid'
import { TRANSACTION_TYPES, ITEMS_PER_PAGE } from '@/lib/constants'

function SearchPageContent() {
  const { filters, setFilters } = useFilters()
  const { listings, count, loading } = useListings(filters)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE)
  const currentPage = filters.page || 1

  const transactionTabs = [
    { value: '', label: 'Alle' },
    ...TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label })),
  ]

  function handlePageChange(page: number) {
    setFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBarWithAutocomplete
          initialQuery={filters.query || ''}
          onSearch={(q) => setFilters({ query: q || undefined })}
        />
      </div>

      {/* Transaction type tabs */}
      <Tabs
        tabs={transactionTabs}
        activeTab={filters.type || ''}
        onChange={(value) =>
          setFilters({ type: (value as 'leje' | 'salg' | 'investering') || undefined })
        }
        className="mb-4"
      />

      {/* Active filter chips */}
      <FilterChips className="mb-4" />

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FilterPanel />
        </aside>

        {/* Mobile filter overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white overflow-y-auto shadow-xl z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Filtre</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Luk filtre"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <FilterPanel />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filtre
              </button>
              <p className="text-sm text-gray-600">
                {loading ? (
                  'Søger...'
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{count}</span>{' '}
                    {count === 1 ? 'ejendom fundet' : 'ejendomme fundet'}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SortDropdown
                value={filters.sort || 'relevans'}
                onChange={(value) => setFilters({ sort: value })}
              />

              {/* View toggle */}
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-green-700 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Listevisning"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-colors ${
                    viewMode === 'map'
                      ? 'bg-green-700 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Kortvisning"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {viewMode === 'list' ? (
            <PropertyGrid listings={listings} loading={loading} />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-sm font-medium">Kortvisning</p>
                <p className="text-xs mt-1">Kortet vises her, når det er tilgængeligt</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forrige
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number
                if (totalPages <= 7) {
                  page = i + 1
                } else if (currentPage <= 4) {
                  page = i + 1
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i
                } else {
                  page = currentPage - 3 + i
                }
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-green-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Næste
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
