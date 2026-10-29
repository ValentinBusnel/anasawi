import type { Metadata } from 'next'
import Link from 'next/link'

import { chargerContenu } from '@/components/qeeps/donnees'
import { BarreSite } from '@/components/qeeps/interactifs'
import {
  AccompagnementsDossiersSection,
  AproposCarte,
  ContactCartes,
  GalerieDossiersSection,
  MethodeCartes,
  OuvertureHalo,
  PiedDePage,
  QuestionsVoletsSection,
  TexteCitation,
  TexteChiffres,
} from '@/components/qeeps/sections'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ANASAWI — version Qeeps',
}

const LIENS = [
  { href: '#a-propos', label: 'Qui je suis' },
  { href: '#methode', label: 'Méthode' },
  { href: '#accompagnements', label: 'Accompagnements' },
  { href: '#cabinet', label: 'Le cabinet' },
  { href: '#questions', label: 'Questions' },
  { href: '#contact', label: 'Contact' },
]

/** La page d'accueil entière, une section par catégorie de modèle. */
export default async function QeepsPage() {
  const c = await chargerContenu()

  return (
    <>
      <BarreSite nom={c.nom} liens={LIENS} rdv={c.rdv} />
      <main>
        <OuvertureHalo c={c} />
        <TexteChiffres c={c} />
        <AproposCarte c={c} />
        <MethodeCartes c={c} />
        <AccompagnementsDossiersSection c={c} />
        <TexteCitation c={c} />
        <GalerieDossiersSection c={c} />
        <QuestionsVoletsSection c={c} />
        <ContactCartes c={c} />
      </main>
      <PiedDePage c={c} liens={LIENS} />
      <p className="pb-8 text-center text-[12px] text-[#a8bbbe]">
        Démonstration ·{' '}
        <Link href="/qeeps/modeles" className="underline underline-offset-2 hover:text-[#164951]">
          voir toutes les variantes
        </Link>
      </p>
    </>
  )
}
