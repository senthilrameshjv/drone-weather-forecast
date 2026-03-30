import type { LocationName, SearchResult } from '../../api/geocoding'
import type { LocationSource } from '../../hooks/useGeolocation'
import { LocationBar } from '../location/LocationBar'

interface HeaderProps {
  locationName: LocationName | null
  locationSource: LocationSource | null
  locationLoading: boolean
  locationError: string | null
  onDetectLocation: () => void
  onManualSelect: (result: SearchResult) => void
}

export function Header({
  locationName,
  locationSource,
  locationLoading,
  locationError,
  onDetectLocation,
  onManualSelect,
}: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚁</span>
          <h1 className="text-lg font-bold text-white tracking-tight">UAV Forecast</h1>
          <span className="text-xs text-gray-500 ml-1">Drone Flight Conditions</span>
        </div>
        <LocationBar
          locationName={locationName}
          locationSource={locationSource}
          loading={locationLoading}
          error={locationError}
          onDetect={onDetectLocation}
          onManualSelect={onManualSelect}
        />
      </div>
    </header>
  )
}
