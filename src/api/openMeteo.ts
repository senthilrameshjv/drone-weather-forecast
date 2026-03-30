import type { OpenMeteoResponse, OpenMeteoHourlyRaw, OpenMeteoDailyRaw } from '../types/weather'
import type { HourlySlot, DayForecast } from '../types/forecast'
import { scoreHour, scoreDay } from '../scoring/goNoGo'

function buildUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m', 'relative_humidity_2m', 'precipitation',
      'weather_code', 'cloud_cover', 'wind_speed_10m',
      'wind_direction_10m', 'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m', 'precipitation_probability', 'precipitation',
      'weather_code', 'cloud_cover', 'visibility',
      'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
    ].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'precipitation_sum', 'wind_speed_10m_max', 'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: '7',
    forecast_hours: '168',
  })
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`
}

export async function fetchWeather(lat: number, lon: number): Promise<OpenMeteoResponse> {
  const url = buildUrl(lat, lon)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<OpenMeteoResponse>
}

export function parseHourly(raw: OpenMeteoHourlyRaw): HourlySlot[] {
  return raw.time.map((time, i) => {
    const slot = {
      time,
      temperature_2m: raw.temperature_2m[i],
      precipitation_probability: raw.precipitation_probability[i],
      precipitation: raw.precipitation[i],
      weather_code: raw.weather_code[i],
      cloud_cover: raw.cloud_cover[i],
      visibility: raw.visibility[i],
      wind_speed_10m: raw.wind_speed_10m[i],
      wind_direction_10m: raw.wind_direction_10m[i],
      wind_gusts_10m: raw.wind_gusts_10m[i],
    }
    return { ...slot, goNoGo: scoreHour(slot) }
  })
}

export function parseDaily(raw: OpenMeteoDailyRaw): DayForecast[] {
  return raw.time.map((time, i) => {
    const day = {
      time,
      weather_code: raw.weather_code[i],
      temperature_2m_max: raw.temperature_2m_max[i],
      temperature_2m_min: raw.temperature_2m_min[i],
      precipitation_sum: raw.precipitation_sum[i],
      wind_speed_10m_max: raw.wind_speed_10m_max[i],
      wind_gusts_10m_max: raw.wind_gusts_10m_max[i],
      wind_direction_10m_dominant: raw.wind_direction_10m_dominant[i],
    }
    return { ...day, goNoGo: scoreDay(day) }
  })
}
