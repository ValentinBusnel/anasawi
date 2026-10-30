import { AdminContent } from '@/components/admin/AdminContent'
import { PageHeader } from '@/components/admin/PageHeader'
import { SynchroWorkbench } from '@/components/admin/SynchroWorkbench'
import { requireAdmin } from '@/lib/auth'
import { phraseDeConfirmation } from '@/server/actions/synchronisation'
import { etatSynchro } from '@/server/synchronisation'

export const dynamic = 'force-dynamic'

/**
 * Synchronisation préprod ⇄ production — réservée au propriétaire.
 * Chaque site récupère le contenu de l'autre (voir server/synchronisation).
 */
export default async function SynchronisationPage() {
  const user = await requireAdmin()
  if (user.role !== 'owner') {
    return (
      <AdminContent>
        <PageHeader title="Synchronisation" description="Cet écran est réservé au propriétaire du site." />
      </AdminContent>
    )
  }
  const [etat, phrase] = await Promise.all([etatSynchro(), phraseDeConfirmation()])
  return (
    <AdminContent width="wide">
      <PageHeader
        title="Synchronisation"
        description="Récupérer sur ce site le contenu de l’autre environnement (préprod ou production). Une sauvegarde est faite avant chaque remplacement."
      />
      <SynchroWorkbench etat={etat} phrase={phrase} />
    </AdminContent>
  )
}
