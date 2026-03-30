import type { DayForecast } from '../../types/forecast'
import { DayRow } from './DayRow'

interface DailyForecastProps {
  days: DayForecast[]
}

export function DailyForecast({ days }: DailyForecastProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        7-Day Forecast
      </h2>
      <div className="space-y-2">
        {days.map(day => (
          <DayRow key={day.time} day={day} />
        ))}
      </div>
    </div>
  )
}
