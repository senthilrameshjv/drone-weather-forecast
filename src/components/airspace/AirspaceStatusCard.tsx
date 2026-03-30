import type { AirspaceAssessment, AirspaceStatus } from '../../types/airspace'

interface AirspaceStatusCardProps {
  assessment: AirspaceAssessment | null
  loading: boolean
  error: string | null
}

const statusStyles: Record<AirspaceStatus, { label: string; card: string; badge: string }> = {
  ALLOWED: {
    label: 'Likely Allowed',
    card: 'border-green-800 bg-green-950/40',
    badge: 'border-green-700 bg-green-950 text-green-300',
  },
  AUTHORIZATION_REQUIRED: {
    label: 'Authorization Required',
    card: 'border-yellow-800 bg-yellow-950/40',
    badge: 'border-yellow-700 bg-yellow-950 text-yellow-300',
  },
  LIKELY_PROHIBITED: {
    label: 'Likely Prohibited',
    card: 'border-red-800 bg-red-950/40',
    badge: 'border-red-700 bg-red-950 text-red-300',
  },
  NEEDS_REVIEW: {
    label: 'Needs Review',
    card: 'border-blue-800 bg-blue-950/30',
    badge: 'border-blue-700 bg-blue-950 text-blue-300',
  },
}

export function AirspaceStatusCard({ assessment, loading, error }: AirspaceStatusCardProps) {
  if (!loading && !error && !assessment) return null

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Airspace Awareness
      </h2>

      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-4">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-blue-400" />
            Checking FAA facility map data...
          </div>
        )}

        {!loading && error && (
          <div className="space-y-3">
            <p className="text-sm text-red-300">{error}</p>
            <p className="text-xs text-gray-500">
              Airspace awareness is unavailable right now. Use official FAA tools before flying.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.faa.gov/uas/getting_started/b4ufly"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:border-blue-600 hover:text-blue-200"
              >
                FAA B4UFLY
              </a>
              <a
                href="https://www.faa.gov/uas/getting_started/temporary_flight_restrictions"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:border-blue-600 hover:text-blue-200"
              >
                FAA TFRs
              </a>
            </div>
          </div>
        )}

        {!loading && !error && assessment && (
          <div className={`space-y-4 rounded-xl border p-4 ${statusStyles[assessment.status].card}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[assessment.status].badge}`}>
                  {statusStyles[assessment.status].label}
                </span>
                <p className="text-sm text-gray-200">{assessment.summary}</p>
              </div>

              {typeof assessment.facilityMapAltitudeFeet === 'number' && (
                <div className="min-w-28 rounded-xl border border-gray-700 bg-gray-950/70 px-3 py-2 text-center">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Facility Map</div>
                  <div className="text-lg font-semibold text-white">{assessment.facilityMapAltitudeFeet} ft</div>
                  <div className="text-xs text-gray-500">AGL ceiling</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {assessment.reasons.map(reason => (
                <div key={reason.code} className="rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2">
                  <div className="text-sm font-medium text-white">{reason.label}</div>
                  <div className="text-xs text-gray-400">{reason.detail}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Advisory only. This check does not automate live TFRs, NOTAMs, or all special-use airspace. Verify with official FAA tools before flight.
            </p>

            <div className="flex flex-wrap gap-2">
              {assessment.reviewLinks.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:border-blue-600 hover:text-blue-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
