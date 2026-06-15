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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#1a0000] pointer-events-none" />

      {/* Italian stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008C45] via-[#F2F2F2] to-[#DC0000]" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-2 border-[#DC0000] rounded-full flex items-center justify-center mx-auto">
              <div className="w-2 h-2 bg-[#DC0000] rounded-full" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-[0.15em] uppercase">TJFleet HQ</h1>
          <p className="text-[#666] mt-1 text-xs tracking-[0.2em] uppercase">Internal Operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-[#DC0000]/10 border border-[#DC0000]/30 text-[#FF6666] px-4 py-2.5 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#666] mb-1.5 tracking-[0.1em] uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#DC0000] transition-colors placeholder-[#333]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[#666] mb-1.5 tracking-[0.1em] uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#DC0000] transition-colors placeholder-[#333]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DC0000] text-white font-medium py-2.5 rounded hover:bg-[#FF1A1A] transition-all disabled:opacity-50 tracking-[0.1em] uppercase text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#333] text-xs mt-8 tracking-wider">SUPERIORMOTORCLUB.COM</p>
      </div>
    </div>
  )
}
