import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Crosshair } from 'lucide-react'

// Leaflet CSS injected once
let leafletCSSInjected = false
function injectLeafletCSS() {
  if (leafletCSSInjected) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
  leafletCSSInjected = true
}

// Fix default marker icons (Leaflet + Vite issue)
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

/* ─────────────────────────────────────────────────────────────
   VIEW-ONLY MAP — shows a pin at given lat/lng
───────────────────────────────────────────────────────────── */
export function ComplaintMapView({ latitude, longitude, address, district, state, height = '280px' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  const hasCoords = !isNaN(lat) && !isNaN(lng)

  useEffect(() => {
    if (!hasCoords) return
    injectLeafletCSS()

    let L
    import('leaflet').then(mod => {
      L = mod.default
      fixLeafletIcons(L)

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Custom red marker
      const redIcon = L.divIcon({
        html: `
          <div style="
            width:36px; height:36px;
            background: linear-gradient(135deg,#ef4444,#dc2626);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(239,68,68,0.5);
          "></div>
        `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      const locationLabel = [address, district, state].filter(Boolean).join(', ') || 'Complaint Location'

      L.marker([lat, lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <div style="font-weight:600;color:#0f172a;margin-bottom:4px">📍 Complaint Location</div>
            <div style="font-size:12px;color:#475569">${locationLabel}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          </div>
        `, { maxWidth: 220 })
        .openPopup()

      // Pulse circle
      L.circle([lat, lng], {
        radius: 200,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(map)

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, hasCoords])

  if (!hasCoords) {
    return (
      <div
        style={{ height }}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-card-2)] flex flex-col items-center justify-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-gray-500" />
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">No GPS coordinates</p>
          <p className="text-gray-600 text-xs mt-1">
            {[district, state].filter(Boolean).join(', ') || 'Location not specified'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-[var(--border)]" style={{ height }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {/* Location label overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-white text-xs truncate">
            {[address, district, state].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   INTERACTIVE PICKER — click to set location
───────────────────────────────────────────────────────────── */
export function ComplaintMapPicker({ latitude, longitude, onLocationChange, height = '300px' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState(
    latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null
  )

  // Default center: India
  const DEFAULT_CENTER = [20.5937, 78.9629]
  const DEFAULT_ZOOM = 5

  useEffect(() => {
    injectLeafletCSS()

    let L
    import('leaflet').then(mod => {
      L = mod.default
      fixLeafletIcons(L)

      if (mapInstanceRef.current) return
      if (!mapRef.current) return

      const initialCenter = coords ? [coords.lat, coords.lng] : DEFAULT_CENTER
      const initialZoom = coords ? 14 : DEFAULT_ZOOM

      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Custom draggable marker icon
      const pinIcon = L.divIcon({
        html: `
          <div style="
            width:32px; height:32px;
            background: linear-gradient(135deg,#3b82f6,#2563eb);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(59,130,246,0.5);
            cursor: grab;
          "></div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      // Place marker if coords exist
      if (coords) {
        const marker = L.marker([coords.lat, coords.lng], { icon: pinIcon, draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setCoords({ lat: pos.lat, lng: pos.lng })
          onLocationChange?.({ latitude: pos.lat, longitude: pos.lng })
        })
        markerRef.current = marker
      }

      // Click to place/move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        setCoords({ lat, lng })
        onLocationChange?.({ latitude: lat, longitude: lng })

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map)
          marker.on('dragend', () => {
            const pos = marker.getLatLng()
            setCoords({ lat: pos.lat, lng: pos.lng })
            onLocationChange?.({ latitude: pos.lat, longitude: pos.lng })
          })
          markerRef.current = marker
        }
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocating(false)
        setCoords({ lat, lng })
        onLocationChange?.({ latitude: lat, longitude: lng })

        import('leaflet').then(mod => {
          const L = mod.default
          const map = mapInstanceRef.current
          if (!map) return
          map.setView([lat, lng], 15)

          const pinIcon = L.divIcon({
            html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);cursor:grab;"></div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          })

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
          } else {
            const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map)
            marker.on('dragend', () => {
              const p = marker.getLatLng()
              setCoords({ lat: p.lat, lng: p.lng })
              onLocationChange?.({ latitude: p.lat, longitude: p.lng })
            })
            markerRef.current = marker
          }
        })
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Click on the map to pin your location, or drag the marker</p>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg px-3 py-1.5 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          {locating ? (
            <><div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" /> Locating...</>
          ) : (
            <><Crosshair className="w-3 h-3" /> Use My Location</>
          )}
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-[var(--border)]" style={{ height }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {!coords && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
              <Navigation className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white text-xs font-medium">Click anywhere to pin location</p>
            </div>
          </div>
        )}
      </div>

      {/* Coords display */}
      {coords && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Pinned: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
          <button
            type="button"
            onClick={() => {
              setCoords(null)
              onLocationChange?.({ latitude: null, longitude: null })
              if (markerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current)
                markerRef.current = null
              }
            }}
            className="ml-auto text-gray-600 hover:text-red-400 transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  )
}
