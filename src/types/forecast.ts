export type GoNoGoVerdict = 'GO' | 'CAUTION' | 'NO_GO'

export interface ParameterScore {
  name: string
  value: string
  score: number  // 0, 50, or 100
  verdict: GoNoGoVerdict
}

export interface GoNoGoResult {
  verdict: GoNoGoVerdict
  score: number
  breakdown: ParameterScore[]
  hardOverride: string | null
}

export interface HourlySlot {
  time: string              // ISO string
  temperature_2m: number    // °C
  precipitation_probability: number
  precipitation: number     // mm/hr
  weather_code: number
  cloud_cover: number       // %
  visibility: number        // meters (raw from API)
  wind_speed_10m: number    // mph
  wind_direction_10m: number
  wind_gusts_10m: number    // mph
  goNoGo: GoNoGoResult
}

export interface DayForecast {
  time: string              // YYYY-MM-DD
  weather_code: number
  temperature_2m_max: number  // °C
  temperature_2m_min: number  // °C
  precipitation_sum: number
  wind_speed_10m_max: number  // mph
  wind_gusts_10m_max: number  // mph
  wind_direction_10m_dominant: number
  goNoGo: GoNoGoResult
}
