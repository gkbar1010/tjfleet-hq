'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-neutral-400 mb-4">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
