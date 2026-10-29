'use client'

import { m, useInView, useReducedMotion } from 'motion/react'
import {
  Children,
  Fragment,
  createContext,
  useContext,
  useId,
  useRef,
  type ElementType,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════════════
   ANASAWI — primitives d'animation (planche V8)

   Toutes les primitives partagent le même mécanisme : quand l'animation
   est coupée — via <AnimProvider enabled={false}> (éditeur admin,
   vignettes de la bibliothèque) ou via prefers-reduced-motion — chacune
   rend son ÉTAT FINAL immédiatement. Aucune opacité 0, aucun masque :
   le contenu n'est jamais invisible hors du site public.

   Tout est en `m.*` (LazyMotion strict) : chaque consommateur doit être
   sous le <MotionProvider> du projet.
   ══════════════════════════════════════════════════════════════════════ */

/** Courbe signature de la maquette — cubic-bezier(.22,1,.36,1). */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Déclenchement standard : une fois, dès ~12 % visible, à peine sous
    le bord bas. Avant (20 %, -10 %), une section commençait à s'animer
    alors qu'elle était déjà bien entrée dans l'écran : on la voyait
    vide, puis arriver — une lenteur, pas une élégance. */
const VIEWPORT = { once: true, amount: 0.12, margin: '0px 0px -4% 0px' } as const

/**
 * Tempo des délais d'échelonnement.
 *
 * Les modèles échelonnent leurs éléments (titre, texte, boutons) par des
 * délais absolus, écrits à la main : 0.5 s, 0.62 s, 0.7 s… Additionnés à
 * la durée du mouvement, un bouton n'était cliquable qu'une bonne seconde
 * et demie après l'entrée de sa section. Plutôt que de retoucher chaque
 * modèle, le tempo réduit tous les délais d'un même facteur : l'ordre et
 * le rythme relatif restent, l'attente tombe.
 */
const TEMPO = 0.35
const tempo = (delay: number) => delay * TEMPO

/* ── AnimProvider ──────────────────────────────────────────────────── */

const AnimContext = createContext<boolean>(true)

/**
 * Coupe (ou rétablit) toutes les primitives d'animation en dessous.
 * Défaut : activé. L'éditeur et les aperçus de la bibliothèque enveloppent
 * leur rendu de `<AnimProvider enabled={false}>` pour un rendu statique.
 */
export function AnimProvider({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  return <AnimContext.Provider value={enabled}>{children}</AnimContext.Provider>
}

/**
 * Vrai si les animations doivent jouer : contexte activé ET pas de
 * prefers-reduced-motion. C'est le seul interrupteur des primitives.
 */
export function useAnimEnabled(): boolean {
  const enabled = useContext(AnimContext)
  const reduced = useReducedMotion()
  return enabled && !reduced
}

/* ══════════════════════════════════════════════════════════════════════
   UN SEUL GESTE D'APPARITION

   Le site animait chaque chose à sa façon : lettres une à une, lignes
   sorties d'un masque, photos dévoilées par un rideau avec zoom, chiffres
   qui défilent, mots qui s'allument. Pris un à un, des gestes soignés ;
   ensemble, une page qui bouge sans cesse et détourne du contenu.

   Toutes les primitives ci-dessous partagent désormais le même geste :
   un fondu, porté par une montée de quelques pixels, court. Leurs props
   sont inchangées — les templates et les contenus enregistrés n'ont rien
   à savoir de ce changement.
   ══════════════════════════════════════════════════════════════════════ */

/** Montée de l'apparition, en pixels. */
const RISE = 10
/** Durée de l'apparition, en secondes. */
const DURATION = 0.55

/** Le geste commun : fondu montant, déclenché à l'entrée dans l'écran. */
function Appear({
  as = 'div',
  delay = 0,
  className,
  children,
}: {
  as?: 'div' | 'span'
  delay?: number
  className?: string
  children: ReactNode
}) {
  const Comp = as === 'span' ? m.span : m.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION, ease: EASE, delay: tempo(delay) }}
    >
      {children}
    </Comp>
  )
}

/* ── Reveal ──────────────────────────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  /** Décalage en secondes (la maquette échelonne par pas de 0.1). */
  delay?: number
  className?: string
}) {
  const on = useAnimEnabled()
  if (!on) return <div className={className}>{children}</div>
  return (
    <Appear delay={delay} className={className}>
      {children}
    </Appear>
  )
}

/* ── MaskLines ─────────────────────────────────────────────────────────
   Chaque enfant est une ligne. Le bloc apparaît d'un seul geste : plus de
   lignes qui montent une à une depuis un masque. `step` est conservé
   pour l'API. */

export function MaskLines({
  children,
  delay = 0,
  className,
  lineClassName,
}: {
  /** Un enfant = une ligne (spans, fragments…). */
  children: ReactNode
  delay?: number
  /** Écart entre deux lignes, en secondes (sans effet : un seul geste). */
  step?: number
  className?: string
  /** Classes posées sur chaque conteneur de ligne. */
  lineClassName?: string
}) {
  const on = useAnimEnabled()
  const lines = Children.toArray(children).map((line, i) => (
    <div key={i} className={lineClassName}>
      {line}
    </div>
  ))

  if (!on) return <div className={className}>{lines}</div>
  return (
    <Appear delay={delay} className={className}>
      {lines}
    </Appear>
  )
}

/* ── SplitChars ────────────────────────────────────────────────────────
   Le texte du hero. Il n'est plus découpé lettre à lettre : il apparaît
   d'un bloc. Les MOTS restent insécables — un mot trop large déborde, ce
   que `TitreAjuste` mesure et corrige en réduisant le titre. */

export function SplitChars({
  text,
  italic = false,
  delay = 0,
  className,
  as,
}: {
  text: string
  /** Rend l'ensemble en italique (équivalent du <em> de la maquette). */
  italic?: boolean
  delay?: number
  className?: string
  /** Balise du conteneur — 'span' par défaut. */
  as?: ElementType
}) {
  const on = useAnimEnabled()
  const Comp: ElementType = as ?? 'span'

  const mots = text.split(' ').map((mot, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className="whitespace-nowrap">{mot}</span>
    </Fragment>
  ))

  return (
    /* `aria-label` : le repère de la LIGNE (son texte entier). L'admin
       pose chaque ligne du hero à gauche, au centre ou à droite, et les
       tests vérifient ce placement en mesurant cet élément-là. */
    <Comp className={cn('block', italic && 'italic', className)} aria-label={text}>
      {on ? (
        <Appear as="span" delay={delay} className="block">
          {mots}
        </Appear>
      ) : (
        mots
      )}
    </Comp>
  )
}

/* ── Counter ───────────────────────────────────────────────────────────
   Le chiffre, tel quel. Un nombre qui défile de 0 à sa valeur attire
   l'œil sur l'animation plutôt que sur ce qu'il dit — et se lit faux
   pendant une seconde. `duration` est conservé pour l'API. */

export function Counter({
  value,
  className,
}: {
  value: number
  /** Sans effet : le chiffre est affiché directement. */
  duration?: number
  className?: string
}) {
  return <span className={className}>{value}</span>
}

/* ── ImageVeil ─────────────────────────────────────────────────────────
   L'image apparaît en fondu, une fois chargée — plus de rideau découpé
   ni de zoom. Le conteneur porte l'arrondi (arche…).

   `data-veil` (« ferme » / « ouvert ») est conservé : il dit si l'image
   est montrée, et les tests s'en servent pour vérifier qu'elle ne
   l'est jamais avant d'être chargée. */

type VeilTone = 'ivory' | 'sand' | 'cream'

/** Masque radial : force le rognage net sur l'arrondi (sans liseré). */
const VEIL_FRAME =
  'relative isolate overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]'

export function ImageVeil({
  children,
  delay = 0,
  className,
  ready = true,
}: {
  /** L'image (ou tout contenu) à dévoiler. */
  children: ReactNode
  /** Conservé pour l'API. */
  tone?: VeilTone
  delay?: number
  className?: string
  /** Faux tant que l'image n'est pas chargée : elle reste masquée. */
  ready?: boolean
}) {
  const on = useAnimEnabled()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, VIEWPORT)

  /* L'image déborde d'un pixel et finit à 1.02 : à l'échelle exacte, ses
     bords coïncident avec ceux du cadre et l'anti-aliasing dessine un
     contour sombre sur l'arrondi. */
  const image = (
    <div className="absolute -inset-px scale-[1.02] rounded-[inherit]">{children}</div>
  )

  if (!on) return <div className={cn(VEIL_FRAME, className)}>{image}</div>

  const ouvert = inView && ready
  return (
    <div ref={ref} className={cn(VEIL_FRAME, className)} data-veil={ouvert ? 'ouvert' : 'ferme'}>
      <m.div
        className="absolute inset-0 rounded-[inherit]"
        initial={{ opacity: 0 }}
        animate={{ opacity: ouvert ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: ouvert ? tempo(delay) : 0 }}
      >
        {image}
      </m.div>
    </div>
  )
}

/* ── Marquee ───────────────────────────────────────────────────────────
   Bandeau infini à tempo constant : contenu dupliqué, translateX -50 %
   en CSS. `prefers-reduced-motion` fige l'animation (règle globale). */

export function Marquee({
  children,
  duration = 38,
  className,
}: {
  children: ReactNode
  /** Durée d'un cycle complet, en secondes. */
  duration?: number
  className?: string
}) {
  const on = useAnimEnabled()

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max whitespace-nowrap',
          on && 'anasawi-marquee will-change-transform',
        )}
        style={on ? { animationDuration: `${duration}s` } : undefined}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── CircleText ────────────────────────────────────────────────────────
   Texte posé sur un cercle, immobile. `center` pose un glyphe au
   milieu — l'astérisque ✳︎ de la marque, typiquement. */

export function CircleText({
  text,
  size = 120,
  center,
  radius = 44,
  textClassName,
  centerClassName,
  className,
}: {
  /** Texte de la couronne — terminer par « · » pour une boucle propre. */
  text: string
  /** Côté du carré SVG, en pixels (viewBox 120 constant). */
  size?: number
  /** Glyphe central optionnel, ex. '✳︎'. */
  center?: string
  /** Sans effet : le cercle ne tourne plus. Conservé pour l'API. */
  duration?: number
  /** Rayon du cercle dans le viewBox 120 — 44 (hero) ou 56 (médaillon). */
  radius?: number
  /** Style du texte — défaut : bleu profond 10.4px / .32em (hero A).
      Le médaillon L passe `fill-stone text-[6.5px] tracking-[0.42em]`. */
  textClassName?: string
  /** Style du glyphe central — à passer en blanc quand la couronne est
      posée en inversion (`text-invert`) au-dessus d'une image. */
  centerClassName?: string
  className?: string
}) {
  const pathId = useId()
  const r = Math.max(10, Math.min(radius, 58))

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      /* Immobile : un texte qui tourne en continu tire l'œil sans rien
         dire de plus. `duration` est conservé pour l'API. */
      className={className}
    >
      <defs>
        <path
          id={pathId}
          d={`M60,60 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`}
          fill="none"
        />
      </defs>
      <text
        className={cn(
          'font-sans font-semibold uppercase',
          textClassName ??
            'fill-blue-deep text-[10.4px] tracking-[0.32em]',
        )}
      >
        <textPath href={`#${pathId}`}>{text}</textPath>
      </text>
      {center ? (
        <text
          x="60"
          y="66"
          textAnchor="middle"
          className={cn(
            'font-serif text-[20px]',
            centerClassName ?? 'fill-blue-deep',
          )}
        >
          {center}
        </text>
      ) : null}
    </svg>
  )
}

/* ── WordsIgnite ───────────────────────────────────────────────────────
   Le manifeste. Les mots ne s'allument plus un à un : le texte apparaît
   d'un seul geste, comme le reste. `step` est conservé pour l'API. */

export function WordsIgnite({
  text,
  delay = 0.1,
  className,
  as,
}: {
  text: string
  /** Attente avant l'apparition, en secondes. */
  delay?: number
  /** Sans effet : un seul geste. */
  step?: number
  className?: string
  /** Balise du conteneur — 'p' par défaut. */
  as?: ElementType
}) {
  const on = useAnimEnabled()
  const Comp: ElementType = as ?? 'p'
  return (
    <Comp className={className}>
      {on ? (
        <Appear as="span" delay={delay} className="inline-block">
          {text}
        </Appear>
      ) : (
        text
      )}
    </Comp>
  )
}
