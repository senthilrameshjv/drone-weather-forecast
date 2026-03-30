interface WmoInfo {
  description: string
  icon: string
}

const WMO_CODES: Record<number, WmoInfo> = {
  0:  { description: 'Clear sky', icon: '☀️' },
  1:  { description: 'Mainly clear', icon: '🌤️' },
  2:  { description: 'Partly cloudy', icon: '⛅' },
  3:  { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Icy fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Drizzle', icon: '🌦️' },
  55: { description: 'Heavy drizzle', icon: '🌧️' },
  61: { description: 'Light rain', icon: '🌧️' },
  63: { description: 'Rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Light snow', icon: '🌨️' },
  73: { description: 'Snow', icon: '❄️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  77: { description: 'Snow grains', icon: '❄️' },
  80: { description: 'Light showers', icon: '🌦️' },
  81: { description: 'Showers', icon: '🌧️' },
  82: { description: 'Heavy showers', icon: '⛈️' },
  85: { description: 'Snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm w/ hail', icon: '⛈️' },
  99: { description: 'Thunderstorm w/ heavy hail', icon: '⛈️' },
}

export function getWmoInfo(code: number): WmoInfo {
  return WMO_CODES[code] ?? { description: 'Unknown', icon: '🌡️' }
}
