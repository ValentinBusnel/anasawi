'use server'

import { fail, guard, ok, type ActionResult } from './types'
import { requireOwner } from '@/lib/auth'
import { configSynchro, demanderALAutre, raison, type Etat } from '@/server/synchronisation'

/**
 * « Envoyer vers l'autre site » — réservé au PROPRIÉTAIRE. Chaque étape
 * est une demande à l'autre site, qui récupère notre contenu (voir
 * server/synchronisation.ts). Le mot de confirmation est revérifié ici.
 */

/** La phrase à taper pour confirmer (« ENVOYER VERS LA PRODUCTION »). */
export async function phraseDeConfirmation(): Promise<string> {
  const config = configSynchro()
  return config ? `ENVOYER VERS ${config.source.toUpperCase()}` : ''
}

const message = (e: unknown) => raison(e)

/** L'état vu par l'autre site : nos chiffres (source) et les siens (cible). */
export async function etatEnvoiAction(): Promise<ActionResult<Etat>> {
  return guard(async () => {
    await requireOwner()
    try {
      return ok(await demanderALAutre<Etat>({ action: 'etat' }))
    } catch (e) {
      return fail(message(e))
    }
  })
}

export async function envoyerFichiersAction(depart: number): Promise<ActionResult<{ suivant: number | null; total: number; copies: number }>> {
  return guard(async () => {
    await requireOwner()
    if (!Number.isInteger(depart) || depart < 0) return fail('Étape invalide.')
    try {
      return ok(await demanderALAutre({ action: 'fichiers', depart }))
    } catch (e) {
      return fail(message(e))
    }
  })
}

export async function envoyerAction(confirmation: string): Promise<ActionResult<{ sauvegarde: string }>> {
  return guard(async () => {
    await requireOwner()
    const attendue = await phraseDeConfirmation()
    if (!attendue || confirmation.trim() !== attendue) return fail(`Tapez exactement « ${attendue} » pour confirmer.`)
    try {
      return ok(await demanderALAutre<{ sauvegarde: string }>({ action: 'remplacer' }))
    } catch (e) {
      return fail(message(e))
    }
  })
}

export async function restaurerChezLAutreAction(nom: string, confirmation: string): Promise<ActionResult<void>> {
  return guard(async () => {
    await requireOwner()
    if (confirmation.trim() !== 'RESTAURER') return fail('Tapez exactement « RESTAURER » pour confirmer.')
    try {
      await demanderALAutre({ action: 'restaurer', nom })
      return ok()
    } catch (e) {
      return fail(message(e))
    }
  })
}
