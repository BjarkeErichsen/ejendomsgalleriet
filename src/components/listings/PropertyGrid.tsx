import type { Listing } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PropertyCard } from '@/components/listings/PropertyCard'

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[16/10] w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-5 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  )
}

interface PropertyGridProps {
  listings: Listing[]
  loading?: boolean
  className?: string
}

export function PropertyGrid({ listings, loading = false, className }: PropertyGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <svg
          className="h-16 w-16 text-gray-300 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Ingen ejendomme fundet</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          Prøv at ændre dine søgekriterier eller fjern nogle filtre for at se flere resultater.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
