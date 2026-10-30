import Image from 'next/image'

import logoAnasawi from './logo-anasawi.png'
import { cn } from '@/lib/utils'

/**
 * Marque ANASAWI — l'ombelle de pissenlit d'Anne.
 *
 * C'est une ILLUSTRATION, pas un tracé au trait : ses couleurs sont
 * fixes, elle ne suit donc pas `currentColor` et ne s'inverse pas sur
 * fond sombre. Les classes de couleur passées par `className`
 * (`text-stone`, `text-ink`…) n'ont plus d'effet ; elles restent sans
 * danger et évitent de reprendre les cinq appelants.
 *
 * Le fichier est CADRÉ AU CONTENU. Le SVG d'origine laissait de larges
 * marges vides autour du dessin — les akènes qui s'envolent élargissent
 * la boîte — si bien qu'à 16 px la marque n'occupait que huit pixels et
 * devenait une tache. Marges retirées, elle se lit.
 */
export function LogoMark({
  className,
  src,
  priority = false,
  resolution = 128,
}: {
  className?: string
  /** Taille du fichier chargé (px) : environ le double de la taille affichée. */
  resolution?: number
  /** Logo choisi dans les Réglages. Absent : celui livré avec le site. */
  src?: string | null
  /**
   * Préchargé (`<link rel=preload>`) : réservé à l'en-tête du site, la
   * seule marque visible dès le premier écran. Partout ailleurs (404,
   * connexion, barre latérale de l'admin) le préchargement concurrençait
   * les vraies ressources critiques.
   */
  priority?: boolean
}) {
  return (
    <Image
      src={src || logoAnasawi}
      width={resolution}
      height={resolution}
      alt=""
      aria-hidden="true"
      priority={priority}
      /* 128px : le double de la plus grande taille d'affichage (64px au
         pied de page), pour rester net sur écran à haute densité. */
      sizes={`${resolution}px`}
      className={cn('h-9 w-9 select-none object-contain', className)}
    />
  )
}

export function Logo({
  className,
  wordmarkClassName,
}: {
  className?: string
  wordmarkClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-3.5', className)}>
      <LogoMark />
      <span
        className={cn(
          'font-serif text-[1.02rem] tracking-[0.28em] text-current',
          wordmarkClassName,
        )}
      >
        ANASAWI
      </span>
    </span>
  )
}
