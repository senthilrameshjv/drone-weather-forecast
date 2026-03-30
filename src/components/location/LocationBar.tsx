import type { LocationName } from '../../api/geocoding'

interface LocationBarProps {
  locationName: LocationName | null
  loading: boolean
  error: string | null
  onDetect: () => void
}

export function LocationBar({ locationName, loading, error, onDetect }: LocationBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-gray-300 min-w-0">
        <span className="text-base">📍</span>
        {locationName ? (
          <span className="text-sm font-medium truncate">
            {locationName.city}{locationName.region ? `, ${locationName.region}` : ''}
          </span>
        ) : (
          <span className="text-sm text-gray-500">No location set</span>
        )}
      </div>

      <button
        onClick={onDetect}
        disabled={loading}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Detecting…
          </>
        ) : (
          <>⊕ Detect Location</>
        )}
      </button>

    </div>
  )
}
