import { AdminContent } from '@/components/admin/AdminContent'
import { ServicesManager } from '@/components/admin/ServicesManager'
import {
  getAllMedia,
  getAllServices,
  getServiceGroups,
} from '@/server/queries'

export const dynamic = 'force-dynamic'

export default async function ServicesAdminPage() {
  const [services, groups, library] = await Promise.all([
    getAllServices(),
    getServiceGroups(),
    getAllMedia(),
  ])

  return (
    <AdminContent width="wide">
      <ServicesManager services={services} groups={groups} library={library} />
    </AdminContent>
  )
}
