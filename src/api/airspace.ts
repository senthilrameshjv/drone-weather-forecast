import type { AirspaceAssessment, AirspaceReason, AirspaceStatus } from '../types/airspace'

const FAA_FACILITY_MAP_URL = 'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/ArcGIS/rest/services/FAA_UAS_FacilityMap_Data_V5/FeatureServer/0/query'
const US_SCOPE_BOXES = [
  { minLat: 24.3, maxLat: 49.5, minLon: -125.0, maxLon: -66.5 },   // contiguous U.S.
  { minLat: 51.2, maxLat: 71.5, minLon: -170.0, maxLon: -129.0 },  // Alaska
  { minLat: 18.8, maxLat: 22.5, minLon: -160.5, maxLon: -154.5 },  // Hawaii
  { minLat: 17.8, maxLat: 18.6, minLon: -67.4, maxLon: -65.1 },    // Puerto Rico / USVI
  { minLat: 13.2, maxLat: 14.8, minLon: 144.5, maxLon: 145.95 },   // Guam / Northern Mariana Islands
  { minLat: -14.6, maxLat: -10.9, minLon: -171.1, maxLon: -168.0 }, // American Samoa
]

interface FacilityMapAttributes {
  CEILING?: number | null
  UNIT?: string | null
  APT1_NAME?: string | null
  APT1_LAANC?: number | null
  AIRSPACE_1?: string | null
  AIRSPACE_2?: string | null
  REGION?: string | null
}

interface FacilityMapFeature {
  attributes: FacilityMapAttributes
}

interface FacilityMapResponse {
  features?: FacilityMapFeature[]
}

const reviewLinks = [
  { label: 'FAA B4UFLY and Where Can I Fly?', url: 'https://www.faa.gov/uas/getting_started/b4ufly' },
  { label: 'FAA UAS Facility Maps', url: 'https://www.faa.gov/uas/commercial_operators/uas_facility_maps' },
  { label: 'FAA Temporary Flight Restrictions', url: 'https://www.faa.gov/uas/getting_started/temporary_flight_restrictions' },
]

function isWithinSupportedUsBounds(lat: number, lon: number): boolean {
  return US_SCOPE_BOXES.some(box => (
    lat >= box.minLat
      && lat <= box.maxLat
      && lon >= box.minLon
      && lon <= box.maxLon
  ))
}

function uniqueDefined(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map(value => value?.trim()).filter(Boolean) as string[])]
}

function buildSummary(status: AirspaceStatus, airportNames: string[], ceiling?: number): string {
  if (status === 'AUTHORIZATION_REQUIRED') {
    const airportText = airportNames.length > 0 ? ` near ${airportNames.join(', ')}` : ''
    const ceilingText = typeof ceiling === 'number' ? ` with a published facility-map altitude of ${ceiling} ft AGL` : ''
    return `This point intersects an FAA UAS Facility Map${airportText}${ceilingText}. Authorization may be required before flight.`
  }

  if (status === 'ALLOWED') {
    return 'No FAA UAS Facility Map polygon was found at this point. Weather may be suitable, but you should still check official FAA restrictions before flying.'
  }

  return 'Airspace awareness for this point needs manual FAA review before flight.'
}

export function buildAssessmentFromFacilityMapResponse(
  response: FacilityMapResponse,
  coords: { lat: number; lon: number }
): AirspaceAssessment {
  if (!isWithinSupportedUsBounds(coords.lat, coords.lon)) {
    return {
      status: 'NEEDS_REVIEW',
      summary: 'This airspace checker currently supports U.S. FAA coverage only. Review official local aviation rules before flying here.',
      reasons: [
        {
          code: 'OUTSIDE_US_SCOPE',
          label: 'Outside supported region',
          detail: 'The selected coordinates fall outside the U.S.-focused FAA Facility Map coverage used by this app.',
        },
      ],
      sourceCoverage: {
        scope: 'OUTSIDE_SUPPORTED_REGION',
        facilityMap: 'UNAVAILABLE',
        liveRestrictions: 'OFFICIAL_HANDOFF_REQUIRED',
      },
      reviewLinks,
    }
  }

  const match = response.features?.[0]
  if (!match) {
    return {
      status: 'ALLOWED',
      summary: buildSummary('ALLOWED', []),
      reasons: [
        {
          code: 'FAA_FACILITY_MAP_NO_MATCH',
          label: 'No FAA facility-map grid at this point',
          detail: 'The FAA UAS Facility Map did not return a matching controlled-airspace polygon for these coordinates.',
        },
        {
          code: 'FAA_NO_LIVE_RESTRICTION_DATA',
          label: 'Live restrictions still require review',
          detail: 'Temporary flight restrictions, NOTAMs, and other live airspace changes are not automated in this version.',
        },
      ],
      sourceCoverage: {
        scope: 'US_ONLY',
        facilityMap: 'NO_MATCH',
        liveRestrictions: 'OFFICIAL_HANDOFF_REQUIRED',
      },
      reviewLinks,
    }
  }

  const airportNames = uniqueDefined([
    match.attributes.APT1_NAME,
  ])

  const ceiling = typeof match.attributes.CEILING === 'number' ? match.attributes.CEILING : undefined
  const airspaces = uniqueDefined([match.attributes.AIRSPACE_1, match.attributes.AIRSPACE_2])
  const reasons: AirspaceReason[] = [
    {
      code: 'FAA_FACILITY_MAP_MATCH',
      label: 'FAA facility-map match',
      detail: `These coordinates intersect a published FAA UAS Facility Map polygon${airspaces.length > 0 ? ` (${airspaces.join(', ')})` : ''}.`,
    },
    {
      code: 'FAA_NO_LIVE_RESTRICTION_DATA',
      label: 'Live restrictions still require review',
      detail: 'Temporary flight restrictions, NOTAMs, and other live airspace changes are not automated in this version.',
    },
  ]

  if (match.attributes.APT1_LAANC === 1) {
    reasons.splice(1, 0, {
      code: 'FAA_LAANC_AVAILABLE',
      label: 'LAANC may be available',
      detail: 'The FAA facility-map record indicates LAANC support may exist for this airport, but you still need an official authorization workflow.',
    })
  }

  return {
    status: 'AUTHORIZATION_REQUIRED',
    summary: buildSummary('AUTHORIZATION_REQUIRED', airportNames, ceiling),
    reasons,
    facilityMapAltitudeFeet: ceiling,
    sourceCoverage: {
      scope: 'US_ONLY',
      facilityMap: 'MATCHED',
      liveRestrictions: 'OFFICIAL_HANDOFF_REQUIRED',
    },
    reviewLinks,
  }
}

export async function getAirspaceAssessment(lat: number, lon: number): Promise<AirspaceAssessment> {
  if (!isWithinSupportedUsBounds(lat, lon)) {
    return buildAssessmentFromFacilityMapResponse({}, { lat, lon })
  }

  const params = new URLSearchParams({
    f: 'json',
    geometry: `${lon},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: 'false',
    resultRecordCount: '1',
    outFields: ['CEILING', 'UNIT', 'APT1_NAME', 'APT1_LAANC', 'AIRSPACE_1', 'AIRSPACE_2', 'REGION'].join(','),
  })

  const res = await fetch(`${FAA_FACILITY_MAP_URL}?${params.toString()}`)
  if (!res.ok) throw new Error('FAA facility map lookup failed')

  const data: FacilityMapResponse = await res.json()
  if (!('features' in data) || !Array.isArray(data.features)) {
    throw new Error('FAA facility map response was invalid')
  }

  return buildAssessmentFromFacilityMapResponse(data, { lat, lon })
}
