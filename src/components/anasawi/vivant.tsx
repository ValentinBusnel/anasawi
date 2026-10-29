'use client'

import { ArrowUpRight, Check, Menu, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { LogoMark } from '@/components/site/Logo'
import { cn } from '@/lib/utils'
import type { FaqItem, Media, OpeningHour, ServiceWithMedia } from '@/server/db/schema'

/**
 * Les composants VIVANTS de la nouvelle DA d'Anasawi.
 *
 * Un principe pour tous : le mouvement suit la lecture. Le défilement
 * écrit une seule variable CSS (`--p`, de 0 à 1) sur l'élément, une fois
 * par image ; tout le reste — tailles, rayons, opacités, tracés — est du
 * `calc()` dans le style. Pas de re-rendu React à chaque pixel, et rien
 * ne bouge pour qui a demandé moins d'animations.
 */

const reduit = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Écrit `--p` (avancement 0 → 1) sur l'élément.
 * - `colle` : pour une section haute à contenu collant — 0 quand son haut
 *   touche le haut de l'écran, 1 quand son bas touche le bas.
 * - `passage` : 0 quand l'élément entre par le bas, 1 quand il sort par
 *   le haut.
 */
function useAvancement<T extends HTMLElement>(mode: 'colle' | 'passage', lisse = false) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduit()) {
      el.style.setProperty('--p', mode === 'colle' ? '0' : '1')
      el.style.setProperty('--e', '0')
      return
    }
    let image = 0
    const calcule = () => {
      image = 0
      const r = el.getBoundingClientRect()
      const h = window.innerHeight
      const p =
        mode === 'colle'
          ? -r.top / Math.max(1, r.height - h)
          : (h - r.top) / (h + r.height)
      const c = Math.min(1, Math.max(0, p))
      el.style.setProperty('--p', c.toFixed(4))
      if (lisse) {
        /* Une courbe douce au départ et à l'arrivée. */
        const e = c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
        el.style.setProperty('--e', e.toFixed(4))
      }
    }
    const demande = () => {
      if (!image) image = requestAnimationFrame(calcule)
    }
    calcule()
    window.addEventListener('scroll', demande, { passive: true })
    window.addEventListener('resize', demande)
    return () => {
      cancelAnimationFrame(image)
      window.removeEventListener('scroll', demande)
      window.removeEventListener('resize', demande)
    }
  }, [mode, lisse])
  return ref
}

/* ══════════════════════════════════════════════════════════════════════
   RÉVÉLATION — trois façons d'entrer : monter (avec un léger flou qui se
   dissipe), sortir d'un masque ligne par ligne, ou lettre à lettre.
   ══════════════════════════════════════════════════════════════════════ */

export function Revele({
  children,
  className,
  delai = 0,
  as: Balise = 'div',
}: {
  children: React.ReactNode
  className?: string
  delai?: number
  as?: 'div' | 'li' | 'p' | 'span'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [etat, setEtat] = useState<'ssr' | 'cache' | 'vu'>('ssr')
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduit()) return setEtat('vu')
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) return setEtat('vu')
    setEtat('cache')
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setEtat('vu')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Balise
      ref={ref as never}
      className={cn(
        etat === 'cache' && 'opacity-0',
        etat === 'vu' && 'motion-safe:animate-[ad-monter_1.2s_var(--ad-ease)_backwards]',
        className,
      )}
      style={etat === 'vu' && delai ? { animationDelay: `${delai}s` } : undefined}
    >
      {children}
    </Balise>
  )
}

/** Des lignes qui sortent chacune de leur masque, l'une après l'autre. */
export function Lignes({
  lignes,
  className,
  ligneClassName,
  delai = 0,
}: {
  lignes: React.ReactNode[]
  className?: string
  ligneClassName?: string
  delai?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVu(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <span ref={ref} className={cn('block', className)}>
      {lignes.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span
            className={cn(
              'block',
              vu ? 'motion-safe:animate-[ad-sortir_1.1s_var(--ad-ease)_backwards]' : 'motion-safe:translate-y-[105%]',
              ligneClassName,
            )}
            style={vu ? { animationDelay: `${delai + i * 0.12}s` } : undefined}
          >
            {l}
          </span>
        </span>
      ))}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LE SEUIL — l'ouverture. Au premier écran, le nom d'Anne, centré, au
   PREMIER PLAN ; juste dessous, une fenêtre sur le cabinet. On fait
   défiler : le nom s'élève et s'efface, la fenêtre monte au centre et
   s'élargit jusqu'à remplir l'écran — on entre dans la pièce — et la
   phrase d'accueil apparaît dedans.
   ══════════════════════════════════════════════════════════════════════ */

export function Seuil({
  prenom,
  nom,
  metier,
  ville,
  accroche,
  photo,
  rdv,
  horaires,
  services,
  intro,
}: {
  prenom: string
  nom: string
  metier: string
  ville: string
  accroche: string
  photo: Media | null
  rdv: string
  horaires: OpeningHour[]
  services: { titre: string }[]
  /** Une phrase de présentation, sous le nom. */
  intro: string
}) {
  const ref = useAvancement<HTMLElement>('colle', true)
  /* « Ouvert aujourd'hui » se calcule chez le visiteur (son jour) : après
     l'hydratation, jamais au rendu serveur. */
  const [jour, setJour] = useState<string | null>(null)
  useEffect(() => {
    const j = JOURS[(new Date().getDay() + 6) % 7]!
    const h = horaires.find((x) => x.day.toLowerCase().startsWith(j.slice(0, 3)))?.hours
    setJour(h && !/ferm/i.test(h) ? h : '')
  }, [horaires])

  /* Ce qui habille le premier écran s'efface dès qu'on entre. */
  const sFondu = { opacity: 'clamp(0, calc(1 - var(--e) * 7), 1)' }
  const sEfface = { ...sFondu, transform: 'translateY(calc(var(--e) * -24px))' }
  /* La fenêtre : sous le nom au départ, plein écran à l'arrivée. */
  const larg = 'min(460px, 64vw)'
  const haut = 'min(400px, 38svh)'
  return (
    <section ref={ref} id="haut" className="relative h-[240vh] [--e:0] [--p:0]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Un halo très doux, derrière tout. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[30%] h-[70svh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(54,163,155,0.14),rgba(47,111,147,0.08)_55%,transparent)] blur-2xl"
          style={sFondu}
        />

        {/* Le métier, au-dessus du nom. */}
        <div className="absolute inset-x-0 top-[13svh] z-30 flex justify-center md:top-[14svh]" style={sEfface}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ad-pierre)] shadow-[0_1px_2px_rgba(20,35,46,0.06),0_6px_18px_-8px_rgba(20,35,46,0.18)] motion-safe:animate-[ad-monter_1.1s_var(--ad-ease)_0.1s_backwards]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--ad-or)]" />
            {metier} · {ville}
          </span>
        </div>

        {/* Le nom : centré, AU PREMIER PLAN, jusqu'à ce qu'on fasse défiler. */}
        <h1
          className="pointer-events-none absolute inset-x-0 top-[19svh] z-30 px-5 text-center text-[clamp(52px,9.4vw,156px)] leading-[0.95] text-[var(--ad-nuit)] md:top-[20svh]"
          style={{
            transform: 'translateY(calc(var(--e) * -16svh)) scale(calc(1 - var(--e) * 0.25))',
            opacity: 'clamp(0, calc(1 - var(--e) * 2.2), 1)',
          }}
        >
          <span className="block overflow-hidden pb-[0.06em] md:inline-block">
            <span className="block motion-safe:animate-[ad-sortir_1.2s_var(--ad-ease)_0.15s_backwards]">{prenom}</span>
          </span>{' '}
          <span className="block overflow-hidden pb-[0.06em] md:inline-block">
            <em className="block motion-safe:animate-[ad-sortir_1.2s_var(--ad-ease)_0.28s_backwards]">{nom}</em>
          </span>
        </h1>

        {/* Sous le nom : la présentation, et les deux actions. */}
        <div
          className="absolute inset-x-0 top-[calc(19svh+clamp(120px,21vw,330px))] z-30 hidden flex-col items-center px-6 text-center md:top-[calc(20svh+clamp(60px,10.5vw,170px))] md:flex"
          style={sEfface}
        >
          <p className="max-w-[54ch] text-[16px] leading-[1.6] text-[var(--ad-pierre)] motion-safe:animate-[ad-monter_1.2s_var(--ad-ease)_0.45s_backwards]">{intro}</p>
        </div>

        {/* La fenêtre sur le cabinet : sous le nom, puis plein écran. */}
        <div
          className="absolute left-1/2 z-10 overflow-hidden bg-[var(--ad-sable-fonce)] shadow-[0_50px_120px_-50px_rgba(20,35,46,0.55)] motion-safe:animate-[ad-monter_1.4s_var(--ad-ease)_0.35s_backwards]"
          style={{
            top: 'calc(66% - 16% * var(--e))',
            width: `calc(${larg} + (100vw - ${larg}) * var(--e))`,
            height: `calc(${haut} + (100svh - ${haut}) * var(--e))`,
            transform: 'translate(-50%, -50%)',
            borderRadius: 'calc((1 - var(--e)) * 32px)',
          }}
        >
          {photo && (
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ transform: 'scale(calc(1.15 - var(--e) * 0.15))' }}
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-[var(--ad-nuit)]" style={{ opacity: 'calc(var(--e) * 0.5)' }} />
          {/* La phrase d'accueil, dans la pièce. */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white"
            style={{
              opacity: 'clamp(0, calc((var(--e) - 0.55) * 3), 1)',
              transform: 'translateY(calc((1 - var(--e)) * 40px))',
            }}
          >
            <p className="max-w-[18ch] text-balance text-[clamp(34px,5.2vw,80px)] font-semibold leading-[1.04] tracking-[-0.035em]">{accroche}</p>
            <a
              href={rdv}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-[15px] font-semibold text-[var(--ad-nuit)]"
            >
              Prendre rendez-vous
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ad-nuit)] text-white transition-transform duration-500 ease-[var(--ad-ease)] group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>

        {/* De part et d'autre de la fenêtre : deux cartes de verre qui flottent. */}
        <div className="pointer-events-none absolute inset-x-0 top-[66%] z-20 hidden -translate-y-1/2 justify-between px-[6vw] lg:flex" style={sFondu}>
          <div className="w-[230px] motion-safe:animate-[ad-monter_1.2s_var(--ad-ease)_0.7s_backwards]">
            {jour !== null && (
              <div className="flex items-center gap-3 rounded-[18px] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_20px_50px_-24px_rgba(20,35,46,0.35)] backdrop-blur-xl motion-safe:animate-[ad-flotter_6s_ease-in-out_infinite]">
                <span className="relative grid h-3 w-3 place-items-center">
                  {jour && <span className="absolute inset-0 rounded-full bg-[#4caf8b] motion-safe:animate-[ad-pouls_1.8s_ease-out_infinite]" />}
                  <span className={cn('relative h-2 w-2 rounded-full', jour ? 'bg-[#4caf8b]' : 'bg-[var(--ad-gris)]')} />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-[var(--ad-nuit)]">{jour ? 'Ouvert aujourd’hui' : 'Fermé aujourd’hui'}</span>
                  <span className="block text-[12px] text-[var(--ad-gris)]">{jour || 'Écrivez-moi, je vous réponds'}</span>
                </span>
              </div>
            )}
          </div>
          <div className="w-[250px] motion-safe:animate-[ad-monter_1.2s_var(--ad-ease)_0.85s_backwards]">
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_-24px_rgba(20,35,46,0.35)] backdrop-blur-xl motion-safe:animate-[ad-flotter_7s_ease-in-out_1.2s_infinite]">
              <p className="text-[12px] font-semibold text-[var(--ad-gris)]">{services.length} accompagnements</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {services.slice(0, 4).map((x) => (
                  <li key={x.titre} className="rounded-full bg-[var(--ad-sable)] px-2.5 py-1 text-[12px] font-medium text-[var(--ad-nuit)]">
                    {x.titre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* En bas : les deux actions, et l'invitation à entrer. */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-5 px-6" style={sEfface}>
          <div className="flex flex-wrap justify-center gap-2 motion-safe:animate-[ad-monter_1.2s_var(--ad-ease)_0.6s_backwards]">
            <a
              href={rdv}
              className="pointer-events-auto group inline-flex items-center gap-2.5 rounded-full bg-[var(--ad-nuit)] py-1.5 pl-5 pr-1.5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(20,35,46,0.6)]"
            >
              Prendre rendez-vous
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-[var(--ad-ease)] group-hover:rotate-45">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <a
              href="#accompagnements"
              className="pointer-events-auto inline-flex items-center rounded-full border border-[var(--ad-sable-fonce)] bg-white px-5 text-[14px] font-semibold text-[var(--ad-nuit)] transition-colors hover:border-[var(--ad-nuit)]"
            >
              Découvrir
            </a>
          </div>
          <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ad-gris)] max-md:hidden">
            Défiler pour entrer
            <span className="relative block h-8 w-px overflow-hidden bg-[var(--ad-sable-fonce)]">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-[var(--ad-or)] motion-safe:animate-[ad-descendre_2.2s_var(--ad-ease-lent)_infinite]" />
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   L'ENCRE — un texte dont les mots se teintent à mesure qu'on le lit.
   ══════════════════════════════════════════════════════════════════════ */

export function Encre({ texte, className }: { texte: string; className?: string }) {
  const ref = useAvancement<HTMLParagraphElement>('passage')
  const mots = texte.split(/\s+/).filter(Boolean)
  const n = mots.length
  return (
    <p ref={ref} className={cn('[--p:1]', className)}>
      {mots.map((m, i) => (
        <span
          key={i}
          className="transition-[opacity] duration-200"
          style={{ opacity: `clamp(0.16, calc((var(--p) * 2.1 - 0.35 - ${i / n}) * 9), 1)` }}
        >
          {m}{' '}
        </span>
      ))}
    </p>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LE CHEMIN — les étapes reliées par un trait qui se dessine au fil de
   la lecture ; chaque étape s'allume quand le trait l'atteint.
   ══════════════════════════════════════════════════════════════════════ */

export function Chemin({ etapes }: { etapes: { titre: string; texte: string }[] }) {
  const ref = useAvancement<HTMLOListElement>('passage')
  const n = etapes.length
  /* Une onde douce qui croise l'axe au centre de chaque étape. */
  const pas = 1000 / n
  let d = `M 50 0`
  for (let i = 0; i < n; i++) {
    const y0 = i * pas
    const sens = i % 2 ? -1 : 1
    d += ` C ${50 + 30 * sens} ${y0 + pas * 0.25}, ${50 + 30 * sens} ${y0 + pas * 0.25}, 50 ${y0 + pas * 0.5}`
    d += ` C ${50 - 30 * sens} ${y0 + pas * 0.75}, ${50 - 30 * sens} ${y0 + pas * 0.75}, 50 ${y0 + pas}`
  }
  const avance = 'calc((var(--p) - 0.12) * 1.7)'
  return (
    <ol ref={ref} className="relative [--p:1]">
      <svg
        aria-hidden="true"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[18px] top-0 h-full w-[60px] -translate-x-1/2 md:left-1/2 md:w-[160px]"
      >
        <path d={d} fill="none" stroke="var(--ad-sable-fonce)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path
          d={d}
          fill="none"
          stroke="var(--ad-or)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: `calc(1 - clamp(0, ${avance}, 1))` }}
        />
      </svg>
      {etapes.map((e, i) => {
        const seuil = (i + 0.5) / n
        const allume = `clamp(0, calc((${avance} - ${seuil}) * 14), 1)`
        const gauche = i % 2 === 0
        return (
          <li key={e.titre} className="relative grid min-h-[220px] items-center pl-14 md:grid-cols-2 md:gap-28 md:pl-0">
            {/* Le jalon, sur le trait. */}
            <span
              aria-hidden="true"
              className="absolute left-[18px] top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--ad-sable-fonce)] bg-[var(--ad-ivoire)] font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[20px] text-[var(--ad-gris)] md:left-1/2"
            >
              <span
                className="absolute inset-0 rounded-full bg-[var(--ad-nuit)]"
                style={{ transform: `scale(${allume})`, opacity: allume }}
              />
              <span className="relative" style={{ color: `color-mix(in srgb, white calc(${allume} * 100%), var(--ad-gris))` }}>
                {i + 1}
              </span>
            </span>
            <div
              className={cn('py-8', gauche ? 'md:col-start-1 md:text-right' : 'md:col-start-2')}
              style={{
                opacity: `clamp(0.25, calc(0.25 + ${allume} * 0.75), 1)`,
                transform: `translateX(calc((1 - ${allume}) * ${gauche ? '-' : ''}16px))`,
              }}
            >
              <h3 className="text-[34px] md:text-[44px]">{e.titre}</h3>
              {e.texte && <p className={cn('mt-3 max-w-[38ch] text-[16px] leading-[1.7] text-[var(--ad-pierre)]', gauche && 'md:ml-auto')}>{e.texte}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LES ARCHES — les accompagnements côte à côte, chacun dans une arche.
   On en survole (ou on en touche) une : elle s'ouvre, les autres se
   resserrent, et sa fiche apparaît.
   ══════════════════════════════════════════════════════════════════════ */

const TEINTES = ['#e3eef5', '#ddf1ee', '#e7e8f6', '#e9eef3', '#dfedf7', '#e4f3ea']

export function Arches({ services, rdv }: { services: ServiceWithMedia[]; rdv: string }) {
  const [ouverte, setOuverte] = useState(0)
  return (
    <ul className="flex flex-col gap-3 md:h-[560px] md:flex-row md:gap-4">
      {services.map((s, i) => {
        const actif = ouverte === i
        return (
          <li
            key={s.id}
            onMouseEnter={() => setOuverte(i)}
            className={cn(
              'group relative overflow-hidden rounded-[28px] transition-[flex-grow,height] duration-[900ms] ease-[var(--ad-ease)]',
              actif ? 'h-[460px] md:h-auto md:flex-[3.4]' : 'h-[120px] md:h-auto md:flex-1',
            )}
            style={{ background: TEINTES[i % TEINTES.length] }}
          >
            <button
              type="button"
              onClick={() => setOuverte(i)}
              onFocus={() => setOuverte(i)}
              aria-expanded={actif}
              className="absolute inset-0 z-10 text-left focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-[var(--ad-nuit)]"
            >
              <span className="sr-only">{s.title}</span>
            </button>
            {s.media && (
              <Image
                src={s.media.url}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className={cn(
                  'object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ad-ease)]',
                  actif ? 'scale-100 opacity-100' : 'scale-110 opacity-60 grayscale-[40%]',
                )}
              />
            )}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 bg-gradient-to-t from-[rgba(46,66,79,0.88)] via-[rgba(46,66,79,0.25)] to-transparent transition-opacity duration-700',
                s.media ? 'opacity-100' : 'opacity-0',
              )}
            />
            {/* Le repère d'état : « + » fermé, « × » ouvert. */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-[var(--ad-nuit)] backdrop-blur transition-transform duration-700 ease-[var(--ad-ease)] max-md:hidden',
                actif && 'rotate-45',
              )}
            >
              <Plus className="h-4 w-4" />
            </span>
            {/* Fermée : le numéro et le titre, debout. */}
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-3 p-6 transition-[opacity,transform] duration-500',
                actif ? 'translate-y-4 opacity-0' : 'opacity-100',
                s.media ? 'text-white' : 'text-[var(--ad-nuit)]',
              )}
            >
              <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[18px] opacity-70">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[24px] leading-[1.05] md:[writing-mode:vertical-rl] md:rotate-180">{s.title}</span>
            </div>
            {/* Ouverte : la fiche. */}
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 z-20 p-7 transition-[opacity,transform] duration-700 ease-[var(--ad-ease)] md:p-9',
                actif ? 'translate-y-0 opacity-100 delay-200' : 'pointer-events-none translate-y-6 opacity-0',
                s.media ? 'text-white' : 'text-[var(--ad-nuit)]',
              )}
            >
              <div className="mb-3 flex flex-wrap gap-2 text-[12px] font-medium uppercase tracking-[0.14em]">
                {s.group && <span className="rounded-full border border-current/40 px-3 py-1 opacity-90">{s.group.label}</span>}
                {s.duration && <span className="rounded-full border border-current/40 px-3 py-1 opacity-90">{s.duration.split(/[·—]/)[0]}</span>}
              </div>
              <h3 className="text-[40px] md:text-[54px]">{s.title}</h3>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.65] opacity-85">{s.excerpt.replace(/\*/g, '')}</p>
              <a
                href={rdv}
                className="group/lien relative z-30 mt-6 inline-flex items-center gap-2 border-b border-current pb-1 text-[14px] font-medium"
              >
                Réserver cet accompagnement
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/lien:-translate-y-0.5 group-hover/lien:translate-x-0.5" />
              </a>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA PROMENADE — le cabinet, pièce après pièce. Sur grand écran, la
   page s'immobilise et le défilement fait glisser les photos de côté,
   chacune avec sa profondeur ; sur téléphone, on les fait glisser au
   doigt.
   ══════════════════════════════════════════════════════════════════════ */

export function Promenade({ photos, titre }: { photos: Media[]; titre: React.ReactNode }) {
  const ref = useAvancement<HTMLElement>('colle')
  const piste = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mesure = () => {
      const p = piste.current
      const s = ref.current
      if (!p || !s) return
      s.style.setProperty('--decal', `${Math.max(0, p.scrollWidth - window.innerWidth)}px`)
    }
    mesure()
    window.addEventListener('resize', mesure)
    return () => window.removeEventListener('resize', mesure)
  }, [ref])
  const formes = ['rounded-[28px]', 'rounded-[20px]', 'rounded-[36px]', 'rounded-[24px]']
  return (
    <section ref={ref} id="cabinet" className="relative [--p:0] md:h-[320vh]">
      <div className="py-20 md:sticky md:top-0 md:flex md:h-[100svh] md:flex-col md:justify-center md:overflow-hidden md:py-0">
        <div className="mb-10 flex items-end justify-between gap-6 px-[5vw]">
          <h2 className="text-[48px] md:text-[80px]">{titre}</h2>
          <p className="pb-3 text-[12px] uppercase tracking-[0.2em] text-[var(--ad-gris)] max-md:hidden">
            <span className="tabular-nums">{photos.length}</span> pièces · défilez
          </p>
        </div>
        <div className="overflow-x-auto [scrollbar-width:none] md:overflow-visible">
          <div
            ref={piste}
            className="flex w-max items-center gap-6 px-[5vw] md:gap-10"
            style={{ transform: 'translateX(calc(var(--p) * var(--decal, 0px) * -1))' }}
          >
            {photos.map((p, i) => (
              <figure key={p.id} className={cn('shrink-0', i % 2 ? 'md:mt-24' : 'md:-mt-16')}>
                <div
                  className={cn(
                    'relative overflow-hidden bg-[var(--ad-sable-fonce)]',
                    formes[i % formes.length],
                    i % 3 === 0 ? 'h-[300px] w-[240px] md:h-[52svh] md:w-[30svh]' : 'h-[240px] w-[300px] md:h-[40svh] md:w-[52svh]',
                  )}
                >
                  <Image
                    src={p.url}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 768px) 300px, 50vh"
                    className="object-cover"
                    style={{ transform: `translateX(calc((var(--p) - ${i / photos.length}) * -60px)) scale(1.15)` }}
                  />
                </div>
                {p.caption && (
                  <figcaption className="mt-3 text-[14px] font-medium text-[var(--ad-gris)]">{p.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
        {/* La barre d'avancement de la promenade. */}
        <div aria-hidden="true" className="mx-[5vw] mt-12 h-px bg-[var(--ad-sable-fonce)] max-md:hidden">
          <div className="h-px origin-left bg-[var(--ad-nuit)]" style={{ transform: 'scaleX(var(--p))' }} />
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA CONVERSATION — on choisit une question ; elle part comme un
   message, Anne « écrit »… et sa réponse arrive.
   ══════════════════════════════════════════════════════════════════════ */

export function Conversation({ faq, prenom, portrait }: { faq: FaqItem[]; prenom: string; portrait: Media | null }) {
  const [choisie, setChoisie] = useState(0)
  const [ecrit, setEcrit] = useState(false)
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) {
      premier.current = false
      return
    }
    if (reduit()) return
    setEcrit(true)
    const t = window.setTimeout(() => setEcrit(false), 900)
    return () => window.clearTimeout(t)
  }, [choisie])
  const q = faq[choisie]
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
      <ul className="flex flex-wrap content-start gap-2.5">
        {faq.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setChoisie(i)}
              aria-pressed={choisie === i}
              className={cn(
                'rounded-full border px-4 py-2.5 text-left text-[14.5px] leading-[1.35] transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ad-ease)] hover:-translate-y-0.5',
                choisie === i
                  ? 'border-[var(--ad-nuit)] bg-[var(--ad-nuit)] text-white'
                  : 'border-[var(--ad-sable-fonce)] bg-transparent text-[var(--ad-nuit)] hover:border-[var(--ad-nuit)]',
              )}
            >
              {f.question}
            </button>
          </li>
        ))}
      </ul>
      <div className="relative flex min-h-[340px] flex-col rounded-[36px] bg-[var(--ad-sable)] p-6 sm:p-9" aria-live="polite">
        {q && (
          <div key={q.id} className="flex flex-1 flex-col gap-5">
            <p className="ml-auto max-w-[80%] rounded-[22px] rounded-br-[6px] bg-white px-5 py-3.5 text-[15px] leading-[1.5] text-[var(--ad-nuit)] shadow-[0_8px_24px_-12px_rgba(20,35,46,0.25)] motion-safe:animate-[ad-monter_0.6s_var(--ad-ease)_backwards]">
              {q.question}
            </p>
            <div className="flex items-end gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[12px] bg-[var(--ad-sable-fonce)]">
                {portrait && <Image src={portrait.url} alt="" fill sizes="40px" className="object-cover" />}
              </span>
              {ecrit ? (
                <span className="flex h-12 items-center gap-1.5 rounded-[22px] rounded-bl-[6px] bg-[var(--ad-nuit)] px-5" aria-label={`${prenom} écrit…`}>
                  {[0, 0.15, 0.3].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-[ad-points_1s_ease-in-out_infinite]" style={{ animationDelay: `${d}s` }} />
                  ))}
                </span>
              ) : (
                <p className="max-w-[88%] whitespace-pre-line rounded-[22px] rounded-bl-[6px] bg-[var(--ad-nuit)] px-5 py-4 text-[15px] leading-[1.65] text-white/90 motion-safe:animate-[ad-monter_0.7s_var(--ad-ease)_backwards]">
                  {q.answer.replace(/\*/g, '')}
                </p>
              )}
            </div>
            <p className="pl-[52px] text-[12px] uppercase tracking-[0.18em] text-[var(--ad-gris)]">{prenom} · répond en personne</p>
            <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--ad-sable-fonce)] pt-5">
              <span className="text-[13px] tabular-nums text-[var(--ad-gris)]">
                {choisie + 1} / {faq.length}
              </span>
              <button
                type="button"
                onClick={() => setChoisie((choisie + 1) % faq.length)}
                className="group inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ad-nuit)]"
              >
                Question suivante
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white transition-transform duration-500 ease-[var(--ad-ease)] group-hover:translate-x-1">
                  <ArrowUpRight className="h-4 w-4 rotate-45" />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA SEMAINE — les jours de consultation, aujourd'hui allumé, avec un
   pouls s'il est ouvert.
   ══════════════════════════════════════════════════════════════════════ */

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

export function Semaine({ horaires }: { horaires: OpeningHour[] }) {
  const [aujourdhui, setAujourdhui] = useState<number | null>(null)
  useEffect(() => setAujourdhui((new Date().getDay() + 6) % 7), [])
  const horaireDe = (j: string) => horaires.find((h) => h.day.toLowerCase().startsWith(j.slice(0, 3)))?.hours ?? null
  const ferme = (h: string | null) => !h || /ferm/i.test(h)
  const duJour = aujourdhui !== null ? horaireDe(JOURS[aujourdhui]!) : null
  return (
    <div>
      <p className="mb-5 flex items-center gap-3 text-[15px] text-[var(--ad-nuit)]">
        {aujourdhui !== null && (
          <>
            <span className="relative grid h-3 w-3 place-items-center">
              {!ferme(duJour) && <span className="absolute inset-0 rounded-full bg-[#6e9a6b] motion-safe:animate-[ad-pouls_1.8s_ease-out_infinite]" />}
              <span className={cn('relative h-2 w-2 rounded-full', ferme(duJour) ? 'bg-[var(--ad-gris)]' : 'bg-[#6e9a6b]')} />
            </span>
            {ferme(duJour) ? 'Le cabinet est fermé aujourd’hui' : `Ouvert aujourd’hui · ${duJour}`}
          </>
        )}
      </p>
      <ol className="grid grid-cols-7 gap-1.5">
        {JOURS.map((j, i) => {
          const h = horaireDe(j)
          const actif = i === aujourdhui
          return (
            <li
              key={j}
              title={h ?? 'Fermé'}
              className={cn(
                'flex flex-col items-center gap-2 rounded-full px-1 py-4 text-center transition-colors duration-500',
                actif ? 'bg-[var(--ad-nuit)] text-white' : ferme(h) ? 'bg-transparent text-[var(--ad-gris)]/60' : 'bg-[var(--ad-sable)] text-[var(--ad-nuit)]',
              )}
            >
              <span className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[20px] capitalize leading-none">{j.slice(0, 2)}</span>
              <span className={cn('h-1 w-1 rounded-full', ferme(h) ? 'bg-current/30' : actif ? 'bg-[var(--ad-or)]' : 'bg-[var(--ad-bleu)]')} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA LETTRE — le formulaire, comme une lettre : des lignes, pas des
   cases. Envoyée, elle s'envole ; une enveloppe se dessine à sa place.
   Le VRAI envoi : elle arrive dans « Messages » de l'administration.
   ══════════════════════════════════════════════════════════════════════ */

const LIGNE =
  'w-full border-0 border-b border-[var(--ad-sable-fonce)] bg-transparent px-0 py-3 font-[family-name:var(--ad-titre)] font-medium tracking-[-0.01em] text-[18px] text-[var(--ad-nuit)] outline-none transition-[border-color] duration-300 placeholder:text-[var(--ad-gris)]/50 focus:border-[var(--ad-nuit)]'

export function Lettre({ prenom }: { prenom: string }) {
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'envole' | 'ok'>('repos')
  const [longueur, setLongueur] = useState(0)
  const [erreur, setErreur] = useState<string | null>(null)

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setEtat('envoi')
    setErreur(null)
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          email: f.get('email'),
          phone: f.get('phone'),
          message: f.get('message'),
          consent: f.get('consent') === 'on',
          website: f.get('website'),
        }),
      })
      if (!r.ok) {
        const corps = (await r.json().catch(() => null)) as { error?: string } | null
        setErreur(corps?.error ?? 'La lettre n’est pas partie. Réessayez dans un instant.')
        return setEtat('repos')
      }
      setEtat('envole')
      window.setTimeout(() => setEtat('ok'), reduit() ? 0 : 750)
    } catch {
      setErreur('Connexion interrompue. Réessayez dans un instant.')
      setEtat('repos')
    }
  }

  if (etat === 'ok') {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[36px] bg-white p-10 text-center shadow-[0_30px_80px_-40px_rgba(20,35,46,0.35)]">
        <svg viewBox="0 0 120 84" className="h-24 w-32" aria-hidden="true">
          {['M6 10 h108 v64 h-108 z', 'M6 10 L60 50 L114 10', 'M6 74 L46 40', 'M114 74 L74 40'].map((d, i) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={i === 1 ? 'var(--ad-or)' : 'var(--ad-nuit)'}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              className="[--ad-longueur:1] motion-safe:animate-[ad-tracer_1.2s_var(--ad-ease)_backwards]"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </svg>
        <p className="mt-8 font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[40px] leading-none text-[var(--ad-nuit)]">
          Votre lettre est <em>partie</em>.
        </p>
        <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.6] text-[var(--ad-pierre)]">
          {prenom} vous répondra personnellement, en général sous 48 heures.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={envoyer}
      className={cn(
        'relative rounded-[36px] bg-white p-7 shadow-[0_30px_80px_-40px_rgba(20,35,46,0.35)] sm:p-12',
        etat === 'envole' && 'motion-safe:animate-[ad-envol_0.75s_var(--ad-ease)_forwards]',
      )}
    >
      <p className="font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[30px] text-[var(--ad-nuit)]">Chère {prenom},</p>
      <div className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Votre nom</span>
          <input name="name" required minLength={2} autoComplete="name" placeholder="Je m’appelle…" className={LIGNE} />
        </label>
        <label className="block">
          <span className="sr-only">Votre téléphone (facultatif)</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Mon téléphone (facultatif)" className={LIGNE} />
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">Votre adresse e-mail</span>
          <input name="email" type="email" required autoComplete="email" placeholder="Vous pouvez me répondre à…" className={LIGNE} />
        </label>
        <label className="block sm:col-span-2">
          <span className="sr-only">Votre message</span>
          <textarea
            name="message"
            required
            minLength={20}
            rows={5}
            placeholder="Je vous écris parce que…"
            onChange={(e) => setLongueur(e.currentTarget.value.trim().length)}
            aria-describedby="lettre-longueur"
            className={cn(
              LIGNE,
              'resize-none border-b-0 bg-[linear-gradient(transparent_calc(2.4em_-_1px),var(--ad-sable-fonce)_calc(2.4em_-_1px),var(--ad-sable-fonce)_2.4em,transparent_2.4em)] bg-[length:100%_2.4em] leading-[2.4em] [background-attachment:local]',
            )}
          />
          <span
            id="lettre-longueur"
            className={cn(
              'mt-2 flex items-center gap-1.5 text-[12px] transition-colors duration-300',
              longueur >= 20 ? 'text-[var(--ad-or)]' : 'text-[var(--ad-gris)]',
            )}
          >
            <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full transition-colors', longueur >= 20 ? 'bg-[var(--ad-or)] text-white' : 'border border-current')}>
              {longueur >= 20 && <Check className="h-2.5 w-2.5" />}
            </span>
            {longueur >= 20 ? 'C’est parfait.' : `Encore ${20 - longueur} caractère${20 - longueur > 1 ? 's' : ''} au moins`}
          </span>
        </label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="mt-6 flex items-start gap-3 text-[13px] leading-[1.5] text-[var(--ad-gris)]">
        <input name="consent" type="checkbox" required className="peer sr-only" />
        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-[var(--ad-sable-fonce)] transition-colors peer-checked:border-[var(--ad-nuit)] peer-checked:bg-[var(--ad-nuit)] peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--ad-bleu)] [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100">
          <Check className="h-3 w-3 text-white" />
        </span>
        J’accepte que mes coordonnées servent uniquement à me répondre.
      </label>
      {erreur && (
        <p role="alert" className="mt-4 rounded-[16px] bg-[#f3e1db] px-4 py-3 text-[14px] text-[#9a5a48]">
          {erreur}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <span className="text-[15px] font-medium text-[var(--ad-gris)]">— avec mes salutations</span>
        <button
          type="submit"
          disabled={etat !== 'repos'}
          className="group inline-flex items-center gap-3 rounded-full bg-[var(--ad-nuit)] py-2 pl-6 pr-2 text-[15px] font-medium text-white transition-opacity disabled:opacity-60"
        >
          {etat === 'repos' ? 'Envoyer la lettre' : 'Envoi…'}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ad-or)] transition-transform duration-500 ease-[var(--ad-ease)] group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LE FIL — la navigation : une pilule flottante qui se resserre quand on
   descend, et un fil d'or qui mesure la lecture. Sur téléphone, un
   rideau ivoire aux grands liens.
   ══════════════════════════════════════════════════════════════════════ */

export function Fil({ liens, rdv, logo }: { liens: { href: string; label: string }[]; rdv: string; logo: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [serre, setSerre] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  const [actif, setActif] = useState<string | null>(null)
  /* Le lien de la section qu'on lit s'allume. */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) if (e.isIntersecting) setActif(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const l of liens) {
      const el = document.getElementById(l.href.slice(1))
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [liens])
  useEffect(() => {
    let image = 0
    const calcule = () => {
      image = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      ref.current?.style.setProperty('--lu', String(max > 0 ? window.scrollY / max : 0))
      setSerre(window.scrollY > 80)
    }
    const demande = () => {
      if (!image) image = requestAnimationFrame(calcule)
    }
    calcule()
    window.addEventListener('scroll', demande, { passive: true })
    return () => {
      cancelAnimationFrame(image)
      window.removeEventListener('scroll', demande)
    }
  }, [])
  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [ouvert])

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div
          ref={ref}
          className={cn(
            'pointer-events-auto relative flex items-center gap-2 overflow-hidden rounded-full border border-white/60 bg-white/75 shadow-[0_10px_40px_-20px_rgba(20,35,46,0.3)] backdrop-blur-xl transition-[padding,gap,box-shadow] duration-700 ease-[var(--ad-ease)] [--lu:0]',
            serre ? 'py-1.5 pl-5 pr-1.5' : 'py-2.5 pl-6 pr-2.5',
          )}
        >
          <a href="#haut" className="group/logo mr-3 flex items-center gap-2.5 text-[20px] font-bold leading-none tracking-[-0.03em] text-[var(--ad-nuit)]">
            <LogoMark src={logo} priority className="h-8 w-8 transition-transform duration-700 ease-[var(--ad-ease)] group-hover/logo:rotate-[-12deg]" />
            <span className={cn('transition-[opacity,max-width] duration-700 ease-[var(--ad-ease)]', serre ? 'max-w-0 opacity-0 md:max-w-[120px] md:opacity-100' : 'max-w-[120px]')}>
              Anasawi<span className="text-[var(--ad-or)]">.</span>
            </span>
          </a>
          <nav aria-label="Sections" className="flex items-center max-md:hidden">
            {liens.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={actif === l.href ? 'location' : undefined}
                className="relative rounded-full px-3.5 py-2 text-[14px] text-[var(--ad-pierre)] transition-[color,background-color] duration-300 aria-[current=location]:bg-[var(--ad-sable)] aria-[current=location]:text-[var(--ad-nuit)] after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[var(--ad-ease)] hover:text-[var(--ad-nuit)] hover:after:origin-left hover:after:scale-x-100"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href={rdv}
            className={cn(
              'rounded-full bg-[var(--ad-nuit)] text-[14px] font-medium text-white transition-[padding] duration-700 ease-[var(--ad-ease)] max-md:hidden',
              serre ? 'px-4 py-2' : 'px-5 py-2.5',
            )}
          >
            Rendez-vous
          </a>
          <button
            type="button"
            onClick={() => setOuvert(true)}
            aria-label="Ouvrir le menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ad-nuit)] text-white md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          {/* Le fil d'or : ce qu'on a lu de la page. */}
          <span aria-hidden="true" className="absolute inset-x-6 bottom-0 h-[1.5px] origin-left bg-[var(--ad-or)]" style={{ transform: 'scaleX(var(--lu))' }} />
        </div>
      </div>

      {/* Le rideau du téléphone. */}
      <div
        className={cn(
          'fixed inset-0 z-[60] flex flex-col bg-[var(--ad-ivoire)] px-7 pb-10 pt-6 transition-[clip-path] duration-[800ms] ease-[var(--ad-ease)] md:hidden',
          ouvert ? '[clip-path:circle(150%_at_calc(100%-44px)_44px)]' : 'pointer-events-none [clip-path:circle(0%_at_calc(100%-44px)_44px)]',
        )}
        aria-hidden={!ouvert}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-[24px] font-bold tracking-[-0.03em]">
            <LogoMark src={logo} className="h-9 w-9" />
            Anasawi<span className="-ml-2.5 text-[var(--ad-or)]">.</span>
          </span>
          <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer le menu" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ad-sable-fonce)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav aria-label="Sections" className="mt-auto flex flex-col gap-1">
          {liens.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOuvert(false)}
              tabIndex={ouvert ? 0 : -1}
              className={cn(
                'font-[family-name:var(--ad-titre)] font-semibold tracking-[-0.03em] text-[46px] leading-[1.15] text-[var(--ad-nuit)] transition-[opacity,transform] duration-700 ease-[var(--ad-ease)]',
                ouvert ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              )}
              style={{ transitionDelay: ouvert ? `${0.15 + i * 0.06}s` : '0s' }}
            >
              <span className="mr-3 align-top text-[14px] text-[var(--ad-or)]">{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <a href={rdv} onClick={() => setOuvert(false)} tabIndex={ouvert ? 0 : -1} className="mt-10 rounded-full bg-[var(--ad-nuit)] py-4 text-center text-[16px] font-medium text-white">
          Prendre rendez-vous
        </a>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LE SOUFFLE — le cercle qui respire, et un exercice guidé d'une minute :
   un anneau qui se remplit, le nombre de respirations, l'arrêt à tout
   moment.
   ══════════════════════════════════════════════════════════════════════ */

const DUREE_EXERCICE = 64 // 8 respirations de 8 s

export function Souffle() {
  const [debut, setDebut] = useState<number | null>(null)
  const [ecoule, setEcoule] = useState(0)
  useEffect(() => {
    if (debut === null) return
    const t = window.setInterval(() => {
      const s = (Date.now() - debut) / 1000
      if (s >= DUREE_EXERCICE) {
        setDebut(null)
        setEcoule(DUREE_EXERCICE)
      } else setEcoule(s)
    }, 200)
    return () => window.clearInterval(t)
  }, [debut])
  const enCours = debut !== null
  const fini = !enCours && ecoule >= DUREE_EXERCICE
  const respirations = Math.min(8, Math.floor(ecoule / 8) + (enCours ? 1 : 0))

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative grid aspect-square w-full max-w-[400px] place-items-center">
        <span aria-hidden="true" className="absolute inset-0 rounded-full border border-[var(--ad-sable-fonce)]" />
        {/* L'anneau de l'exercice. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="49.4"
            fill="none"
            stroke="var(--ad-or)"
            strokeWidth="0.8"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            style={{ strokeDashoffset: 1 - ecoule / DUREE_EXERCICE, transition: 'stroke-dashoffset 0.3s linear' }}
          />
        </svg>
        <span aria-hidden="true" className="absolute inset-[13%] rounded-full border border-dashed border-[var(--ad-or)]/40 motion-safe:animate-[ad-tourner_60s_linear_infinite]" />
        {/* La clé `debut` relance l'animation : l'exercice démarre sur une inspiration. */}
        <span
          key={`c-${debut ?? 'repos'}`}
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_32%,#ffffff_0%,var(--ad-brume)_48%,#c9e3ee_100%)] shadow-[0_40px_100px_-30px_rgba(47,111,147,0.45)] motion-safe:animate-[ad-souffle_8s_var(--ad-ease-lent)_infinite]"
        />
        <span key={`t-${debut ?? 'repos'}`} className="relative grid place-items-center text-[30px] font-semibold tracking-[-0.03em] text-[var(--ad-nuit)]">
          <span className="col-start-1 row-start-1 motion-safe:animate-[ad-inspirez_8s_linear_infinite]">Inspirez</span>
          <span className="col-start-1 row-start-1 opacity-0 motion-safe:animate-[ad-expirez_8s_linear_infinite]">Expirez</span>
        </span>
      </div>
      <div className="flex items-center gap-4" aria-live="polite">
        <button
          type="button"
          onClick={() => {
            if (enCours) setDebut(null)
            else {
              setEcoule(0)
              setDebut(Date.now())
            }
          }}
          className="group inline-flex items-center gap-3 rounded-full bg-[var(--ad-nuit)] py-2 pl-5 pr-2 text-[14px] font-semibold text-white"
        >
          {enCours ? 'Arrêter' : fini ? 'Recommencer' : 'Respirer une minute'}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
            {enCours ? <X className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />}
          </span>
        </button>
        <span className="text-[13px] tabular-nums text-[var(--ad-gris)]">
          {enCours ? `Respiration ${respirations} / 8` : fini ? 'Bravo. Prenez ce calme avec vous.' : '8 respirations · 4 s · 4 s'}
        </span>
      </div>
    </div>
  )
}
