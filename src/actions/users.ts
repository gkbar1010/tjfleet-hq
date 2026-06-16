'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/auth'
import { UserRole } from '@/generated/prisma/client'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  await requireRole('ADMIN' as UserRole)

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return users
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireRole('ADMIN' as UserRole)

  if (!Object.values(UserRole).includes(role)) {
    return { error: 'Invalid role' }
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath('/settings/users')
    return { success: true, user }
  } catch (err) {
    console.error('Update user role error:', err)
    return { error: 'Failed to update user role. Please try again.' }
  }
}

export async function inviteUser(email: string, fullName: string, role: UserRole) {
  const currentUser = await requireRole('ADMIN' as UserRole)

  if (!email?.trim() || !fullName?.trim()) {
    return { error: 'Email and full name are required' }
  }

  if (!Object.values(UserRole).includes(role)) {
    return { error: 'Invalid role' }
  }

  try {
    // Check if user already exists in DB
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (existing) {
      return { error: 'A user with this email already exists' }
    }

    // Create user in Supabase Auth using admin client
    const supabase = await createAdminClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    })

    if (authError || !authData.user) {
      return { error: authError?.message || 'Failed to create auth user' }
    }

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        role,
      },
    })

    revalidatePath('/settings/users')
    return { success: true, user }
  } catch (err) {
    console.error('Invite user error:', err)
    return { error: 'Failed to invite user. Please try again.' }
  }
}

export async function deleteUser(userId: string) {
  const currentUser = await requireRole('ADMIN' as UserRole)

  if (currentUser.id === userId) {
    return { error: 'You cannot delete your own account' }
  }

  try {
    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!targetUser) {
      return { error: 'User not found' }
    }

    // Delete from Supabase Auth
    const supabase = await createAdminClient()
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      return { error: authError.message || 'Failed to delete auth user' }
    }

    // Delete from DB
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (err) {
    console.error('Delete user error:', err)
    return { error: 'Failed to delete user. Please try again.' }
  }
}
