import { useState, useCallback } from 'react'

export interface Coords {
  lat: number
  lon: number
}

interface GeolocationState {
  coords: Coords | null
  error: string | null
  loading: boolean
  requestLocation: () => void
}

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please allow location access and try again.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Check your device settings.')
            break
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.')
            break
          default:
            setError('Unable to retrieve location.')
        }
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return { coords, error, loading, requestLocation }
}
