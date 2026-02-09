'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { PRIMARY_USAGE_TYPES } from '@/lib/constants'
import { cn, getRegionLabel } from '@/lib/utils'
import { postalCodeToRegion } from '@/lib/dawa'
import type { ParsedAddress } from '@/lib/dawa'
import type { Listing } from '@/lib/types'

export default function EditListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, listing_facilities(*)')
        .eq('id', listingId)
        .eq('user_id', user.id)
        .single()
      setListing(data as Listing)
      setLoading(false)
    }
    fetch()
  }, [user, listingId, supabase])

  const updateListing = (updates: Partial<Listing>) => {
    if (!listing) return
    setListing({ ...listing, ...updates })
  }

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!listing || !user) return
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        status: status || listing.status,
        title: listing.title,
        description: listing.description,
        address_street: listing.address_street,
        address_postal_code: listing.address_postal_code,
        address_city: listing.address_city,
        region: listing.region || postalCodeToRegion(listing.address_postal_code),
        latitude: listing.latitude,
        longitude: listing.longitude,
        primary_usage: listing.primary_usage,
        transaction_type: listing.transaction_type,
        primary_area_m2: listing.primary_area_m2,
        monthly_rent_dkk: listing.monthly_rent_dkk,
        annual_rent_dkk: listing.annual_rent_dkk,
        sale_price_dkk: listing.sale_price_dkk,
        price_per_m2_dkk: listing.price_per_m2_dkk,
        energy_label: listing.energy_label,
        contact_name: listing.contact_name,
        contact_email: listing.contact_email,
        contact_phone: listing.contact_phone,
        contact_company: listing.contact_company,
      })
      .eq('id', listingId)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/mine-opslag')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Opslag ikke fundet</h1>
        <Button href="/mine-opslag">Tilbage til mine opslag</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rediger opslag</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
            Gem som kladde
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            {saving ? 'Gemmer...' : 'Publicer'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-8 bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Adresse</h2>
          <AddressAutocomplete
            label="Adresse"
            value={listing.address_street}
            onChange={(value) => updateListing({ address_street: value })}
            onAddressSelect={(address: ParsedAddress) => {
              updateListing({
                address_street: address.street,
                address_postal_code: address.postalCode,
                address_city: address.city,
                region: address.region,
                latitude: address.latitude,
                longitude: address.longitude,
              })
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postnummer"
              value={listing.address_postal_code}
              onChange={(e) => {
                const region = postalCodeToRegion(e.target.value)
                updateListing({ address_postal_code: e.target.value, region: region || listing.region })
              }}
            />
            <Input label="By" value={listing.address_city} onChange={(e) => updateListing({ address_city: e.target.value })} />
          </div>
          {listing.region && (
            <p className="text-sm text-blue-700">Region: <strong>{getRegionLabel(listing.region)}</strong></p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Detaljer</h2>
          <Input label="Titel" value={listing.title || ''} onChange={(e) => updateListing({ title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
            <textarea
              value={listing.description}
              onChange={(e) => updateListing({ description: e.target.value })}
              rows={5}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Areal" suffix="m²" type="number" value={listing.primary_area_m2 || ''} onChange={(e) => updateListing({ primary_area_m2: Number(e.target.value) || 0 })} />
            <Select
              label="Type"
              options={PRIMARY_USAGE_TYPES.map(t => ({ value: t.value, label: t.label }))}
              value={listing.primary_usage}
              onChange={(e) => updateListing({ primary_usage: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pris</h2>
          {listing.transaction_type === 'leje' || listing.transaction_type === 'investering' ? (
            <>
              <p className="text-xs text-gray-500">Månedlige og årlige beløb beregnes automatisk.</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Månedlig leje"
                  suffix="DKK"
                  type="number"
                  value={listing.monthly_rent_dkk || ''}
                  onChange={(e) => {
                    const monthly = Number(e.target.value) || null
                    updateListing({ monthly_rent_dkk: monthly, annual_rent_dkk: monthly ? monthly * 12 : listing.annual_rent_dkk })
                  }}
                />
                <Input
                  label="Årlig leje"
                  suffix="DKK"
                  type="number"
                  value={listing.annual_rent_dkk || ''}
                  onChange={(e) => {
                    const annual = Number(e.target.value) || null
                    updateListing({ annual_rent_dkk: annual, monthly_rent_dkk: annual ? Math.round(annual / 12) : listing.monthly_rent_dkk })
                  }}
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pris"
                suffix="DKK"
                type="number"
                value={listing.sale_price_dkk || ''}
                onChange={(e) => {
                  const price = Number(e.target.value) || null
                  const pricePerM2 = price && listing.primary_area_m2 ? Math.round(price / listing.primary_area_m2) : listing.price_per_m2_dkk
                  updateListing({ sale_price_dkk: price, price_per_m2_dkk: pricePerM2 })
                }}
              />
              <Input label="Pris pr. m²" suffix="DKK" type="number" value={listing.price_per_m2_dkk || ''} onChange={(e) => updateListing({ price_per_m2_dkk: Number(e.target.value) || null })} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Kontaktperson</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Navn" value={listing.contact_name} onChange={(e) => updateListing({ contact_name: e.target.value })} />
            <Input label="Email" value={listing.contact_email} onChange={(e) => updateListing({ contact_email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefon" value={listing.contact_phone} onChange={(e) => updateListing({ contact_phone: e.target.value })} />
            <Input label="Firma" value={listing.contact_company || ''} onChange={(e) => updateListing({ contact_company: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  )
}
