import {
  ArrowRight,
  CalendarDays,
  Clock,
  Compass,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  UserRound,
} from 'lucide-react'

import type { Contenu } from './donnees'
import {
  AccompagnementsDossiers,
  Apparait,
  FormulaireContact,
  GalerieDossiers,
  QuestionsAccordeon,
  QuestionsVolets,
} from './interactifs'
import { Bloc, Bouton, Carte, EnTete, Halo, Photo, Puce, Section, Tuile, pastel } from './ui'
import { cn, toE164 } from '@/lib/utils'

/**
 * Les sections du site, en direction artistique Qeeps — plusieurs
 * variantes par catégorie de modèle. Toutes lisent le même contenu réel
 * (`Contenu`) : on compare des mises en forme, pas des textes.
 */

type P = { c: Contenu }

/** La photo d'un accompagnement — ou, s'il n'en a pas, son pastel et
    son icône plutôt qu'un cadre gris vide. */
function Vignette({ s, rang, sizes, className }: { s: Contenu['services'][number]; rang: number; sizes: string; className?: string }) {
  if (s.media) return <Photo media={s.media} sizes={sizes} className={className} />
  const p = pastel(rang)
  return (
    <div aria-hidden="true" className={cn('grid place-items-center', className)} style={{ background: p.bg, color: p.fg }}>
      <HeartHandshake className="h-7 w-7" strokeWidth={1.5} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   OUVERTURE
   ══════════════════════════════════════════════════════════════════════ */

/** Le bandeau du tableau de bord : halo qui dérive, bonjour, puces, et
    le portrait dans une carte avec ses étiquettes flottantes. */
export function OuvertureHalo({ c }: P) {
  return (
    <Section id="haut" className="pt-6 sm:pt-8">
      <div className="relative isolate grid items-center gap-8 overflow-hidden rounded-[32px] bg-[#f6f8f8] p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-12">
        <Halo />
        <div className="min-w-0 motion-safe:animate-[adm-in_0.7s_cubic-bezier(0.02,0.45,0.56,1)_backwards]">
          <p className="text-[14px] font-medium text-[#8aa4a8]">{c.ouverture.surtitre}</p>
          <h1 className="mt-2 text-balance text-[38px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#164951] sm:text-[54px]">
            {c.ouverture.titre}
          </h1>
          {c.ouverture.intro && (
            <p className="mt-4 max-w-[52ch] text-pretty text-[17px] leading-[1.6] text-[#46606c]">{c.ouverture.intro}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Puce point="#6eb382">Nouveaux patients acceptés</Puce>
            <Puce>{c.metier}</Puce>
            <Puce>
              <MapPin className="h-3.5 w-3.5 text-[#8aa4a8]" />
              {c.ville}
            </Puce>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Bouton href={c.rdv}>
              <CalendarDays />
              Prendre rendez-vous
            </Bouton>
            <Bouton href="#accompagnements" variante="blanc">
              Découvrir les accompagnements
            </Bouton>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[420px] motion-safe:animate-[adm-pop_0.6s_cubic-bezier(0.22,1,0.36,1)_0.15s_backwards]">
          <div className="rounded-[28px] bg-white p-2 shadow-[0_20px_60px_rgba(22,73,81,0.12)]">
            <Photo media={c.portrait} sizes="420px" priorite className="aspect-[4/5] rounded-[22px]" />
            <div className="flex items-center gap-3 px-3 py-3">
              <Tuile rang={0} taille="sm">
                <UserRound />
              </Tuile>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#164951]">{c.nom}</p>
                <p className="truncate text-[12px] text-[#8aa4a8]">{c.metier}</p>
              </div>
            </div>
          </div>
          <div className="absolute -left-4 top-10 hidden items-center gap-2.5 rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(22,73,81,0.12)] motion-safe:animate-[auth-float_6s_ease-in-out_infinite] sm:flex">
            <Tuile rang={1} taille="sm">
              <HeartHandshake />
            </Tuile>
            <div>
              <p className="text-[13px] font-semibold text-[#164951]">{c.services.length} accompagnements</p>
              <p className="text-[11.5px] text-[#8aa4a8]">Individuel, couple, pro</p>
            </div>
          </div>
          {c.horaires[0] && (
            <div className="absolute -right-3 bottom-24 hidden items-center gap-2.5 rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(22,73,81,0.12)] motion-safe:animate-[auth-float_7s_ease-in-out_1s_infinite] sm:flex">
              <Tuile rang={5} taille="sm">
                <Clock />
              </Tuile>
              <div>
                <p className="text-[13px] font-semibold text-[#164951]">{c.horaires[0].day}</p>
                <p className="text-[11.5px] text-[#8aa4a8]">{c.horaires[0].hours}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

/** Deux colonnes sobres : le texte dans une carte blanche, la photo dans
    le bloc gris. */
export function OuvertureDeuxColonnes({ c }: P) {
  return (
    <Section id="haut" className="pt-6 sm:pt-8">
      <Bloc className="grid grid-cols-[minmax(0,1fr)] gap-2 lg:grid-cols-2">
        <Carte className="flex flex-col justify-center p-8 sm:p-12">
          <p className="text-[14px] font-medium text-[#8aa4a8]">{c.ouverture.surtitre}</p>
          <h1 className="mt-2 text-balance text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#164951] sm:text-[48px]">
            {c.ouverture.titre}
          </h1>
          <p className="mt-4 text-pretty text-[16px] leading-[1.65] text-[#46606c]">{c.ouverture.intro || c.accroche}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Bouton href={c.rdv}>Prendre rendez-vous</Bouton>
            <Bouton href="#contact" variante="blanc" className="shadow-[0_0_0_1px_#e1e6e7]">
              Poser une question
            </Bouton>
          </div>
        </Carte>
        <div className="relative">
          <Photo media={c.ambiance ?? c.portrait} sizes="(max-width: 1024px) 100vw, 580px" priorite className="h-full min-h-[340px] rounded-[22px]" />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <Puce point="#6eb382">{c.ville}</Puce>
            <Puce>En cabinet</Puce>
          </div>
        </div>
      </Bloc>
    </Section>
  )
}

/** Centrée, minimale : un titre, une phrase, une rangée de puces. */
export function OuvertureCentree({ c }: P) {
  return (
    <Section id="haut" className="relative isolate overflow-hidden py-20 text-center sm:py-28">
      <Halo className="opacity-70" />
      <div className="mx-auto max-w-[780px] motion-safe:animate-[adm-in_0.7s_cubic-bezier(0.02,0.45,0.56,1)_backwards]">
        <Puce ton="cyan" className="mx-auto">
          <Sparkles className="h-3.5 w-3.5" />
          {c.metier} · {c.ville}
        </Puce>
        <h1 className="mt-5 text-balance text-[40px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#164951] sm:text-[64px]">
          {c.ouverture.titre}
        </h1>
        <p className="mx-auto mt-5 max-w-[56ch] text-pretty text-[17px] leading-[1.6] text-[#46606c]">{c.ouverture.intro || c.accroche}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Bouton href={c.rdv}>Prendre rendez-vous</Bouton>
          <Bouton href="#accompagnements" variante="blanc">
            Les accompagnements
            <ArrowRight />
          </Bouton>
        </div>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   QUI JE SUIS
   ══════════════════════════════════════════════════════════════════════ */

export function AproposCarte({ c }: P) {
  return (
    <Section id="a-propos">
      <Apparait>
        <EnTete surtitre={c.apropos.surtitre} titre={c.apropos.titre} />
        <Bloc className="grid grid-cols-[minmax(0,1fr)] gap-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Photo media={c.portrait} sizes="(max-width: 1024px) 100vw, 460px" className="aspect-[4/5] rounded-[22px] lg:aspect-auto" />
          <Carte className="flex flex-col p-7 sm:p-10">
            <p className="whitespace-pre-line text-pretty text-[16px] leading-[1.75] text-[#46606c]">{c.apropos.texte}</p>
            {c.apropos.citation && (
              <blockquote className="mt-6 rounded-[18px] bg-[#f2f3f4] p-5 text-[15px] italic leading-[1.6] text-[#164951]">
                « {c.apropos.citation} »
              </blockquote>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-7">
              {[...new Set(c.services.map((s) => s.method).filter(Boolean))].slice(0, 4).map((m, i) => (
                <span key={m} className="rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                  {m}
                </span>
              ))}
            </div>
          </Carte>
        </Bloc>
      </Apparait>
    </Section>
  )
}

/** Un profil en cartes : portrait rond, puces, chiffres, texte. */
export function AproposProfil({ c }: P) {
  const chiffres = [
    { valeur: String(c.services.length), libelle: 'accompagnements' },
    { valeur: String(c.faq.length), libelle: 'réponses aux questions fréquentes' },
    { valeur: c.ville, libelle: 'cabinet' },
  ]
  return (
    <Section id="a-propos">
      <Apparait>
        <Bloc className="grid grid-cols-[minmax(0,1fr)] gap-2 md:grid-cols-[300px_minmax(0,1fr)]">
          <Carte className="flex flex-col items-center text-center">
            <Photo media={c.portrait} sizes="160px" className="h-36 w-36 rounded-full ring-[6px] ring-[#ddf7f7]" />
            <p className="mt-4 text-[18px] font-semibold text-[#164951]">{c.nom}</p>
            <p className="text-[13px] text-[#8aa4a8]">{c.metier}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <Puce ton="gris" point="#6eb382">
                Disponible
              </Puce>
              <Puce ton="gris">{c.ville}</Puce>
            </div>
          </Carte>
          <div className="grid gap-2">
            <Carte>
              <p className="text-[14px] font-medium text-[#8aa4a8]">{c.apropos.surtitre}</p>
              <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-0.02em] text-[#164951]">{c.apropos.titre}</h2>
              <p className="mt-3 line-clamp-6 whitespace-pre-line text-[15px] leading-[1.75] text-[#46606c]">{c.apropos.texte}</p>
            </Carte>
            <div className="grid gap-2 sm:grid-cols-3">
              {chiffres.map((ch, i) => (
                <Carte key={ch.libelle} className="p-5 sm:p-5">
                  <p className="text-[24px] font-semibold tracking-[-0.02em]" style={{ color: pastel(i).fg }}>
                    {ch.valeur}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6b8186]">{ch.libelle}</p>
                </Carte>
              ))}
            </div>
          </div>
        </Bloc>
      </Apparait>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MA MÉTHODE
   ══════════════════════════════════════════════════════════════════════ */

export function MethodeCartes({ c }: P) {
  return (
    <Section id="methode">
      <Apparait>
        <EnTete surtitre={c.methode.surtitre} titre={c.methode.titre} intro={c.methode.intro} />
      </Apparait>
      <Bloc>
        <ol className={cn('grid gap-2', c.methode.etapes.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3')}>
          {c.methode.etapes.map((e, i) => (
            <li key={e.titre}>
              <Apparait delai={i * 0.08} className="h-full">
                <Carte className="group flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <Tuile rang={i + 2}>
                      <Compass />
                    </Tuile>
                    <span className="text-[13px] font-semibold tabular-nums text-[#c5d2d4]">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold text-[#164951]">{e.titre}</h3>
                  {e.texte && <p className="mt-2 text-[14px] leading-[1.65] text-[#6b8186]">{e.texte}</p>}
                </Carte>
              </Apparait>
            </li>
          ))}
        </ol>
      </Bloc>
    </Section>
  )
}

/** Un fil vertical : pastilles numérotées reliées, textes à droite. */
export function MethodeFil({ c }: P) {
  return (
    <Section id="methode">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Apparait className="lg:sticky lg:top-28 lg:self-start">
          <EnTete surtitre={c.methode.surtitre} titre={c.methode.titre} intro={c.methode.intro} />
          <Bouton href={c.rdv} variante="blanc">
            Commencer par un échange
            <ArrowRight />
          </Bouton>
        </Apparait>
        <ol className="relative rounded-[28px] bg-[#f2f3f4] p-2">
          {c.methode.etapes.map((e, i) => (
            <li key={e.titre} className="relative">
              <Apparait delai={i * 0.06}>
                <div className="flex gap-4 rounded-[20px] p-4 transition-colors duration-300 hover:bg-white sm:p-5">
                  <div className="flex flex-col items-center">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold"
                      style={{ background: pastel(i + 2).bg, color: pastel(i + 2).fg }}
                    >
                      {i + 1}
                    </span>
                    {i < c.methode.etapes.length - 1 && <span aria-hidden="true" className="mt-2 w-px flex-1 bg-[#d8e1e3]" />}
                  </div>
                  <div className="pb-2 pt-1.5">
                    <h3 className="text-[17px] font-semibold text-[#164951]">{e.titre}</h3>
                    {e.texte && <p className="mt-1.5 text-[14.5px] leading-[1.7] text-[#6b8186]">{e.texte}</p>}
                  </div>
                </div>
              </Apparait>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ACCOMPAGNEMENTS
   ══════════════════════════════════════════════════════════════════════ */

export function AccompagnementsDossiersSection({ c }: P) {
  return (
    <Section id="accompagnements">
      <Apparait>
        <EnTete
          surtitre="Accompagnements"
          titre="Ce que je vous propose"
          intro="Choisissez une famille à gauche, ouvrez une fiche pour tout savoir."
        />
        <AccompagnementsDossiers services={c.services} rdv={c.rdv} />
      </Apparait>
    </Section>
  )
}

export function AccompagnementsGrille({ c }: P) {
  return (
    <Section id="accompagnements">
      <Apparait>
        <EnTete
          surtitre="Accompagnements"
          titre="Ce que je vous propose"
          action={
            <Bouton href={c.rdv} variante="blanc">
              Prendre rendez-vous
              <ArrowRight />
            </Bouton>
          }
        />
      </Apparait>
      <Bloc>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {c.services.map((s, i) => (
            <li key={s.id}>
              <Apparait delai={(i % 3) * 0.06} className="h-full">
                <Carte className="group flex h-full flex-col p-2 sm:p-2">
                  <Vignette s={s} rang={i} sizes="(max-width: 640px) 100vw, 380px" className="aspect-[16/10] rounded-[16px]" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {s.group && (
                        <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                          {s.group.label}
                        </span>
                      )}
                      {s.duration && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f3f4] px-2.5 py-0.5 text-[11.5px] font-medium text-[#46606c]">
                          <Clock className="h-3 w-3" />
                          {s.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[17px] font-semibold text-[#164951]">{s.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-[14px] leading-[1.6] text-[#6b8186]">{s.excerpt.replace(/\*/g, '')}</p>
                  </div>
                </Carte>
              </Apparait>
            </li>
          ))}
        </ul>
      </Bloc>
    </Section>
  )
}

/** Des lignes, comme une liste de l'administration : vignette, titre,
    extrait, puces, flèche. */
export function AccompagnementsLignes({ c }: P) {
  return (
    <Section id="accompagnements">
      <Apparait>
        <EnTete surtitre="Accompagnements" titre="Ce que je vous propose" />
        <ul className="flex flex-col gap-1.5 rounded-[28px] bg-[#f2f3f4] p-2">
          {c.services.map((s, i) => (
            <li key={s.id}>
              <a
                href={c.rdv}
                className="group flex items-center gap-4 rounded-[20px] bg-white p-3 pr-5 transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(22,73,81,0.10)]"
              >
                <Vignette s={s} rang={i} sizes="96px" className="h-[72px] w-24 shrink-0 rounded-[14px] max-sm:hidden [&_svg]:h-5 [&_svg]:w-5" />
                <Tuile rang={i} className="sm:hidden">
                  <HeartHandshake />
                </Tuile>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-semibold text-[#164951]">{s.title}</span>
                    {s.method && <span className="rounded-full bg-[#f2f3f4] px-2.5 py-0.5 text-[11.5px] font-medium text-[#46606c]">{s.method}</span>}
                  </p>
                  <p className="mt-0.5 truncate text-[14px] text-[#6b8186]">{s.excerpt.replace(/\*/g, '')}</p>
                </div>
                {s.duration && <Puce ton="gris" className="max-md:hidden">{s.duration}</Puce>}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2f3f4] text-[#164951] transition-[background-color,color,transform] duration-300 group-hover:translate-x-0.5 group-hover:bg-[#164951] group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Apparait>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PHOTOS
   ══════════════════════════════════════════════════════════════════════ */

export function GalerieDossiersSection({ c }: P) {
  return (
    <Section id="cabinet">
      <Apparait>
        <EnTete surtitre="Le cabinet" titre="Un lieu calme, en images" intro="Rangées par dossiers, comme dans la photothèque." />
        <GalerieDossiers photos={c.photos.filter((p) => !/substitution/i.test(p.alt))} dossiers={c.dossiers} />
      </Apparait>
    </Section>
  )
}

export function GalerieMosaique({ c }: P) {
  const photos = c.photos.filter((p) => !/substitution/i.test(p.alt)).slice(0, 7)
  const formes = [
    'col-span-2 row-span-2',
    '',
    '',
    'row-span-2',
    '',
    'col-span-2',
    '',
  ]
  return (
    <Section id="cabinet">
      <Apparait>
        <EnTete surtitre="Le cabinet" titre="Un lieu calme, en images" />
      </Apparait>
      <Bloc>
        <div className="grid auto-rows-[150px] grid-cols-2 gap-2 sm:auto-rows-[190px] md:grid-cols-4">
          {photos.map((p, i) => (
            <Apparait key={p.id} delai={i * 0.04} className={cn('group relative', formes[i])}>
              <Photo media={p} sizes="(max-width: 768px) 50vw, 300px" className="h-full rounded-[20px] [&_img]:transition-transform [&_img]:duration-[900ms] [&_img]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&_img]:scale-[1.04]" />
              {p.caption && (
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-[#164951] opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                  {p.caption}
                </span>
              )}
            </Apparait>
          ))}
        </div>
      </Bloc>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTIONS
   ══════════════════════════════════════════════════════════════════════ */

export function QuestionsVoletsSection({ c }: P) {
  if (!c.faq.length) return null
  return (
    <Section id="questions">
      <Apparait>
        <EnTete surtitre="Questions fréquentes" titre="Avant de venir" intro={`${c.faq.length} réponses aux questions qu’on me pose le plus souvent.`} />
        <QuestionsVolets faq={c.faq} />
      </Apparait>
    </Section>
  )
}

export function QuestionsAccordeonSection({ c }: P) {
  if (!c.faq.length) return null
  return (
    <Section id="questions">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <Apparait>
          <EnTete surtitre="Questions fréquentes" titre="Avant de venir" />
          <Carte className="bg-[#ddf7f7]">
            <p className="text-[15px] font-semibold text-[#164951]">Une autre question ?</p>
            <p className="mt-1 text-[14px] leading-[1.6] text-[#46606c]">Écrivez-moi, je réponds personnellement.</p>
            <Bouton href="#contact" variante="lien" className="mt-3">
              Me contacter
              <ArrowRight />
            </Bouton>
          </Carte>
        </Apparait>
        <Apparait delai={0.08}>
          <QuestionsAccordeon faq={c.faq} />
        </Apparait>
      </div>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   TEXTES
   ══════════════════════════════════════════════════════════════════════ */

export function TexteCitation({ c }: P) {
  return (
    <Section>
      <Apparait>
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[#ddf7f7] px-6 py-14 text-center sm:px-16 sm:py-20">
          <Halo className="opacity-60" />
          <Quote aria-hidden="true" className="mx-auto h-8 w-8 text-[#176c79]/50" />
          <p className="mx-auto mt-5 max-w-[30ch] text-balance text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#164951] sm:text-[36px]">
            {c.citation.texte}
          </p>
          <p className="mt-5 text-[14px] font-medium text-[#6b8186]">— {c.citation.auteur}</p>
        </div>
      </Apparait>
    </Section>
  )
}

/** Les repères en chiffres, en puces de tableau de bord. */
export function TexteChiffres({ c }: P) {
  const familles = new Set(c.services.map((s) => s.group?.id).filter(Boolean)).size
  const reperes = [
    { valeur: String(c.services.length), libelle: 'accompagnements', icone: <HeartHandshake /> },
    { valeur: String(familles || 1), libelle: 'familles de pratique', icone: <Compass /> },
    { valeur: String(c.faq.length), libelle: 'questions répondues', icone: <Sparkles /> },
    { valeur: c.horaires.length ? String(c.horaires.length) : '—', libelle: 'jours de consultation', icone: <CalendarDays /> },
  ]
  return (
    <Section>
      <Apparait>
        <Bloc>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {reperes.map((r, i) => (
              <Carte key={r.libelle} className="group flex items-center gap-4 p-5 sm:p-6">
                <Tuile rang={i * 2} taille="lg">
                  {r.icone}
                </Tuile>
                <div>
                  <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#164951]">{r.valeur}</p>
                  <p className="mt-1 text-[13px] text-[#6b8186]">{r.libelle}</p>
                </div>
              </Carte>
            ))}
          </div>
        </Bloc>
      </Apparait>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CONTACT
   ══════════════════════════════════════════════════════════════════════ */

function Coordonnees({ c }: P) {
  const lignes = [
    c.adresse && { icone: <MapPin />, titre: 'Adresse', texte: c.adresse, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.adresse)}` },
    c.telephone && { icone: <Phone />, titre: 'Téléphone', texte: c.telephone, href: `tel:${toE164(c.telephone)}` },
    c.email && { icone: <Mail />, titre: 'E-mail', texte: c.email, href: `mailto:${c.email}` },
  ].filter(Boolean) as { icone: React.ReactNode; titre: string; texte: string; href: string }[]

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
      <Carte className="p-3 sm:p-3">
        <ul className="flex flex-col">
          {lignes.map((l, i) => (
            <li key={l.titre}>
              <a href={l.href} className="group flex items-center gap-3.5 rounded-[16px] p-3 transition-colors hover:bg-[#f7f8f8]">
                <Tuile rang={i}>{l.icone}</Tuile>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] text-[#8aa4a8]">{l.titre}</span>
                  <span className="block truncate text-[15px] font-medium text-[#164951]">{l.texte}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#8aa4a8] transition-transform group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </Carte>
      {c.horaires.length > 0 && (
        <Carte>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-[#164951]">
            <Clock className="h-4 w-4 text-[#8aa4a8]" />
            Horaires
          </p>
          <dl className="mt-3 grid gap-1.5">
            {c.horaires.map((h) => (
              <div key={h.day} className="flex justify-between gap-4 rounded-[10px] bg-[#f7f8f8] px-3 py-2 text-[14px]">
                <dt className="font-medium text-[#164951]">{h.day}</dt>
                <dd className="text-[#6b8186]">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </Carte>
      )}
      {c.infoPratique && (
        <Carte className="bg-[#ddf7f7] p-5 sm:p-5">
          <p className="whitespace-pre-line text-[14px] leading-[1.6] text-[#164951]">{c.infoPratique.replace(/\*/g, '')}</p>
        </Carte>
      )}
    </div>
  )
}

export function ContactCartes({ c }: P) {
  return (
    <Section id="contact">
      <Apparait>
        <EnTete surtitre="Contact" titre="Prendre contact" intro="Un premier échange, sans engagement — par téléphone, par e-mail ou ici." />
        <Bloc className="grid grid-cols-[minmax(0,1fr)] gap-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Coordonnees c={c} />
          <FormulaireContact />
        </Bloc>
      </Apparait>
    </Section>
  )
}

/** Le bandeau d'action du tableau de bord, en bas de page. */
export function ContactBandeau({ c }: P) {
  return (
    <Section id="contact">
      <Apparait>
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[#164951] p-8 sm:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#176c79] blur-3xl motion-safe:animate-[adm-drift_14s_ease-in-out_infinite_alternate]" />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#2a7f6f]/60 blur-3xl" />
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[560px]">
              <p className="text-[14px] font-medium text-[#8fc7cc]">Contact</p>
              <h2 className="mt-2 text-balance text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-[40px]">
                Et si on commençait par en parler ?
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {c.telephone && (
                  <a href={`tel:${toE164(c.telephone)}`} className="inline-flex h-[30px] items-center gap-2 rounded-full bg-white/10 px-3 text-[13px] font-medium text-white hover:bg-white/15">
                    <Phone className="h-3.5 w-3.5" />
                    {c.telephone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="inline-flex h-[30px] items-center gap-2 rounded-full bg-white/10 px-3 text-[13px] font-medium text-white hover:bg-white/15">
                    <Mail className="h-3.5 w-3.5" />
                    {c.email}
                  </a>
                )}
                {c.adresse && (
                  <span className="inline-flex h-[30px] items-center gap-2 rounded-full bg-white/10 px-3 text-[13px] font-medium text-white">
                    <MapPin className="h-3.5 w-3.5" />
                    {c.ville}
                  </span>
                )}
              </div>
            </div>
            <Bouton href={c.rdv} variante="blanc" className="h-12 px-6">
              <CalendarDays />
              Prendre rendez-vous
            </Bouton>
          </div>
        </div>
      </Apparait>
    </Section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PIED DE PAGE
   ══════════════════════════════════════════════════════════════════════ */

export function PiedDePage({ c, liens }: P & { liens: { href: string; label: string }[] }) {
  return (
    <footer className="mx-auto max-w-[1180px] px-5 pb-10 pt-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[#f2f3f4] px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#176c79] to-[#164951] text-[13px] font-semibold text-white">
            {c.nom.charAt(0)}
          </span>
          <span className="text-[14px] font-semibold text-[#164951]">{c.nom}</span>
          <span className="text-[13px] text-[#8aa4a8]">· {c.metier}</span>
        </div>
        <nav aria-label="Pied de page">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {liens.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[13px] font-medium text-[#6b8186] hover:text-[#164951]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
