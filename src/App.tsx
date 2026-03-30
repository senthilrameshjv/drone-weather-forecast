import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { useGoNoGo } from './hooks/useGoNoGo'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { GoNoGoBadge } from './components/gonogo/GoNoGoBadge'
import { ScoreBreakdown } from './components/gonogo/ScoreBreakdown'
import { CurrentConditions } from './components/current/CurrentConditions'
import { HourlyForecast } from './components/hourly/HourlyForecast'
import { DailyForecast } from './components/daily/DailyForecast'
import { LoadingSpinner } from './components/shared/LoadingSpinner'
import { ErrorMessage } from './components/shared/ErrorMessage'
import { getWmoInfo } from './utils/wmoCode'
import { formatDate } from './utils/formatters'

function App() {
  const { coords, source: locationSource, error: geoError, loading: geoLoading, requestLocation } = useGeolocation()
  const { data, locationName, loading: weatherLoading, error: weatherError } = useWeather(coords)
  const { current: currentGoNoGo, hourly, daily } = useGoNoGo(data)

  const isLoading = geoLoading || weatherLoading
  const error = geoError ?? weatherError

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header
        locationName={locationName}
        locationSource={locationSource}
        locationLoading={geoLoading}
        locationError={geoError}
        onDetectLocation={requestLocation}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">

        {/* Welcome state — also shown after geo error so user can retry */}
        {!coords && !isLoading && !data && (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🚁</div>
            <h2 className="text-2xl font-bold text-white">Ready to fly?</h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Tap <strong>Detect Location</strong> above to check current drone flying conditions at your location.
            </p>
            {geoError && (
              <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-2 max-w-xs mx-auto">
                {geoError}
              </p>
            )}
            <button
              onClick={requestLocation}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              ⊕ {geoError ? 'Try Again' : 'Detect My Location'}
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <LoadingSpinner message={geoLoading ? 'Getting your location…' : 'Fetching weather data…'} />
        )}

        {/* Error (non-geo errors) */}
        {!isLoading && weatherError && (
          <ErrorMessage
            message={weatherError}
            onRetry={requestLocation}
          />
        )}

        {/* Main content */}
        {!isLoading && data && currentGoNoGo && (
          <>
            {/* Current weather description */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="text-xl">{getWmoInfo(data.current.weather_code).icon}</span>
              <span>{getWmoInfo(data.current.weather_code).description}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500 text-xs">Updated {formatDate(data.current.time)}</span>
            </div>

            {/* Go/No-Go Badge */}
            <GoNoGoBadge result={currentGoNoGo} />

            {/* Score Breakdown */}
            <ScoreBreakdown result={currentGoNoGo} />

            {/* Current Conditions */}
            <CurrentConditions current={data.current} />

            {/* Hourly Forecast */}
            {hourly.length > 0 && <HourlyForecast slots={hourly} />}

            {/* Daily Forecast */}
            {daily.length > 0 && <DailyForecast days={daily} />}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
