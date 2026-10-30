import type { Metadata } from 'next'

import { MODELES_MODERNES, sectionsEnMemoire } from '@/blocks/moderne/defaut'
import { getBlock } from '@/blocks/registry'
import { chargerContenu } from '@/components/anasawi/charger'
import { Horizon } from '@/components/anasawi/sections'
import { Fil } from '@/components/anasawi/vivant'
import { SectionsView } from '@/components/site/SectionsView'
import { getActiveFaq, getActiveServices, getAllMedia, getSettings } from '@/server/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ANASAWI — modèles de la version moderne',
}

/**
 * Vitrine : les quinze modèles modernes supplémentaires, l'un après
 * l'autre, avec le vrai contenu — pour les voir vivre avant de les
 * ajouter dans l'éditeur.
 */
export default async function ModelesModernesPage() {
  const [c, settings, services, faqItems, media] = await Promise.all([
    chargerContenu(),
    getSettings(),
    getActiveServices(),
    getActiveFaq(),
    getAllMedia(),
  ])
  // Les valeurs par défaut de chaque bloc : ce que l'on obtient en
  // l'ajoutant depuis l'éditeur.
  const sections = sectionsEnMemoire(MODELES_MODERNES, 'vitrine').map((s) => ({
    ...s,
    payload: (getBlock(s.type)?.defaults ?? {}) as Record<string, unknown>,
  }))

  return (
    <>
      <Fil liens={[{ href: '/moderne', label: 'Retour au site moderne' }]} rdv="#contact" logo={c.logo} />
      <main>
        <SectionsView sections={sections} data={{ services, faqItems, settings, media, partage: c }} />
      </main>
      <Horizon c={c} liens={[]} />
    </>
  )
}
