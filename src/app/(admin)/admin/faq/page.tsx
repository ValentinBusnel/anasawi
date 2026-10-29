import { AdminContent } from '@/components/admin/AdminContent'
import { FaqManager } from '@/components/admin/FaqManager'
import { getAllFaq } from '@/server/queries'

export const dynamic = 'force-dynamic'

export default async function FaqAdminPage() {
  const items = await getAllFaq()

  /* L'en-tête (compteurs, « Nouvelle question ») vit dans le
     gestionnaire : il suit les ajouts et les masquages sans recharger. */
  return (
    <AdminContent width="wide">
      <FaqManager items={items} />
    </AdminContent>
  )
}
