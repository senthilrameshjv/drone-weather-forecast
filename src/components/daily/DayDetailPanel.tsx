import type { DayForecast, HourlySlot } from '../../types/forecast'
import { GoNoGoBadge } from '../gonogo/GoNoGoBadge'
import { ScoreBreakdown } from '../gonogo/ScoreBreakdown'
import { HourlyCard } from '../hourly/HourlyCard'

interface DayDetailPanelProps {
  day: DayForecast
  hourly: HourlySlot[]
}

export function DayDetailPanel({ day, hourly }: DayDetailPanelProps) {
  return (
    <div className="ml-4 rounded-2xl border border-gray-700 bg-gray-900 p-4">
      <div className="space-y-4">
        <GoNoGoBadge result={day.goNoGo} subtitle={`Details for ${day.time}`} />
        <ScoreBreakdown result={day.goNoGo} />

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Hourly
          </h3>
          {hourly.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {hourly.map(slot => (
                <HourlyCard key={slot.time} slot={slot} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hourly data available for this day.</p>
          )}
        </div>
      </div>
    </div>
  )
}
