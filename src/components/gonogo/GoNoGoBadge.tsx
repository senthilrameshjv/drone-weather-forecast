import type { GoNoGoResult, GoNoGoVerdict } from '../../types/forecast'

interface GoNoGoBadgeProps {
  result: GoNoGoResult
  subtitle?: string
}

const verdictConfig: Record<GoNoGoVerdict, { bg: string; border: string; text: string; label: string; emoji: string }> = {
  GO: {
    bg: 'bg-green-950',
    border: 'border-green-700',
    text: 'text-green-400',
    label: 'GO TO FLY',
    emoji: '✅',
  },
  CAUTION: {
    bg: 'bg-yellow-950',
    border: 'border-yellow-700',
    text: 'text-yellow-400',
    label: 'FLY WITH CAUTION',
    emoji: '⚠️',
  },
  NO_GO: {
    bg: 'bg-red-950',
    border: 'border-red-800',
    text: 'text-red-400',
    label: 'DO NOT FLY',
    emoji: '🚫',
  },
}

export function GoNoGoBadge({ result, subtitle }: GoNoGoBadgeProps) {
  const cfg = verdictConfig[result.verdict]
  return (
    <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-6 text-center`}>
      <div className="text-4xl mb-2">{cfg.emoji}</div>
      <div className={`text-3xl font-bold tracking-wide ${cfg.text}`}>{cfg.label}</div>
      {result.hardOverride ? (
        <p className="text-sm text-red-300 mt-2">{result.hardOverride}</p>
      ) : (
        <p className="text-sm text-gray-400 mt-2">
          Flight Score: <span className={`font-semibold ${cfg.text}`}>{result.score}/100</span>
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
