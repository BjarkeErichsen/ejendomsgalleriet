export const TRANSACTION_TYPES = [
  { value: 'leje', label: 'Leje' },
  { value: 'salg', label: 'Salg' },
  { value: 'investering', label: 'Investering' },
] as const

export const USAGE_TYPES = [
  { value: 'boligudlejning', label: 'Boligudlejning' },
  { value: 'kontor', label: 'Kontor' },
  { value: 'domicil', label: 'Domicil' },
  { value: 'klinik', label: 'Klinik' },
  { value: 'detailhandel', label: 'Detailhandel & butik' },
  { value: 'lager', label: 'Lager & produktion' },
  { value: 'vaerksted', label: 'Værksted' },
  { value: 'hotel_restaurant', label: 'Hotel & restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'take_away', label: 'Take away' },
  { value: 'grunde', label: 'Grunde' },
  { value: 'bolig_erhverv', label: 'Bolig & erhverv' },
  { value: 'andre', label: 'Andre typer' },
] as const

export const PRIMARY_USAGE_TYPES = [
  { value: 'butik', label: 'Butik' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'take_away', label: 'Take-away' },
  { value: 'klinik', label: 'Klinik' },
  { value: 'bar', label: 'Bar' },
  { value: 'investering', label: 'Investering' },
  { value: 'pop_up', label: 'Pop-up' },
  { value: 'catering', label: 'Catering' },
  { value: 'kontor', label: 'Kontor' },
  { value: 'industri', label: 'Industri' },
  { value: 'lager', label: 'Lager' },
] as const

export const OFFICE_TYPES = [
  { value: 'fast_plads', label: 'Fast plads' },
  { value: 'flexplads', label: 'Flexplads' },
  { value: 'lukket_kontor', label: 'Lukket kontor' },
] as const

export const REGIONS = [
  { value: 'bornholm', label: 'Bornholm' },
  { value: 'byen_koebenhavn', label: 'Byen København' },
  { value: 'fyn', label: 'Fyn' },
  { value: 'koebenhavns_omegn', label: 'Københavns omegn' },
  { value: 'nordjylland', label: 'Nordjylland' },
  { value: 'nordsjaelland', label: 'Nordsjælland' },
  { value: 'oestjylland', label: 'Østjylland' },
  { value: 'oestsjaelland', label: 'Østsjælland' },
  { value: 'sydjylland', label: 'Sydjylland' },
  { value: 'vestjylland', label: 'Vestjylland' },
  { value: 'vest_sydsjaelland', label: 'Vest- og Sydsjælland' },
] as const

export const FACILITIES = [
  { value: 'udstillingsvinduer', label: 'Udstillingsvinduer' },
  { value: 'udeservering', label: 'Udeservering' },
  { value: 'siddepladser', label: 'Siddepladser' },
  { value: 'lager', label: 'Lager' },
  { value: 'personalerum', label: 'Personalerum' },
  { value: 'fryserum', label: 'Fryserum' },
  { value: 'privat_parkering', label: 'Privat parkering' },
  { value: 'udsugning', label: 'Udsugning' },
  { value: 'alkoholbevilling', label: 'Alkoholbevilling' },
  { value: 'gaard', label: 'Gård' },
  { value: 'kaelder', label: 'Kælder' },
  { value: 'proverum', label: 'Prøverum' },
  { value: 'sikkerhedssystem', label: 'Sikkerhedssystem' },
  { value: 'kolerum', label: 'Kølerum' },
  { value: 'varmt_kokken', label: 'Varmt køkken' },
] as const

export const ENERGY_LABELS = [
  { value: 'A2020', label: 'A', year: '2020', color: '#1B5E20' },
  { value: 'A2015', label: 'A', year: '2015', color: '#2E7D32' },
  { value: 'A2010', label: 'A', year: '2010', color: '#388E3C' },
  { value: 'B', label: 'B', year: '', color: '#558B2F' },
  { value: 'C', label: 'C', year: '', color: '#9E9D24' },
  { value: 'D', label: 'D', year: '', color: '#F9A825' },
  { value: 'E', label: 'E', year: '', color: '#FF8F00' },
  { value: 'F', label: 'F', year: '', color: '#EF6C00' },
  { value: 'G', label: 'G', year: '', color: '#D32F2F' },
] as const

export const SORT_OPTIONS = [
  { value: 'relevans', label: 'Relevans' },
  { value: 'nyeste', label: 'Nyeste først' },
  { value: 'pris_asc', label: 'Pris (lav til høj)' },
  { value: 'pris_desc', label: 'Pris (høj til lav)' },
  { value: 'size_asc', label: 'Størrelse (lav til høj)' },
  { value: 'size_desc', label: 'Størrelse (høj til lav)' },
] as const

export const ITEMS_PER_PAGE = 12
