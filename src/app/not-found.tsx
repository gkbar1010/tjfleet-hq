import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="text-center">
        <p
          className="text-6xl font-bold text-[#E10600] mb-4"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          404
        </p>
        <h1
          className="text-xl font-bold text-white tracking-[0.15em] uppercase mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          Page not found
        </h1>
        <p className="text-sm text-[#666] mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-[#E10600] text-white text-sm font-medium rounded hover:bg-[#c10500] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
