interface WindDirectionArrowProps {
  degrees: number
  size?: number
  className?: string
}

export function WindDirectionArrow({ degrees, size = 16, className = '' }: WindDirectionArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ transform: `rotate(${degrees}deg)` }}
      aria-label={`Wind from ${degrees}°`}
    >
      <path d="M12 2 L16 10 L12 8 L8 10 Z" />
    </svg>
  )
}
