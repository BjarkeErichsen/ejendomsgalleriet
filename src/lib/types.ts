export interface Profile {
  id: string
  full_name: string
  company: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  status: 'draft' | 'published'
  transaction_type: 'leje' | 'salg' | 'investering'
  primary_usage: string
  title: string | null
  description: string
  address_street: string
  address_postal_code: string
  address_city: string
  region: string
  latitude: number | null
  longitude: number | null
  primary_area_m2: number
  secondary_area_m2: number | null
  plot_area_m2: number | null
  monthly_rent_dkk: number | null
  annual_rent_dkk: number | null
  deposit_months: number | null
  deposit_dkk: number | null
  operating_costs_monthly: number | null
  operating_costs_annual: number | null
  prepaid_consumption_monthly: number | null
  prepaid_consumption_annual: number | null
  transfer_fee_dkk: number | null
  sale_price_dkk: number | null
  price_per_m2_dkk: number | null
  yield_percent: number | null
  annual_rental_income: number | null
  energy_label: string | null
  is_listed_building: boolean
  handover_condition: string | null
  vacating_condition: string | null
  notice_period_months: number | null
  notice_period_years: number | null
  non_cancellation_months: number | null
  non_cancellation_years: number | null
  sublease_right: boolean | null
  transfer_right: boolean | null
  rent_adjustment: string | null
  rent_adjustment_percent: number | null
  maintenance_note: string | null
  external_link: string | null
  internal_case_number: string | null
  video_url: string | null
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_company: string | null
  created_at: string
  updated_at: string
  listing_images?: ListingImage[]
  listing_facilities?: ListingFacility[]
  listing_documents?: ListingDocument[]
}

export interface ListingImage {
  id: string
  listing_id: string
  storage_path: string
  url: string
  type: 'photo' | 'floorplan'
  sort_order: number
  created_at: string
}

export interface ListingFacility {
  id: string
  listing_id: string
  facility: string
}

export interface ListingDocument {
  id: string
  listing_id: string
  storage_path: string
  url: string
  filename: string
  file_type: string
  created_at: string
}

export interface SearchFilters {
  type?: 'leje' | 'salg' | 'investering'
  query?: string
  usage?: string[]
  regions?: string[]
  minArea?: number
  maxArea?: number
  minPrice?: number
  maxPrice?: number
  minRent?: number
  maxRent?: number
  minYield?: number
  maxYield?: number
  facilities?: string[]
  sort?: string
  page?: number
}

export interface ListingFormData {
  address_street: string
  address_postal_code: string
  address_city: string
  address_region: string
  address_latitude: number | null
  address_longitude: number | null
  primary_usage: string
  transaction_type: 'leje' | 'salg'
  monthly_rent_dkk: string
  annual_rent_dkk: string
  deposit_months: string
  deposit_dkk: string
  operating_costs_monthly: string
  operating_costs_annual: string
  prepaid_consumption_monthly: string
  prepaid_consumption_annual: string
  transfer_fee_dkk: string
  sale_price_dkk: string
  price_per_m2_dkk: string
  primary_area_m2: string
  secondary_area_m2: string
  plot_area_m2: string
  video_url: string
  facilities: string[]
  title: string
  description: string
  energy_label: string
  is_listed_building: boolean
  handover_condition: string
  vacating_condition: string
  notice_period_months: string
  notice_period_years: string
  non_cancellation_months: string
  non_cancellation_years: string
  sublease_right: boolean | null
  transfer_right: boolean | null
  rent_adjustment: string
  rent_adjustment_percent: string
  maintenance_note: string
  external_link: string
  internal_case_number: string
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_company: string
}
