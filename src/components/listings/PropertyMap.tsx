'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PropertyMapProps {
  latitude: number
  longitude: number
  address?: string
  className?: string
  /** Label above price, e.g. "Leje" or "Salg" */
  priceLabel?: string
  /** Formatted price text, e.g. "180.800 DKK" */
  priceText?: string
}

export function PropertyMap({ latitude, longitude, address, className, priceLabel, priceText }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import of Leaflet (it needs window/DOM)
    import('leaflet').then((L) => {
      // Fix default marker icons for webpack/next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      const map = L.map(mapRef.current).setView([latitude, longitude], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (priceLabel && priceText) {
        // Custom price marker (like ejendomstorvet.dk)
        const priceIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              background: #F59E0B;
              color: #000;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 700;
              font-size: 13px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              text-align: center;
              line-height: 1.3;
              position: relative;
            ">
              <div style="font-size:11px;font-weight:600;opacity:0.8">${priceLabel}</div>
              <div>${priceText}</div>
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid #F59E0B;
              "></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 50],
        })
        L.marker([latitude, longitude], { icon: priceIcon }).addTo(map)
      } else {
        // Default pin marker
        const marker = L.marker([latitude, longitude]).addTo(map)
        if (address) {
          marker.bindPopup(`<strong>${address}</strong>`).openPopup()
        }
      }

      mapInstanceRef.current = map

      // Force resize after render
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, address, priceLabel, priceText])

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
        style={{ height: '300px', width: '100%' }}
      />
    </>
  )
}
