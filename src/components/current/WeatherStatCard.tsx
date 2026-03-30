import type { ReactNode } from 'react'

interface WeatherStatCardProps {
  label: string
  value: string
  icon: string
  sub?: ReactNode
}

export function WeatherStatCard({ label, value, icon, sub }: WeatherStatCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col items-center gap-1 text-center">
      <span className="text-xl">{icon}</span>
      <span className="text-lg font-semibold text-white">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}
