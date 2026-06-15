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
    throw new Error('Invalid role')
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath('/settings/users')
  return { success: true, user }
}

export async function inviteUser(email: string, fullName: string, role: UserRole) {
  const currentUser = await requireRole('ADMIN' as UserRole)

  if (!email?.trim() || !fullName?.trim()) {
    throw new Error('Email and full name are required')
  }

  if (!Object.values(UserRole).includes(role)) {
    throw new Error('Invalid role')
  }

  // Check if user already exists in DB
  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (existing) {
    throw new Error('A user with this email already exists')
  }

  // Create user in Supabase Auth using admin client
  const supabase = await createAdminClient()
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    email_confirm: true,
    user_metadata: { full_name: fullName.trim() },
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create auth user')
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
}

export async function deleteUser(userId: string) {
  const currentUser = await requireRole('ADMIN' as UserRole)

  if (currentUser.id === userId) {
    throw new Error('You cannot delete your own account')
  }

  // Verify the target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!targetUser) {
    throw new Error('User not found')
  }

  // Delete from Supabase Auth
  const supabase = await createAdminClient()
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) {
    throw new Error(authError.message || 'Failed to delete auth user')
  }

  // Delete from DB
  await prisma.user.delete({
    where: { id: userId },
  })

  revalidatePath('/settings/users')
  return { success: true }
}
