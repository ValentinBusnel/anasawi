import {
  Horizon,
  Phrase,
  Rencontre,
  RendezVous,
  Respiration,
  SectionArches,
  SectionChemin,
  SectionConversation,
  SectionPromenade,
  SectionSeuil,
} from './sections'
import { Fil } from './vivant'
import { chargerContenu } from '@/components/qeeps/donnees'

const LIENS = [
  { href: '#a-propos', label: 'Rencontre' },
  { href: '#methode', label: 'Le chemin' },
  { href: '#accompagnements', label: 'Accompagnements' },
  { href: '#cabinet', label: 'Le cabinet' },
  { href: '#questions', label: 'Questions' },
]

/** La page d'accueil, dans la nouvelle DA d'Anasawi. */
export async function PageAnasawi({ base }: { base: string }) {
  const c = await chargerContenu()
  return (
    <>
      <Fil liens={LIENS} rdv="#contact" />
      <main>
        <SectionSeuil c={c} />
        <Respiration c={c} />
        <Rencontre c={c} />
        <SectionChemin c={c} />
        <SectionArches c={c} />
        <Phrase c={c} />
        <SectionPromenade c={c} />
        <SectionConversation c={c} />
        <RendezVous c={c} />
      </main>
      <Horizon c={c} liens={LIENS} base={base} />
    </>
  )
}

const COMPOSANTS = [
  { nom: 'Seuil', idee: 'L’arche s’ouvre au défilement : on entre dans le cabinet.', C: SectionSeuil },
  { nom: 'Respiration', idee: 'Un cercle qui respire, 4 secondes pour inspirer, 4 pour expirer.', C: Respiration },
  { nom: 'Rencontre', idee: 'Le portrait en arche, son sceau qui tourne, un texte qui s’encre à la lecture.', C: Rencontre },
  { nom: 'Chemin', idee: 'Un trait d’or se dessine et allume chaque étape.', C: SectionChemin },
  { nom: 'Arches', idee: 'Une arche par accompagnement ; survolée, elle s’ouvre en fiche.', C: SectionArches },
  { nom: 'Phrase', idee: 'Une conviction en très grand, ligne après ligne.', C: Phrase },
  { nom: 'Promenade', idee: 'La page s’arrête, les pièces du cabinet glissent de côté.', C: SectionPromenade },
  { nom: 'Conversation', idee: 'Une question part, Anne « écrit »… la réponse arrive.', C: SectionConversation },
  { nom: 'Rendez-vous', idee: 'La semaine allumée, et une lettre qui s’envole une fois envoyée.', C: RendezVous },
] as const

/** La vitrine : chaque composant, avec son idée. */
export async function ModelesAnasawi({ base }: { base: string }) {
  const c = await chargerContenu()
  return (
    <>
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-6 px-[5vw] pb-6 pt-16">
        <div>
          <p className="text-[12px] uppercase tracking-[0.22em] text-[var(--ad-gris)]">Nouvelle direction artistique</p>
          <h1 className="mt-3 text-[56px] md:text-[80px]">
            Les <em>composants</em>
          </h1>
        </div>
        <a href={base} className="border-b border-current pb-1 text-[14px] text-[var(--ad-nuit)]">
          ← La page complète
        </a>
      </header>
      <main>
        {COMPOSANTS.map(({ nom, idee, C }, i) => (
          <div key={nom}>
            <div className="mx-auto flex max-w-[1200px] items-baseline gap-4 border-t border-[var(--ad-sable-fonce)] px-[5vw] pt-6">
              <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[20px] text-[var(--ad-or)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[28px]">{nom}</span>
              <span className="text-[14px] text-[var(--ad-gris)]">{idee}</span>
            </div>
            <C c={c} />
          </div>
        ))}
      </main>
    </>
  )
}
