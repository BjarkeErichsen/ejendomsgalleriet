# CLAUDE.md — Ejendomsgalleriet

## Project Overview

**Ejendomsgalleriet** is a Danish commercial real estate listing platform inspired by [ejendomstorvet.dk](https://www.ejendomstorvet.dk/) and [respace.dk](https://www.respace.dk/). It enables users to search, browse, and list commercial properties (offices, retail, warehouses, etc.) for rent, sale, or investment.

### Core Principles
- Danish-language UI throughout (all labels, navigation, and content in Danish)
- Scandinavian minimalist aesthetic: clean, white-dominant, spacious layout
- Green primary accent color (similar to ejendomstorvet.dk)
- Mobile-responsive design
- All buttons and interactions must be fully functional

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14+** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Database | **Supabase** (PostgreSQL) |
| Auth | **Supabase Auth** |
| Storage | **Supabase Storage** (images, documents) |
| Deployment | Vercel (recommended) |
| Charts | **Recharts** or **Chart.js** (for statistics page) |
| Maps | **Leaflet** or **Mapbox** (for property map view) |

### Supabase Configuration
- Environment variables expected in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # server-side only
  ```
- If keys are not yet available, build with placeholder references — they will be supplied later.

---

## Feature Specification

### Feature 1: Public Property Search (Open to All)

A full-featured search and browse experience for commercial real estate.

#### Transaction Type Tabs
Three primary listing modes accessible via tabs:
- **Leje** (Rent) — Commercial premises for rent
- **Salg** (Sale/Buy) — Commercial premises for purchase
- **Investering** (Investment) — Investment properties with yield data

#### Search Capabilities
- **Free-text search bar** on homepage hero section (search by street, postal code, city, municipality, region)
- **Faceted filter sidebar** on search results page with the following filters:

##### Anvendelser (Usage Types)
- Boligudlejning (Residential rental)
- Kontor (Office)
- Domicil (Domicile)
- Klinik (Clinic)
- Detailhandel & butik (Retail & shop)
- Lager & produktion (Warehouse & production)
- Værksted (Workshop)
- Hotel & restaurant
- Cafe
- Take away
- Grunde (Land/plots)
- Bolig & erhverv (Mixed residential/commercial)
- Andre typer (Other types)

##### Kontorpladstyper (Office Space Types)
- Fast plads (Fixed desk)
- Flexplads (Flex desk)
- Lukket kontor (Private office)

##### Vis kun (Show Only)
- Projekt (Project)
- Udbud (Tender)

##### Beliggenhed (Location) — Danish Regions
- Bornholm
- Byen København (Copenhagen City)
- Fyn
- Københavns omegn (Greater Copenhagen)
- Nordjylland
- Nordsjælland
- Østjylland
- Østsjælland
- Sydjylland
- Vestjylland
- Vest- og Sydsjælland

##### Numeric Range Filters
- Etageareal (Floor area in m²)
- Grundareal (Plot area in m²)
- Årlig leje inkl. drift (Annual rent incl. operating costs)
- Årlig leje pr. m² inkl. drift (Annual rent per m² incl. operating costs)
- Årlige lejeindtægter (Annual rental income)
- Pris (Price)
- Pris pr. m² (Price per m²)
- Afkast (Yield %)
- Antal pladser [Kontorhotel] (Number of desks [Office hotel])
- Pris pr. plads [Kontorhotel] (Price per desk [Office hotel])

##### Faciliteter (Facilities)
Multi-select checkboxes for amenities (see listing creation section for full list).

#### Search Results Page
- **List view** (default) with property cards in a grid (2-3 columns on desktop)
- **Map view** toggle showing properties on an interactive map
- **Sort options**: Relevans (relevance), Nyeste først (newest first), Pris (price), Størrelse (size)
- **Pagination** for browsing results
- **Result count** displayed

#### Property Card Structure
Each card displays:
- Primary photo (large thumbnail)
- Property type badge (Kontor, Butik, Lager, etc.)
- Transaction type indicator (Leje/Salg/Investering)
- Full address (street, postal code, city)
- Size in m²
- Price or annual rent
- Annual rent per m² (for rental)
- Yield % (for investment)
- Contact/broker info snippet

---

### Feature 2: User Accounts & Listing Creation (Auth Required)

#### Authentication (via Supabase Auth)
- **Email + password** registration and login
- Login/register page at `/login` and `/registrer`
- Protected routes for listing creation and user dashboard
- Session persistence across page navigations
- User profile with:
  - Name
  - Email
  - Company/firm (optional)
  - Phone number

#### Listing Creation — Multi-Step Form
Based on respace.dk's form structure, the listing creation flow has **10 steps/sections**:

##### Step 01: Adresse (Address)
- Vejnavn (Street name) — text input with autocomplete
- Postnummer (Postal code)
- By (City)
- Full address assembled

##### Step 02: Anvendelse (Usage/Type)
- **Primær anvendelse** (Primary usage) — select one:
  - Butik, Restaurant, Cafe, Hotel, Take-away, Klinik, Bar, Investering, Pop-up, Catering, Kontor, Industri, Lager

##### Step 03: Salg / Leje (Sale or Rent)
- Toggle: **Leje** or **Salg**
- If Leje:
  - Leje pr. md. (Monthly rent in DKK)
  - Leje pr. år (Annual rent in DKK)
  - Depositum i måneder (Deposit in months) — optional
  - Depositum i DKK (Deposit in DKK) — optional
  - Driftsomkostninger pr. md. (Operating costs monthly) — optional
  - Driftsomkostninger pr. år (Operating costs annually) — optional
  - Aconto forbrug pr. md. (Prepaid consumption monthly) — optional
  - Aconto forbrug pr. år (Prepaid consumption annually) — optional
  - Evt. afståelsesbeløb (Transfer fee) — optional
- If Salg:
  - Pris (Price in DKK)
  - Pris pr. m² (Price per m²)

##### Step 04: Areal (Area)
- Primært areal (Primary area in m²) — required
- Sekundært areal (Secondary area in m²) — optional
- Grundareal (Plot area in m²) — optional

##### Step 05: Dokumenter (Documents)
- **Billeder** (Photos) — drag-and-drop upload zone
  - Min. 1 photo required
  - Max file size: 20MB
  - Formats: jpg, jpeg, png
  - Filenames must be unique, alphanumeric with hyphens/underscores only
- **Plantegninger** (Floor plans) — separate upload zone
  - Same format restrictions as photos
- **Video** — YouTube link (must start with https://) — optional

##### Step 06: Beskrivelse & Fakta (Description & Facts)
- **Faciliteter** (Facilities) — multi-select toggles:
  - Udstillingsvinduer (Display windows)
  - Udeservering (Outdoor seating)
  - Siddepladser (Seating)
  - Lager (Storage)
  - Personalerum (Staff room)
  - Fryserum (Freezer room)
  - Privat parkering (Private parking)
  - Udsugning (Ventilation/extraction)
  - Alkoholbevilling (Alcohol license)
  - Gård (Courtyard)
  - Kælder (Basement)
  - Prøverum (Fitting room)
  - Sikkerhedssystem (Security system)
  - Kølerum (Cold room)
  - Varmt køkken (Commercial kitchen)
  - *(expandable: "Vis flere faciliteter")*
- **Datapunkter** (Data points) — category-specific metrics
- **Overskrift** (Headline/title) — optional
- **Beskrivelse** (Description) — rich text area (max ~2000 characters)
- **Energimærkning** (Energy label) — select one:
  - A2020, A2015, A2010, B, C, D, E, F, G
  - Checkbox: "Ingen energimærke / Fredet ejendom" (No energy label / Listed building)

##### Step 07: Kontraktforhold (Contract Terms) — Optional
- Overtagelsestilstand (Handover condition) — dropdown ("Efter aftale" default)
- Fraflytningstand (Vacating condition) — dropdown
- Opsigelsesvarsel (Notice period) — months + years dropdowns
- Uopsigelighed (Non-cancellation period) — months + years dropdowns
- Fremlejerett (Sublease right) — Yes/No radio
- Afståelsesret (Transfer right) — Yes/No radio
- Lejeregulering (Rent adjustment) — dropdown ("Efter aftale" default)
- Vedligeholdelse (Maintenance) — text area (max 200 characters)
- Percentage field (likely for rent adjustment %)

##### Step 08: Prospekt (Prospectus) — Optional
- PDF upload zone for property prospectus
  - Max file size: 20MB
  - Format: PDF only
  - Unique filename requirement

##### Step 09: Eksterne oplysninger (External Information) — Optional
- Eksternt link (External link) — URL starting with https://
- Internt sagsnr. (Internal case number) — text field

##### Step 10: Kontaktperson (Contact Person)
- Name
- Email
- Phone
- Company (optional)

#### Listing States
- **Kladde** (Draft) — saved but not published
- **Publiceret** (Published) — live on the platform

---

### Feature 3: Property Detail Page

Each listing has a full detail page accessible by clicking a property card.

#### Detail Page Sections
- **Image gallery** — full-width carousel with thumbnail strip, supports click-through browsing
- **Floor plan viewer** — separate tab/section for plan drawings
- **Key facts sidebar/header**:
  - Address, type badge, transaction type
  - Price / rent information
  - Area (m²)
  - Energy label badge
- **Description** — full text
- **Facilities** — icon grid with labels
- **Contract terms** — structured table
- **Map** — embedded map showing property location with marker
- **Contact section** — broker/owner contact card (green accent) with:
  - Name, company, phone, email
  - Contact form / "Kontakt" button
- **Documents** — downloadable prospectus PDF if available
- **Video** — embedded YouTube player if link provided

#### Image Gallery Behavior
- Clicking main image opens full-screen lightbox
- Arrow navigation (left/right) through all images
- Thumbnail strip below for direct image selection
- Swipe support on mobile

---

### Feature 4: Statistics Page

A dedicated `/statistik` page with data visualizations based on listings in the database.

#### Visualizations to Include
- **Listings by type** — bar/pie chart (Kontor, Butik, Lager, etc.)
- **Listings by region** — bar chart or choropleth map
- **Average rent per m²** — by property type and region
- **Average price** — by property type (for sale listings)
- **Average yield %** — for investment properties
- **Listings over time** — line chart showing new listings per month
- **Size distribution** — histogram of property sizes
- **Vacancy/supply overview** — by type and region

All statistics are derived from actual listings in the Supabase database.

---

## NOT in Scope

The following features from ejendomstorvet.dk are explicitly **excluded**:
- "Find mægler" (Find broker) directory
- "Nyheder" (News) section
- "Ordbog" (Glossary)
- "Kontormatch" matching tool
- "Søgeagent" email notification system (may add later)
- Native mobile app

---

## Database Schema (Supabase)

### Tables

#### `profiles`
Extends Supabase Auth users.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK to auth.users, PK |
| full_name | text | |
| company | text | nullable |
| phone | text | nullable |
| avatar_url | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | |

#### `listings`
Main property listings table.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK to profiles.id |
| status | text | 'draft' or 'published' |
| transaction_type | text | 'leje', 'salg', or 'investering' |
| primary_usage | text | e.g. 'kontor', 'butik', 'lager' |
| title | text | nullable, optional headline |
| description | text | |
| address_street | text | |
| address_postal_code | text | |
| address_city | text | |
| region | text | Danish region identifier |
| latitude | float8 | nullable, for map |
| longitude | float8 | nullable, for map |
| primary_area_m2 | integer | Primary area in m² |
| secondary_area_m2 | integer | nullable |
| plot_area_m2 | integer | nullable |
| monthly_rent_dkk | integer | nullable (for leje) |
| annual_rent_dkk | integer | nullable (for leje) |
| deposit_months | integer | nullable |
| deposit_dkk | integer | nullable |
| operating_costs_monthly | integer | nullable |
| operating_costs_annual | integer | nullable |
| prepaid_consumption_monthly | integer | nullable |
| prepaid_consumption_annual | integer | nullable |
| transfer_fee_dkk | integer | nullable (afståelsesbeløb) |
| sale_price_dkk | integer | nullable (for salg) |
| price_per_m2_dkk | integer | nullable |
| yield_percent | numeric(5,2) | nullable (for investering) |
| annual_rental_income | integer | nullable |
| energy_label | text | nullable, e.g. 'A2020', 'B', 'C' |
| is_listed_building | boolean | default false |
| handover_condition | text | nullable |
| vacating_condition | text | nullable |
| notice_period_months | integer | nullable |
| notice_period_years | integer | nullable |
| non_cancellation_months | integer | nullable |
| non_cancellation_years | integer | nullable |
| sublease_right | boolean | nullable |
| transfer_right | boolean | nullable |
| rent_adjustment | text | nullable |
| rent_adjustment_percent | numeric(5,2) | nullable |
| maintenance_note | text | nullable (max 200 chars) |
| external_link | text | nullable |
| internal_case_number | text | nullable |
| video_url | text | nullable, YouTube link |
| contact_name | text | |
| contact_email | text | |
| contact_phone | text | |
| contact_company | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | |

#### `listing_facilities`
Many-to-many relation for facilities.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| listing_id | uuid | FK to listings.id |
| facility | text | e.g. 'udstillingsvinduer', 'parkering' |

#### `listing_images`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| listing_id | uuid | FK to listings.id |
| storage_path | text | Supabase Storage path |
| url | text | Public URL |
| type | text | 'photo', 'floorplan' |
| sort_order | integer | For ordering in gallery |
| created_at | timestamptz | |

#### `listing_documents`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| listing_id | uuid | FK to listings.id |
| storage_path | text | |
| url | text | |
| filename | text | |
| file_type | text | e.g. 'prospekt' |
| created_at | timestamptz | |

### Supabase Storage Buckets
- `listing-images` — property photos and floor plans
- `listing-documents` — PDFs (prospectus, etc.)

### Row Level Security (RLS)
- **listings**: Anyone can SELECT published listings. Only the owner (user_id) can INSERT, UPDATE, DELETE.
- **listing_images / listing_documents**: Same as listings — public read for published, owner write.
- **profiles**: Users can read all profiles. Users can only update their own profile.

---

## Application Routes

```
/                           — Homepage with hero search, featured listings
/soeg                       — Search results page (list view + map toggle)
/soeg?type=leje             — Filtered by transaction type
/soeg?type=salg
/soeg?type=investering
/ejendom/[id]               — Property detail page
/opret                      — Create new listing (auth required, multi-step form)
/mine-opslag                — My listings dashboard (auth required)
/mine-opslag/[id]/rediger   — Edit a listing (auth required)
/statistik                  — Statistics and visualizations
/login                      — Login page
/registrer                  — Register page
/profil                     — User profile (auth required)
```

---

## Project Structure

```
ejendomsgalleriet/
├── CLAUDE.md                       # This file
├── .env.local                      # Supabase keys (git-ignored)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.ico
│   └── images/                     # Static images (logo, placeholders)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with nav + footer
│   │   ├── page.tsx                # Homepage
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── registrer/
│   │   │   └── page.tsx
│   │   ├── soeg/
│   │   │   └── page.tsx            # Search results
│   │   ├── ejendom/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Property detail
│   │   ├── opret/
│   │   │   └── page.tsx            # Create listing (multi-step form)
│   │   ├── mine-opslag/
│   │   │   ├── page.tsx            # My listings dashboard
│   │   │   └── [id]/
│   │   │       └── rediger/
│   │   │           └── page.tsx    # Edit listing
│   │   ├── statistik/
│   │   │   └── page.tsx            # Statistics page
│   │   └── profil/
│   │       └── page.tsx            # User profile
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top navigation bar
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx         # Search filter sidebar
│   │   ├── search/
│   │   │   ├── SearchBar.tsx       # Hero search input
│   │   │   ├── FilterPanel.tsx     # Faceted filter sidebar
│   │   │   ├── FilterChips.tsx     # Active filter tags
│   │   │   └── SortDropdown.tsx
│   │   ├── listings/
│   │   │   ├── PropertyCard.tsx    # Search result card
│   │   │   ├── PropertyGrid.tsx    # Grid of property cards
│   │   │   ├── PropertyMap.tsx     # Map view with markers
│   │   │   └── ImageGallery.tsx    # Lightbox image viewer
│   │   ├── forms/
│   │   │   ├── ListingForm.tsx     # Multi-step listing form container
│   │   │   ├── AddressStep.tsx
│   │   │   ├── UsageStep.tsx
│   │   │   ├── PricingStep.tsx
│   │   │   ├── AreaStep.tsx
│   │   │   ├── DocumentsStep.tsx
│   │   │   ├── DescriptionStep.tsx
│   │   │   ├── ContractStep.tsx
│   │   │   ├── ProspectStep.tsx
│   │   │   ├── ExternalInfoStep.tsx
│   │   │   └── ContactStep.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx       # Route protection wrapper
│   │   ├── stats/
│   │   │   ├── ChartCard.tsx       # Reusable chart container
│   │   │   ├── ListingsByType.tsx
│   │   │   ├── ListingsByRegion.tsx
│   │   │   ├── PriceTrends.tsx
│   │   │   └── YieldOverview.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Tabs.tsx
│   │       ├── FileUpload.tsx
│   │       └── RangeSlider.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   └── middleware.ts       # Auth middleware
│   │   ├── constants.ts            # Regions, usage types, facilities enums
│   │   ├── types.ts                # TypeScript types for listings, profiles, etc.
│   │   └── utils.ts                # Formatting helpers (currency, area, etc.)
│   └── hooks/
│       ├── useListings.ts          # Fetch/search listings
│       ├── useAuth.ts              # Auth state
│       └── useFilters.ts           # URL-synced filter state
├── supabase/
│   └── migrations/                 # SQL migration files
│       └── 001_initial_schema.sql
└── middleware.ts                    # Next.js middleware for auth redirect
```

---

## Design & Aesthetic Guidelines

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary (CTA, accents) | Green | `#2E7D32` or similar |
| Primary hover | Darker green | `#1B5E20` |
| Background | White | `#FFFFFF` |
| Surface/Cards | Light gray | `#F5F5F5` |
| Border | Gray | `#E0E0E0` |
| Text primary | Dark gray/black | `#212121` |
| Text secondary | Medium gray | `#757575` |
| Error | Red | `#D32F2F` |
| Energy label A | Green | varies by year |
| Energy label G | Red | `#D32F2F` |

### Typography
- Sans-serif font stack (Inter, system-ui, or similar clean font)
- Clear hierarchy: large bold headings, regular weight body text
- Danish characters (æ, ø, å) must render correctly everywhere

### Component Patterns
- **Cards**: Rounded corners (8px), subtle shadow, hover elevation
- **Buttons**: Green primary, white/outlined secondary, rounded (6px)
- **Inputs**: Full-width, light border, focus ring in green
- **Badges**: Rounded pill shape for property type labels
- **Tabs**: Underline-style active indicator in green
- **Filter sidebar**: Collapsible sections with +/- toggles (matching ejendomstorvet.dk)

### Responsive Breakpoints
- Mobile: < 768px (single column, bottom nav possible)
- Tablet: 768px - 1024px (2-column grid)
- Desktop: > 1024px (3-column grid, sidebar visible)

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Lint check
npm run type-check   # TypeScript check
```

---

## Development Conventions

### Code Style
- **TypeScript** strict mode enabled
- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Component files use PascalCase: `PropertyCard.tsx`
- Utility files use camelCase: `formatCurrency.ts`
- All user-facing strings in Danish
- Use `'use client'` directive only where needed (interactive components)
- Prefer Server Components where possible for performance

### State Management
- URL search params as the primary state for search/filter (via `useSearchParams`)
- React state for local component state (form steps, UI toggles)
- Supabase real-time not needed initially

### Data Fetching
- Server Components with direct Supabase queries where possible
- Client-side fetching via custom hooks for interactive features
- Use Supabase's `.from().select()` query builder

### Form Handling
- Multi-step form with local state + validation per step
- File uploads direct to Supabase Storage
- Form validation before submission (required fields marked)
- Draft saving enabled at any step

### Git Workflow
- Feature branches off `main`
- Descriptive commit messages in English
- No force-pushes to main

---

## Key Implementation Notes

1. **Search URL Sync**: All search filters should be reflected in URL query parameters so searches are shareable and bookmarkable.

2. **Image Optimization**: Use Next.js `<Image>` component for all property photos. Store originals in Supabase Storage.

3. **Map Integration**: Leaflet (free) preferred. Show property markers, click to open detail. Support list/map view toggle.

4. **Energy Labels**: Display as colored circles matching Danish energy label standards (A2020=dark green, through G=red).

5. **Number Formatting**: Danish locale — use period as thousands separator, comma for decimals. Currency shown as "1.250.000 DKK".

6. **Authentication Flow**: Redirect to `/login` when accessing protected routes. After login, redirect back to intended page.

7. **Listing Form**: Progress indicator showing all 10 steps in left sidebar. Steps can be navigated non-linearly. Validation occurs on "Publicer annoncen" (Publish).

8. **Statistics**: All charts derive from real listing data in the database. Use server-side aggregation queries for performance.

9. **Facilities**: Store as an array of string identifiers. Render with appropriate icons in both the form and detail views.

10. **Empty States**: Provide clear empty states for: no search results, no listings created, no statistics available.
