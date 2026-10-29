import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings2,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import type { Contenu } from './donnees'
import { Accordeon, Apparait, FormulaireContact, Inclinaison } from './interactifs'
import { Accent, Bouton, Etiquette, LogoMot, Photo, Section, Titre } from './ui'
import { PASTELS } from '@/components/admin/editor/pastels'
import { cn, toE164 } from '@/lib/utils'

/**
 * Le site d'Anne dans la DA du site vitrine de Qeeps (byqeeps.com).
 * Plusieurs variantes par section ; toutes lisent le même contenu réel.
 */

type P = { c: Contenu }
type Service = Contenu['services'][number]

const pastel = (i: number) => PASTELS[((i % PASTELS.length) + PASTELS.length) % PASTELS.length]!
const sansEtoiles = (t: string) => t.replace(/\*/g, '')
/** La durée courte d'un accompagnement (« 1 h · 80 € » → « 1 h »). */
const dureeCourte = (s: Service) => s.duration?.split(/[·—-]/)[0]?.trim() || null

/* ══════════════════════════════════════════════════════════════════════
   OUVERTURE
   ══════════════════════════════════════════════════════════════════════ */

/** La signature de byqeeps.com : une grande maquette qui se fond dans la
    page, et le titre en dégradé qui vient la chevaucher sur une bande
    floutée. Ici, la maquette est le cabinet d'Anne, avec ses fiches. */
export function OuvertureMaquette({ c }: P) {
  const fiches = c.services.slice(0, 3)
  return (
    <section id="haut" className="relative flex flex-col items-center overflow-x-clip px-6 pb-14 pt-24 xl:pb-24 xl:pt-[78px]">
      <Inclinaison className="w-full max-w-[876px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0,0.37,0.56,1)_0.1s_backwards]">
        <div className="grid h-[300px] grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[12px] bg-white shadow-[var(--q-shadow-hero)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_52%,transparent_96%)] sm:h-[460px] sm:grid-cols-[160px_minmax(0,1fr)] xl:h-[557px]">
          <aside className="flex flex-col gap-4 border-r border-[#f1f3f4] p-4 max-sm:hidden">
            <LogoMot nom="Anasawi" className="text-center text-[17px] leading-none" />
            <div className="flex items-center gap-2 rounded-[6px] border border-[#eef1f2] p-1.5">
              <Photo media={c.portrait} sizes="24px" className="h-6 w-6 shrink-0 rounded-full" />
              <span className="min-w-0">
                <span className="block truncate text-[9px] font-medium text-[#164951]">{c.nom}</span>
                <span className="block truncate text-[7px] text-[#8aa4a8]">{c.metier}</span>
              </span>
            </div>
            <ul className="flex flex-col gap-4 px-1 py-2 text-[9px] font-medium text-[#164951]">
              {['Accueil', 'Accompagnements', 'Le cabinet', 'Questions'].map((l, i) => (
                <li key={l} className={cn('flex items-center gap-1.5', i > 1 && 'text-[#8aa4a8]')}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: pastel(i).fg }} />
                  {l}
                </li>
              ))}
            </ul>
          </aside>
          <div className="flex min-w-0 flex-col gap-3 p-5 sm:pt-6">
            <p className="text-[15px] font-medium text-[#164951]">Bienvenue au cabinet</p>
            <Photo media={c.ambiance} sizes="(max-width: 640px) 100vw, 700px" priorite className="h-[150px] shrink-0 rounded-[8px] sm:h-[190px]" />
            <div className="rounded-[6px] border border-[#eef1f2] p-2.5">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#164951]">
                Les accompagnements
                <span className="rounded-[10px] bg-[#fdf6dc] px-1.5 text-[8px] text-[#c9a227]">{c.services.length}</span>
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {fiches.map((s, i) => (
                  <div key={s.id} className="flex min-w-0 items-center gap-2 rounded-[6px] border border-[#eef1f2] p-2">
                    <span className="grid h-9 w-10 shrink-0 place-items-center rounded-[4px]" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                      <HeartHandshake className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[8.5px] font-semibold text-[#164951]">{s.title}</span>
                      {dureeCourte(s) && (
                        <span className="mt-1 inline-block rounded-[3px] bg-[#ddf7f7] px-1.5 py-px text-[6.5px] text-[#164951]">{dureeCourte(s)}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Inclinaison>

      {/* La bande floutée sur laquelle le titre se pose. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[230px] h-64 bg-gradient-to-b from-[#f7f7f7]/0 via-[#f7f7f7]/90 to-[#f7f7f7] sm:top-[360px] xl:top-[388px] xl:bg-[rgba(247,247,247,0.01)] xl:bg-none xl:backdrop-blur-[8.5px]" />

      <div className="relative -mt-12 flex flex-col items-center text-center sm:-mt-36 xl:-mt-[247px]">
        <h1 className="q-degrade text-balance text-[30px] font-bold leading-[1.2] sm:text-[42px] xl:text-[52px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.25s_backwards]">
          {c.nom}
          <br />
          {c.metier}
        </h1>
        <p className="mt-1.5 max-w-[820px] text-pretty text-[14px] font-medium leading-[1.4] text-[#8aa4a8] xl:text-[16px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.35s_backwards]">
          {c.ouverture.intro || c.accroche}
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4 max-sm:flex-col-reverse max-sm:items-stretch motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.45s_backwards]">
          <Bouton href="#accompagnements" variante="contour">
            <Sparkles />
            Les accompagnements
          </Bouton>
          <Bouton href={c.rdv}>
            <CalendarDays />
            Prendre rendez-vous
          </Bouton>
        </div>
      </div>
    </section>
  )
}

/** Centrée, sans maquette : le grand titre en dégradé, puis un défilé de
    photos du cabinet qui s'efface sur les bords. */
export function OuvertureCentree({ c }: P) {
  const photos = c.photos.filter((p) => !/substitution/i.test(p.alt)).slice(0, 10)
  return (
    <section id="haut" className="overflow-x-clip pb-14 pt-20 xl:pb-24 xl:pt-32">
      <div className="mx-auto flex max-w-[900px] flex-col items-center px-6 text-center">
        <Etiquette ton="cyan" className="motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_backwards]">
          <MapPin />
          {c.ville}
        </Etiquette>
        <h1 className="q-degrade mt-5 text-balance text-[32px] font-bold leading-[1.15] sm:text-[44px] xl:text-[60px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.1s_backwards]">
          {c.ouverture.titre}
        </h1>
        <p className="mt-3 max-w-[640px] text-pretty text-[15px] font-medium leading-[1.5] text-[#8aa4a8] xl:text-[16px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.2s_backwards]">
          {c.ouverture.intro || c.accroche}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4 motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_0.3s_backwards]">
          <Bouton href="#contact" variante="contour">
            <MessageCircle />
            Me contacter
          </Bouton>
          <Bouton href={c.rdv}>
            <CalendarDays />
            Prendre rendez-vous
          </Bouton>
        </div>
      </div>
      <div className="mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_15%,#000_85%,transparent_100%)]">
        <div className="flex w-max motion-safe:animate-[q-defile_60s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((tour) => (
            <div key={tour} aria-hidden={tour === 1 || undefined} className="flex gap-5 pr-5">
              {photos.map((p, i) => (
                <Photo
                  key={`${tour}-${p.id}`}
                  media={p}
                  sizes="320px"
                  className={cn('h-[220px] shrink-0 rounded-[20px] shadow-[var(--q-shadow-quote)]', i % 3 === 0 ? 'w-[300px]' : 'w-[220px]')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Deux colonnes : le texte aligné à gauche, le portrait en carte
    inclinable. */
export function OuverturePortrait({ c }: P) {
  return (
    <Section id="haut" className="xl:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_backwards]">
          <p className="text-[14px] font-medium text-[#8aa4a8] xl:text-[18px]">{c.ouverture.surtitre}</p>
          <h1 className="q-degrade mt-2 text-balance text-[34px] font-bold leading-[1.15] xl:text-[52px] xl:leading-[1.2]">{c.ouverture.titre}</h1>
          <Accent className="mt-4 max-w-[52ch]" texte={c.ouverture.intro || c.accroche} />
          <div className="mt-6 flex flex-wrap gap-2">
            {[...new Set(c.services.map((s) => s.method).filter(Boolean))].slice(0, 3).map((m) => (
              <Etiquette key={m}>
                <Check />
                {m}
              </Etiquette>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Bouton href={c.rdv}>
              <CalendarDays />
              Prendre rendez-vous
            </Bouton>
            <Bouton href="#a-propos" variante="contour">
              Qui je suis
            </Bouton>
          </div>
        </div>
        <Inclinaison className="mx-auto w-full max-w-[400px] motion-safe:animate-[q-appear_1.1s_cubic-bezier(0,0.37,0.56,1)_0.15s_backwards]">
          <div className="rounded-[20px] bg-white p-2.5 shadow-[var(--q-shadow-card)]">
            <Photo media={c.portrait} sizes="400px" priorite className="aspect-[4/5] rounded-[14px]" />
            <div className="flex items-center justify-between gap-3 px-2.5 pb-1.5 pt-3.5">
              <span>
                <span className="block text-[16px] font-semibold text-[#164951]">{c.nom}</span>
                <span className="block text-[13px] font-medium text-[#8aa4a8]">{c.metier}</span>
              </span>
              <Etiquette ton="vert">Disponible</Etiquette>
            </div>
          </div>
        </Inclinaison>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   DÉFILÉ — la bande des « agences partenaires » : tuiles et noms qui
   défilent sur 759 px, fondus sur les bords.
   ══════════════════════════════════════════════════════════════════════ */

export function Defile({ c }: P) {
  const mots = [
    ...new Set([
      ...c.services.map((s) => s.title),
      ...c.services.map((s) => s.method).filter((m): m is string => Boolean(m)),
      c.ville,
      'En cabinet',
      'En visio',
    ]),
  ]
  return (
    <Section className="xl:py-14">
      <Titre surtitre="Ce que j’accompagne" titre="Des situations très diverses" serre />
      <div className="mx-auto max-w-[759px] overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_15%,#000_85%,transparent_100%)]">
        <div className="flex w-max motion-safe:animate-[q-defile_40s_linear_infinite]">
          {[0, 1].map((tour) => (
            <ul key={tour} aria-hidden={tour === 1 || undefined} className="flex items-center gap-[60px] pr-[60px]">
              {mots.map((m, i) => (
                <li key={`${tour}-${m}`} className="flex h-[100px] min-w-[72px] flex-col items-center justify-center gap-2.5">
                  <span className="grid h-[46px] w-[46px] place-items-center rounded-[12px]" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                    {i % 3 === 0 ? <HeartHandshake className="h-[22px] w-[22px]" /> : i % 3 === 1 ? <Sparkles className="h-[22px] w-[22px]" /> : <Check className="h-[22px] w-[22px]" />}
                  </span>
                  <span className="whitespace-nowrap text-[12px] font-medium text-[#8aa4a8]">{m}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   COMMENT ÇA SE PASSE — les quatre blocs « Comment ça fonctionne ? » de
   byqeeps.com : 828 × 310, texte d'un côté, visuel vivant de l'autre.
   ══════════════════════════════════════════════════════════════════════ */

function Bloc({
  titre,
  texte,
  visuel,
  inverse = false,
  turquoise = false,
}: {
  titre: string
  texte: string
  visuel: React.ReactNode
  inverse?: boolean
  turquoise?: boolean
}) {
  return (
    <Apparait>
      <div
        className={cn(
          'group/bloc relative grid overflow-hidden rounded-[24px] bg-[#f2f3f4] xl:h-[310px] xl:grid-cols-[331px_minmax(0,1fr)]',
          inverse && 'xl:grid-cols-[minmax(0,1fr)_331px]',
          turquoise && 'xl:bg-[linear-gradient(104deg,rgba(33,139,156,0.16)_0%,#f2f3f4_60%)]',
        )}
      >
        <div className={cn('relative z-[2] flex flex-col justify-center gap-1.5 px-6 pb-10 pt-2 max-xl:mx-auto max-xl:max-w-[340px] max-xl:text-center xl:px-12 xl:py-0', inverse && 'xl:order-2 xl:pl-0')}>
          <h3 className="text-[23px] font-semibold leading-[1.2] text-[#164951] xl:text-[24px]">{titre}</h3>
          <Accent texte={texte} className="max-xl:text-[14px]" />
        </div>
        <div className={cn('relative h-[260px] max-xl:order-first xl:h-full', inverse && 'xl:order-1')}>{visuel}</div>
      </div>
    </Apparait>
  )
}

/** Visuel 1 : la pile de messages (les « mails » de byqeeps.com) — les
    questions qu'on peut poser, qui se déploient au survol. */
function VisuelMessages({ c }: P) {
  const qs = c.faq.slice(0, 3)
  const carte = (q: (typeof qs)[number] | undefined, i: number, principale = false) =>
    q && (
      <div className="flex w-[280px] flex-col rounded-[10.36px] bg-white px-3 pb-2.5 pt-2 shadow-[var(--q-shadow-card)]">
        <div className="mb-3 flex h-[26px] items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] font-light uppercase tracking-wide text-[#adadad]">
            <span className="grid h-[18px] w-[18px] place-items-center rounded-[4px] bg-[#2f80ed] text-white">
              <Mail className="h-3 w-3" />
            </span>
            Message
          </span>
          <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[10.5px] font-semibold" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
            <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: pastel(i).fg }}>
              <span className="absolute -inset-[3px] rounded-full opacity-35 motion-safe:animate-[q-pulse_1.8s_ease-out_infinite]" style={{ background: pastel(i).fg }} />
            </span>
            {q.category || 'Question'}
          </span>
        </div>
        <p className="text-[14px] font-semibold leading-[1.2] text-[#164951]">Vous</p>
        <p className="mb-2.5 mt-1 line-clamp-2 text-[12px] font-medium leading-[1.25] text-[rgba(22,73,81,0.5)]">{q.question}</p>
        {principale && (
          <span className="flex h-7 items-center justify-center rounded-[5.9px] bg-[#164951] text-[10.3px] font-medium text-white shadow-[var(--q-shadow-btn)]">
            Écrire à {c.nom.split(' ')[0]}
          </span>
        )}
      </div>
    )
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute left-0 top-0 -translate-y-[60%] opacity-0 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.44,0,0.56,1)] group-hover/bloc:-translate-y-[108%] group-hover/bloc:opacity-100">
          {carte(qs[1], 1)}
        </div>
        <div className="relative z-[2]">{carte(qs[0], 0, true)}</div>
        <div className="absolute left-0 top-0 z-[3] translate-y-[60%] opacity-0 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.44,0,0.56,1)] group-hover/bloc:translate-y-[112%] group-hover/bloc:opacity-100">
          {carte(qs[2], 2)}
        </div>
      </div>
    </div>
  )
}

/** Visuel 2 : les tuiles (la grille « React · TS · SQL » de la
    candidature) — la durée de chaque accompagnement, et la tuile qui
    pivote vers la liste. */
function VisuelTuiles({ c }: P) {
  const tuiles = c.services.filter((s) => dureeCourte(s)).slice(0, 3)
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-2">
        <div aria-hidden="true" className="col-span-2 -mb-1 grid grid-cols-2 gap-2">
          <span className="h-9 rounded-[7.9px] bg-gradient-to-b from-transparent to-white" />
          <span className="h-9 rounded-[7.9px] bg-gradient-to-b from-transparent to-white" />
        </div>
        {tuiles.map((s) => (
          <div key={s.id} className="flex h-[93px] w-[153px] flex-col items-center justify-center gap-2 rounded-[7.9px] bg-white text-[#164951] shadow-[var(--q-shadow-card),inset_0_0_0_1.19px_#f2f2f2]">
            <span className="flex items-center gap-1.5 text-[22px] font-semibold leading-none">
              <Clock className="h-[11px] w-[11px]" />
              {dureeCourte(s)}
            </span>
            <span className="max-w-[130px] truncate text-[8px] font-light uppercase">{s.title}</span>
          </div>
        ))}
        <a
          href="#accompagnements"
          className="group/tuile flex h-[93px] w-[153px] flex-col items-center justify-center gap-2 rounded-[7.7px] bg-[#d7e0e1] text-[8px] font-semibold text-[#164951] shadow-[var(--q-shadow-card),inset_0_0_0_1.16px_rgba(138,164,168,0.2)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.08]"
        >
          <Settings2 className="h-8 w-8 transition-transform duration-500 group-hover/tuile:-rotate-[150deg]" strokeWidth={1.5} />
          + Voir tous les accompagnements
        </a>
      </div>
    </div>
  )
}

/** Visuel 3 : les fiches qui défilent en boucle, la fiche du centre au
    premier plan (la boucle des expériences de la candidature). */
function VisuelFiches({ c }: P) {
  const fiches = [...c.services, ...c.services]
  return (
    <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_22%,#000_78%,transparent_100%)]">
      <div className="mx-auto w-[min(380px,90%)] motion-safe:animate-[q-defile-v_26s_linear_infinite] group-hover/bloc:[animation-play-state:paused]">
        <ul className="flex flex-col gap-4 py-2">
          {fiches.map((s, i) => (
            <li key={`${s.id}-${i}`} aria-hidden={i >= c.services.length || undefined} className="flex items-center gap-3 rounded-[10px] bg-white px-5 py-2.5 shadow-[0_1px_2px_rgba(22,73,81,0.04),0_4px_12px_-6px_rgba(22,73,81,0.08)]">
              <span className="grid h-[49px] w-[49px] shrink-0 place-items-center rounded-[12.26px] text-[15px] font-bold shadow-[var(--q-shadow-btn)]" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                {s.title.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-[#164951]">{s.title}</span>
                <span className="block truncate text-[8px] font-light text-[#164951]">{sansEtoiles(s.excerpt)}</span>
                <span className="mt-2 flex gap-2.5 text-[8px] font-medium text-[#164951]">
                  {s.method && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2 w-2" />
                      {s.method}
                    </span>
                  )}
                  {dureeCourte(s) && (
                    <span className="flex items-center gap-1 text-[#6eb382]">
                      <Clock className="h-2 w-2" />
                      {dureeCourte(s)}
                    </span>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Visuel 4 : la carte « pass » — pétrole, reflet, le cabinet en
    quatre lignes. */
function VisuelCarte({ c }: P) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[min(400px,88%)] [perspective:1200px]">
        <div aria-hidden="true" className="absolute inset-0 -translate-x-4 -translate-y-3 -rotate-6 rounded-[20.9px] bg-[#e1e6e7] shadow-[var(--q-shadow-card)]" />
        <div className="relative flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-[20.9px] bg-[#164951] p-6 text-white shadow-[var(--q-shadow-card)] transition-[transform,filter] duration-[800ms] ease-[cubic-bezier(0.12,0.23,0.5,1)] group-hover/bloc:[transform:rotateX(10deg)_rotateY(-5deg)_scale(1.0125)] group-hover/bloc:brightness-110">
          <span aria-hidden="true" className="pointer-events-none absolute -inset-[40%] -translate-x-[70%] bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.22)_47%,rgba(255,255,255,0.05)_53%,transparent_60%)] transition-transform duration-[1100ms] group-hover/bloc:translate-x-[70%]" />
          <div className="relative flex items-center justify-between">
            <LogoMot nom="Anasawi" clair className="text-[24px]" />
            <span className="inline-flex h-[30px] items-center gap-2 rounded-[9.9px] bg-[#e1e6e7] px-2.5 text-[14px] font-medium text-[#164951]">
              <MapPin className="h-4 w-4" />
              Cabinet
            </span>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <span className="flex flex-col gap-1">
              <span className="text-[11.6px] font-medium text-[#8aa4a8]">Ville</span>
              <span className="text-[18px] font-semibold leading-[1.2]">{c.ville}</span>
            </span>
            {c.horaires[0] && (
              <span className="flex flex-col items-end gap-1 text-right">
                <span className="text-[11.6px] font-medium text-[#8aa4a8]">{c.horaires[0].day}</span>
                <span className="text-[18px] font-semibold leading-[1.2]">{c.horaires[0].hours}</span>
              </span>
            )}
            {c.telephone && (
              <span className="col-span-2 flex flex-col gap-1">
                <span className="text-[11.6px] font-medium text-[#8aa4a8]">Téléphone</span>
                <span className="text-[18px] font-semibold leading-[1.2]">{c.telephone}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Fonctionnement({ c }: P) {
  const etapes = c.methode.etapes
  const t = (i: number, defaut: string) => etapes[i]?.texte || defaut
  return (
    <Section id="methode" etroite>
      <Titre surtitre={c.methode.surtitre} titre={c.methode.titre || 'Comment ça se passe ?'} />
      <div className="flex flex-col gap-4 xl:gap-14">
        <Bloc
          titre={etapes[0]?.titre ?? 'Un premier échange'}
          texte={`${t(0, 'Un appel ou un message pour faire connaissance.')} *Sans engagement*, et sans rien à préparer.`}
          visuel={<VisuelMessages c={c} />}
        />
        <Bloc
          inverse
          titre={etapes[1]?.titre ?? 'Un cadre clair'}
          texte={`${t(1, 'La durée et le rythme sont posés dès le départ.')} Chaque accompagnement a *sa durée*, et *son tarif* affiché.`}
          visuel={<VisuelTuiles c={c} />}
        />
        <Bloc
          titre={etapes[2]?.titre ?? 'Un accompagnement pour chacun'}
          texte={`${c.services.length} accompagnements : *individuel*, *couple*, ou *professionnel*. On choisit ensemble ce qui vous convient.`}
          visuel={<VisuelFiches c={c} />}
        />
        <Bloc
          turquoise
          inverse
          titre={`Un cabinet à ${c.ville}`}
          texte={`Un lieu calme, ${c.horaires.length ? `ouvert *${c.horaires.length} jours sur 7*` : 'sur rendez-vous'}, et des séances *en visio* si vous êtes loin.`}
          visuel={<VisuelCarte c={c} />}
        />
      </div>
    </Section>
  )
}

/** La même étape en simples cartes blanches — variante sans visuel. */
export function FonctionnementCartes({ c }: P) {
  return (
    <Section id="methode">
      <Titre surtitre={c.methode.surtitre} titre={c.methode.titre} sous={c.methode.intro || undefined} />
      <ol className="grid gap-6 md:grid-cols-3">
        {c.methode.etapes.slice(0, 3).map((e, i) => (
          <li key={e.titre}>
            <Apparait delai={i * 0.1} className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-[24px] bg-[#f2f3f4] p-8 transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(22,73,81,0.1)]">
                <span className="q-degrade text-[44px] font-bold leading-none">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-[20px] font-semibold leading-[1.25] text-[#164951]">{e.titre}</h3>
                <p className="text-[15px] font-medium leading-[1.5] text-[#8aa4a8]">{e.texte}</p>
              </div>
            </Apparait>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CHIFFRES — 62 px, gras, en dégradé ; libellé gris 18 px.
   ══════════════════════════════════════════════════════════════════════ */

export function Chiffres({ c }: P) {
  const chiffres = [
    { valeur: String(c.services.length), libelle: 'accompagnements\nproposés' },
    { valeur: c.horaires.length ? `${c.horaires.length}/7` : '—', libelle: 'jours\nde consultation' },
    { valeur: String(c.faq.length), libelle: 'questions\ndéjà répondues' },
  ]
  return (
    <Section>
      <Titre surtitre="En quelques chiffres" titre="Un cadre simple et disponible" serre />
      <div className="flex flex-col items-center justify-center gap-0 sm:flex-row sm:flex-wrap sm:gap-[72px]">
        {chiffres.map((ch, i) => (
          <Apparait key={ch.libelle} delai={i * 0.1}>
            <div className="flex h-[190px] flex-col justify-center rounded-[20px] p-2.5 text-center">
              <span className="q-degrade pb-px text-[62px] font-bold leading-[1.2]">{ch.valeur}</span>
              <span className="mt-px whitespace-pre-line text-[18px] font-medium leading-[1.2] text-[#8aa4a8]">{ch.libelle}</span>
            </div>
          </Apparait>
        ))}
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   QUI JE SUIS — le bloc « profil » de la candidature : carte d'identité
   blanche à gauche, texte à droite, dans un bloc gris.
   ══════════════════════════════════════════════════════════════════════ */

function Faits({ c }: P) {
  const faits = [
    c.adresse && { icone: <MapPin />, texte: c.adresse },
    c.telephone && { icone: <Phone />, texte: c.telephone, href: `tel:${toE164(c.telephone)}` },
    c.email && { icone: <Mail />, texte: c.email, href: `mailto:${c.email}` },
    c.horaires[0] && { icone: <Clock />, texte: `${c.horaires[0].day} · ${c.horaires[0].hours}` },
  ].filter(Boolean) as { icone: React.ReactNode; texte: string; href?: string }[]
  return (
    <ul className="mb-1.5 mt-3.5 flex flex-col gap-[9px] text-[12.5px] font-medium text-[#164951] [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:shrink-0">
      {faits.map((f) => (
        <li key={f.texte} className="flex items-center gap-2 [overflow-wrap:anywhere]">
          {f.icone}
          {f.href ? (
            <a href={f.href} className="hover:underline">
              {f.texte}
            </a>
          ) : (
            f.texte
          )}
        </li>
      ))}
    </ul>
  )
}

export function Profil({ c }: P) {
  const [premier, ...reste] = c.apropos.texte.split(/\n+/)
  return (
    <Section id="a-propos" etroite>
      <Titre surtitre={c.apropos.surtitre} titre={c.nom} serre />
      <Apparait>
        <div className="grid items-start gap-6 rounded-[24px] bg-[#f2f3f4] p-6 md:grid-cols-[283px_minmax(0,1fr)] md:gap-12 md:px-12 md:py-10">
          <div className="flex flex-col items-start gap-1.5 rounded-[10.36px] bg-white p-6 shadow-[var(--q-shadow-card)]">
            <div className="mb-2.5 flex items-center gap-3">
              <Photo media={c.portrait} sizes="49px" className="h-[49px] w-[49px] shrink-0 rounded-[12px]" />
              <span>
                <span className="block text-[20px] font-semibold leading-[1.2] text-[#164951]">{c.nom}</span>
                <span className="block text-[13px] font-medium leading-[18px] text-[#8aa4a8]">{c.metier}</span>
              </span>
            </div>
            <Faits c={c} />
            <div className="mt-1.5 flex flex-wrap gap-2">
              <Etiquette ton="vert">Nouveaux patients</Etiquette>
              <Etiquette ton="cyan">En visio aussi</Etiquette>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-[16px] font-medium leading-[1.5] text-[#164951]">{premier}</p>
            {reste.length > 0 && <p className="whitespace-pre-line text-[15px] font-medium leading-[1.5] text-[#8aa4a8]">{reste.join('\n\n')}</p>}
            {c.apropos.citation && (
              <blockquote className="rounded-[10px] bg-white p-5 text-[14px] font-medium leading-[1.6] text-[#8aa4a8] shadow-[var(--q-shadow-quote)]">
                « {c.apropos.citation} »
              </blockquote>
            )}
            <div>
              <Bouton href={c.rdv}>
                Prendre rendez-vous
                <ArrowRight />
              </Bouton>
            </div>
          </div>
        </div>
      </Apparait>
    </Section>
  )
}

/** Variante : grand portrait à gauche, titre et texte à droite. */
export function ProfilPortrait({ c }: P) {
  return (
    <Section id="a-propos">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Apparait>
          <Photo media={c.portrait} sizes="(max-width: 1024px) 100vw, 560px" className="aspect-[4/5] rounded-[24px] shadow-[var(--q-shadow-card)]" />
        </Apparait>
        <Apparait delai={0.1}>
          <p className="text-[14px] font-medium text-[#8aa4a8] xl:text-[18px]">{c.apropos.surtitre}</p>
          <h2 className="mt-1 text-balance text-[24px] font-semibold leading-[1.2] text-[#164951] xl:text-[36px] xl:leading-[49px]">{c.apropos.titre}</h2>
          <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-[1.6] text-[#8aa4a8] xl:text-[16px]">{c.apropos.texte}</p>
          <ul className="mt-6 flex flex-col gap-[7px]">
            {[...new Set(c.services.map((s) => s.method).filter(Boolean))].slice(0, 4).map((m) => (
              <li key={m} className="flex gap-2 text-[14px] leading-5 text-[#6b8186]">
                <Check className="mt-0.5 h-[15px] w-[15px] shrink-0 text-[#6eb382]" />
                {m}
              </li>
            ))}
          </ul>
        </Apparait>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ACCOMPAGNEMENTS
   ══════════════════════════════════════════════════════════════════════ */

/** Les cartes de projets de la candidature : blocs gris, étiquettes,
    lien qui glisse — avec la photo de l'accompagnement. */
export function AccompagnementsCartes({ c }: P) {
  return (
    <Section id="accompagnements">
      <Titre surtitre="Accompagnements" titre="Ce que je vous propose" />
      <ul className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {c.services.map((s, i) => (
          <li key={s.id}>
            <Apparait delai={(i % 3) * 0.08} className="h-full">
              <a
                href={c.rdv}
                className="group flex h-full flex-col gap-3 rounded-[24px] bg-[#f2f3f4] p-8 transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(22,73,81,0.1)]"
              >
                <div className="flex items-center justify-between">
                  {s.group ? <Etiquette ton="cyan">{s.group.label}</Etiquette> : <span />}
                  {dureeCourte(s) && (
                    <Etiquette>
                      <Clock />
                      {dureeCourte(s)}
                    </Etiquette>
                  )}
                </div>
                {s.media && <Photo media={s.media} sizes="(max-width: 640px) 100vw, 360px" className="mt-2 aspect-[16/10] rounded-[10px]" />}
                <h3 className="mt-2 text-[24px] font-semibold leading-[1.2] text-[#164951]">{s.title}</h3>
                <p className="line-clamp-3 text-[15px] font-medium leading-[1.5] text-[#8aa4a8]">{sansEtoiles(s.excerpt)}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-semibold text-[#164951]">
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4 transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[5px]" />
                </span>
              </a>
            </Apparait>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** La « vitrine » de la candidature : un grand bloc par accompagnement,
    texte à gauche, capture inclinée à droite qui se redresse au survol. */
export function AccompagnementsVitrine({ c }: P) {
  return (
    <Section id="accompagnements">
      <Titre surtitre="Accompagnements" titre="Ce que je vous propose" />
      <div className="flex flex-col gap-8">
        {c.services.map((s, i) => (
          <Apparait key={s.id}>
            <article className="group grid items-center gap-8 overflow-hidden rounded-[24px] bg-[radial-gradient(70%_90%_at_85%_50%,rgba(255,255,255,0.6),transparent_70%),#f2f3f4] px-6 pt-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:py-11 md:pl-12 md:pr-0">
              <div className="flex flex-col items-start gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-[52px] w-[52px] place-items-center rounded-[12px] text-[18px] font-bold text-white" style={{ background: i % 2 ? '#176c79' : '#164951' }}>
                    {s.title.charAt(0)}
                  </span>
                  {s.group && <Etiquette ton="cyan">{s.group.label}</Etiquette>}
                  {s.method && <Etiquette>{s.method}</Etiquette>}
                </div>
                <h3 className="text-[32px] font-bold leading-[38px] tracking-[-0.01em] text-[#164951] md:text-[40px] md:leading-[46px]">{s.title}</h3>
                <p className="max-w-[46ch] text-[15px] font-medium leading-[1.5] text-[#8aa4a8]">{sansEtoiles(s.excerpt)}</p>
                {s.duration && (
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#8aa4a8]">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-2.5">
                  <Bouton href={c.rdv}>
                    Prendre rendez-vous
                    <ArrowRight />
                  </Bouton>
                </div>
              </div>
              <div className="relative md:h-full md:min-h-[300px]">
                <div className="overflow-hidden rounded-t-[10px] bg-white shadow-[0_30px_80px_rgba(22,73,81,0.16)] transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:absolute md:left-0 md:top-1/2 md:w-[520px] md:rounded-[10px] md:[transform:translateY(-50%)_perspective(1200px)_rotateY(-8deg)] md:group-hover:[transform:translateY(-50%)_perspective(1200px)_rotateY(-2deg)_translateX(-8px)]">
                  <div className="flex items-center gap-[5px] border-b border-[#eef1f2] px-3 py-[9px]">
                    <span className="h-2 w-2 rounded-full bg-[#e2e6e7]" />
                    <span className="h-2 w-2 rounded-full bg-[#e2e6e7]" />
                    <span className="h-2 w-2 rounded-full bg-[#e2e6e7]" />
                    <span className="ml-2.5 rounded-[4px] bg-[#f4f6f6] px-2.5 py-0.5 text-[10px] text-[#8aa4a8]">anasawi.fr/{s.slug}</span>
                  </div>
                  {s.media ? (
                    <Photo media={s.media} sizes="520px" className="aspect-[16/10]" />
                  ) : (
                    <div className="grid aspect-[16/10] place-items-center" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                      <HeartHandshake className="h-10 w-10" strokeWidth={1.4} />
                    </div>
                  )}
                </div>
              </div>
            </article>
          </Apparait>
        ))}
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTIONS
   ══════════════════════════════════════════════════════════════════════ */

export function Questions({ c }: P) {
  if (!c.faq.length) return null
  return (
    <Section id="questions" etroite>
      <Titre surtitre="Questions fréquentes" titre="Avant de venir" serre />
      <Apparait>
        <Accordeon faq={c.faq} />
      </Apparait>
    </Section>
  )
}

/** Les cartes de témoignages de byqeeps.com, qui défilent — ici, les
    réponses aux questions qu'on se pose avant de venir. */
export function QuestionsDefile({ c }: P) {
  if (!c.faq.length) return null
  return (
    <section id="questions" className="scroll-mt-24 overflow-x-clip pb-14 pt-24 xl:py-24">
      <Titre surtitre="Questions fréquentes" titre="Ce qu’on me demande souvent" serre />
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]">
        <div className="flex w-max py-5 motion-safe:animate-[q-defile_70s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((tour) => (
            <ul key={tour} aria-hidden={tour === 1 || undefined} className="flex items-start gap-[26px] pr-[26px] xl:gap-[60px] xl:pr-[60px]">
              {c.faq.map((f, i) => (
                <li key={`${tour}-${f.id}`} className="flex w-[256px] shrink-0 flex-col gap-[30px] rounded-[20px] bg-[linear-gradient(rgba(240,240,240,0)_0%,rgba(241,241,241,0.7)_100%)] p-[30px] shadow-[var(--q-shadow-quote)] xl:w-[320px]">
                  <div className="flex items-center gap-[15px]">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                      <MessageCircle className="h-[26px] w-[26px]" />
                    </span>
                    <span className="text-[18px] font-semibold leading-[1.25] text-[#164951]">{f.question}</span>
                  </div>
                  <p className="line-clamp-6 text-[14px] font-medium leading-[1.6] text-[#8aa4a8]">{sansEtoiles(f.answer)}</p>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   APPEL À L'ACTION — « Pas encore convaincu ? »
   ══════════════════════════════════════════════════════════════════════ */

export function Appel({ c }: P) {
  return (
    <section className="px-10 pb-24 pt-10 xl:py-[100px]">
      <Apparait className="flex flex-col items-center gap-2 text-center">
        <p className="text-[16px] font-medium leading-[1.2] text-[#8aa4a8] xl:text-[18px]">Pas encore décidé ?</p>
        <h2 className="text-balance text-[24px] font-semibold leading-[49px] text-[#164951] xl:text-[36px]">{c.citation.texte}</h2>
        <Bouton href={c.rdv} className="mt-10">
          <CalendarDays />
          Prendre rendez-vous
        </Bouton>
      </Apparait>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CONTACT
   ══════════════════════════════════════════════════════════════════════ */

export function Contact({ c }: P) {
  return (
    <Section id="contact" etroite>
      <Titre surtitre="Contact" titre="Écrivez-moi" sous="Je réponds personnellement, en général sous 48 heures." serre />
      <Apparait>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {c.telephone && (
            <a href={`tel:${toE164(c.telephone)}`}>
              <Etiquette>
                <Phone />
                {c.telephone}
              </Etiquette>
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`}>
              <Etiquette>
                <Mail />
                {c.email}
              </Etiquette>
            </a>
          )}
          <Etiquette ton="cyan">
            <MapPin />
            {c.ville}
          </Etiquette>
        </div>
        <FormulaireContact className="mx-auto max-w-[640px]" />
      </Apparait>
    </Section>
  )
}

/** Variante : coordonnées dans le bloc gris, formulaire à côté. */
export function ContactBloc({ c }: P) {
  return (
    <Section id="contact">
      <Titre surtitre="Contact" titre="Prenons le temps d’en parler" serre />
      <Apparait>
        <div className="grid gap-6 rounded-[24px] bg-[#f2f3f4] p-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:p-12">
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-[24px] font-semibold leading-[1.2] text-[#164951]">{c.nom}</h3>
              <p className="mt-1 text-[15px] font-medium text-[#8aa4a8]">{c.metier}</p>
            </div>
            <Faits c={c} />
            {c.horaires.length > 0 && (
              <div className="rounded-[10px] bg-white p-5 shadow-[var(--q-shadow-quote)]">
                <p className="mb-3 text-[15px] font-semibold text-[#164951]">Horaires</p>
                <dl className="grid gap-1.5 text-[13px]">
                  {c.horaires.map((h) => (
                    <div key={h.day} className="flex justify-between gap-4">
                      <dt className="font-medium text-[#164951]">{h.day}</dt>
                      <dd className="font-medium text-[#8aa4a8]">{h.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {c.infoPratique && <Accent texte={c.infoPratique} className="text-[14px]" />}
          </div>
          <FormulaireContact />
        </div>
      </Apparait>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PIED DE PAGE — pétrole, logo-mot en grand, deux colonnes de liens.
   ══════════════════════════════════════════════════════════════════════ */

export function PiedDePage({ c, liens }: P & { liens: { href: string; label: string }[] }) {
  return (
    <footer className="bg-[#164951] p-16 text-white">
      <div className="mx-auto grid max-w-[1000px] gap-12 xl:grid-cols-[1fr_223px]">
        <div className="flex flex-col gap-2.5 xl:pt-1.5">
          <LogoMot nom="Anasawi" clair className="text-[44px] leading-[48px]" />
          <p className="max-w-[376px] text-[16px] font-medium leading-6 tracking-[-0.5px] text-white/60">{c.accroche}</p>
        </div>
        <div className="flex flex-col gap-8 xl:pt-9">
          <div className="flex flex-col items-start gap-2.5">
            <p className="-mb-0.5 text-[24px] font-semibold leading-[1.2]">Le site</p>
            {liens.map((l) => (
              <a key={l.href} href={l.href} className="text-[16px] font-medium leading-[1.2] text-white/60 transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <p className="-mb-0.5 text-[24px] font-semibold leading-[1.2]">Contact</p>
            {c.telephone && (
              <a href={`tel:${toE164(c.telephone)}`} className="text-[16px] font-medium text-white/60 hover:text-white">
                {c.telephone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="text-[16px] font-medium text-white/60 hover:text-white">
                {c.email}
              </a>
            )}
          </div>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-[1000px] text-center text-[14px] font-medium leading-[21px] tracking-[-0.5px] text-white/60">
        © {new Date().getFullYear()} {c.nom} ·{' '}
        <Link href="/qeeps/modeles" className="underline-offset-2 hover:underline">
          Démonstration — toutes les variantes
        </Link>
      </p>
    </footer>
  )
}
