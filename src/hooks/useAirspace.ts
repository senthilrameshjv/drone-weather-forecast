import { useEffect, useState } from 'react'
import type { Coords } from './useGeolocation'
import { getAirspaceAssessment } from '../api/airspace'
import type { AirspaceAssessment } from '../types/airspace'

interface AirspaceState {
  assessment: AirspaceAssessment | null
  loading: boolean
  error: string | null
}

const cache = new Map<string, { assessment: AirspaceAssessment; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function useAirspace(coords: Coords | null): AirspaceState {
  const [state, setState] = useState<AirspaceState>({
    assessment: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!coords) return

    let cancelled = false
    const key = `${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`
    const cached = cache.get(key)

    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      queueMicrotask(() => {
        if (!cancelled) {
          setState({ assessment: cached.assessment, loading: false, error: null })
        }
      })
      return () => {
        cancelled = true
      }
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setState(prev => ({ ...prev, loading: true, error: null }))
      }
    })

    getAirspaceAssessment(coords.lat, coords.lon)
      .then((assessment) => {
        if (cancelled) return
        cache.set(key, { assessment, ts: Date.now() })
        setState({ assessment, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setState(prev => ({ ...prev, loading: false, error: err.message }))
      })

    return () => {
      cancelled = true
    }
  }, [coords])

  return state
}
