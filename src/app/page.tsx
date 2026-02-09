import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUsageLabel, getListingPrice, getListingPriceLabel, formatArea } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { SearchBarWithAutocomplete } from '@/components/search/SearchBarWithAutocomplete'
import type { Listing } from '@/lib/types'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(9)

  const typedListings = (listings as Listing[] | null) ?? []

  return (
    <>
      {/* Compact Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
            Find din næste erhvervsejendom
          </h1>
          <p className="text-sm md:text-base text-blue-200 mb-6">
            Søg blandt erhvervslokaler til leje, salg og investering i hele Danmark
          </p>
          <SearchBarWithAutocomplete hero />
        </div>
      </section>

      {/* Compact Transaction Type Tabs */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 py-3">
            <Link
              href="/soeg?type=leje"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
              </svg>
              Leje
            </Link>
            <Link
              href="/soeg?type=salg"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salg
            </Link>
            <Link
              href="/soeg?type=investering"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Investering
            </Link>
            <Link
              href="/soeg"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Se alle →
            </Link>
          </div>
        </div>
      </section>

      {/* Listings — Prominent & High Up */}
      <section className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Nyeste opslag
            </h2>
            <Link
              href="/soeg"
              className="text-blue-700 font-medium hover:underline text-sm"
            >
              Se alle →
            </Link>
          </div>

          {typedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {typedListings.map((listing) => {
                const photos = listing.listing_images
                  ?.filter((img) => img.type === 'photo')
                  .sort((a, b) => a.sort_order - b.sort_order)
                const primaryImage = photos?.[0]

                return (
                  <Link
                    key={listing.id}
                    href={`/ejendom/${listing.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-56 bg-gray-100">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={listing.title || listing.address_street}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                          quality={90}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="blue">
                          {getUsageLabel(listing.primary_usage)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {listing.title || listing.address_street}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {listing.address_street}, {listing.address_postal_code} {listing.address_city}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{getListingPriceLabel(listing)}</p>
                          <p className="font-semibold text-blue-700">{getListingPrice(listing)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Areal</p>
                          <p className="font-medium text-gray-900">{formatArea(listing.primary_area_m2)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen opslag endnu</h3>
              <p className="text-gray-600 mb-6">Vær den første til at oprette et opslag på platformen.</p>
              <Link
                href="/opret"
                className="inline-flex items-center justify-center bg-blue-700 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 transition-colors"
              >
                Opret annonce
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
