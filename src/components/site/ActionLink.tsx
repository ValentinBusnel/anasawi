import Link from 'next/link'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline'

/* Boutons sobres : pilule, couleur pleine, et au survol un simple
   changement de teinte. L'« encre liquide » qui suivait la souris dans le
   bouton est retirée : un bouton doit se reconnaître, pas se donner en
   spectacle. Le rayon vient de `--button-radius` (999px par défaut), que
   l'identité admin peut resserrer. */
const base =
  'group relative inline-flex items-center justify-center gap-[11px] rounded-[var(--button-radius,999px)] ' +
  'px-[34px] py-4 text-[11px] font-semibold uppercase tracking-[0.18em] ' +
  'transition-colors duration-200 ease-out'

const variants: Record<Variant, string> = {
  primary: 'bg-blue-deep text-ivory',
  outline: 'border border-blue-deep bg-transparent text-blue-deep',
  ghost: 'border border-blue-deep bg-transparent text-blue-deep',
}

/* Teinte de survol selon la variante… */
const hovers: Record<Variant, string> = {
  primary: 'hover:bg-night',
  outline: 'hover:bg-blue-mist',
  ghost: 'hover:bg-blue-mist',
}

/* …ou selon l'« encre » demandée par un template au fond personnalisé
   (bouton ivoire sur l'arche bleue, lien sans fond). Écrites en toutes
   lettres pour que Tailwind les génère. */
const hoverInks: Record<string, string> = {
  'bg-blue-mist': 'hover:bg-blue-mist',
  'bg-transparent': 'hover:bg-transparent',
  'bg-night': 'hover:bg-night',
}

function hoverOf(variant: Variant, ink?: string): string {
  return ink ? (hoverInks[ink] ?? hovers[variant]) : hovers[variant]
}

/** Libellé + flèche : le contenu commun du lien et du bouton. */
function ActionContent({
  withArrow,
  children,
}: {
  withArrow: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <span>{children}</span>
      {withArrow && (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
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
        hoverOf(variant, ink),
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
    >
      <ActionContent withArrow={withArrow}>{children}</ActionContent>
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
  /** Teinte de survol, pour un bouton dont le fond est personnalisé
      (ex. bouton ivoire sur l'arche bleue → `bg-blue-mist`). */
  ink?: string
}) {
  const content = (
    <ActionContent withArrow={withArrow}>{children}</ActionContent>
  )

  const classes = cn(base, variants[variant], hoverOf(variant, ink), className)

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
