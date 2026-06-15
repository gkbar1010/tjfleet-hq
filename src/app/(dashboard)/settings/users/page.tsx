import { getCurrentUser } from '@/lib/auth'
import { getUsers } from '@/actions/users'
import { redirect } from 'next/navigation'
import { UsersPageClient } from '@/components/settings/UsersPageClient'

export default async function SettingsUsersPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-[#888]">
            You do not have permission to manage users. Only administrators can access this page.
          </p>
        </div>
      </div>
    )
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-[#888] mt-1">Manage team members and their roles.</p>
      </div>
      <UsersPageClient users={users} currentUserId={user.id} />
    </div>
  )
}
