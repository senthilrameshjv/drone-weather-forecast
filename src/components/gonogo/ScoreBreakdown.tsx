import { useState } from 'react'
import type { GoNoGoResult, GoNoGoVerdict } from '../../types/forecast'

interface ScoreBreakdownProps {
  result: GoNoGoResult
}

const verdictIcon: Record<GoNoGoVerdict, string> = {
  GO: '✅',
  CAUTION: '⚠️',
  NO_GO: '🚫',
}

const verdictText: Record<GoNoGoVerdict, string> = {
  GO: 'text-green-400',
  CAUTION: 'text-yellow-400',
  NO_GO: 'text-red-400',
}

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-gray-750 transition-colors"
      >
        <span className="font-medium">Score Breakdown</span>
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {result.breakdown.map(param => (
            <div key={param.name} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{param.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${verdictText[param.verdict]}`}>{param.value}</span>
                <span>{verdictIcon[param.verdict]}</span>
              </div>
            </div>
          ))}
          {result.hardOverride && (
            <p className="text-xs text-red-400 pt-2 border-t border-gray-700">
              Hard override: {result.hardOverride}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
