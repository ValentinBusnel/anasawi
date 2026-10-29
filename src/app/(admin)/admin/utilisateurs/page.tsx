import { AdminContent } from '@/components/admin/AdminContent'
import { UsersManager } from '@/components/admin/UsersManager'
import { listUsers } from '@/server/queries/users'

export const dynamic = 'force-dynamic'

export default async function UtilisateursPage() {
  const result = await listUsers()
  const utilisateurs = result.ok ? result.data : []

  return (
    <AdminContent width="wide">
      <UsersManager initial={utilisateurs} />
    </AdminContent>
  )
}
