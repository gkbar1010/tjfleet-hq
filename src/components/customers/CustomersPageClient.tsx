'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Users } from 'lucide-react'
import { AVAILABLE_TAGS } from '@/lib/constants'

type Customer = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  instagram: string | null
  tags: string[]
  _count: { bookings: number }
}

export default function CustomersPageClient({
  customers,
  search,
  tag,
}: {
  customers: Customer[]
  search?: string
  tag?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(search ?? '')

  function applyFilters(newSearch?: string, newTag?: string) {
    const params = new URLSearchParams()
    const s = newSearch !== undefined ? newSearch : searchValue
    const t = newTag !== undefined ? newTag : (searchParams.get('tag') ?? '')
    if (s) params.set('search', s)
    if (t) params.set('tag', t)
    router.push(`/customers${params.toString() ? `?${params}` : ''}`)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilters(searchValue)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors"
        >
          <Plus size={16} />
          Add Customer
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Search by name, phone, email, or Instagram..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit(e)
            }}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 pl-9 text-white text-sm focus:outline-none focus:border-white transition-colors"
          />
        </form>

        <select
          value={tag ?? ''}
          onChange={(e) => applyFilters(undefined, e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-colors"
        >
          <option value="">All Tags</option>
          {AVAILABLE_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {customers.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <Users size={40} className="mx-auto text-neutral-600 mb-3" />
          <p className="text-neutral-400 text-sm">
            {search || tag ? 'No customers match your filters.' : 'No customers yet.'}
          </p>
          {!search && !tag && (
            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors mt-4"
            >
              <Plus size={16} />
              Add your first customer
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-800 text-neutral-400 text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium text-right">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {customer.fullName}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {customer.phone ?? '--'}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {customer.email ?? '--'}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {customer.instagram ? `@${customer.instagram.replace('@', '')}` : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.length > 0
                        ? customer.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300"
                            >
                              {t}
                            </span>
                          ))
                        : <span className="text-neutral-600">--</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300 text-right">
                    {customer._count.bookings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
