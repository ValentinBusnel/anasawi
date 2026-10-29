import { AdminContent } from '@/components/admin/AdminContent'
import { MediaManager } from '@/components/admin/MediaManager'
import { getAllMedia, getMediaFolders } from '@/server/queries'

export const dynamic = 'force-dynamic'

export default async function MediaAdminPage() {
  const [items, folders] = await Promise.all([getAllMedia(), getMediaFolders()])

  /* L'en-tête (compteurs, « Envoyer des fichiers ») vit dans le
     gestionnaire : il suit les ajouts et les rangements sans recharger. */
  return (
    <AdminContent width="wide">
      <MediaManager items={items} folders={folders} />
    </AdminContent>
  )
}
