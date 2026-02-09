import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ImageGallery } from '@/components/listings/ImageGallery'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatArea, formatYield, getUsageLabel, getEnergyLabelColor, getListingPrice, getListingPriceLabel } from '@/lib/utils'
import { FACILITIES } from '@/lib/constants'
import type { Listing } from '@/lib/types'

const PropertyMap = dynamic(
  () => import('@/components/listings/PropertyMap').then(mod => ({ default: mod.PropertyMap })),
  { ssr: false, loading: () => <div className="bg-gray-100 rounded-lg h-64 animate-pulse" /> }
)

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, listing_images(*), listing_facilities(*), listing_documents(*)')
    .eq('id', params.id)
    .single()

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ejendom ikke fundet</h1>
        <p className="text-gray-600 mb-6">Denne ejendom findes ikke eller er blevet fjernet.</p>
        <Link href="/soeg" className="text-blue-700 font-medium hover:underline">
          ← Tilbage til søgning
        </Link>
      </div>
    )
  }

  const l = listing as Listing
  const photos = (l.listing_images || []).filter(img => img.type === 'photo').sort((a, b) => a.sort_order - b.sort_order)
  const floorplans = (l.listing_images || []).filter(img => img.type === 'floorplan')
  const facilities = l.listing_facilities || []
  const documents = l.listing_documents || []

  const transactionBadgeVariant = l.transaction_type === 'leje' ? 'blue' : l.transaction_type === 'salg' ? 'blue' : 'orange'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/soeg" className="hover:text-blue-700">Søg</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{l.title || l.address_street}</span>
      </nav>

      {/* Image Gallery */}
      <ImageGallery images={photos.length > 0 ? photos : floorplans} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={transactionBadgeVariant}>
                {l.transaction_type === 'leje' ? 'Til leje' : l.transaction_type === 'salg' ? 'Til salg' : 'Investering'}
              </Badge>
              <Badge>{getUsageLabel(l.primary_usage)}</Badge>
              {l.energy_label && (
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: getEnergyLabelColor(l.energy_label) }}
                >
                  {l.energy_label.charAt(0)}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {l.title || `${getUsageLabel(l.primary_usage)} på ${l.address_street}`}
            </h1>
            <p className="text-lg text-gray-600">
              {l.address_street}, {l.address_postal_code} {l.address_city}
            </p>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">{getListingPriceLabel(l)}</p>
              <p className="text-xl font-bold text-gray-900">{getListingPrice(l)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Areal</p>
              <p className="text-xl font-bold text-gray-900">{formatArea(l.primary_area_m2)}</p>
            </div>
            {l.price_per_m2_dkk && (
              <div>
                <p className="text-sm text-gray-500">Pris pr. m²</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(l.price_per_m2_dkk)}</p>
              </div>
            )}
            {l.yield_percent && (
              <div>
                <p className="text-sm text-gray-500">Afkast</p>
                <p className="text-xl font-bold text-blue-700">{formatYield(l.yield_percent)}</p>
              </div>
            )}
            {l.secondary_area_m2 && (
              <div>
                <p className="text-sm text-gray-500">Sekundært areal</p>
                <p className="text-lg font-semibold text-gray-900">{formatArea(l.secondary_area_m2)}</p>
              </div>
            )}
            {l.plot_area_m2 && (
              <div>
                <p className="text-sm text-gray-500">Grundareal</p>
                <p className="text-lg font-semibold text-gray-900">{formatArea(l.plot_area_m2)}</p>
              </div>
            )}
          </div>

          {/* Rent details */}
          {l.transaction_type === 'leje' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Lejedetaljer</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {l.monthly_rent_dkk && <div><span className="text-gray-500">Månedlig leje:</span> <span className="font-medium">{formatCurrency(l.monthly_rent_dkk)}</span></div>}
                {l.annual_rent_dkk && <div><span className="text-gray-500">Årlig leje:</span> <span className="font-medium">{formatCurrency(l.annual_rent_dkk)}</span></div>}
                {l.operating_costs_monthly && <div><span className="text-gray-500">Drift pr. md.:</span> <span className="font-medium">{formatCurrency(l.operating_costs_monthly)}</span></div>}
                {l.operating_costs_annual && <div><span className="text-gray-500">Drift pr. år:</span> <span className="font-medium">{formatCurrency(l.operating_costs_annual)}</span></div>}
                {l.deposit_dkk && <div><span className="text-gray-500">Depositum:</span> <span className="font-medium">{formatCurrency(l.deposit_dkk)}</span></div>}
                {l.deposit_months && <div><span className="text-gray-500">Depositum:</span> <span className="font-medium">{l.deposit_months} måneder</span></div>}
              </div>
            </div>
          )}

          {/* Description */}
          {l.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Beskrivelse</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{l.description}</div>
            </div>
          )}

          {/* Facilities */}
          {facilities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Faciliteter</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilities.map((f) => {
                  const label = FACILITIES.find(fac => fac.value === f.facility)?.label || f.facility
                  return (
                    <div key={f.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contract terms */}
          {(l.handover_condition || l.notice_period_months || l.sublease_right !== null) && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Kontraktforhold</h2>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {l.handover_condition && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-500 font-medium">Overtagelsestilstand</td>
                        <td className="px-4 py-3 text-gray-900">{l.handover_condition}</td>
                      </tr>
                    )}
                    {l.vacating_condition && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-500 font-medium">Fraflytningstand</td>
                        <td className="px-4 py-3 text-gray-900">{l.vacating_condition}</td>
                      </tr>
                    )}
                    {(l.notice_period_months || l.notice_period_years) && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-500 font-medium">Opsigelsesvarsel</td>
                        <td className="px-4 py-3 text-gray-900">
                          {l.notice_period_years ? `${l.notice_period_years} år ` : ''}{l.notice_period_months ? `${l.notice_period_months} måneder` : ''}
                        </td>
                      </tr>
                    )}
                    {l.sublease_right !== null && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-500 font-medium">Fremlejeret</td>
                        <td className="px-4 py-3 text-gray-900">{l.sublease_right ? 'Ja' : 'Nej'}</td>
                      </tr>
                    )}
                    {l.transfer_right !== null && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-gray-500 font-medium">Afståelsesret</td>
                        <td className="px-4 py-3 text-gray-900">{l.transfer_right ? 'Ja' : 'Nej'}</td>
                      </tr>
                    )}
                    {l.rent_adjustment && (
                      <tr>
                        <td className="px-4 py-3 text-gray-500 font-medium">Lejeregulering</td>
                        <td className="px-4 py-3 text-gray-900">{l.rent_adjustment}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Map */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kort</h2>
            <PropertyMap
              latitude={l.latitude}
              longitude={l.longitude}
              address={`${l.address_street}, ${l.address_postal_code} ${l.address_city}`}
              priceLabel={getListingPriceLabel(l)}
              priceText={getListingPrice(l)}
            />
          </div>

          {/* Video */}
          {l.video_url && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Video</h2>
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={l.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right column (1/3) — Contact card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Contact card */}
            <div className="bg-white border-2 border-blue-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{l.contact_name}</p>
                  {l.contact_company && <p className="text-sm text-gray-500">{l.contact_company}</p>}
                </div>
                {l.contact_phone && (
                  <a href={`tel:${l.contact_phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {l.contact_phone}
                  </a>
                )}
                {l.contact_email && (
                  <a href={`mailto:${l.contact_email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {l.contact_email}
                  </a>
                )}
              </div>
              <a
                href={`mailto:${l.contact_email}?subject=Henvendelse vedr. ${l.title || l.address_street}`}
                className="mt-5 w-full inline-flex items-center justify-center px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition-colors"
              >
                Send besked
              </a>
            </div>

            {/* Price box */}
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">{getListingPriceLabel(l)}</p>
              <p className="text-2xl font-bold text-gray-900">{getListingPrice(l)}</p>
              {l.transaction_type === 'leje' && l.primary_area_m2 && l.annual_rent_dkk && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(Math.round(l.annual_rent_dkk / l.primary_area_m2))} pr. m²/år
                </p>
              )}
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dokumenter</h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-700 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
