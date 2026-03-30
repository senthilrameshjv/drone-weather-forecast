import type { HourlySlot } from '../../types/forecast'
import { HourlyCard } from './HourlyCard'

interface HourlyForecastProps {
  slots: HourlySlot[]
}

export function HourlyForecast({ slots }: HourlyForecastProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        48-Hour Forecast
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slots.map(slot => (
          <HourlyCard key={slot.time} slot={slot} />
        ))}
      </div>
    </div>
  )
}
