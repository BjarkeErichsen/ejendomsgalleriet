import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUsageLabel, getListingPrice, getListingPriceLabel, formatArea } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Listing } from '@/lib/types'

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  const typedListings = (listings as Listing[] | null) ?? []

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Find din n&aelig;ste erhvervsejendom
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            S&oslash;g blandt tusindvis af erhvervslokaler til leje, salg og investering i hele Danmark
          </p>
          <form action="/soeg" method="GET" className="max-w-2xl mx-auto">
            <div className="flex items-stretch rounded-lg shadow-xl overflow-hidden">
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
                  name="q"
                  placeholder="S&oslash;g p&aring; adresse, by eller postnummer..."
                  className="w-full h-full pl-12 pr-4 py-4 text-lg text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0 bg-white"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-700 text-white px-8 py-4 text-lg font-medium hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
                <span className="hidden sm:inline">S&oslash;g</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Transaction Type Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            Udforsk erhvervsejendomme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leje Card */}
            <Link
              href="/soeg?type=leje"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                Leje
              </h3>
              <p className="text-gray-600 mb-4">
                Find erhvervslokaler til leje. Kontor, butik, lager og mere i hele Danmark.
              </p>
              <span className="text-green-700 font-medium text-sm group-hover:underline">
                Se lejem&aring;l &rarr;
              </span>
            </Link>

            {/* Salg Card */}
            <Link
              href="/soeg?type=salg"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                Salg
              </h3>
              <p className="text-gray-600 mb-4">
                K&oslash;b erhvervsejendomme. Find den rigtige ejendom til din virksomhed.
              </p>
              <span className="text-green-700 font-medium text-sm group-hover:underline">
                Se ejendomme til salg &rarr;
              </span>
            </Link>

            {/* Investering Card */}
            <Link
              href="/soeg?type=investering"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                Investering
              </h3>
              <p className="text-gray-600 mb-4">
                Investeringsejendomme med attraktive afkast. Find din n&aelig;ste investering.
              </p>
              <span className="text-green-700 font-medium text-sm group-hover:underline">
                Se investeringer &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Nyeste opslag
            </h2>
            <Link
              href="/soeg"
              className="text-green-700 font-medium hover:underline text-sm"
            >
              Se alle &rarr;
            </Link>
          </div>

          {typedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="relative h-48 bg-gray-100">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={listing.title || listing.address_street}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="green">
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
                          <p className="font-semibold text-green-700">{getListingPrice(listing)}</p>
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
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen opslag endnu</h3>
              <p className="text-gray-600 mb-6">V&aelig;r den f&oslash;rste til at oprette et opslag p&aring; platformen.</p>
              <Link
                href="/opret"
                className="inline-flex items-center justify-center bg-green-700 text-white px-6 py-3 rounded-md font-medium hover:bg-green-800 transition-colors"
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
