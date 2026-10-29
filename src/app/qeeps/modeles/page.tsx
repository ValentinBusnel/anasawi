import type { Metadata } from 'next'
import Link from 'next/link'

import { chargerContenu } from '@/components/qeeps/donnees'
import {
  AccompagnementsDossiersSection,
  AccompagnementsGrille,
  AccompagnementsLignes,
  AproposCarte,
  AproposProfil,
  ContactBandeau,
  ContactCartes,
  GalerieDossiersSection,
  GalerieMosaique,
  MethodeCartes,
  MethodeFil,
  OuvertureCentree,
  OuvertureDeuxColonnes,
  OuvertureHalo,
  QuestionsAccordeonSection,
  QuestionsVoletsSection,
  TexteChiffres,
  TexteCitation,
} from '@/components/qeeps/sections'
import { Etiquette, pastel } from '@/components/qeeps/ui'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Modèles façon Qeeps — ANASAWI',
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
      { nom: 'Bandeau à halo', C: OuvertureHalo },
      { nom: 'Deux colonnes', C: OuvertureDeuxColonnes },
      { nom: 'Centrée, minimale', C: OuvertureCentree },
    ],
  },
  {
    categorie: 'Qui je suis',
    variantes: [
      { nom: 'Portrait et carte', C: AproposCarte },
      { nom: 'Profil en cartes', C: AproposProfil },
    ],
  },
  {
    categorie: 'Ma méthode',
    variantes: [
      { nom: 'Étapes en cartes', C: MethodeCartes },
      { nom: 'Fil vertical', C: MethodeFil },
    ],
  },
  {
    categorie: 'Accompagnements',
    variantes: [
      { nom: 'Dossiers et fiches', C: AccompagnementsDossiersSection },
      { nom: 'Grille de cartes', C: AccompagnementsGrille },
      { nom: 'Lignes', C: AccompagnementsLignes },
    ],
  },
  {
    categorie: 'Photos',
    variantes: [
      { nom: 'Dossiers et visionneuse', C: GalerieDossiersSection },
      { nom: 'Mosaïque', C: GalerieMosaique },
    ],
  },
  {
    categorie: 'Questions',
    variantes: [
      { nom: 'Deux volets', C: QuestionsVoletsSection },
      { nom: 'Accordéon', C: QuestionsAccordeonSection },
    ],
  },
  {
    categorie: 'Textes',
    variantes: [
      { nom: 'Citation', C: TexteCitation },
      { nom: 'Chiffres clés', C: TexteChiffres },
    ],
  },
  {
    categorie: 'Contact',
    variantes: [
      { nom: 'Coordonnées et formulaire', C: ContactCartes },
      { nom: 'Bandeau rendez-vous', C: ContactBandeau },
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
      <header className="sticky top-0 z-50 border-b border-[#eef1f2] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
          <div className="mr-auto">
            <p className="text-[13px] font-medium text-[#8aa4a8]">Modèles façon Qeeps · {total} variantes</p>
            <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#164951]">Bibliothèque de sections</h1>
          </div>
          <nav aria-label="Catégories" className="no-scrollbar -mx-1 max-w-full overflow-x-auto">
            <ul className="flex gap-1 px-1">
              {CATALOGUE.map((g, i) => (
                <li key={g.categorie}>
                  <a
                    href={`#${ancre(g.categorie)}`}
                    className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full bg-[#f2f3f4] px-3 text-[13px] font-medium text-[#46606c] transition-colors hover:bg-[#e9eced] hover:text-[#164951]"
                  >
                    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: pastel(i).fg }} />
                    {g.categorie}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/qeeps" className="text-[13px] font-medium text-[#176c79] hover:text-[#164951]">
            ← La page complète
          </Link>
        </div>
      </header>

      <main className="pb-24">
        {CATALOGUE.map((g, i) => (
          <div key={g.categorie} id={ancre(g.categorie)} className="scroll-mt-24">
            {g.variantes.map((v) => (
              <div key={v.nom}>
                <Etiquette categorie={g.categorie} nom={v.nom} rang={i} />
                <v.C c={c} />
              </div>
            ))}
          </div>
        ))}
      </main>
    </>
  )
}
