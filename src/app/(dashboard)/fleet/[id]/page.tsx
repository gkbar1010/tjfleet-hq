import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVehicle } from '@/actions/fleet'
import VehicleDetailClient from '@/components/fleet/VehicleDetailClient'

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicle = await getVehicle(id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link href="/fleet" className="hover:text-white transition-colors">
          Fleet
        </Link>
        <span>/</span>
        <span className="text-white">{vehicle.displayName}</span>
      </div>

      <VehicleDetailClient vehicle={JSON.parse(JSON.stringify(vehicle))} />
    </div>
  )
}
