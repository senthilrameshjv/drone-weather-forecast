import { useEffect, useRef, useState } from 'react'
import { searchLocations, type SearchResult } from '../../api/geocoding'

interface LocationSearchProps {
  onSelect: (result: SearchResult) => void
  onClose: () => void
}

export function LocationSearch({ onSelect, onClose }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trimmedQuery = query.trim()
  const showDropdown = loading || !!error || results.length > 0 || searched

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    if (!trimmedQuery) return

    const timeoutId = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      searchLocations(trimmedQuery)
        .then(nextResults => {
          setResults(nextResults)
          setSearched(true)
        })
        .catch((err: Error) => {
          setResults([])
          setSearched(true)
          setError(err.message)
        })
        .finally(() => setLoading(false))
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [trimmedQuery])

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)

          if (!nextQuery.trim()) {
            setResults([])
            setLoading(false)
            setSearched(false)
            setError(null)
          }
        }}
        placeholder="Search city or town"
        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
              Searching...
            </div>
          )}

          {!loading && error && (
            <div className="px-3 py-3 text-sm text-red-400">{error}</div>
          )}

          {!loading && !error && results.map(result => (
            <button
              key={`${result.lat},${result.lon},${result.displayName}`}
              type="button"
              onClick={() => onSelect(result)}
              className="block w-full border-b border-gray-800 px-3 py-3 text-left text-sm text-gray-200 transition-colors last:border-b-0 hover:bg-gray-800"
            >
              {result.displayName}
            </button>
          ))}

          {!loading && !error && searched && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  )
}
