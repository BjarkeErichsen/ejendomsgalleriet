'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatArea, getUsageLabel } from '@/lib/utils'
import type { Listing } from '@/lib/types'

export default function MineOpslagPage() {
  const { user, loading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, listing_images(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setListings((data as Listing[]) || [])
      setLoading(false)
    }
    fetchListings()
  }, [user, supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette opslag?')) return
    await supabase.from('listing_facilities').delete().eq('listing_id', id)
    await supabase.from('listing_images').delete().eq('listing_id', id)
    await supabase.from('listing_documents').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mine opslag</h1>
        <Button href="/opret">Opret ny annonce</Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ingen opslag endnu</h2>
          <p className="text-gray-500 mb-6">Du har ikke oprettet nogen opslag endnu.</p>
          <Button href="/opret">Opret dit første opslag</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const firstImage = listing.listing_images?.find(img => img.type === 'photo')
            return (
              <div key={listing.id} className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="w-32 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {firstImage ? (
                    <img src={firstImage.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Intet billede
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {listing.title || listing.address_street || 'Uden titel'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {listing.address_street}, {listing.address_postal_code} {listing.address_city}
                      </p>
                    </div>
                    <Badge variant={listing.status === 'published' ? 'blue' : 'default'}>
                      {listing.status === 'published' ? 'Publiceret' : 'Kladde'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{getUsageLabel(listing.primary_usage)}</span>
                    <span>{formatArea(listing.primary_area_m2)}</span>
                    <span>
                      {listing.transaction_type === 'salg'
                        ? formatCurrency(listing.sale_price_dkk)
                        : formatCurrency(listing.annual_rent_dkk || listing.monthly_rent_dkk)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href={`/ejendom/${listing.id}`}
                      className="text-sm text-blue-700 hover:underline font-medium"
                    >
                      Se opslag
                    </Link>
                    <Link
                      href={`/mine-opslag/${listing.id}/rediger`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Rediger
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Slet
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
