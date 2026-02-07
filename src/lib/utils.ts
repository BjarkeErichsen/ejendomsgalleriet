import { USAGE_TYPES, REGIONS, ENERGY_LABELS } from './constants'
import type { Listing, SearchFilters } from './types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '-'
  return amount.toLocaleString('da-DK') + ' DKK'
}

export function formatArea(m2: number | null | undefined): string {
  if (m2 == null) return '-'
  return m2.toLocaleString('da-DK') + ' m²'
}

export function formatYield(percent: number | null | undefined): string {
  if (percent == null) return '-'
  return percent.toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%'
}

export function getEnergyLabelColor(label: string | null | undefined): string {
  if (!label) return '#9E9E9E'
  const found = ENERGY_LABELS.find((e) => e.value === label)
  return found?.color ?? '#9E9E9E'
}

export function getUsageLabel(value: string): string {
  const found = USAGE_TYPES.find((u) => u.value === value)
  return found?.label ?? value
}

export function getRegionLabel(value: string): string {
  const found = REGIONS.find((r) => r.value === value)
  return found?.label ?? value
}

export function getListingPrice(listing: Listing): string {
  if (listing.transaction_type === 'salg') {
    return formatCurrency(listing.sale_price_dkk)
  }
  if (listing.transaction_type === 'investering') {
    return formatCurrency(listing.sale_price_dkk ?? listing.annual_rental_income)
  }
  return formatCurrency(listing.annual_rent_dkk ?? listing.monthly_rent_dkk)
}

export function getListingPriceLabel(listing: Listing): string {
  if (listing.transaction_type === 'salg') return 'Pris'
  if (listing.transaction_type === 'investering') return 'Pris'
  if (listing.annual_rent_dkk) return 'Årlig leje'
  return 'Månedlig leje'
}

export function buildSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.query) params.set('q', filters.query)
  if (filters.usage?.length) params.set('usage', filters.usage.join(','))
  if (filters.regions?.length) params.set('regions', filters.regions.join(','))
  if (filters.minArea) params.set('minArea', String(filters.minArea))
  if (filters.maxArea) params.set('maxArea', String(filters.maxArea))
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
  if (filters.minRent) params.set('minRent', String(filters.minRent))
  if (filters.maxRent) params.set('maxRent', String(filters.maxRent))
  if (filters.minYield) params.set('minYield', String(filters.minYield))
  if (filters.maxYield) params.set('maxYield', String(filters.maxYield))
  if (filters.facilities?.length) params.set('facilities', filters.facilities.join(','))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function parseSearchParams(params: URLSearchParams): SearchFilters {
  return {
    type: (params.get('type') as SearchFilters['type']) || undefined,
    query: params.get('q') || undefined,
    usage: params.get('usage')?.split(',').filter(Boolean) || undefined,
    regions: params.get('regions')?.split(',').filter(Boolean) || undefined,
    minArea: params.get('minArea') ? Number(params.get('minArea')) : undefined,
    maxArea: params.get('maxArea') ? Number(params.get('maxArea')) : undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRent: params.get('minRent') ? Number(params.get('minRent')) : undefined,
    maxRent: params.get('maxRent') ? Number(params.get('maxRent')) : undefined,
    minYield: params.get('minYield') ? Number(params.get('minYield')) : undefined,
    maxYield: params.get('maxYield') ? Number(params.get('maxYield')) : undefined,
    facilities: params.get('facilities')?.split(',').filter(Boolean) || undefined,
    sort: params.get('sort') || undefined,
    page: params.get('page') ? Number(params.get('page')) : undefined,
  }
}
