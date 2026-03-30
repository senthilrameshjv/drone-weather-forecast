export type AirspaceStatus = 'ALLOWED' | 'AUTHORIZATION_REQUIRED' | 'LIKELY_PROHIBITED' | 'NEEDS_REVIEW'

export type AirspaceReasonCode =
  | 'FAA_FACILITY_MAP_MATCH'
  | 'FAA_FACILITY_MAP_NO_MATCH'
  | 'FAA_LAANC_AVAILABLE'
  | 'FAA_NO_LIVE_RESTRICTION_DATA'
  | 'OUTSIDE_US_SCOPE'
  | 'FAA_DATA_UNAVAILABLE'

export interface AirspaceReason {
  code: AirspaceReasonCode
  label: string
  detail: string
}

export interface AirspaceSourceCoverage {
  scope: 'US_ONLY' | 'OUTSIDE_SUPPORTED_REGION'
  facilityMap: 'MATCHED' | 'NO_MATCH' | 'UNAVAILABLE'
  liveRestrictions: 'OFFICIAL_HANDOFF_REQUIRED'
}

export interface AirspaceReviewLink {
  label: string
  url: string
}

export interface AirspaceAssessment {
  status: AirspaceStatus
  summary: string
  reasons: AirspaceReason[]
  facilityMapAltitudeFeet?: number
  sourceCoverage: AirspaceSourceCoverage
  reviewLinks: AirspaceReviewLink[]
}
