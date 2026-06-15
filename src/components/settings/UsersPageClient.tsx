'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, inviteUser, deleteUser } from '@/actions/users'
import type { User } from '@/generated/prisma/client'

const ROLES = ['ADMIN', 'SECRETARY', 'VIEWER'] as const
type Role = (typeof ROLES)[number]

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: 'bg-red-900 text-red-200',
  SECRETARY: 'bg-blue-900 text-blue-200',
  VIEWER: 'bg-neutral-700 text-neutral-300',
}

interface UsersPageClientProps {
  users: User[]
  currentUserId: string
}

export function UsersPageClient({ users, currentUserId }: UsersPageClientProps) {
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-800 rounded-lg px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/50 border border-green-800 rounded-lg px-4 py-3 text-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowInvite(!showInvite); clearMessages() }}
          className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 text-sm"
        >
          {showInvite ? 'Cancel' : 'Invite User'}
        </button>
      </div>

      {showInvite && (
        <InviteForm
          onSuccess={(msg) => { setSuccess(msg); setShowInvite(false) }}
          onError={setError}
          clearMessages={clearMessages}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-800 text-neutral-300 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                onSuccess={setSuccess}
                onError={setError}
                clearMessages={clearMessages}
              />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRow({
  user,
  isSelf,
  onSuccess,
  onError,
  clearMessages,
}: {
  user: User
  isSelf: boolean
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
  clearMessages: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleRoleChange(newRole: string) {
    clearMessages()
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole as Role)
        onSuccess(`Role updated for ${user.fullName}`)
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Failed to update role')
      }
    })
  }

  function handleDelete() {
    clearMessages()
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        onSuccess(`${user.fullName} has been removed`)
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Failed to delete user')
        setConfirmDelete(false)
      }
    })
  }

  return (
    <tr className={isPending ? 'opacity-50' : ''}>
      <td className="px-4 py-3 text-white">
        {user.fullName}
        {isSelf && <span className="ml-2 text-xs text-neutral-500">(you)</span>}
      </td>
      <td className="px-4 py-3 text-neutral-400">{user.email}</td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[user.role as Role]}`}>
            {user.role}
          </span>
        ) : (
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isPending}
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-white"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {isSelf ? (
          <span className="text-xs text-neutral-600">--</span>
        ) : confirmDelete ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-neutral-400">Confirm?</span>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
              className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded text-xs hover:bg-neutral-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  )
}

function InviteForm({
  onSuccess,
  onError,
  clearMessages,
}: {
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
  clearMessages: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('VIEWER')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()

    if (!email.trim() || !fullName.trim()) {
      onError('Email and full name are required')
      return
    }

    startTransition(async () => {
      try {
        await inviteUser(email.trim(), fullName.trim(), role)
        onSuccess(`Invited ${fullName.trim()} (${email.trim()})`)
        setEmail('')
        setFullName('')
        setRole('VIEWER')
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Failed to invite user')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-3">Invite New User</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 text-sm disabled:opacity-50"
        >
          {isPending ? 'Inviting...' : 'Send Invite'}
        </button>
      </div>
    </form>
  )
}
