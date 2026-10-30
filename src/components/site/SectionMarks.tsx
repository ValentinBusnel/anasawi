import { cn } from '@/lib/utils'

/**
 * Marques de section de la charte (planche V8) — l'astérisque signature,
 * les méta-textes, l'index de section en chiffres romains, les trois
 * points. (Le décor au trait, lui, est `Ornament.tsx`.)
 *
 * Aucun état, aucun JavaScript : de purs composants serveur que chaque
 * template consomme pour parler la même langue.
 */

/**
 * L'ornement des templates. Ce fut l'astérisque ✳︎, répété partout
 * (au-dessus des citations, en puce, entre deux titres) ; c'est désormais
 * un simple point, de la couleur du texte — la ponctuation reste, le décor
 * se tait. Les tailles passées par `className` sont sans effet ; la
 * couleur et les marges sont conservées.
 */
export function Aster({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-[1em] items-center justify-center align-middle',
        className,
      )}
    >
      <span className="block size-[5px] rounded-full bg-current opacity-70" />
    </span>
  )
}

/** Les trois points bleus de la maquette — ponctuation entre deux sections. */
export function Dots({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex items-center justify-center gap-2.5', className)}
    >
      <i className="h-1 w-1 rounded-full bg-blue opacity-55" />
      <i className="h-1 w-1 rounded-full bg-blue opacity-55" />
      <i className="h-1 w-1 rounded-full bg-blue opacity-55" />
    </span>
  )
}
