import Link from 'next/link'

import { LiquidFill } from '@/components/site/LiquidFill'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline'

/* Boutons sobres de la planche V8 : pilule, flèche qui glisse de 4px, et
   au survol un remplissage liquide — l'encre naît sous la souris, la suit
   dans le bouton, se résorbe à la sortie. Le bouton ne bouge pas. Le
   rayon vient de `--button-radius` (999px par défaut), que l'identité
   admin peut resserrer. */
const base =
  'group relative inline-flex items-center justify-center gap-[11px] overflow-hidden rounded-[var(--button-radius,999px)] ' +
  'px-[34px] py-4 text-[11px] font-semibold uppercase tracking-[0.18em] ' +
  'transition-[color,border-color] duration-[350ms] ease-[var(--ease)]'

const variants: Record<Variant, string> = {
  primary: 'bg-blue-deep text-ivory',
  outline: 'border border-blue-deep bg-transparent text-blue-deep',
  ghost: 'border border-blue-deep bg-transparent text-blue-deep',
}

/* Couleur de l'encre selon la variante. */
const inks: Record<Variant, string> = {
  primary: 'bg-night',
  outline: 'bg-blue-mist',
  ghost: 'bg-blue-mist',
}

/** Libellé + flèche + encre : le contenu commun du lien et du bouton. */
function ActionContent({
  variant,
  withArrow,
  ink,
  children,
}: {
  variant: Variant
  withArrow: boolean
  ink?: string
  children: React.ReactNode
}) {
  return (
    <>
      <LiquidFill className={ink ?? inks[variant]} />
      <span className="relative z-[1]">{children}</span>
      {withArrow && (
        <span
          aria-hidden="true"
          className="relative z-[1] inline-block transition-transform duration-[350ms] ease-[var(--ease)] group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  )
}

/**
 * Le même bouton, pour une ACTION plutôt qu'une navigation (envoi d'un
 * formulaire, « Réessayer »). Avant, ces boutons gardaient un ancien style
 * — angles vifs, autre corps, autre interlettrage — et juraient à côté des
 * pilules du reste du site.
 */
export function ActionButton({
  children,
  variant = 'primary',
  className,
  withArrow = false,
  ink,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: React.ReactNode
  variant?: Variant
  withArrow?: boolean
  ink?: string
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        base,
        variants[variant],
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
    >
      <ActionContent variant={variant} withArrow={withArrow} ink={ink}>
        {children}
      </ActionContent>
    </button>
  )
}

export function ActionLink({
  href,
  children,
  variant = 'primary',
  className,
  withArrow = true,
  external = false,
  ink,
  onClick,
}: {
  href: string
  children: React.ReactNode
  variant?: Variant
  className?: string
  withArrow?: boolean
  external?: boolean
  /** Réagir au clic sans empêcher la navigation (fermer une fiche…). */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** Classe de couleur de l'encre, pour un bouton dont le fond est
      personnalisé (ex. bouton ivoire sur l'arche bleue → `bg-blue-mist`). */
  ink?: string
}) {
  const content = (
    <ActionContent variant={variant} withArrow={withArrow} ink={ink}>
      {children}
    </ActionContent>
  )

  const classes = cn(base, variants[variant], className)

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  )
}
