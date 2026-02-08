/**
 * DAWA (Danmarks Adressers Web API) integration
 * Official Danish address API from Dataforsyningen
 * https://dawadocs.dataforsyningen.dk/
 */

const DAWA_BASE = 'https://api.dataforsyningen.dk'

export interface DawaAddressSuggestion {
  tekst: string
  adresse: {
    id: string
    href: string
    vejnavn: string
    husnr: string
    etage: string | null
    dør: string | null
    supplerendebynavn: string | null
    postnr: string
    postnrnavn: string
    stormodtagerpostnr: string | null
    stormodtagerpostnrnavn: string | null
    kommunekode: string
  }
}

export interface DawaAdgangsadresseSuggestion {
  tekst: string
  adgangsadresse: {
    id: string
    href: string
    vejnavn: string
    husnr: string
    supplerendebynavn: string | null
    postnr: string
    postnrnavn: string
    kommunekode: string
  }
}

export interface DawaAddressDetail {
  id: string
  vejnavn: string
  husnr: string
  etage: string | null
  dør: string | null
  postnr: string
  postnrnavn: string
  kommunekode: string
  x: number  // longitude (WGS84)
  y: number  // latitude (WGS84)
  adgangsadresse: {
    id: string
    koordinater: [number, number] // [longitude, latitude]
  }
}

export interface ParsedAddress {
  street: string       // e.g. "Vestergade 12, 1. th"
  postalCode: string   // e.g. "1456"
  city: string         // e.g. "København K"
  region: string       // e.g. "byen_koebenhavn"
  latitude: number | null
  longitude: number | null
  fullText: string     // Full formatted address text
}

/**
 * Autocomplete addresses from DAWA
 */
export async function searchAddresses(query: string, limit = 7): Promise<DawaAddressSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      per_side: String(limit),
      fuzzy: '',
    })
    const response = await fetch(`${DAWA_BASE}/adresser/autocomplete?${params}`)
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

/**
 * Autocomplete access addresses (street + number, no floor/door) from DAWA
 */
export async function searchAccessAddresses(query: string, limit = 7): Promise<DawaAdgangsadresseSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const params = new URLSearchParams({
      q: query,
      per_side: String(limit),
      fuzzy: '',
    })
    const response = await fetch(`${DAWA_BASE}/adgangsadresser/autocomplete?${params}`)
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

/**
 * Get full address details including coordinates
 */
export async function getAddressDetails(addressId: string): Promise<DawaAddressDetail | null> {
  try {
    const response = await fetch(`${DAWA_BASE}/adresser/${addressId}`)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Get coordinates for an access address
 */
export async function getAccessAddressCoordinates(
  accessAddressId: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(`${DAWA_BASE}/adgangsadresser/${accessAddressId}`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.adgangspunkt?.koordinater) {
      return {
        longitude: data.adgangspunkt.koordinater[0],
        latitude: data.adgangspunkt.koordinater[1],
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Map Danish postal code to one of the 11 regional categories used in the app.
 * These regions follow the convention used by ejendomstorvet.dk and similar platforms.
 */
export function postalCodeToRegion(postalCode: string): string {
  const code = parseInt(postalCode, 10)
  if (isNaN(code)) return ''

  // Bornholm: 3700-3799
  if (code >= 3700 && code <= 3799) return 'bornholm'

  // Byen København: 1000-2099 (inner Copenhagen + Frederiksberg)
  if (code >= 1000 && code <= 2099) return 'byen_koebenhavn'

  // Københavns omegn: 2100-2990
  if (code >= 2100 && code <= 2990) return 'koebenhavns_omegn'

  // Nordsjælland: 2990-3699 (excluding Bornholm range)
  if (code >= 2990 && code <= 3699) return 'nordsjaelland'

  // Østsjælland: 4000-4299
  if (code >= 4000 && code <= 4299) return 'oestsjaelland'

  // Vest- og Sydsjælland: 4300-4999
  if (code >= 4300 && code <= 4999) return 'vest_sydsjaelland'

  // Fyn: 5000-5999
  if (code >= 5000 && code <= 5999) return 'fyn'

  // Sydjylland: 6000-6999
  if (code >= 6000 && code <= 6999) return 'sydjylland'

  // Vestjylland: 7000-7999
  if (code >= 7000 && code <= 7999) return 'vestjylland'

  // Østjylland: 8000-8999
  if (code >= 8000 && code <= 8999) return 'oestjylland'

  // Nordjylland: 9000-9999
  if (code >= 9000 && code <= 9999) return 'nordjylland'

  return ''
}

/**
 * Parse a DAWA address suggestion into our structured address format
 */
export function parseDawaAddress(suggestion: DawaAddressSuggestion): ParsedAddress {
  const addr = suggestion.adresse
  let street = addr.vejnavn
  if (addr.husnr) street += ' ' + addr.husnr
  if (addr.etage) street += ', ' + addr.etage + '.'
  if (addr.dør) street += ' ' + addr.dør

  return {
    street,
    postalCode: addr.postnr,
    city: addr.postnrnavn,
    region: postalCodeToRegion(addr.postnr),
    latitude: null,  // Populated separately via getAddressDetails
    longitude: null,
    fullText: suggestion.tekst,
  }
}

/**
 * Parse a DAWA access address suggestion into our structured address format
 */
export function parseDawaAccessAddress(suggestion: DawaAdgangsadresseSuggestion): ParsedAddress {
  const addr = suggestion.adgangsadresse
  let street = addr.vejnavn
  if (addr.husnr) street += ' ' + addr.husnr

  return {
    street,
    postalCode: addr.postnr,
    city: addr.postnrnavn,
    region: postalCodeToRegion(addr.postnr),
    latitude: null,
    longitude: null,
    fullText: suggestion.tekst,
  }
}

/**
 * Search for locations (addresses, postal codes, cities) for the search bar.
 * Returns formatted suggestions for the general search experience.
 */
export async function searchLocations(query: string, limit = 7): Promise<{
  text: string
  type: 'adresse' | 'postnummer' | 'by'
  data: ParsedAddress | { postalCode: string; city: string }
}[]> {
  if (!query || query.length < 2) return []

  try {
    // Search addresses and postal codes in parallel
    const [addressRes, postalRes] = await Promise.all([
      fetch(`${DAWA_BASE}/adgangsadresser/autocomplete?q=${encodeURIComponent(query)}&per_side=${limit}&fuzzy=`),
      fetch(`${DAWA_BASE}/postnumre/autocomplete?q=${encodeURIComponent(query)}&per_side=5`),
    ])

    const results: {
      text: string
      type: 'adresse' | 'postnummer' | 'by'
      data: ParsedAddress | { postalCode: string; city: string }
    }[] = []

    // Add postal code results first
    if (postalRes.ok) {
      const postalData = await postalRes.json()
      for (const item of postalData.slice(0, 3)) {
        results.push({
          text: `${item.postnummer.nr} ${item.postnummer.navn}`,
          type: 'postnummer',
          data: { postalCode: item.postnummer.nr, city: item.postnummer.navn },
        })
      }
    }

    // Add address results
    if (addressRes.ok) {
      const addressData = await addressRes.json()
      for (const item of addressData.slice(0, limit - results.length)) {
        results.push({
          text: item.tekst,
          type: 'adresse',
          data: parseDawaAccessAddress(item),
        })
      }
    }

    return results.slice(0, limit)
  } catch {
    return []
  }
}
