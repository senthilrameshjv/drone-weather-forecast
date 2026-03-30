import type { OpenMeteoResponse } from '../types/weather'
import type { GoNoGoResult, HourlySlot, DayForecast } from '../types/forecast'
import { scoreConditions } from '../scoring/goNoGo'
import { parseHourly, parseDaily } from '../api/openMeteo'

interface GoNoGoState {
  current: GoNoGoResult | null
  hourly: HourlySlot[]
  daily: DayForecast[]
}

export function useGoNoGo(data: OpenMeteoResponse | null): GoNoGoState {
  if (!data) return { current: null, hourly: [], daily: [] }

  const current = scoreConditions({
    wind_speed_10m: data.current.wind_speed_10m,
    wind_gusts_10m: data.current.wind_gusts_10m,
    precipitation: data.current.precipitation,
    visibility: 16093,  // current weather has no visibility field — assume clear (10 miles)
    cloud_cover: data.current.cloud_cover,
    temperature_2m: data.current.temperature_2m,
    weather_code: data.current.weather_code,
  })

  const hourly = parseHourly(data.hourly)
  const daily = parseDaily(data.daily)

  return { current, hourly, daily }
}
