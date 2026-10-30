'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

import { fail, guard, ok, type ActionResult } from './types'
import { requireOwner } from '@/lib/auth'
import { tags } from '@/server/queries'
import { configSynchro, copierFichiers, remplacerParLaSource, restaurer } from '@/server/synchronisation'

/**
 * Les actions de la synchronisation préprod ⇄ production. Réservées au
 * PROPRIÉTAIRE, et le mot de confirmation est revérifié ici : un clic
 * accidentel, ou un appel forgé, ne suffit pas.
 */

/** La phrase à taper pour confirmer (« REMPLACER LA PRODUCTION »). */
export async function phraseDeConfirmation(): Promise<string> {
  const config = configSynchro()
  return config ? `REMPLACER ${config.cible.toUpperCase()}` : ''
}

function toutRafraichir() {
  for (const tag of [tags.pages, tags.services, tags.faq, tags.settings, tags.media]) revalidateTag(tag)
  revalidatePath('/', 'layout')
}

/** Les erreurs de la synchronisation sont faites pour être lues. */
function message(e: unknown): string {
  return e instanceof Error ? e.message : 'Erreur inconnue.'
}

export async function copierFichiersAction(depart: number): Promise<ActionResult<{ suivant: number | null; total: number; copies: number }>> {
  return guard(async () => {
    await requireOwner()
    if (!Number.isInteger(depart) || depart < 0) return fail('Étape invalide.')
    try {
      return ok(await copierFichiers(depart))
    } catch (e) {
      return fail(message(e))
    }
  })
}

export async function remplacerAction(confirmation: string): Promise<ActionResult<{ sauvegarde: string }>> {
  return guard(async () => {
    await requireOwner()
    const attendue = await phraseDeConfirmation()
    if (!attendue || confirmation.trim() !== attendue) return fail(`Tapez exactement « ${attendue} » pour confirmer.`)
    try {
      const r = await remplacerParLaSource()
      toutRafraichir()
      return ok(r)
    } catch (e) {
      return fail(message(e))
    }
  })
}

export async function restaurerAction(nom: string, confirmation: string): Promise<ActionResult<void>> {
  return guard(async () => {
    await requireOwner()
    if (confirmation.trim() !== 'RESTAURER') return fail('Tapez exactement « RESTAURER » pour confirmer.')
    try {
      await restaurer(nom)
      toutRafraichir()
      return ok()
    } catch (e) {
      return fail(message(e))
    }
  })
}
