import type { Metadata } from 'next'

import { chargerContenu } from '@/components/qeeps/donnees'
import { BarreSite } from '@/components/qeeps/interactifs'
import {
  AccompagnementsCartes,
  Appel,
  Chiffres,
  Contact,
  Defile,
  Fonctionnement,
  OuvertureMaquette,
  PiedDePage,
  Profil,
  Questions,
} from '@/components/qeeps/sections'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ANASAWI — dans la DA du site Qeeps',
}

const LIENS = [
  { href: '#a-propos', label: 'Qui je suis' },
  { href: '#methode', label: 'Comment ça se passe' },
  { href: '#accompagnements', label: 'Accompagnements' },
  { href: '#questions', label: 'Questions' },
]

/** La page d'accueil d'Anne, construite comme byqeeps.com. */
export default async function QeepsPage() {
  const c = await chargerContenu()

  return (
    <>
      <BarreSite nom="Anasawi" liens={LIENS} rdv={c.rdv} />
      <main>
        <OuvertureMaquette c={c} />
        <Defile c={c} />
        <Profil c={c} />
        <Fonctionnement c={c} />
        <Chiffres c={c} />
        <AccompagnementsCartes c={c} />
        <Questions c={c} />
        <Appel c={c} />
        <Contact c={c} />
      </main>
      <PiedDePage c={c} liens={LIENS} />
    </>
  )
}
