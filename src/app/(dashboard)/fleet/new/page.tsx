import Link from 'next/link'
import VehicleForm from '@/components/fleet/VehicleForm'

export default function NewVehiclePage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[#666] mb-6">
        <Link href="/fleet" className="hover:text-white transition-colors">
          Fleet
        </Link>
        <span>/</span>
        <span className="text-white">New Vehicle</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Add New Vehicle</h1>

      <VehicleForm />
    </div>
  )
}
