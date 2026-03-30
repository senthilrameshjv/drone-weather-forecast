import { useState } from 'react'
import type { DayForecast } from '../../types/forecast'
import type { HourlySlot } from '../../types/forecast'
import { DayRow } from './DayRow'
import { DayDetailPanel } from './DayDetailPanel'

interface DailyForecastProps {
  days: DayForecast[]
  hourly: HourlySlot[]
}

export function DailyForecast({ days, hourly }: DailyForecastProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        7-Day Forecast
      </h2>
      <div className="space-y-2">
        {days.map((day, index) => {
          const isExpanded = selectedDayIndex === index
          const dayHourly = hourly.filter(slot => slot.time.startsWith(day.time))

          return (
            <div key={day.time} className="space-y-2">
              <DayRow
                day={day}
                isExpanded={isExpanded}
                onClick={() => setSelectedDayIndex(current => current === index ? null : index)}
              />
              {isExpanded && <DayDetailPanel day={day} hourly={dayHourly} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
