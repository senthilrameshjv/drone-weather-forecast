import type { DayForecast } from '../../types/forecast'
import type { GoNoGoVerdict } from '../../types/forecast'
import { formatDay } from '../../utils/formatters'
import { celsiusToFahrenheit } from '../../utils/units'
import { WeatherIcon } from '../shared/WeatherIcon'
import { WindDirectionArrow } from '../shared/WindDirectionArrow'

const badgeStyle: Record<GoNoGoVerdict, string> = {
  GO: 'bg-green-900 text-green-400 border-green-700',
  CAUTION: 'bg-yellow-900 text-yellow-400 border-yellow-700',
  NO_GO: 'bg-red-900 text-red-400 border-red-700',
}

const badgeLabel: Record<GoNoGoVerdict, string> = {
  GO: 'GO',
  CAUTION: 'CAUTION',
  NO_GO: 'NO-GO',
}

interface DayRowProps {
  day: DayForecast
  isExpanded: boolean
  onClick: () => void
}

export function DayRow({ day, isExpanded, onClick }: DayRowProps) {
  const verdict = day.goNoGo.verdict
  const maxF = celsiusToFahrenheit(day.temperature_2m_max)
  const minF = celsiusToFahrenheit(day.temperature_2m_min)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-left transition-colors hover:bg-gray-750"
    >
      <div className="w-24 flex-shrink-0">
        <span className="text-sm font-medium text-white">{formatDay(day.time)}</span>
      </div>
      <WeatherIcon code={day.weather_code} size="sm" />
      <div className="flex-1 flex items-center gap-3 text-sm text-gray-400">
        <span>{maxF}° / {minF}°F</span>
        <span className="flex items-center gap-1">
          <span>💨</span>
          <span>{day.wind_speed_10m_max.toFixed(0)} mph</span>
          <WindDirectionArrow degrees={day.wind_direction_10m_dominant} size={12} className="text-gray-500" />
        </span>
        {day.precipitation_sum > 0 && (
          <span className="text-blue-400">{day.precipitation_sum.toFixed(1)} mm</span>
        )}
      </div>
      <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${badgeStyle[verdict]}`}>
        {badgeLabel[verdict]}
      </span>
      <span className={`flex-shrink-0 text-sm text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  )
}
