'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer, updateCustomer } from '@/actions/customers'
import { AVAILABLE_TAGS } from '@/lib/constants'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type CustomerData = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  instagram: string | null
  notes: string | null
  tags: string[]
}

export default function CustomerForm({
  customer,
}: {
  customer?: CustomerData
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(customer?.tags ?? [])
  const isEditing = !!customer

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      // Remove any existing tags entries and add our selected ones
      formData.delete('tags')
      selectedTags.forEach((tag) => formData.append('tags', tag))

      let result
      if (isEditing) {
        result = await updateCustomer(customer.id, formData)
      } else {
        result = await createCustomer(formData)
      }

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (isEditing) {
        router.push(`/customers/${customer.id}`)
      } else if ('id' in result && result.id) {
        router.push(`/customers/${result.id}`)
      } else {
        router.push('/customers')
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={isEditing ? `/customers/${customer.id}` : '/customers'}
          className="inline-flex items-center gap-1 text-sm text-[#888] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          {isEditing ? 'Back to customer' : 'Back to customers'}
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Customer' : 'New Customer'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-2">Contact Information</h2>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#aaa] mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={customer?.fullName ?? ''}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#aaa] mb-1">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={customer?.phone ?? ''}
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#aaa] mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email ?? ''}
                className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-[#aaa] mb-1">
              Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              defaultValue={customer?.instagram ?? ''}
              className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="@johndoe"
            />
          </div>
        </div>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#E10600] text-white'
                      : 'bg-neutral-800 text-[#aaa] hover:bg-[#222]'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Notes</h2>
          <textarea
            name="notes"
            rows={4}
            defaultValue={customer?.notes ?? ''}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-colors resize-none"
            placeholder="Any additional notes about this customer..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#E10600] text-white px-6 py-2 rounded font-medium hover:bg-[#FF2D2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </button>
          <Link
            href={isEditing ? `/customers/${customer.id}` : '/customers'}
            className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
