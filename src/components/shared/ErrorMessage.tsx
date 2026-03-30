interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
      <p className="text-red-300 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
