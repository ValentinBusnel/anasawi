import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { tags } from '@/server/queries'
import { copierFichiers, etatSynchro, remplacerParLaSource, restaurer, secretValide } from '@/server/synchronisation'

/**
 * Point d'entrée de la synchronisation, appelé par L'AUTRE site quand on
 * y clique « Envoyer vers … » (voir server/synchronisation.ts). Ce site
 * récupère alors le contenu de l'autre — en lecture seule — et remplace
 * le sien, après sauvegarde.
 *
 * Authentification : le secret partagé `SYNC_SECRET` (en-tête
 * `x-synchro-secret`), comparé à temps constant. Le propriétaire est
 * vérifié côté appelant, avant l'appel.
 */

export const dynamic = 'force-dynamic'
/* Le remplacement relit les deux bases et écrit en une transaction. */
export const maxDuration = 26

function toutRafraichir() {
  for (const tag of [tags.pages, tags.services, tags.faq, tags.settings, tags.media]) revalidateTag(tag)
  revalidatePath('/', 'layout')
}

export async function POST(request: Request) {
  if (!secretValide(request.headers.get('x-synchro-secret'))) {
    return NextResponse.json({ ok: false, error: 'Accès refusé.' }, { status: 403 })
  }
  const corps = (await request.json().catch(() => ({}))) as { action?: string; depart?: number; nom?: string }
  try {
    switch (corps.action) {
      case 'etat':
        return NextResponse.json({ ok: true, data: await etatSynchro() })
      case 'fichiers': {
        const depart = Number(corps.depart ?? 0)
        if (!Number.isInteger(depart) || depart < 0) throw new Error('Étape invalide.')
        return NextResponse.json({ ok: true, data: await copierFichiers(depart) })
      }
      case 'remplacer': {
        const r = await remplacerParLaSource()
        toutRafraichir()
        return NextResponse.json({ ok: true, data: r })
      }
      case 'restaurer': {
        await restaurer(String(corps.nom ?? ''))
        toutRafraichir()
        return NextResponse.json({ ok: true, data: null })
      }
      default:
        return NextResponse.json({ ok: false, error: 'Action inconnue.' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue.' }, { status: 500 })
  }
}
