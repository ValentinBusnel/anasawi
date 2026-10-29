import type { Metadata } from 'next'

import { sectionsModernesParDefaut } from '@/blocks/moderne/defaut'
import { chargerContenu } from '@/components/anasawi/charger'
import { Horizon } from '@/components/anasawi/sections'
import { Fil } from '@/components/anasawi/vivant'
import { SectionsView } from '@/components/site/SectionsView'
import { getActiveFaq, getActiveServices, getAllMedia, getPublishedModern, getSettings } from '@/server/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ANASAWI — version moderne',
}

const LIENS = [
  { href: '#a-propos', label: 'Rencontre' },
  { href: '#methode', label: 'Le chemin' },
  { href: '#accompagnements', label: 'Accompagnements' },
  { href: '#cabinet', label: 'Le cabinet' },
  { href: '#questions', label: 'Questions' },
]

/**
 * La version moderne : les sections publiées de la page « accueil-
 * moderne » (composées dans l'éditeur, thème Moderne), rendues par le
 * même moteur que le site classique — avec le contenu partagé.
 */
export default async function ModernePage() {
  const [page, c, settings, services, faqItems, media] = await Promise.all([
    getPublishedModern(),
    chargerContenu(),
    getSettings(),
    getActiveServices(),
    getActiveFaq(),
    getAllMedia(),
  ])
  const sections = (page?.sections ?? sectionsModernesParDefaut()).filter((s) => s.isActive)

  return (
    <>
      <Fil liens={LIENS} rdv="#contact" logo={c.logo} />
      <main>
        <SectionsView sections={sections} data={{ services, faqItems, settings, media, partage: c }} />
      </main>
      <Horizon c={c} liens={LIENS} />
    </>
  )
}
