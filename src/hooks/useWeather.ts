import { useState, useEffect, useRef } from 'react'
import type { Coords } from './useGeolocation'
import type { OpenMeteoResponse } from '../types/weather'
import { fetchWeather } from '../api/openMeteo'
import { reverseGeocode } from '../api/geocoding'
import type { LocationName } from '../api/geocoding'

interface WeatherState {
  data: OpenMeteoResponse | null
  locationName: LocationName | null
  loading: boolean
  error: string | null
}

const cache = new Map<string, { data: OpenMeteoResponse; locationName: LocationName; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000  // 5 minutes

export function useWeather(coords: Coords | null): WeatherState {
  const [state, setState] = useState<WeatherState>({
    data: null,
    locationName: null,
    loading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!coords) return

    const key = `${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`
    const cached = cache.get(key)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setState({ data: cached.data, locationName: cached.locationName, loading: false, error: null })
      return
    }

    abortRef.current?.abort()
    setState(prev => ({ ...prev, loading: true, error: null }))

    Promise.all([
      fetchWeather(coords.lat, coords.lon),
      reverseGeocode(coords.lat, coords.lon).catch(() => ({ city: 'Unknown Location', region: '' })),
    ])
      .then(([data, locationName]) => {
        cache.set(key, { data, locationName, ts: Date.now() })
        setState({ data, locationName, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setState(prev => ({ ...prev, loading: false, error: err.message }))
      })
  }, [coords?.lat, coords?.lon])

  return state
}
