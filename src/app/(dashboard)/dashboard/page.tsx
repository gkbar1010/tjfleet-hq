import { getDashboardData } from '@/actions/dashboard'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#888] mt-1">Fleet overview and today&apos;s schedule</p>
      </div>
      <DashboardClient data={data} />
    </div>
  )
}
