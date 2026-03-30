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

interface NominatimSearchResponse {
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    region?: string
    country?: string
  }
}

export interface LocationName {
  city: string
  region: string
}

export interface SearchResult {
  lat: number
  lon: number
  displayName: string
}

function buildShortDisplayName(address?: NominatimSearchResponse['address']): string {
  if (!address) return 'Unknown Location'

  const city = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? 'Unknown'
  const region = address.state ?? address.region ?? address.country ?? ''

  return region ? `${city}, ${region}` : city
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

export async function searchLocations(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '1',
  })

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'UAVForecastApp/1.0' },
  })

  if (!res.ok) throw new Error('Location search failed')

  const data: NominatimSearchResponse[] = await res.json()

  return data.map(result => ({
    lat: Number(result.lat),
    lon: Number(result.lon),
    displayName: buildShortDisplayName(result.address),
  }))
}
