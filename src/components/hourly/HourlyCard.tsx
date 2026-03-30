import type { HourlySlot } from '../../types/forecast'
import type { GoNoGoVerdict } from '../../types/forecast'
import { formatHour } from '../../utils/formatters'
import { WeatherIcon } from '../shared/WeatherIcon'

const dotColor: Record<GoNoGoVerdict, string> = {
  GO: 'bg-green-500',
  CAUTION: 'bg-yellow-500',
  NO_GO: 'bg-red-500',
}

const cardBorder: Record<GoNoGoVerdict, string> = {
  GO: 'border-green-900',
  CAUTION: 'border-yellow-900',
  NO_GO: 'border-red-900',
}

interface HourlyCardProps {
  slot: HourlySlot
}

export function HourlyCard({ slot }: HourlyCardProps) {
  const verdict = slot.goNoGo.verdict
  return (
    <div className={`flex-shrink-0 w-20 bg-gray-800 border ${cardBorder[verdict]} rounded-xl p-2 flex flex-col items-center gap-1`}>
      <span className="text-xs text-gray-400">{formatHour(slot.time)}</span>
      <WeatherIcon code={slot.weather_code} size="sm" />
      <div className={`w-2.5 h-2.5 rounded-full ${dotColor[verdict]}`} title={verdict} />
      <span className="text-xs font-medium text-white">{slot.wind_speed_10m.toFixed(0)}</span>
      <span className="text-xs text-gray-500">mph</span>
    </div>
  )
}
