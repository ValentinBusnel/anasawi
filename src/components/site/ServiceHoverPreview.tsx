'use client'

import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

import { EASE, useAnimEnabled } from '@/components/site/anim'
import type { ServiceWithMedia } from '@/server/db/schema'
import { numberWordFr } from '@/lib/format'

/*
 * Carte flottante au survol d'un accompagnement.
 *
 * Une carte en verre dépoli, façon iOS, qui suit la souris avec un retard
 * élastique : l'index, le titre, la description longue, la durée — et
 * l'invitation à ouvrir la fiche. Format portrait, étroit et haut. La page
 * transparaît à travers elle, floutée et saturée ; rien d'autre ne change.
 *
 * Elle s'anime à l'ouverture et à la fermeture seulement. D'une rangée à
 * l'autre, le contenu se remplace sans transition : la carte est déjà là,
 * on lit la suite. Sa hauteur suit le texte à partir d'un minimum fixe ; on
 * la mesure en direct pour la retenir dans la fenêtre. Au-delà de l'écran,
 * le texte s'estompe vers le bas — la fiche a le reste.
 *
 * Pointeurs fins seulement : au doigt, rien ne survole, et la fiche s'ouvre
 * au toucher. Inerte au pointeur, pour ne jamais intercepter le clic.
 */

/* Format paysage : large et basse, un seul paragraphe. */
const CARD_W = 560
const CARD_MIN_H = 220
/* Décalage : à droite du curseur, centrée verticalement sur lui. */
const OFFSET_X = 32
const MARGIN = 14


/** Vrai quand un survol a un sens : pointeur fin, qui sait survoler. */
export function useCanHover(): boolean {
  const [can, setCan] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCan(media.matches)
    const onChange = (event: MediaQueryListEvent) => setCan(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return can
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

export function ServiceHoverPreview({
  service,
  index,
  pointerX,
  pointerY,
}: {
  /** L'accompagnement survolé ; `null` cache la carte. */
  service: ServiceWithMedia | null
  /** Rang, pour l'index en toutes lettres. */
  index: number
  /** Position brute du curseur dans la fenêtre — des valeurs de mouvement,
      mises à jour hors du cycle de rendu React. */
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
}) {
  const on = useAnimEnabled()
  const visible = service !== null

  /* Valeurs brutes → ressorts : la carte court après le curseur. */
  const spring = { stiffness: 260, damping: 30, mass: 0.7 }
  const x = useSpring(pointerX, spring)
  const y = useSpring(pointerY, spring)

  /* À l'apparition, les ressorts sautent sur le curseur au lieu d'y courir
     depuis leur dernière position — ou depuis l'origine, la première fois. */
  useEffect(() => {
    if (!visible) return
    x.jump(pointerX.get())
    y.jump(pointerY.get())
  }, [visible, x, y, pointerX, pointerY])

  /* Plus d'inclinaison selon la vitesse de la souris : la carte suit le
     curseur, droite. */

  /* La dernière fiche survolée reste affichée pendant le fondu de sortie. */
  const [shown, setShown] = useState<{
    service: ServiceWithMedia
    index: number
  } | null>(null)
  useEffect(() => {
    if (service) setShown({ service, index })
  }, [service, index])

  /* Hauteur réelle de la carte, mesurée : elle change avec le texte. */
  const cardRef = useRef<HTMLElement>(null)
  const cardH = useMotionValue(CARD_MIN_H)
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    /* Le texte est borné à quatre lignes (`line-clamp`) : plus besoin de
       mesurer un débordement, seule la hauteur de la carte compte. */
    const measure = () => cardH.set(card.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    return () => observer.disconnect()
    /* Sur `shown`, pas `service` : la carte n'est montée qu'au rendu qui
       suit la mise à jour de `shown`. */
  }, [cardH, shown])

  /* Position finale : décalée du curseur, retenue dans la fenêtre. */
  const left = useTransform(x, (v) =>
    Math.min(
      Math.max(v + OFFSET_X, MARGIN),
      (typeof window === 'undefined' ? 1280 : window.innerWidth) - CARD_W - MARGIN,
    ),
  )
  const top = useTransform([y, cardH], ([v, h]) => {
    const height = typeof window === 'undefined' ? 800 : window.innerHeight
    const wanted = (v as number) - (h as number) / 2
    return Math.min(Math.max(wanted, MARGIN), height - (h as number) - MARGIN)
  })

  /* Portail vers <body> : hors de tout ancêtre transformé ou rogné. */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !shown) return null

  const body = paragraphs(shown.service.body)
  const texte = body.length > 0 ? body : [shown.service.excerpt]
  const duration = on ? (visible ? 0.35 : 0.2) : 0

  return createPortal(
    <>
      <m.div
        aria-hidden="true"
        className="pointer-events-none fixed z-[60] hidden md:block"
        style={{ left, top, width: CARD_W }}
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.98,
          y: visible ? 0 : 6,
        }}
        transition={{ duration, ease: EASE }}
      >
        {/* Pas de clé ni de transition sur le contenu : d'une rangée à
            l'autre, il se remplace instantanément. */}
        <article
          ref={cardRef}
          style={{ minHeight: CARD_MIN_H, maxHeight: `calc(100vh - ${MARGIN * 2}px)` }}
          /* Carte contemporaine : blanc franc, grands arrondis, filet à
             peine visible, ombre diffuse. La photo de l'accompagnement à
             gauche, le texte à droite, des étiquettes en pastilles plutôt
             qu'en capitales espacées, et un vrai bouton. */
          className="flex gap-5 overflow-hidden rounded-[22px] border border-black/[0.06] bg-white p-3 text-ink shadow-[0_24px_60px_-24px_rgba(46,66,79,0.35)]"
        >
          {shown.service.media && (
            <div className="relative w-[168px] shrink-0 self-stretch overflow-hidden rounded-[16px] bg-sand">
              <Image
                src={shown.service.media.url}
                alt=""
                fill
                sizes="168px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-blue-mist px-2.5 py-1 text-[11.5px] font-medium text-blue-ink">
                {shown.service.method ||
                  shown.service.group?.label.trim() ||
                  `Accompagnement ${numberWordFr(shown.index)}`}
              </span>
              {shown.service.duration && (
                <span className="rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11.5px] font-medium text-ink-soft">
                  {shown.service.duration}
                </span>
              )}
            </div>

            <h4 className="mt-3 font-serif text-[27px] leading-[1.1]">
              {shown.service.title}
            </h4>

            {/* Le premier paragraphe, sur quatre lignes au plus : la fiche
                a le reste. */}
            <div className="mt-2.5 min-h-0 flex-1">
              <p className="line-clamp-4 text-[14px] leading-[1.65] text-ink-soft">
                {texte[0]}
              </p>
            </div>

            <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-deep px-4 py-2 text-[12.5px] font-medium text-ivory">
              Ouvrir la fiche
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </article>
      </m.div>
    </>,
    document.body,
  )
}
