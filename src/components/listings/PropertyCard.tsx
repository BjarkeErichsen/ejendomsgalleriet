import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'
import {
  cn,
  formatArea,
  formatYield,
  getUsageLabel,
  getListingPrice,
  getListingPriceLabel,
} from '@/lib/utils'

const transactionBadgeStyles: Record<string, string> = {
  leje: 'bg-green-100 text-green-800',
  salg: 'bg-blue-100 text-blue-800',
  investering: 'bg-orange-100 text-orange-800',
}

const transactionLabels: Record<string, string> = {
  leje: 'Leje',
  salg: 'Salg',
  investering: 'Investering',
}

interface PropertyCardProps {
  listing: Listing
  className?: string
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
  const photos = listing.listing_images?.filter((img) => img.type === 'photo') ?? []
  const primaryImage = photos.length > 0 ? photos.sort((a, b) => a.sort_order - b.sort_order)[0] : null
  const address = `${listing.address_street}, ${listing.address_postal_code} ${listing.address_city}`

  return (
    <Link
      href={`/ejendom/${listing.id}`}
      className={cn(
        'group block rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={listing.title ?? address}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
            Ingen billede
          </div>
        )}

        {/* Badges overlaid on image */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-gray-800 shadow-sm">
            {getUsageLabel(listing.primary_usage)}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm',
              transactionBadgeStyles[listing.transaction_type] ?? 'bg-gray-100 text-gray-800'
            )}
          >
            {transactionLabels[listing.transaction_type] ?? listing.transaction_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Address */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">
          {address}
        </h3>

        {/* Details row */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{formatArea(listing.primary_area_m2)}</span>
          {listing.transaction_type === 'investering' && listing.yield_percent != null && (
            <>
              <span className="text-gray-300">|</span>
              <span>Afkast: {formatYield(listing.yield_percent)}</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold text-gray-900">{getListingPrice(listing)}</span>
          <span className="text-xs text-gray-500">{getListingPriceLabel(listing)}</span>
        </div>
      </div>
    </Link>
  )
}
