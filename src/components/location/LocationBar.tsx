import { useState } from 'react'
import type { LocationName } from '../../api/geocoding'
import type { SearchResult } from '../../api/geocoding'
import type { LocationSource } from '../../hooks/useGeolocation'
import { LocationSearch } from './LocationSearch'

interface LocationBarProps {
  locationName: LocationName | null
  locationSource: LocationSource | null
  loading: boolean
  error: string | null
  onDetect: () => void
  onManualSelect: (result: SearchResult) => void
}

export function LocationBar({ locationName, locationSource, loading, error, onDetect, onManualSelect }: LocationBarProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2 text-gray-300">
        <span className="text-base">
          {locationSource === 'manual' ? '🔎' : locationSource === 'ip' ? '🌐' : '📍'}
        </span>
        <div className="min-w-0">
          {locationName ? (
            <span className="block truncate text-sm font-medium">
              {locationName.city}{locationName.region ? `, ${locationName.region}` : ''}
              {locationSource === 'ip' && (
                <span className="ml-1 text-xs font-normal text-gray-500">(approximate)</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-gray-500">No location set</span>
          )}
          {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
        </div>
      </div>

      <div className="relative flex w-full max-w-xs flex-col items-end gap-2">
        <button
          onClick={onDetect}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700"
        >
          {loading ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Detecting...
            </>
          ) : (
            <>⊕ Detect Location</>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowSearch(open => !open)}
          className="text-xs text-blue-400 transition-colors hover:text-blue-300"
        >
          {showSearch ? 'close search' : 'or search manually ->'}
        </button>

        {showSearch && (
          <LocationSearch
            onClose={() => setShowSearch(false)}
            onSelect={(result) => {
              onManualSelect(result)
              setShowSearch(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
