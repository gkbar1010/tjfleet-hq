import { getCustomer } from '@/actions/customers'
import { notFound } from 'next/navigation'
import CustomerDetailClient from '@/components/customers/CustomerDetailClient'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return <CustomerDetailClient customer={customer} />
}
