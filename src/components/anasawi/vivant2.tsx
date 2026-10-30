'use client'

import { ArrowUpRight, Pause, Play, Plus } from 'lucide-react'
import Image from 'next/image'
import { useContext, useEffect, useRef, useState } from 'react'

import { Edition, Incline, Reflet, useAvancement } from './vivant'
import { cn } from '@/lib/utils'
import type { FaqItem, Media } from '@/server/db/schema'

/**
 * Les composants vivants des MODÈLES de la version moderne (les sections
 * qu'on ajoute depuis la bibliothèque de l'éditeur). Même principe que
 * `vivant.tsx` : le défilement écrit `--p`, le style fait le reste.
 */

const reduit = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ══════════════════════════════════════════════════════════════════════
   PLEIN CADRE — la photo occupe l'écran, avance à peine (Ken Burns) et
   s'enfonce au défilement (parallaxe) ; le nom, en blanc, posé dessus.
   ══════════════════════════════════════════════════════════════════════ */

export function PleinCadre({ photo, children }: { photo: Media | null; children: React.ReactNode }) {
  const ref = useAvancement<HTMLElement>('passage')
  return (
    <section ref={ref} className="relative h-[calc(var(--ad-vh)*94)] min-h-[560px] overflow-hidden bg-[var(--ad-nuit)] [--p:0.5]">
      <div className="absolute inset-[-8%_0]" style={{ transform: 'translateY(calc((var(--p) - 0.5) * 18%))' }}>
        {photo && (
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover motion-safe:animate-[ad-kenburns_9s_cubic-bezier(0.22,1,0.36,1)_both]"
          />
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(46,66,79,0.15)_0%,rgba(46,66,79,0.1)_40%,rgba(46,66,79,0.78)_100%)]" />
      <div className="relative flex h-full flex-col justify-end px-[5vw] pb-[calc(var(--ad-vh)*9)] text-white">{children}</div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LE PARCOURS — une frise : le trait se remplit à la lecture, chaque
   étape s'allume au passage.
   ══════════════════════════════════════════════════════════════════════ */

export function Frise({ etapes }: { etapes: { annee: string; titre: string; texte: string }[] }) {
  const ref = useAvancement<HTMLOListElement>('passage')
  const n = Math.max(1, etapes.length)
  const avance = 'clamp(0, calc((var(--p) - 0.15) * 1.8), 1)'
  return (
    <ol ref={ref} className="relative grid gap-10 [--p:1] md:gap-6" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {/* Le trait, et sa part remplie. */}
      <span aria-hidden="true" className="absolute left-0 right-0 top-[11px] h-px bg-[var(--ad-sable-fonce)] max-md:hidden" />
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 top-[11px] h-[2px] origin-left bg-[linear-gradient(90deg,#46728a,#7ba3b6)] max-md:hidden"
        style={{ transform: `scaleX(${avance})` }}
      />
      {etapes.map((e, i) => {
        const allume = `clamp(0, calc((${avance} - ${(i + 0.2) / n}) * 10), 1)`
        return (
          <li key={i} className="relative max-md:col-span-full">
            <span
              aria-hidden="true"
              className="relative z-[1] grid h-6 w-6 place-items-center rounded-full border-2 border-[var(--ad-sable-fonce)] bg-[var(--ad-ivoire)]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--ad-or)]" style={{ transform: `scale(${allume})` }} />
            </span>
            <div style={{ opacity: `calc(0.35 + ${allume} * 0.65)`, transform: `translateY(calc((1 - ${allume}) * 10px))` }}>
              <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--ad-bleu)]">{e.annee}</p>
              <h3 className="mt-2 text-[22px]">{e.titre}</h3>
              {e.texte && <p className="mt-2 text-[15px] leading-[1.65] text-[var(--ad-pierre)]">{e.texte}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LES ENGAGEMENTS — des cartes dont la lumière suit la souris.
   ══════════════════════════════════════════════════════════════════════ */

export function CarteLumiere({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--lx', `${e.clientX - r.left}px`)
        el.style.setProperty('--ly', `${e.clientY - r.top}px`)
      }}
      className={cn(
        'group/lumiere relative overflow-hidden rounded-[28px] bg-white p-8 shadow-[0_1px_2px_rgba(46,66,79,0.05),0_20px_50px_-30px_rgba(46,66,79,0.25)] transition-[translate,box-shadow] duration-500 ease-[var(--ad-ease)] [--lx:50%] [--ly:50%] hover:-translate-y-1',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(420px_circle_at_var(--lx)_var(--ly),rgba(79,169,166,0.14),transparent_45%)] group-hover/lumiere:opacity-100"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA LISTE VIVANTE — des lignes ; au survol, la photo de la ligne flotte
   et suit la souris, la ligne glisse, sa flèche pivote.
   ══════════════════════════════════════════════════════════════════════ */

export function ListeVivante({
  lignes,
  rdv,
}: {
  lignes: { id: string; titre: string; extrait: string; duree: string | null; photo: Media | null; famille: string | null }[]
  rdv: string
}) {
  const zone = useRef<HTMLUListElement>(null)
  const vignette = useRef<HTMLDivElement>(null)
  const [survol, setSurvol] = useState<number | null>(null)
  const bouge = (e: React.PointerEvent) => {
    const z = zone.current
    const v = vignette.current
    if (!z || !v || e.pointerType !== 'mouse') return
    const r = z.getBoundingClientRect()
    v.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`
  }
  const photo = survol !== null ? lignes[survol]?.photo : null
  return (
    <ul ref={zone} onPointerMove={bouge} onPointerLeave={() => setSurvol(null)} className="relative border-t border-[var(--ad-sable-fonce)]">
      {/* La vignette qui suit la souris (grand écran, souris seulement). */}
      <div
        ref={vignette}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-0 top-0 z-20 h-[220px] w-[170px] transition-opacity duration-300 max-lg:hidden',
          photo ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className={cn('relative h-full w-full overflow-hidden rounded-[22px] shadow-[0_30px_60px_-20px_rgba(46,66,79,0.45)] transition-transform duration-500 ease-[var(--ad-ease)]', photo ? 'rotate-[-4deg] scale-100' : 'rotate-0 scale-75')}>
          {lignes.map((l, i) =>
            l.photo ? (
              <Image
                key={l.id}
                src={l.photo.url}
                alt=""
                fill
                sizes="170px"
                className={cn('object-cover transition-opacity duration-300', survol === i ? 'opacity-100' : 'opacity-0')}
              />
            ) : null,
          )}
        </div>
      </div>
      {lignes.map((l, i) => (
        <li key={l.id} className="border-b border-[var(--ad-sable-fonce)]">
          <a
            href={rdv}
            onPointerEnter={() => setSurvol(i)}
            onFocus={() => setSurvol(i)}
            className="group flex items-center gap-6 py-7 transition-[padding] duration-500 ease-[var(--ad-ease)] hover:pl-4 focus-visible:outline-2 focus-visible:outline-[var(--ad-bleu)]"
          >
            <span className="w-10 shrink-0 text-[14px] font-semibold tabular-nums text-[var(--ad-gris)]">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[26px] font-semibold tracking-[-0.03em] text-[var(--ad-nuit)] transition-colors duration-300 group-hover:text-[var(--ad-bleu)] md:text-[34px]">
                {l.titre}
              </span>
              <span className="mt-1 block max-w-[60ch] text-[15px] leading-[1.6] text-[var(--ad-pierre)]">{l.extrait}</span>
            </span>
            {l.duree && (
              <span className="shrink-0 rounded-full bg-[var(--ad-sable)] px-3 py-1 text-[13px] font-semibold text-[var(--ad-pierre)] max-sm:hidden">{l.duree}</span>
            )}
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--ad-sable-fonce)] transition-[background-color,color,transform,border-color] duration-500 ease-[var(--ad-ease)] group-hover:rotate-45 group-hover:border-[var(--ad-nuit)] group-hover:bg-[var(--ad-nuit)] group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   L'ACCORDÉON — une question s'ouvre en douceur, sa croix pivote.
   ══════════════════════════════════════════════════════════════════════ */

export function Accordeon({ faq }: { faq: FaqItem[] }) {
  const [ouverte, setOuverte] = useState<string | null>(faq[0]?.id ?? null)
  return (
    <ul className="flex flex-col gap-3">
      {faq.map((f) => {
        const open = ouverte === f.id
        return (
          <li
            key={f.id}
            className={cn(
              'rounded-[24px] transition-[background-color,box-shadow] duration-500',
              open ? 'bg-white shadow-[0_1px_2px_rgba(46,66,79,0.05),0_24px_50px_-30px_rgba(46,66,79,0.3)]' : 'bg-[var(--ad-sable)] hover:bg-[var(--ad-sable-fonce)]/60',
            )}
          >
            <button
              type="button"
              onClick={() => setOuverte(open ? null : f.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-4 rounded-[24px] px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-[var(--ad-bleu)]"
            >
              <span className="min-w-0 flex-1 text-[17px] font-semibold tracking-[-0.015em] text-[var(--ad-nuit)]">{f.question}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  open ? 'rotate-[135deg] bg-[var(--ad-nuit)] text-white' : 'bg-white text-[var(--ad-nuit)]',
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ad-ease)]', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-6 pb-6 text-[15px] leading-[1.7] text-[var(--ad-pierre)]">{f.answer.replace(/\*/g, '')}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA MOSAÏQUE — chaque tuile a sa propre profondeur au défilement, et
   s'incline vers la souris.
   ══════════════════════════════════════════════════════════════════════ */

export function Mosaique({ photos }: { photos: Media[] }) {
  const ref = useAvancement<HTMLDivElement>('passage')
  const formes = ['md:col-span-2 md:row-span-2', '', 'md:row-span-2', '', 'md:col-span-2', '', '']
  const vitesses = [40, -30, 60, -20, 30, -50, 20]
  return (
    <div ref={ref} className="grid auto-rows-[200px] grid-cols-2 gap-4 [--p:0.5] md:auto-rows-[240px] md:grid-cols-4">
      {photos.slice(0, 7).map((p, i) => (
        <div key={p.id} className={cn('min-h-0', formes[i])} style={{ transform: `translateY(calc((var(--p) - 0.5) * ${vitesses[i]}px))` }}>
          <Incline max={5} className="h-full">
            <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-[var(--ad-sable-fonce)]">
              <Image src={p.url} alt={p.alt} fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover transition-transform duration-[1200ms] ease-[var(--ad-ease)] group-data-[survol=oui]/incline:scale-[1.05]" />
              {p.caption && (
                <span className="absolute bottom-3 left-3 z-20 rounded-full bg-white/85 px-3 py-1 text-[12px] font-semibold text-[var(--ad-nuit)] opacity-0 backdrop-blur transition-opacity duration-300 group-data-[survol=oui]/incline:opacity-100">
                  {p.caption}
                </span>
              )}
            </div>
          </Incline>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LA VIDÉO — un cadre qui s'élargit en arrivant au centre de l'écran ;
   lecture muette en boucle quand on la voit, un bouton pour l'arrêter.
   ══════════════════════════════════════════════════════════════════════ */

export function VideoCadre({ video, affiche }: { video: Media | null; affiche: Media | null }) {
  const ref = useAvancement<HTMLDivElement>('passage')
  const lecteur = useRef<HTMLVideoElement>(null)
  const edition = useContext(Edition)
  const [enLecture, setEnLecture] = useState(false)
  useEffect(() => {
    const v = lecteur.current
    if (!v || edition || reduit()) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) v.play().then(() => setEnLecture(true)).catch(() => {})
        else {
          v.pause()
          setEnLecture(false)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [edition])
  /* De 82 % à pleine largeur en arrivant au milieu de l'écran. */
  const largeur = 'min(1, calc(0.82 + var(--p) * 0.36))'
  return (
    <div ref={ref} className="[--p:0.5]">
      <div className="relative mx-auto aspect-video overflow-hidden rounded-[36px] bg-[var(--ad-nuit)] shadow-[0_50px_100px_-50px_rgba(46,66,79,0.6)]" style={{ transform: `scale(${largeur})` }}>
        {video ? (
          <video ref={lecteur} src={video.url} poster={affiche?.url} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
        ) : affiche ? (
          <Image src={affiche.url} alt={affiche.alt} fill sizes="100vw" className="object-cover" />
        ) : null}
        {video && (
          <button
            type="button"
            onClick={() => {
              const v = lecteur.current
              if (!v) return
              if (v.paused) v.play().then(() => setEnLecture(true)).catch(() => {})
              else {
                v.pause()
                setEnLecture(false)
              }
            }}
            aria-label={enLecture ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
            className="group absolute bottom-6 left-6 grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[var(--ad-nuit)] backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
          >
            {enLecture ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   TEXTE & IMAGE — l'image se dévoile de bas en haut à la lecture, en se
   resserrant légèrement.
   ══════════════════════════════════════════════════════════════════════ */

export function ImageDevoilee({ photo }: { photo: Media | null }) {
  const ref = useAvancement<HTMLDivElement>('passage')
  const ouvert = 'clamp(0, calc((var(--p) - 0.1) * 2.4), 1)'
  return (
    <div ref={ref} className="[--p:1]">
      <Incline max={5} className="aspect-[4/5]">
        <div
          className="relative h-full w-full overflow-hidden rounded-[32px] bg-[var(--ad-sable-fonce)]"
          style={{ clipPath: `inset(calc((1 - ${ouvert}) * 100%) 0 0 0 round 32px)` }}
        >
          {photo && (
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
              style={{ transform: `scale(calc(1.25 - ${ouvert} * 0.25))` }}
            />
          )}
        </div>
      </Incline>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CARTES EMPILÉES — les étapes se posent l'une sur l'autre au défilement
   (chacune reste accrochée un peu plus bas que la précédente).
   ══════════════════════════════════════════════════════════════════════ */

export function Pile({ etapes }: { etapes: { titre: string; texte: string }[] }) {
  const edition = useContext(Edition)
  const teintes = ['#ffffff', '#f4ece0', '#eaf1f4', '#f1e7da', '#e8ece6', '#efe5d6']
  return (
    <ol className="flex flex-col gap-6">
      {etapes.map((e, i) => (
        <li
          key={i}
          className={cn('rounded-[32px] p-8 shadow-[0_-20px_50px_-30px_rgba(46,66,79,0.25)] md:p-12', !edition && 'sticky')}
          style={{ top: `calc(110px + ${i * 26}px)`, background: teintes[i % teintes.length] }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-14">
            <span className="text-[64px] font-semibold leading-none tracking-[-0.05em] text-[var(--ad-nuit)]/15 md:text-[96px]">{String(i + 1).padStart(2, '0')}</span>
            <div className="max-w-[52ch]">
              <h3 className="text-[30px] md:text-[40px]">{e.titre}</h3>
              {e.texte && <p className="mt-4 text-[17px] leading-[1.7] text-[var(--ad-pierre)]">{e.texte}</p>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export { Reflet }
