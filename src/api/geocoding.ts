interface NominatimResponse {
  address: {
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country?: string
  }
}

export interface LocationName {
  city: string
  region: string
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationName> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'UAVForecastApp/1.0' },
  })
  if (!res.ok) throw new Error('Geocoding failed')
  const data: NominatimResponse = await res.json()
  const city = data.address.city ?? data.address.town ?? data.address.village ?? data.address.county ?? 'Unknown'
  const region = data.address.state ?? data.address.country ?? ''
  return { city, region }
}
