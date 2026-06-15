import { getVehicles } from '@/actions/fleet'
import FleetPageClient from '@/components/fleet/FleetPageClient'

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; listingStatus?: string }>
}) {
  const params = await searchParams
  const vehicles = await getVehicles(params.search, params.status, params.listingStatus)

  return (
    <FleetPageClient
      vehicles={JSON.parse(JSON.stringify(vehicles))}
      initialSearch={params.search || ''}
      initialStatus={params.status || ''}
      initialListingStatus={params.listingStatus || ''}
    />
  )
}
