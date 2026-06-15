import { getCustomer } from '@/actions/customers'
import { notFound } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const customer = await getCustomer(id)

  if (!customer) {
    notFound()
  }

  return (
    <CustomerForm
      customer={{
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        instagram: customer.instagram,
        notes: customer.notes,
        tags: customer.tags,
      }}
    />
  )
}
