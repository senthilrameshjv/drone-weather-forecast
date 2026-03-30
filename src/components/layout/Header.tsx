import type { LocationName } from '../../api/geocoding'
import { LocationBar } from '../location/LocationBar'

interface HeaderProps {
  locationName: LocationName | null
  locationLoading: boolean
  locationError: string | null
  onDetectLocation: () => void
}

export function Header({ locationName, locationLoading, locationError, onDetectLocation }: HeaderProps) {
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
          loading={locationLoading}
          error={locationError}
          onDetect={onDetectLocation}
        />
      </div>
    </header>
  )
}
