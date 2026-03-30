export interface OpenMeteoCurrentUnits {
  time: string
  interval: string
  temperature_2m: string
  relative_humidity_2m: string
  precipitation: string
  weather_code: string
  cloud_cover: string
  wind_speed_10m: string
  wind_direction_10m: string
  wind_gusts_10m: string
}

export interface OpenMeteoCurrent {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  precipitation: number
  weather_code: number
  cloud_cover: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
}

export interface OpenMeteoHourlyRaw {
  time: string[]
  temperature_2m: number[]
  precipitation_probability: number[]
  precipitation: number[]
  weather_code: number[]
  cloud_cover: number[]
  visibility: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  wind_gusts_10m: number[]
}

export interface OpenMeteoDailyRaw {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max: number[]
  wind_direction_10m_dominant: number[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  current_units: OpenMeteoCurrentUnits
  current: OpenMeteoCurrent
  hourly: OpenMeteoHourlyRaw
  daily: OpenMeteoDailyRaw
}
