'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Listing, SearchFilters } from '@/lib/types'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export function useListings(filters: SearchFilters) {
  const [listings, setListings] = useState<Listing[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, listing_images(*), listing_facilities(*)', { count: 'exact' })
      .eq('status', 'published')

    if (filters.type) {
      query = query.eq('transaction_type', filters.type)
    }
    if (filters.query) {
      query = query.or(
        `address_street.ilike.%${filters.query}%,address_city.ilike.%${filters.query}%,address_postal_code.ilike.%${filters.query}%,title.ilike.%${filters.query}%`
      )
    }
    if (filters.usage?.length) {
      query = query.in('primary_usage', filters.usage)
    }
    if (filters.regions?.length) {
      query = query.in('region', filters.regions)
    }
    if (filters.minArea) {
      query = query.gte('primary_area_m2', filters.minArea)
    }
    if (filters.maxArea) {
      query = query.lte('primary_area_m2', filters.maxArea)
    }
    if (filters.minPrice) {
      query = query.or(
        `sale_price_dkk.gte.${filters.minPrice},annual_rent_dkk.gte.${filters.minPrice}`
      )
    }
    if (filters.maxPrice) {
      query = query.or(
        `sale_price_dkk.lte.${filters.maxPrice},annual_rent_dkk.lte.${filters.maxPrice}`
      )
    }
    if (filters.minYield) {
      query = query.gte('yield_percent', filters.minYield)
    }
    if (filters.maxYield) {
      query = query.lte('yield_percent', filters.maxYield)
    }

    // Sorting
    switch (filters.sort) {
      case 'nyeste':
        query = query.order('created_at', { ascending: false })
        break
      case 'pris_asc':
        query = query.order('annual_rent_dkk', { ascending: true, nullsFirst: false })
        break
      case 'pris_desc':
        query = query.order('annual_rent_dkk', { ascending: false })
        break
      case 'size_asc':
        query = query.order('primary_area_m2', { ascending: true })
        break
      case 'size_desc':
        query = query.order('primary_area_m2', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const page = filters.page || 1
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    query = query.range(from, to)

    const { data, count: totalCount, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings((data as Listing[]) || [])
      setCount(totalCount || 0)
    }
    setLoading(false)
  }, [filters, supabase])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, count, loading, refetch: fetchListings }
}
