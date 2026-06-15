'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient — subtle red glow from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0000] via-[#080808] to-[#080808] pointer-events-none" />

      {/* Italian flag stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008C45] via-[#F2F2F2] to-[#E10600]" />

      {/* Diagonal racing stripe — very subtle */}
      <div className="absolute top-0 right-0 w-[200px] h-full opacity-[0.02] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, #E10600 40px, #E10600 42px)'
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          {/* Ferrari shield-inspired emblem */}
          <div className="inline-block mb-6">
            <div className="w-16 h-20 relative">
              <div className="absolute inset-0 border-2 border-[#E10600] rounded-t-lg rounded-b-[40%] flex flex-col items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(225,6,0,0.2), inset 0 0 15px rgba(225,6,0,0.05)' }}>
                <span className="text-[#E10600] font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>TJ</span>
                <div className="w-8 h-[1px] bg-[#E10600]/40 mt-1" />
                <span className="text-[#666] text-[7px] tracking-[0.2em] mt-1 uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>Fleet</span>
              </div>
            </div>
          </div>

          <h1 className="text-xl text-white tracking-[0.25em] uppercase" style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700 }}>
            TJFleet HQ
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#E10600]/40" />
            <p className="text-[#555] text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              Operazioni Interne
            </p>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#E10600]/40" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-[#E10600]/10 border border-[#E10600]/30 text-[#FF6666] px-4 py-2.5 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] text-[#555] mb-1.5 tracking-[0.2em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0e0e0e] border border-[#1e1e1e] rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600] focus:shadow-[0_0_10px_rgba(225,6,0,0.15)] transition-all placeholder-[#333]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#555] mb-1.5 tracking-[0.2em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0e0e0e] border border-[#1e1e1e] rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600] focus:shadow-[0_0_10px_rgba(225,6,0,0.15)] transition-all placeholder-[#333]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E10600] text-white font-semibold py-3 rounded hover:bg-[#FF2D2D] hover:shadow-[0_0_20px_rgba(225,6,0,0.3)] transition-all disabled:opacity-50 tracking-[0.15em] uppercase text-sm"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-10">
          <div className="w-2 h-2 rounded-full bg-[#008C45]" />
          <div className="w-2 h-2 rounded-full bg-[#F2F2F2]" />
          <div className="w-2 h-2 rounded-full bg-[#E10600]" />
        </div>
      </div>
    </div>
  )
}
