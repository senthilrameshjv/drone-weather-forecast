import type { GoNoGoResult, GoNoGoVerdict, ParameterScore } from '../types/forecast'
import { metersToMiles } from '../utils/units'

// ─── Thresholds ──────────────────────────────────────────────────────────────

const WIND_SPEED = { good: 15, caution: 20 }      // mph
const WIND_GUST  = { good: 18, caution: 25 }       // mph
const PRECIP     = { good: 0, caution: 0.5 }       // mm/hr
const VIS_MILES  = { good: 3, caution: 1 }         // miles (higher = better, so reversed)
const CLOUD      = { good: 50, caution: 80 }       // %
const TEMP_LOW   = { good: 10, caution: 5 }        // °C (below 5 = NO_GO)
const TEMP_HIGH  = { good: 35, caution: 40 }       // °C (above 40 = NO_GO)

const HARD_GUST_LIMIT   = 30    // mph
const HARD_PRECIP_LIMIT = 1     // mm/hr
const HARD_VIS_LIMIT    = 0.5   // miles
const THUNDER_CODES     = [95, 96, 99]
const HEAVY_SNOW_CODES  = [73, 75, 77]

// ─── Weights ─────────────────────────────────────────────────────────────────

const WEIGHTS = {
  windSpeed: 0.35,
  windGust:  0.25,
  precip:    0.20,
  vis:       0.10,
  cloud:     0.05,
  temp:      0.05,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pointScore(value: number, good: number, caution: number, higherIsBetter = false): number {
  if (higherIsBetter) {
    if (value >= good) return 100
    if (value >= caution) return 50
    return 0
  }
  if (value <= good) return 100
  if (value <= caution) return 50
  return 0
}

function toVerdict(score: number): GoNoGoVerdict {
  if (score >= 75) return 'GO'
  if (score >= 45) return 'CAUTION'
  return 'NO_GO'
}

function checkHardOverride(
  windGust: number,
  precip: number,
  visMiles: number,
  weatherCode: number
): string | null {
  if (windGust > HARD_GUST_LIMIT) return `Gusts ${windGust.toFixed(0)} mph exceed safe limit`
  if (precip > HARD_PRECIP_LIMIT) return `Active precipitation (${precip.toFixed(1)} mm/hr)`
  if (visMiles < HARD_VIS_LIMIT) return `Visibility too low (${visMiles.toFixed(1)} mi)`
  if (THUNDER_CODES.includes(weatherCode)) return 'Thunderstorm in area'
  if (HEAVY_SNOW_CODES.includes(weatherCode)) return 'Heavy snow conditions'
  return null
}

// ─── Core scorer ─────────────────────────────────────────────────────────────

interface ScorerInput {
  wind_speed_10m: number
  wind_gusts_10m: number
  precipitation: number
  visibility: number       // meters
  cloud_cover: number
  temperature_2m: number
  weather_code: number
}

export function scoreConditions(input: ScorerInput): GoNoGoResult {
  const visMiles = metersToMiles(input.visibility)

  const hardOverride = checkHardOverride(
    input.wind_gusts_10m,
    input.precipitation,
    visMiles,
    input.weather_code
  )

  const windSpeedScore = pointScore(input.wind_speed_10m, WIND_SPEED.good, WIND_SPEED.caution)
  const windGustScore  = pointScore(input.wind_gusts_10m, WIND_GUST.good, WIND_GUST.caution)
  const precipScore    = pointScore(input.precipitation, PRECIP.good, PRECIP.caution)
  const visScore       = pointScore(visMiles, VIS_MILES.good, VIS_MILES.caution, true)

  const cloudScore = pointScore(input.cloud_cover, CLOUD.good, CLOUD.caution)

  let tempScore: number
  if (input.temperature_2m < TEMP_LOW.caution || input.temperature_2m > TEMP_HIGH.caution) {
    tempScore = 0
  } else if (input.temperature_2m < TEMP_LOW.good || input.temperature_2m > TEMP_HIGH.good) {
    tempScore = 50
  } else {
    tempScore = 100
  }

  const rawScore =
    windSpeedScore * WEIGHTS.windSpeed +
    windGustScore  * WEIGHTS.windGust  +
    precipScore    * WEIGHTS.precip    +
    visScore       * WEIGHTS.vis       +
    cloudScore     * WEIGHTS.cloud     +
    tempScore      * WEIGHTS.temp

  const score = Math.round(rawScore)

  const breakdown: ParameterScore[] = [
    {
      name: 'Wind Speed',
      value: `${input.wind_speed_10m.toFixed(0)} mph`,
      score: windSpeedScore,
      verdict: toVerdict(windSpeedScore),
    },
    {
      name: 'Wind Gusts',
      value: `${input.wind_gusts_10m.toFixed(0)} mph`,
      score: windGustScore,
      verdict: toVerdict(windGustScore),
    },
    {
      name: 'Precipitation',
      value: input.precipitation === 0 ? 'None' : `${input.precipitation.toFixed(1)} mm/hr`,
      score: precipScore,
      verdict: toVerdict(precipScore),
    },
    {
      name: 'Visibility',
      value: `${visMiles.toFixed(1)} mi`,
      score: visScore,
      verdict: toVerdict(visScore),
    },
    {
      name: 'Cloud Cover',
      value: `${input.cloud_cover}%`,
      score: cloudScore,
      verdict: toVerdict(cloudScore),
    },
    {
      name: 'Temperature',
      value: `${input.temperature_2m.toFixed(0)}°C`,
      score: tempScore,
      verdict: toVerdict(tempScore),
    },
  ]

  if (hardOverride) {
    return { verdict: 'NO_GO', score: 0, breakdown, hardOverride }
  }

  return { verdict: toVerdict(score), score, breakdown, hardOverride: null }
}

// ─── Per-hour scorer ─────────────────────────────────────────────────────────

export function scoreHour(slot: {
  wind_speed_10m: number
  wind_gusts_10m: number
  precipitation: number
  visibility: number
  cloud_cover: number
  temperature_2m: number
  weather_code: number
}): GoNoGoResult {
  return scoreConditions(slot)
}

// ─── Per-day scorer (uses max/worst values) ───────────────────────────────────

export function scoreDay(day: {
  wind_speed_10m_max: number
  wind_gusts_10m_max: number
  precipitation_sum: number
  weather_code: number
  temperature_2m_max: number
  temperature_2m_min: number
}): GoNoGoResult {
  // Use worst-case temp (min if cold, max if hot)
  const worstTemp = day.temperature_2m_min < 10
    ? day.temperature_2m_min
    : day.temperature_2m_max

  return scoreConditions({
    wind_speed_10m: day.wind_speed_10m_max,
    wind_gusts_10m: day.wind_gusts_10m_max,
    precipitation: day.precipitation_sum,
    visibility: 16093,  // daily data has no visibility — assume 10 miles (good)
    cloud_cover: 50,    // daily data has no cloud cover — assume neutral
    temperature_2m: worstTemp,
    weather_code: day.weather_code,
  })
}
