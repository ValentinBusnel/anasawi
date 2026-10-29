import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'

import { Arches, Chemin, Conversation, Encre, Lettre, Lignes, Promenade, Revele, Semaine, Seuil } from './vivant'
import type { Contenu } from '@/components/qeeps/donnees'
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
    />
  )
}

/* ── Respiration ────────────────────────────────────────────────────── */

export function Respiration({ c }: P) {
  return (
    <section className="relative overflow-hidden bg-[var(--ad-sable)] py-28 md:py-40">
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-[5vw] md:grid-cols-2">
        <div>
          <Surtitre>Avant de commencer</Surtitre>
          <h2 className="text-[38px] md:text-[56px]">
            <Lignes lignes={['Prenez le temps', <span key="r">d’une <em>respiration</em>.</span>]} />
          </h2>
          <Revele delai={0.3}>
            <p className="mt-8 max-w-[42ch] text-[17px] leading-[1.75] text-[var(--ad-pierre)]">{c.ouverture.intro || c.accroche}</p>
          </Revele>
        </div>
        {/* Le cercle qui respire : 4 secondes pour inspirer, 4 pour expirer. */}
        <div aria-hidden="true" className="relative mx-auto grid aspect-square w-full max-w-[420px] place-items-center">
          <span className="absolute inset-0 rounded-full border border-[var(--ad-sable-fonce)]" />
          <span className="absolute inset-[14%] rounded-full border border-dashed border-[var(--ad-or)]/40 motion-safe:animate-[ad-tourner_60s_linear_infinite]" />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_35%,#ffffff_0%,var(--ad-brume)_45%,#d9e6ec_100%)] shadow-[0_40px_100px_-30px_rgba(70,114,138,0.45)] motion-safe:animate-[ad-souffle_8s_var(--ad-ease-lent)_infinite]" />
          <span className="relative grid place-items-center font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[34px] text-[var(--ad-nuit)]">
            <span className="col-start-1 row-start-1 motion-safe:animate-[ad-inspirez_8s_linear_infinite]">Inspirez</span>
            <span className="col-start-1 row-start-1 opacity-0 motion-safe:animate-[ad-expirez_8s_linear_infinite]">Expirez</span>
          </span>
        </div>
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
            <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[34px] text-[var(--ad-or)]">A.</span>
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
        <div className="mt-24 flex flex-wrap items-end justify-between gap-8 border-t border-white/15 pt-8 text-[14px] text-white/60">
          <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[28px] text-white">
            Anasawi<span className="text-[var(--ad-or)]">.</span>
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
