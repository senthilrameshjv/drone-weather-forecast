import { getWmoInfo } from '../../utils/wmoCode'

interface WeatherIconProps {
  code: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' }

export function WeatherIcon({ code, size = 'md' }: WeatherIconProps) {
  const { icon, description } = getWmoInfo(code)
  return (
    <span className={sizeMap[size]} role="img" aria-label={description} title={description}>
      {icon}
    </span>
  )
}
