'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { AVAILABLE_TAGS, type CustomerTag } from '@/lib/constants'

export async function getCustomers(search?: string, tag?: string) {
  await requireAuth()
  const where: Record<string, unknown> = {}

  if (search) {
    const s = search.trim()
    where.OR = [
      { fullName: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { instagram: { contains: s, mode: 'insensitive' } },
    ]
  }

  if (tag) {
    where.tags = { has: tag }
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return customers
}

export async function getCustomer(id: string) {
  await requireAuth()
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          vehicle: true,
        },
        orderBy: { pickupDatetime: 'desc' },
      },
      files: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return customer
}

export async function createCustomer(formData: FormData) {
  await requireRole('ADMIN', 'SECRETARY')

  const fullName = formData.get('fullName') as string
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const instagram = (formData.get('instagram') as string) || null
  const notes = (formData.get('notes') as string) || null
  const tags = formData.getAll('tags') as string[]

  if (!fullName || fullName.trim().length === 0) {
    return { error: 'Full name is required' }
  }

  const validTags = tags.filter((t) =>
    AVAILABLE_TAGS.includes(t as CustomerTag)
  )

  const customer = await prisma.customer.create({
    data: {
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      instagram: instagram?.trim() || null,
      notes: notes?.trim() || null,
      tags: validTags,
    },
  })

  revalidatePath('/customers')
  return { success: true, id: customer.id }
}

export async function updateCustomer(id: string, formData: FormData) {
  await requireRole('ADMIN', 'SECRETARY')

  const fullName = formData.get('fullName') as string
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const instagram = (formData.get('instagram') as string) || null
  const notes = (formData.get('notes') as string) || null
  const tags = formData.getAll('tags') as string[]

  if (!fullName || fullName.trim().length === 0) {
    return { error: 'Full name is required' }
  }

  const validTags = tags.filter((t) =>
    AVAILABLE_TAGS.includes(t as CustomerTag)
  )

  await prisma.customer.update({
    where: { id },
    data: {
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      instagram: instagram?.trim() || null,
      notes: notes?.trim() || null,
      tags: validTags,
    },
  })

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function deleteCustomer(id: string) {
  await requireRole('ADMIN')

  try {
    const bookingCount = await prisma.booking.count({
      where: { customerId: id },
    })

    if (bookingCount > 0) {
      return { error: `Cannot delete this customer because they have ${bookingCount} booking(s). Remove or reassign them first.` }
    }

    await prisma.customer.delete({
      where: { id },
    })

    revalidatePath('/customers')
    return { success: true }
  } catch (err) {
    console.error('Delete customer error:', err)
    return { error: 'Failed to delete customer. Please try again.' }
  }
}
