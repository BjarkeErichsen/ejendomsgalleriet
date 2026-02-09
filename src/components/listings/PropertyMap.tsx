'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface PropertyMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  className?: string
  /** Label above price, e.g. "Leje" or "Salg" */
  priceLabel?: string
  /** Formatted price text, e.g. "180.800 DKK" */
  priceText?: string
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.dataforsyningen.dk/adresser?q=${encodeURIComponent(address)}&struktur=mini&per_side=1`
    )
    const data = await res.json()
    if (data?.[0]?.y && data?.[0]?.x) {
      return { lat: data[0].y, lng: data[0].x }
    }
  } catch {
    // Fallback to Nominatim if DAWA fails
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=dk&limit=1`
      )
      const data = await res.json()
      if (data?.[0]) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
    } catch {
      // geocoding failed
    }
  }
  return null
}

export function PropertyMap({ latitude, longitude, address, className, priceLabel, priceText }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )
  const [geocoding, setGeocoding] = useState(false)

  // Geocode from address if no coordinates provided
  useEffect(() => {
    if (latitude && longitude) {
      setResolvedCoords({ lat: latitude, lng: longitude })
      return
    }
    if (!address) return

    setGeocoding(true)
    geocodeAddress(address).then((coords) => {
      if (coords) setResolvedCoords(coords)
      setGeocoding(false)
    })
  }, [latitude, longitude, address])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !resolvedCoords) return

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      const map = L.map(mapRef.current).setView([resolvedCoords.lat, resolvedCoords.lng], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (priceLabel && priceText) {
        // Price marker matching ejendomstorvet.dk style:
        // Teal label on top + dark box with price below + arrow
        const priceIcon = L.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;position:relative">
              <div style="
                background:#0E7569;
                color:#fff;
                padding:2px 8px;
                border-radius:3px;
                font-size:11px;
                font-weight:600;
                letter-spacing:0.3px;
                margin-bottom:2px;
              ">${priceLabel}</div>
              <div style="
                background:#1a1a1a;
                color:#fff;
                padding:5px 12px;
                border-radius:4px;
                font-weight:700;
                font-size:14px;
                white-space:nowrap;
                box-shadow:0 2px 6px rgba(0,0,0,0.3);
                position:relative;
              ">
                ${priceText}
                <div style="
                  position:absolute;
                  bottom:-7px;
                  left:50%;
                  transform:translateX(-50%);
                  width:0;height:0;
                  border-left:7px solid transparent;
                  border-right:7px solid transparent;
                  border-top:7px solid #1a1a1a;
                "></div>
              </div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [60, 58],
        })
        L.marker([resolvedCoords.lat, resolvedCoords.lng], { icon: priceIcon }).addTo(map)
      } else {
        const marker = L.marker([resolvedCoords.lat, resolvedCoords.lng]).addTo(map)
        if (address) {
          marker.bindPopup(`<strong>${address}</strong>`).openPopup()
        }
      }

      mapInstanceRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [resolvedCoords, address, priceLabel, priceText])

  if (geocoding) {
    return (
      <div className={cn('rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center', className)} style={{ height: '400px' }}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-700 mx-auto mb-2" />
          <p className="text-sm">Finder placering...</p>
        </div>
      </div>
    )
  }

  if (!resolvedCoords) {
    return (
      <div className={cn('rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center', className)} style={{ height: '400px' }}>
        <div className="text-center text-gray-500">
          <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">{address || 'Adresse ikke tilgængelig'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className={cn('rounded-lg overflow-hidden', className)}
        style={{ height: '400px', width: '100%' }}
      />
    </>
  )
}
