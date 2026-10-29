import type { Metadata } from 'next'
import Link from 'next/link'

import { chargerContenu } from '@/components/qeeps/donnees'
import {
  AccompagnementsCartes,
  AccompagnementsVitrine,
  Appel,
  Chiffres,
  Contact,
  ContactBloc,
  Defile,
  Fonctionnement,
  FonctionnementCartes,
  OuvertureCentree,
  OuvertureMaquette,
  OuverturePortrait,
  Profil,
  ProfilPortrait,
  Questions,
  QuestionsDefile,
} from '@/components/qeeps/sections'
import { Etiquette, LogoMot, Variante } from '@/components/qeeps/ui'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sections dans la DA du site Qeeps — ANASAWI',
}

/**
 * La vitrine : chaque catégorie de modèle du site, en plusieurs
 * variantes dans la direction artistique Qeeps, toutes avec le contenu
 * réel. L'équivalent de `/templates`, pour comparer d'un coup d'œil.
 */
const CATALOGUE = [
  {
    categorie: 'Ouverture',
    variantes: [
      { nom: 'Maquette fondue et titre en dégradé', C: OuvertureMaquette },
      { nom: 'Centrée, photos qui défilent', C: OuvertureCentree },
      { nom: 'Texte et portrait inclinable', C: OuverturePortrait },
    ],
  },
  {
    categorie: 'Défilé',
    variantes: [{ nom: 'Bande de tuiles', C: Defile }],
  },
  {
    categorie: 'Qui je suis',
    variantes: [
      { nom: 'Carte de profil', C: Profil },
      { nom: 'Grand portrait', C: ProfilPortrait },
    ],
  },
  {
    categorie: 'Comment ça se passe',
    variantes: [
      { nom: 'Blocs animés (survolez-les)', C: Fonctionnement },
      { nom: 'Étapes numérotées', C: FonctionnementCartes },
    ],
  },
  {
    categorie: 'Chiffres',
    variantes: [{ nom: 'Chiffres en dégradé', C: Chiffres }],
  },
  {
    categorie: 'Accompagnements',
    variantes: [
      { nom: 'Cartes', C: AccompagnementsCartes },
      { nom: 'Vitrine inclinée', C: AccompagnementsVitrine },
    ],
  },
  {
    categorie: 'Questions',
    variantes: [
      { nom: 'Accordéon', C: Questions },
      { nom: 'Cartes qui défilent', C: QuestionsDefile },
    ],
  },
  {
    categorie: 'Appel',
    variantes: [{ nom: '« Pas encore décidé ? »', C: Appel }],
  },
  {
    categorie: 'Contact',
    variantes: [
      { nom: 'Formulaire centré', C: Contact },
      { nom: 'Coordonnées et formulaire', C: ContactBloc },
    ],
  },
] as const

const ancre = (categorie: string) =>
  categorie.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '-')

export default async function QeepsModelesPage() {
  const c = await chargerContenu()
  const total = CATALOGUE.reduce((n, g) => n + g.variantes.length, 0)

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#f8f8f8]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <Link href="/qeeps" className="mr-auto flex items-baseline gap-3">
            <LogoMot nom="Anasawi" />
            <span className="text-[14px] font-medium text-[#8aa4a8]">{total} variantes</span>
          </Link>
          <nav aria-label="Catégories" className="no-scrollbar -mx-1 max-w-full overflow-x-auto">
            <ul className="flex gap-1.5 px-1">
              {CATALOGUE.map((g) => (
                <li key={g.categorie}>
                  <a href={`#${ancre(g.categorie)}`}>
                    <Etiquette className="hover:bg-[#ddf7f7]">{g.categorie}</Etiquette>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="pb-24">
        {CATALOGUE.map((g) => (
          <div key={g.categorie} id={ancre(g.categorie)} className="scroll-mt-20">
            {g.variantes.map((v) => (
              <div key={v.nom}>
                <Variante categorie={g.categorie} nom={v.nom} />
                <v.C c={c} />
              </div>
            ))}
          </div>
        ))}
      </main>
    </>
  )
}
