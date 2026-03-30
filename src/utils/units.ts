export function metersToMiles(meters: number): number {
  return meters / 1609.34
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

export function roundOne(n: number): number {
  return Math.round(n * 10) / 10
}
