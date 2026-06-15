import { getCustomers } from '@/actions/customers'
import CustomersPageClient from '@/components/customers/CustomersPageClient'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string }>
}) {
  const { search, tag } = await searchParams
  const customers = await getCustomers(search, tag)

  return <CustomersPageClient customers={customers} search={search} tag={tag} />
}
