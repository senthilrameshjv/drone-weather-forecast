import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAssessmentFromFacilityMapResponse } from '../src/api/airspace.ts'

test('returns authorization required when a facility-map polygon matches', () => {
  const assessment = buildAssessmentFromFacilityMapResponse({
    features: [
      {
        attributes: {
          CEILING: 200,
          APT1_NAME: 'Austin-Bergstrom International',
          APT1_LAANC: 1,
          AIRSPACE_1: 'CLASS C',
        },
      },
    ],
  }, { lat: 30.1975, lon: -97.6664 })

  assert.equal(assessment.status, 'AUTHORIZATION_REQUIRED')
  assert.equal(assessment.facilityMapAltitudeFeet, 200)
  assert.equal(assessment.sourceCoverage.facilityMap, 'MATCHED')
  assert.ok(assessment.reasons.some(reason => reason.code === 'FAA_LAANC_AVAILABLE'))
})

test('returns likely allowed when no facility-map polygon matches', () => {
  const assessment = buildAssessmentFromFacilityMapResponse({ features: [] }, { lat: 35.0, lon: -100.0 })

  assert.equal(assessment.status, 'ALLOWED')
  assert.equal(assessment.sourceCoverage.facilityMap, 'NO_MATCH')
  assert.ok(assessment.reasons.some(reason => reason.code === 'FAA_NO_LIVE_RESTRICTION_DATA'))
})

test('returns needs review outside supported U.S. bounds', () => {
  const assessment = buildAssessmentFromFacilityMapResponse({ features: [] }, { lat: 51.5072, lon: -0.1276 })

  assert.equal(assessment.status, 'NEEDS_REVIEW')
  assert.equal(assessment.sourceCoverage.scope, 'OUTSIDE_SUPPORTED_REGION')
  assert.ok(assessment.reasons.some(reason => reason.code === 'OUTSIDE_US_SCOPE'))
})

test('keeps official handoff links on every assessment', () => {
  const assessment = buildAssessmentFromFacilityMapResponse({ features: [] }, { lat: 39.7392, lon: -104.9903 })

  assert.ok(assessment.reviewLinks.length >= 3)
  assert.ok(assessment.reviewLinks.some(link => link.url.includes('b4ufly')))
})
