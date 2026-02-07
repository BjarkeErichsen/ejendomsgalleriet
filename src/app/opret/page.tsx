'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FileUpload } from '@/components/ui/FileUpload'
import { PRIMARY_USAGE_TYPES, FACILITIES, ENERGY_LABELS, REGIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ListingFormData } from '@/lib/types'

const STEPS = [
  { num: '01', label: 'Adresse', required: true },
  { num: '02', label: 'Anvendelse', required: true },
  { num: '03', label: 'Salg / Leje', required: true },
  { num: '04', label: 'Areal', required: true },
  { num: '05', label: 'Dokumenter', required: true },
  { num: '06', label: 'Beskrivelse & Fakta', required: false },
  { num: '07', label: 'Kontraktforhold', required: false },
  { num: '08', label: 'Prospekt', required: false },
  { num: '09', label: 'Eksterne oplysninger', required: false },
  { num: '10', label: 'Kontaktperson', required: true },
]

const initialFormData: ListingFormData = {
  address_street: '',
  address_postal_code: '',
  address_city: '',
  primary_usage: '',
  transaction_type: 'leje',
  monthly_rent_dkk: '',
  annual_rent_dkk: '',
  deposit_months: '',
  deposit_dkk: '',
  operating_costs_monthly: '',
  operating_costs_annual: '',
  prepaid_consumption_monthly: '',
  prepaid_consumption_annual: '',
  transfer_fee_dkk: '',
  sale_price_dkk: '',
  price_per_m2_dkk: '',
  primary_area_m2: '',
  secondary_area_m2: '',
  plot_area_m2: '',
  video_url: '',
  facilities: [],
  title: '',
  description: '',
  energy_label: '',
  is_listed_building: false,
  handover_condition: 'Efter aftale',
  vacating_condition: 'Efter aftale',
  notice_period_months: '0',
  notice_period_years: '0',
  non_cancellation_months: '0',
  non_cancellation_years: '0',
  sublease_right: null,
  transfer_right: null,
  rent_adjustment: 'Efter aftale',
  rent_adjustment_percent: '',
  maintenance_note: '',
  external_link: '',
  internal_case_number: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  contact_company: '',
}

export default function OpretPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ListingFormData>(initialFormData)
  const [photos, setPhotos] = useState<File[]>([])
  const [floorplans, setFloorplans] = useState<File[]>([])
  const [prospectFile, setProspectFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateField = useCallback(<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleFacility = useCallback((facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }))
  }, [])

  const uploadFiles = async (listingId: string) => {
    const imageRecords: { storage_path: string; url: string; type: string; sort_order: number }[] = []

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const path = `${user!.id}/${listingId}/photos/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(path, file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
        imageRecords.push({ storage_path: path, url: urlData.publicUrl, type: 'photo', sort_order: i })
      }
    }

    for (let i = 0; i < floorplans.length; i++) {
      const file = floorplans[i]
      const path = `${user!.id}/${listingId}/floorplans/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(path, file)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
        imageRecords.push({ storage_path: path, url: urlData.publicUrl, type: 'floorplan', sort_order: i })
      }
    }

    if (imageRecords.length > 0) {
      await supabase.from('listing_images').insert(imageRecords.map(r => ({ listing_id: listingId, ...r })))
    }

    if (prospectFile) {
      const path = `${user!.id}/${listingId}/docs/${Date.now()}-${prospectFile.name}`
      const { error: uploadError } = await supabase.storage.from('listing-documents').upload(path, prospectFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('listing-documents').getPublicUrl(path)
        await supabase.from('listing_documents').insert({
          listing_id: listingId,
          storage_path: path,
          url: urlData.publicUrl,
          filename: prospectFile.name,
          file_type: 'prospekt',
        })
      }
    }
  }

  const saveListing = async (status: 'draft' | 'published') => {
    if (!user) return
    setSaving(true)
    setError('')

    try {
      const toInt = (v: string) => v ? parseInt(v, 10) || null : null
      const toFloat = (v: string) => v ? parseFloat(v) || null : null

      const listingData = {
        user_id: user.id,
        status,
        transaction_type: formData.transaction_type,
        primary_usage: formData.primary_usage,
        title: formData.title || null,
        description: formData.description,
        address_street: formData.address_street,
        address_postal_code: formData.address_postal_code,
        address_city: formData.address_city,
        region: REGIONS.find(r =>
          formData.address_city.toLowerCase().includes('københavn') ? r.value === 'byen_koebenhavn' : false
        )?.value || '',
        primary_area_m2: toInt(formData.primary_area_m2),
        secondary_area_m2: toInt(formData.secondary_area_m2),
        plot_area_m2: toInt(formData.plot_area_m2),
        monthly_rent_dkk: toInt(formData.monthly_rent_dkk),
        annual_rent_dkk: toInt(formData.annual_rent_dkk),
        deposit_months: toInt(formData.deposit_months),
        deposit_dkk: toInt(formData.deposit_dkk),
        operating_costs_monthly: toInt(formData.operating_costs_monthly),
        operating_costs_annual: toInt(formData.operating_costs_annual),
        prepaid_consumption_monthly: toInt(formData.prepaid_consumption_monthly),
        prepaid_consumption_annual: toInt(formData.prepaid_consumption_annual),
        transfer_fee_dkk: toInt(formData.transfer_fee_dkk),
        sale_price_dkk: toInt(formData.sale_price_dkk),
        price_per_m2_dkk: toInt(formData.price_per_m2_dkk),
        yield_percent: toFloat(formData.rent_adjustment_percent) ? undefined : null,
        energy_label: formData.energy_label || null,
        is_listed_building: formData.is_listed_building,
        handover_condition: formData.handover_condition || null,
        vacating_condition: formData.vacating_condition || null,
        notice_period_months: toInt(formData.notice_period_months),
        notice_period_years: toInt(formData.notice_period_years),
        non_cancellation_months: toInt(formData.non_cancellation_months),
        non_cancellation_years: toInt(formData.non_cancellation_years),
        sublease_right: formData.sublease_right,
        transfer_right: formData.transfer_right,
        rent_adjustment: formData.rent_adjustment || null,
        rent_adjustment_percent: toFloat(formData.rent_adjustment_percent),
        maintenance_note: formData.maintenance_note || null,
        external_link: formData.external_link || null,
        internal_case_number: formData.internal_case_number || null,
        video_url: formData.video_url || null,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        contact_company: formData.contact_company || null,
      }

      const { data, error: insertError } = await supabase
        .from('listings')
        .insert(listingData)
        .select('id')
        .single()

      if (insertError) throw insertError

      // Upload files
      await uploadFiles(data.id)

      // Insert facilities
      if (formData.facilities.length > 0) {
        await supabase.from('listing_facilities').insert(
          formData.facilities.map(f => ({ listing_id: data.id, facility: f }))
        )
      }

      router.push('/mine-opslag')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Der opstod en fejl'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Opret annonce</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => saveListing('draft')} disabled={saving}>
            Gem som kladde
          </Button>
          <Button variant="primary" onClick={() => saveListing('published')} disabled={saving}>
            {saving ? 'Gemmer...' : 'Publicer annoncen'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-8">
        {/* Step sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            {STEPS.map((step, idx) => (
              <button
                key={step.num}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left',
                  currentStep === idx
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span className="text-xs font-medium w-5">{step.num}</span>
                <span>{step.label}</span>
                {!step.required && (
                  <span className="ml-auto text-xs text-gray-400">Valgfri</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile step indicator */}
        <div className="lg:hidden mb-4 w-full">
          <Select
            options={STEPS.map((s, i) => ({ value: String(i), label: `${s.num} ${s.label}` }))}
            value={String(currentStep)}
            onChange={(e) => setCurrentStep(Number(e.target.value))}
          />
        </div>

        {/* Form content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
            {/* Step 0: Adresse */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Adresse</h2>
                <Input
                  label="Vejnavn"
                  placeholder="Skriv og vælg adresse fra listen"
                  value={formData.address_street}
                  onChange={(e) => updateField('address_street', e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postnummer"
                    placeholder="F.eks. 2100"
                    value={formData.address_postal_code}
                    onChange={(e) => updateField('address_postal_code', e.target.value)}
                    required
                  />
                  <Input
                    label="By"
                    placeholder="F.eks. København"
                    value={formData.address_city}
                    onChange={(e) => updateField('address_city', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 1: Anvendelse */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Primær anvendelse</h2>
                <div className="flex flex-wrap gap-3">
                  {PRIMARY_USAGE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateField('primary_usage', type.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                        formData.primary_usage === type.value
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Salg / Leje */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Leje / Salg</h2>
                <div className="flex gap-3">
                  {(['leje', 'salg'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateField('transaction_type', type)}
                      className={cn(
                        'px-6 py-2.5 rounded-md text-sm font-medium transition-colors',
                        formData.transaction_type === type
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {type === 'leje' ? 'Leje' : 'Salg'}
                    </button>
                  ))}
                </div>

                {formData.transaction_type === 'leje' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Leje pr. md." suffix="DKK" value={formData.monthly_rent_dkk} onChange={(e) => updateField('monthly_rent_dkk', e.target.value)} type="number" placeholder="Pris" />
                      <Input label="Leje pr. år" suffix="DKK" value={formData.annual_rent_dkk} onChange={(e) => updateField('annual_rent_dkk', e.target.value)} type="number" placeholder="Pris" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Depositum" suffix="måneder" value={formData.deposit_months} onChange={(e) => updateField('deposit_months', e.target.value)} type="number" placeholder="0" />
                      <Input label="Depositum" suffix="DKK" value={formData.deposit_dkk} onChange={(e) => updateField('deposit_dkk', e.target.value)} type="number" placeholder="Pris" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Driftsomkostninger pr. md." suffix="DKK" value={formData.operating_costs_monthly} onChange={(e) => updateField('operating_costs_monthly', e.target.value)} type="number" placeholder="0" />
                      <Input label="Driftsomkostninger pr. år" suffix="DKK" value={formData.operating_costs_annual} onChange={(e) => updateField('operating_costs_annual', e.target.value)} type="number" placeholder="0" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Aconto forbrug pr. md." suffix="DKK" value={formData.prepaid_consumption_monthly} onChange={(e) => updateField('prepaid_consumption_monthly', e.target.value)} type="number" placeholder="0" />
                      <Input label="Aconto forbrug pr. år" suffix="DKK" value={formData.prepaid_consumption_annual} onChange={(e) => updateField('prepaid_consumption_annual', e.target.value)} type="number" placeholder="0" />
                    </div>
                    <Input label="Evt. afståelsesbeløb" suffix="DKK" value={formData.transfer_fee_dkk} onChange={(e) => updateField('transfer_fee_dkk', e.target.value)} type="number" placeholder="0" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input label="Pris" suffix="DKK" value={formData.sale_price_dkk} onChange={(e) => updateField('sale_price_dkk', e.target.value)} type="number" placeholder="Pris" required />
                    <Input label="Pris pr. m²" suffix="DKK" value={formData.price_per_m2_dkk} onChange={(e) => updateField('price_per_m2_dkk', e.target.value)} type="number" placeholder="Pris" />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Areal */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Areal</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Primært areal" suffix="m²" value={formData.primary_area_m2} onChange={(e) => updateField('primary_area_m2', e.target.value)} type="number" placeholder="Kvadratmeter" required />
                  <Input label="Sekundært areal" suffix="m²" value={formData.secondary_area_m2} onChange={(e) => updateField('secondary_area_m2', e.target.value)} type="number" placeholder="Sekundært areal" />
                </div>
                <Input label="Grundareal" suffix="m²" value={formData.plot_area_m2} onChange={(e) => updateField('plot_area_m2', e.target.value)} type="number" placeholder="Grundareal kvadratmeter" />
              </div>
            )}

            {/* Step 4: Dokumenter */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Fotos, Plantegninger & Video</h2>
                <FileUpload
                  label="Billeder"
                  onFilesSelected={(files) => setPhotos(prev => [...prev, ...files])}
                  accept="image/jpeg,image/png,image/jpg"
                  helpText="Maks filstørrelse 20MB. Understøtter jpg, jpeg og png."
                />
                <FileUpload
                  label="Plantegninger"
                  onFilesSelected={(files) => setFloorplans(prev => [...prev, ...files])}
                  accept="image/jpeg,image/png,image/jpg"
                  helpText="Maks filstørrelse 20MB. Understøtter jpg, jpeg og png."
                />
                <Input
                  label="Video"
                  placeholder="Indsæt link til en Youtube-video"
                  value={formData.video_url}
                  onChange={(e) => updateField('video_url', e.target.value)}
                />
                <p className="text-xs text-gray-500">Det er et krav at dit link begynder med https://</p>
              </div>
            )}

            {/* Step 5: Beskrivelse & Fakta */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Beskrivelse & Fakta</h2>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Faciliteter</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FACILITIES.map((fac) => (
                      <button
                        key={fac.value}
                        onClick={() => toggleFacility(fac.value)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm border transition-colors text-left',
                          formData.facilities.includes(fac.value)
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <span className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                          formData.facilities.includes(fac.value) ? 'bg-green-700 border-green-700' : 'border-gray-300'
                        )}>
                          {formData.facilities.includes(fac.value) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        {fac.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Overskrift"
                  placeholder="Titel"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={6}
                    maxLength={2000}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    placeholder="Beskriv lokaletype og område så specifikt som muligt"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/2000 tegn</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Energimærkning</p>
                  <div className="flex gap-2 flex-wrap">
                    {ENERGY_LABELS.map((label) => (
                      <button
                        key={label.value}
                        onClick={() => updateField('energy_label', formData.energy_label === label.value ? '' : label.value)}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform',
                            formData.energy_label === label.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                          )}
                          style={{ backgroundColor: label.color }}
                        >
                          {label.label}
                        </div>
                        {label.year && <span className="text-xs text-gray-500">{label.year}</span>}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.is_listed_building}
                      onChange={(e) => updateField('is_listed_building', e.target.checked)}
                      className="rounded border-gray-300 text-green-700 focus:ring-green-700"
                    />
                    Ingen energimærke / Fredet ejendom
                  </label>
                </div>
              </div>
            )}

            {/* Step 6: Kontraktforhold */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Kontraktforhold</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Overtagelsestilstand"
                    options={[{ value: 'Efter aftale', label: 'Efter aftale' }, { value: 'Nyistandsat', label: 'Nyistandsat' }, { value: 'Som beset', label: 'Som beset' }]}
                    value={formData.handover_condition}
                    onChange={(e) => updateField('handover_condition', e.target.value)}
                  />
                  <Select
                    label="Fraflytningstand"
                    options={[{ value: 'Efter aftale', label: 'Efter aftale' }, { value: 'Nyistandsat', label: 'Nyistandsat' }, { value: 'Som beset', label: 'Som beset' }]}
                    value={formData.vacating_condition}
                    onChange={(e) => updateField('vacating_condition', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opsigelsesvarsel</label>
                    <div className="flex gap-2">
                      <Select options={Array.from({ length: 13 }, (_, i) => ({ value: String(i), label: `${i} måned` }))} value={formData.notice_period_months} onChange={(e) => updateField('notice_period_months', e.target.value)} />
                      <Select options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: `${i} år` }))} value={formData.notice_period_years} onChange={(e) => updateField('notice_period_years', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uopsigelighed</label>
                    <div className="flex gap-2">
                      <Select options={Array.from({ length: 13 }, (_, i) => ({ value: String(i), label: `${i} måned` }))} value={formData.non_cancellation_months} onChange={(e) => updateField('non_cancellation_months', e.target.value)} />
                      <Select options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: `${i} år` }))} value={formData.non_cancellation_years} onChange={(e) => updateField('non_cancellation_years', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Fremlejeret</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="sublease" checked={formData.sublease_right === true} onChange={() => updateField('sublease_right', true)} className="text-green-700 focus:ring-green-700" /> Ja
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="sublease" checked={formData.sublease_right === false} onChange={() => updateField('sublease_right', false)} className="text-green-700 focus:ring-green-700" /> Nej
                      </label>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Afståelsesret</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="transfer" checked={formData.transfer_right === true} onChange={() => updateField('transfer_right', true)} className="text-green-700 focus:ring-green-700" /> Ja
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="transfer" checked={formData.transfer_right === false} onChange={() => updateField('transfer_right', false)} className="text-green-700 focus:ring-green-700" /> Nej
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Lejeregulering"
                    options={[{ value: 'Efter aftale', label: 'Efter aftale' }, { value: 'Nettoprisindeks', label: 'Nettoprisindeks' }, { value: 'Fast procent', label: 'Fast procent' }]}
                    value={formData.rent_adjustment}
                    onChange={(e) => updateField('rent_adjustment', e.target.value)}
                  />
                  <Input label="Procent" suffix="%" value={formData.rent_adjustment_percent} onChange={(e) => updateField('rent_adjustment_percent', e.target.value)} type="number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vedligeholdelse</label>
                  <textarea
                    value={formData.maintenance_note}
                    onChange={(e) => updateField('maintenance_note', e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.maintenance_note.length}/200 tegn</p>
                </div>
              </div>
            )}

            {/* Step 7: Prospekt */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Prospekt</h2>
                <p className="text-sm text-gray-600">Her kan du uploade dit eget prospekt.</p>
                <FileUpload
                  label="Prospekt (PDF)"
                  onFilesSelected={(files) => setProspectFile(files[0] || null)}
                  accept="application/pdf"
                  multiple={false}
                  helpText="Maks filstørrelse 20MB. Understøtter PDF."
                />
              </div>
            )}

            {/* Step 8: Eksterne oplysninger */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Eksterne oplysninger</h2>
                <Input
                  label="Eksternt link"
                  placeholder="Link til sagen på eget website"
                  value={formData.external_link}
                  onChange={(e) => updateField('external_link', e.target.value)}
                />
                <p className="text-xs text-gray-500">Det er et krav at dit link begynder med https://</p>
                <Input
                  label="Internt sagsnr."
                  placeholder="Sagsnr."
                  value={formData.internal_case_number}
                  onChange={(e) => updateField('internal_case_number', e.target.value)}
                />
              </div>
            )}

            {/* Step 9: Kontaktperson */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Kontaktperson</h2>
                <Input label="Navn" value={formData.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} required placeholder="Fulde navn" />
                <Input label="Email" type="email" value={formData.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} required placeholder="email@eksempel.dk" />
                <Input label="Telefon" type="tel" value={formData.contact_phone} onChange={(e) => updateField('contact_phone', e.target.value)} required placeholder="+45 12345678" />
                <Input label="Firma" value={formData.contact_company} onChange={(e) => updateField('contact_company', e.target.value)} placeholder="Firmanavn (valgfri)" />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ← Forrige
              </Button>
              <span className="text-sm text-gray-500">
                Trin {currentStep + 1} af {STEPS.length}
              </span>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                disabled={currentStep === STEPS.length - 1}
              >
                Næste →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
