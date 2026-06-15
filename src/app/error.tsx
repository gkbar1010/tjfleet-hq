'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008C45] via-[#F2F2F2] to-[#E10600]" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-wide mb-2">Something went wrong</h1>
        <p className="text-[#666] mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="bg-[#E10600] text-white px-6 py-2.5 rounded font-medium hover:bg-[#FF2D2D] transition-all tracking-wide uppercase text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
