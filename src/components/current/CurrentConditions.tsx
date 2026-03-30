import type { OpenMeteoCurrent } from '../../types/weather'
import { WeatherStatCard } from './WeatherStatCard'
import { celsiusToFahrenheit } from '../../utils/units'
import { WindDirectionArrow } from '../shared/WindDirectionArrow'

interface CurrentConditionsProps {
  current: OpenMeteoCurrent
}

export function CurrentConditions({ current }: CurrentConditionsProps) {
  const tempF = celsiusToFahrenheit(current.temperature_2m)
  const precipLabel = current.precipitation === 0 ? 'None' : `${current.precipitation.toFixed(1)} mm/hr`

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Current Conditions
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <WeatherStatCard
          icon="💨"
          label="Wind"
          value={`${current.wind_speed_10m.toFixed(0)} mph`}
          sub={
            <span className="flex items-center justify-center gap-1">
              <WindDirectionArrow degrees={current.wind_direction_10m} size={12} className="text-gray-400" />
              {current.wind_direction_10m}°
            </span>
          }
        />
        <WeatherStatCard
          icon="🌬️"
          label="Gusts"
          value={`${current.wind_gusts_10m.toFixed(0)} mph`}
        />
        <WeatherStatCard
          icon="🌧️"
          label="Rain"
          value={precipLabel}
        />
        <WeatherStatCard
          icon="☁️"
          label="Clouds"
          value={`${current.cloud_cover}%`}
        />
        <WeatherStatCard
          icon="💧"
          label="Humidity"
          value={`${current.relative_humidity_2m}%`}
        />
        <WeatherStatCard
          icon="🌡️"
          label="Temp"
          value={`${tempF}°F`}
          sub={`${current.temperature_2m.toFixed(0)}°C`}
        />
      </div>
    </div>
  )
}
