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

/**
 * Méta-texte de section : « ✳︎  Label » en capitales espacées.
 * C'est le label supérieur de presque toutes les sections de la maquette.
 */
export function MetaLabel({
  children,
  className,
  tone = 'accent',
}: {
  children: React.ReactNode
  className?: string
  /** `accent` : bleu profond. `muted` : gris pierre. `light` : sur fond nuit. */
  tone?: 'accent' | 'muted' | 'light'
}) {
  return (
    <p
      className={cn(
        'font-sans text-[11px] font-semibold uppercase tracking-[0.22em]',
        /* Gris pierre, sans ornement — voir `Eyebrow`. Sur fond nuit,
           l'ivoire atténué reste. */
        tone === 'light' ? 'text-ivory/70' : 'text-stone',
        className,
      )}
    >
      {children}
    </p>
  )
}

/**
 * Index de section (« iv — approche »), en haut à droite de chaque
 * section. N'est plus affiché : répété sur toute la page, il ajoutait un
 * niveau de lecture sans information utile au visiteur. Le composant reste
 * — les templates l'appellent toujours — et ne rend rien.
 */
export function SectionIndex(props: {
  index: number
  label: string
  /** Sur fond nuit. */
  light?: boolean
  className?: string
}): null {
  void props
  return null
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
