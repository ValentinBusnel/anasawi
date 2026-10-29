import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'

import { Arches, Chemin, Conversation, Encre, Lettre, Lignes, Promenade, Revele, Semaine, Seuil, Souffle } from './vivant'
import type { Contenu } from '@/components/qeeps/donnees'
import { LogoMark } from '@/components/site/Logo'
import { cn, toE164 } from '@/lib/utils'

/**
 * Les sections de la nouvelle DA d'Anasawi. Chacune a une idée, une
 * seule, et un mouvement qui la sert :
 *
 *   Seuil          on passe la porte : l'arche s'ouvre sur le cabinet
 *   Respiration    un cercle qui respire — inspirez, expirez
 *   Rencontre      le portrait dans l'arche, son sceau qui tourne, un
 *                  texte qui s'encre à la lecture
 *   Chemin         les étapes reliées par un trait d'or qui se dessine
 *   Arches         les accompagnements, une arche chacun, qui s'ouvre
 *   Phrase         une conviction, en très grand
 *   Promenade      le cabinet pièce par pièce, en glissant de côté
 *   Conversation   les questions, comme une messagerie
 *   Rendez-vous    la semaine allumée, et une lettre plutôt qu'un
 *                  formulaire
 *   Horizon        le pied de page, arrondi comme l'arche
 */

type P = { c: Contenu }

const prenomDe = (nom: string) => nom.split(' ')[0] ?? nom
const nomDe = (nom: string) => nom.split(' ').slice(1).join(' ') || nom

/** Surtitre : un trait d'or et des petites capitales. */
function Surtitre({ children, clair = false }: { children: React.ReactNode; clair?: boolean }) {
  return (
    <p
      className={cn(
        'mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold',
        clair ? 'bg-white/10 text-white/80' : 'bg-white text-[var(--ad-pierre)] shadow-[0_1px_2px_rgba(20,35,46,0.06),0_4px_14px_-6px_rgba(20,35,46,0.12)]',
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--ad-or)]" />
      {children}
    </p>
  )
}

/* ── Seuil ──────────────────────────────────────────────────────────── */

export function SectionSeuil({ c }: P) {
  return (
    <Seuil
      prenom={prenomDe(c.nom)}
      nom={nomDe(c.nom)}
      metier={c.metier}
      ville={c.ville}
      accroche={c.accroche}
      photo={c.ambiance ?? c.portrait}
      rdv={c.rdv}
      horaires={c.horaires}
      services={c.services.map((s) => ({ titre: s.title }))}
      intro={c.ouverture.intro || c.accroche}
    />
  )
}

/* ── Respiration ────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- même signature que les autres sections (vitrine)
export function Respiration(_props: P) {
  return (
    <section className="relative overflow-hidden bg-[var(--ad-sable)] py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-[5vw] md:grid-cols-2">
        <div>
          <Surtitre>Avant de commencer</Surtitre>
          <h2 className="text-[38px] md:text-[56px]">
            <Lignes lignes={['Prenez le temps', <span key="r">d’une <em>respiration</em>.</span>]} />
          </h2>
          <Revele delai={0.3}>
            <p className="mt-8 max-w-[42ch] text-[17px] leading-[1.75] text-[var(--ad-pierre)]">
              Un instant pour vous, avant la suite. Suivez le cercle : il gonfle, vous inspirez ; il se pose, vous expirez.
            </p>
          </Revele>
        </div>
        {/* Le cercle qui respire — et l'exercice guidé d'une minute. */}
        <Souffle />
      </div>
    </section>
  )
}

/* ── Rencontre ──────────────────────────────────────────────────────── */

export function Rencontre({ c }: P) {
  const anneau = `${c.metier} · ${c.ville} · ${[...new Set(c.services.map((s) => s.method).filter(Boolean))].slice(0, 2).join(' · ')} · `
  return (
    <section id="a-propos" className="scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-[5vw] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-24">
        <Revele className="relative mx-auto w-full max-w-[440px]">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-[var(--ad-sable-fonce)]">
            {c.portrait && <Image src={c.portrait.url} alt={c.portrait.alt} fill sizes="440px" className="object-cover" />}
          </div>
          {/* Le sceau : le métier écrit en cercle, qui tourne lentement. */}
          <div aria-hidden="true" className="absolute -bottom-10 -right-6 grid h-36 w-36 place-items-center rounded-full bg-[var(--ad-ivoire)] shadow-[0_20px_50px_-20px_rgba(20,35,46,0.4)] md:-right-12">
            <svg viewBox="0 0 100 100" className="absolute inset-2 motion-safe:animate-[ad-tourner_28s_linear_infinite]">
              <defs>
                <path id="ad-cercle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-[var(--ad-nuit)] text-[8.6px] uppercase tracking-[0.2em]">
                <textPath href="#ad-cercle">{anneau}</textPath>
              </text>
            </svg>
            <LogoMark src={c.logo} className="h-12 w-12" />
          </div>
        </Revele>
        <div>
          <Surtitre>{c.apropos.surtitre}</Surtitre>
          <h2 className="text-[36px] md:text-[54px]">
            <Lignes lignes={[prenomDe(c.nom), <em key="n">{nomDe(c.nom)}</em>]} />
          </h2>
          <Encre texte={c.apropos.texte} className="mt-10 font-[family-name:var(--ad-titre)] text-[21px] font-medium leading-[1.55] tracking-[-0.015em] text-[var(--ad-nuit)] md:text-[24px]" />
          {c.apropos.citation && (
            <Revele delai={0.1}>
              <p className="mt-8 border-l border-[var(--ad-or)] pl-5 text-[16px] leading-[1.7] text-[var(--ad-pierre)]">{c.apropos.citation}</p>
            </Revele>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Chemin ─────────────────────────────────────────────────────────── */

export function SectionChemin({ c }: P) {
  return (
    <section id="methode" className="scroll-mt-24 py-24 md:py-36">
      <div className="mx-auto max-w-[1100px] px-[5vw]">
        <div className="mb-16 text-center md:mb-24">
          <div className="flex justify-center">
            <Surtitre>{c.methode.surtitre}</Surtitre>
          </div>
          <h2 className="text-[36px] md:text-[54px]">
            <Lignes lignes={[c.methode.titre]} />
          </h2>
          {c.methode.intro && (
            <Revele delai={0.2}>
              <p className="mx-auto mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-[var(--ad-pierre)]">{c.methode.intro}</p>
            </Revele>
          )}
        </div>
        <Chemin etapes={c.methode.etapes} />
      </div>
    </section>
  )
}

/* ── Arches ─────────────────────────────────────────────────────────── */

export function SectionArches({ c }: P) {
  return (
    <section id="accompagnements" className="scroll-mt-24 bg-[var(--ad-ivoire)] py-24 md:py-36">
      <div className="mx-auto max-w-[1320px] px-[5vw]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Surtitre>Accompagnements</Surtitre>
            <h2 className="text-[36px] md:text-[54px]">
              <Lignes lignes={['Ce que je vous', <em key="p">propose</em>]} />
            </h2>
          </div>
          <Revele delai={0.2}>
            <p className="max-w-[34ch] text-[15px] leading-[1.7] text-[var(--ad-pierre)]">
              {c.services.length} façons d’être accompagné. Survolez ou touchez une carte pour l’ouvrir.
            </p>
          </Revele>
        </div>
        <Revele>
          <Arches services={c.services} rdv={c.rdv} />
        </Revele>
      </div>
    </section>
  )
}

/* ── En pratique ────────────────────────────────────────────────────── */

const JOURS_COURTS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

/** Un « bento » : tout ce qu'on cherche avant d'appeler, en cartes
    vivantes — le plan qui bat, l'onde de la visio, les séances. */
export function EnPratique({ c }: P) {
  const ouverts = c.horaires.filter((h) => !/ferm/i.test(h.hours))
  const indice = (j: string) => JOURS_COURTS.findIndex((d) => j.toLowerCase().startsWith(d))
  const tries = [...ouverts].sort((a, b) => indice(a.day) - indice(b.day))
  const plage = tries.length ? `${tries[0]!.day} → ${tries.at(-1)!.day}` : 'Sur rendez-vous'
  const carte = 'rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(20,35,46,0.05),0_20px_50px_-30px_rgba(20,35,46,0.25)]'
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-[5vw]">
        <Surtitre>En pratique</Surtitre>
        <h2 className="mb-12 text-[36px] md:text-[54px]">
          <Lignes lignes={['Tout ce qu’il faut', <em key="s">savoir</em>]} />
        </h2>
        <div className="grid gap-4 md:auto-rows-[220px] md:grid-cols-4">
          {/* Le plan : des rues dessinées, l'épingle qui bat. */}
          <Revele className={cn(carte, 'relative overflow-hidden p-0 md:col-span-2 md:row-span-2')}>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[var(--ad-brume)] [background-image:linear-gradient(115deg,transparent_46%,#fff_46%,#fff_49%,transparent_49%),linear-gradient(15deg,transparent_58%,#fff_58%,#fff_60%,transparent_60%),linear-gradient(90deg,transparent_30%,rgba(255,255,255,0.7)_30%,rgba(255,255,255,0.7)_31.5%,transparent_31.5%),linear-gradient(0deg,transparent_70%,rgba(255,255,255,0.7)_70%,rgba(255,255,255,0.7)_71.5%,transparent_71.5%)]"
            />
            <span aria-hidden="true" className="absolute left-[54%] top-[42%] grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="absolute h-16 w-16 rounded-full bg-[var(--ad-or)]/30 motion-safe:animate-[ad-pouls_2.4s_ease-out_infinite]" />
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[var(--ad-nuit)] text-white shadow-[0_10px_30px_-8px_rgba(20,35,46,0.5)]">
                <MapPin className="h-5 w-5" />
              </span>
            </span>
            <div className="relative flex h-full min-h-[300px] flex-col justify-end p-7">
              <div className="rounded-[20px] bg-white/90 p-5 backdrop-blur">
                <p className="text-[13px] font-semibold text-[var(--ad-gris)]">Le cabinet</p>
                <p className="mt-1 text-[18px] font-semibold tracking-[-0.02em]">{c.adresse ?? c.ville}</p>
                {c.adresse && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.adresse)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ad-bleu)]"
                  >
                    Itinéraire
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </div>
          </Revele>

          {/* Les séances. */}
          <Revele delai={0.08} className={cn(carte, 'md:col-span-2')}>
            <p className="text-[13px] font-semibold text-[var(--ad-gris)]">Les séances</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {c.services.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 text-[15px]">
                  <span className="truncate font-medium">{s.title}</span>
                  {s.duration && (
                    <span className="shrink-0 rounded-full bg-[var(--ad-sable)] px-3 py-1 text-[12.5px] font-semibold tabular-nums text-[var(--ad-pierre)]">
                      {s.duration.split(/[—–]/)[0]!.trim()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Revele>

          {/* La visio, et son onde. */}
          <Revele delai={0.16} className={cn(carte, 'flex flex-col justify-between')}>
            <div aria-hidden="true" className="flex h-12 items-center gap-1">
              {[0.1, 0.35, 0.6, 0.2, 0.45, 0.7, 0.3].map((d, i) => (
                <span
                  key={i}
                  className="h-full w-1.5 origin-center rounded-full bg-gradient-to-t from-[#2f6f93] to-[#36a39b] motion-safe:animate-[ad-onde_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.02em]">En visio aussi</p>
              <p className="mt-1 text-[14px] leading-[1.5] text-[var(--ad-gris)]">Si vous êtes loin, ou empêché.</p>
            </div>
          </Revele>

          {/* Les jours. */}
          <Revele delai={0.24} className={cn(carte, 'flex flex-col justify-between')}>
            <p className="text-[13px] font-semibold text-[var(--ad-gris)]">Consultations</p>
            <div>
              <p className="text-[24px] font-semibold capitalize tracking-[-0.03em]">{plage}</p>
              {tries[0] && <p className="mt-1 text-[14px] text-[var(--ad-gris)]">{tries[0].hours}</p>}
            </div>
          </Revele>
        </div>
      </div>
    </section>
  )
}

/* ── Phrase ─────────────────────────────────────────────────────────── */

export function Phrase({ c }: P) {
  const mots = c.citation.texte.split(' ')
  const milieu = Math.ceil(mots.length / 2)
  return (
    <section className="py-28 md:py-44">
      <div className="mx-auto max-w-[1200px] px-[5vw] text-center">
        <span aria-hidden="true" className="mx-auto mb-10 block h-16 w-px bg-gradient-to-b from-transparent to-[var(--ad-or)]" />
        <blockquote>
          <p className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[clamp(34px,5vw,80px)] leading-[1.05] text-[var(--ad-nuit)]">
            <Lignes lignes={[mots.slice(0, milieu).join(' '), <em key="b">{mots.slice(milieu).join(' ')}</em>]} />
          </p>
          <Revele delai={0.4}>
            <footer className="mt-10 text-[12px] uppercase tracking-[0.22em] text-[var(--ad-gris)]">{c.citation.auteur}</footer>
          </Revele>
        </blockquote>
      </div>
    </section>
  )
}

/* ── Promenade ──────────────────────────────────────────────────────── */

export function SectionPromenade({ c }: P) {
  const photos = c.photos.filter((p) => !/substitution/i.test(p.alt)).slice(0, 9)
  return (
    <div className="bg-[var(--ad-sable)]">
      <Promenade photos={photos} titre={<>Le <em>cabinet</em></>} />
    </div>
  )
}

/* ── Conversation ───────────────────────────────────────────────────── */

export function SectionConversation({ c }: P) {
  if (!c.faq.length) return null
  return (
    <section id="questions" className="scroll-mt-24 py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-[5vw]">
        <Surtitre>Questions fréquentes</Surtitre>
        <h2 className="mb-14 text-[36px] md:text-[54px]">
          <Lignes lignes={['Ce qu’on me', <em key="d">demande</em>]} />
        </h2>
        <Revele>
          <Conversation faq={c.faq} prenom={prenomDe(c.nom)} portrait={c.portrait} />
        </Revele>
      </div>
    </section>
  )
}

/* ── Rendez-vous ────────────────────────────────────────────────────── */

export function RendezVous({ c }: P) {
  const lignes = [
    c.telephone && { icone: <Phone />, texte: c.telephone, href: `tel:${toE164(c.telephone)}` },
    c.email && { icone: <Mail />, texte: c.email, href: `mailto:${c.email}` },
    c.adresse && { icone: <MapPin />, texte: c.adresse, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.adresse)}` },
  ].filter(Boolean) as { icone: React.ReactNode; texte: string; href: string }[]
  return (
    <section id="contact" className="scroll-mt-24 bg-[var(--ad-sable)] py-24 md:py-36">
      <div className="mx-auto grid max-w-[1200px] gap-16 px-[5vw] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <Surtitre>Rendez-vous</Surtitre>
          <h2 className="text-[36px] md:text-[54px]">
            <Lignes lignes={['Écrivez-moi,', <em key="e">simplement</em>]} />
          </h2>
          <Revele delai={0.2} className="mt-12">
            <Semaine horaires={c.horaires} />
          </Revele>
          <Revele delai={0.3}>
            <ul className="mt-10 divide-y divide-[var(--ad-sable-fonce)] border-y border-[var(--ad-sable-fonce)]">
              {lignes.map((l) => (
                <li key={l.texte}>
                  <a href={l.href} className="group flex items-center gap-4 py-4 text-[15px] text-[var(--ad-nuit)] [&_svg]:h-4 [&_svg]:w-4">
                    <span className="text-[var(--ad-or)]">{l.icone}</span>
                    <span className="min-w-0 flex-1 truncate">{l.texte}</span>
                    <ArrowUpRight className="opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ad-ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </Revele>
        </div>
        <Revele delai={0.15}>
          <Lettre prenom={prenomDe(c.nom)} />
        </Revele>
      </div>
    </section>
  )
}

/* ── Horizon ────────────────────────────────────────────────────────── */

export function Horizon({ c, liens, base }: P & { liens: { href: string; label: string }[]; base: string }) {
  return (
    /* Le fond sable continue celui du rendez-vous derrière la courbe. */
    <div className="bg-[var(--ad-sable)]">
    <footer className="relative overflow-hidden rounded-t-[40px] bg-[var(--ad-nuit)] px-[5vw] pb-10 pt-28 text-white md:rounded-t-[56px] md:pt-40">
      <div aria-hidden="true" className="absolute -top-40 left-1/2 h-80 w-[60vw] -translate-x-1/2 rounded-full bg-[var(--ad-bleu)]/30 blur-3xl" />
      <div className="relative mx-auto max-w-[1200px]">
        <p className="text-center font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[clamp(48px,8.5vw,136px)] leading-[0.98]">
          <Lignes lignes={['Prenons', <span key="t" className="text-[var(--ad-or)]">le temps.</span>]} />
        </p>
        <Revele delai={0.3} className="mt-12 flex justify-center">
          <a
            href={c.rdv}
            className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-7 pr-2 text-[16px] font-medium text-[var(--ad-nuit)]"
          >
            Prendre rendez-vous
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ad-nuit)] text-white transition-transform duration-500 ease-[var(--ad-ease)] group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </Revele>
        <Revele delai={0.4} className="mt-8 flex flex-wrap justify-center gap-2">
          {c.telephone && (
            <a href={`tel:${toE164(c.telephone)}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[14px] text-white/85 transition-colors hover:bg-white/15">
              <Phone className="h-3.5 w-3.5" />
              {c.telephone}
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[14px] text-white/85 transition-colors hover:bg-white/15">
              <Mail className="h-3.5 w-3.5" />
              {c.email}
            </a>
          )}
        </Revele>
        <div className="mt-24 flex flex-wrap items-end justify-between gap-8 border-t border-white/15 pt-8 text-[14px] text-white/60">
          <span className="flex items-center gap-3 text-[26px] font-bold tracking-[-0.03em] text-white">
            <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-white">
              <LogoMark src={c.logo} className="h-9 w-9" />
            </span>
            <span>
              Anasawi<span className="text-[var(--ad-or)]">.</span>
            </span>
          </span>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 gap-y-2">
            {liens.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <span>
            © {new Date().getFullYear()} {c.nom} ·{' '}
            <a href={`${base}/modeles`} className="underline-offset-2 hover:text-white hover:underline">
              les composants
            </a>
          </span>
        </div>
      </div>
    </footer>
    </div>
  )
}
