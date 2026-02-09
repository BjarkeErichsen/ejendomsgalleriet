'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUsageLabel, getRegionLabel } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { Listing } from '@/lib/types'

const CHART_COLORS = ['#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#0D47A1', '#1565C0', '#9E9D24', '#F9A825', '#EF6C00']

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function StatistikPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
      setListings((data as Listing[]) || [])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Statistik</h1>
        <p className="text-gray-500">Ingen data tilgængelig. Statistikker vises når der er opslag på platformen.</p>
      </div>
    )
  }

  // Listings by type
  const byType = Object.entries(
    listings.reduce((acc, l) => {
      const key = l.primary_usage
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([key, count]) => ({ name: getUsageLabel(key), count }))
    .sort((a, b) => b.count - a.count)

  // Listings by region
  const byRegion = Object.entries(
    listings.reduce((acc, l) => {
      if (l.region) {
        acc[l.region] = (acc[l.region] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  ).map(([key, count]) => ({ name: getRegionLabel(key), count }))
    .sort((a, b) => b.count - a.count)

  // Average rent per m² by type
  const avgRentByType = Object.entries(
    listings.reduce((acc, l) => {
      if (l.annual_rent_dkk && l.primary_area_m2) {
        const key = l.primary_usage
        if (!acc[key]) acc[key] = { total: 0, count: 0 }
        acc[key].total += l.annual_rent_dkk / l.primary_area_m2
        acc[key].count += 1
      }
      return acc
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([key, { total, count }]) => ({
    name: getUsageLabel(key),
    avg: Math.round(total / count),
  }))

  // Listings over time
  const byMonth = Object.entries(
    listings.reduce((acc, l) => {
      const date = new Date(l.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // By transaction type for pie chart
  const byTransaction = Object.entries(
    listings.reduce((acc, l) => {
      acc[l.transaction_type] = (acc[l.transaction_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([key, count]) => ({
    name: key === 'leje' ? 'Leje' : key === 'salg' ? 'Salg' : 'Investering',
    value: count,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistik</h1>
      <p className="text-gray-500 mb-8">Markedsoverblik baseret på {listings.length} aktive opslag</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Aktive opslag</p>
          <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Til leje</p>
          <p className="text-2xl font-bold text-blue-700">{listings.filter(l => l.transaction_type === 'leje').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Til salg</p>
          <p className="text-2xl font-bold text-blue-700">{listings.filter(l => l.transaction_type === 'salg').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Investering</p>
          <p className="text-2xl font-bold text-orange-600">{listings.filter(l => l.transaction_type === 'investering').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Opslag efter type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} name="Antal" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fordeling efter transaktionstype">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byTransaction}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {byTransaction.map((_, i) => (
                  <Cell key={i} fill={['#1565C0', '#1565C0', '#EF6C00'][i % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Opslag efter region">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#1976D2" radius={[0, 4, 4, 0]} name="Antal" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {avgRentByType.length > 0 && (
          <ChartCard title="Gennemsnitlig leje pr. m² (DKK/år)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgRentByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} DKK/m²`, 'Gns. leje']} />
                <Bar dataKey="avg" fill="#1E88E5" radius={[4, 4, 0, 0]} name="DKK/m²" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {byMonth.length > 1 && (
          <ChartCard title="Opslag over tid">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1565C0" strokeWidth={2} dot={{ fill: '#1565C0' }} name="Antal" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
