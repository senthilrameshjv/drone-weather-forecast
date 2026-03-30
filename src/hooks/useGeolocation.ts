import { useState, useCallback } from 'react'

export interface Coords {
  lat: number
  lon: number
}

export type LocationSource = 'gps' | 'ip'

interface GeolocationState {
  coords: Coords | null
  source: LocationSource | null
  error: string | null
  loading: boolean
  requestLocation: () => void
}

// IP-based fallback using ipapi.co (free, HTTPS, no key required)
async function getIpLocation(): Promise<Coords> {
  const res = await fetch('https://ipapi.co/json/')
  if (!res.ok) throw new Error('IP location failed')
  const data = await res.json()
  if (!data.latitude || !data.longitude) throw new Error('IP location unavailable')
  return { lat: data.latitude, lon: data.longitude }
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [source, setSource] = useState<LocationSource | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      // No GPS support at all — go straight to IP fallback
      getIpLocation()
        .then(c => { setCoords(c); setSource('ip') })
        .catch(() => setError('Unable to determine your location.'))
        .finally(() => setLoading(false))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude })
        setSource('gps')
        setLoading(false)
      },
      (_err) => {
        // GPS failed (timeout, unavailable, or Firefox MLS issue) — try IP fallback
        getIpLocation()
          .then(c => { setCoords(c); setSource('ip') })
          .catch(() => {
            setError(
              _err.code === _err.PERMISSION_DENIED
                ? 'Location permission denied. Please allow location access and try again.'
                : 'Unable to determine your location. Check your browser settings.'
            )
          })
          .finally(() => setLoading(false))
      },
      { timeout: 15000, maximumAge: 300000 }
    )
  }, [])

  return { coords, source, error, loading, requestLocation }
}
