'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data as Profile)
      setLoading(false)
    }
    fetchProfile()
  }, [user, supabase])

  const handleSave = async () => {
    if (!profile || !user) return
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        company: profile.company,
        phone: profile.phone,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Profil ikke fundet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Min profil</h1>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          Profil opdateret!
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <Input
          label="Email"
          value={user?.email || ''}
          disabled
          name="email"
        />
        <Input
          label="Fulde navn"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          name="fullName"
          placeholder="Dit navn"
        />
        <Input
          label="Firma"
          value={profile.company || ''}
          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
          name="company"
          placeholder="Firmanavn (valgfri)"
        />
        <Input
          label="Telefon"
          value={profile.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          name="phone"
          placeholder="+45 12345678"
          type="tel"
        />
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Gemmer...' : 'Gem ændringer'}
        </Button>
      </div>
    </div>
  )
}
