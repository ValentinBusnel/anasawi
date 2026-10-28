import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * En-tête d'écran du CMS : un titre net (sans-serif, semi-gras), une
 * phrase qui dit à quoi sert l'écran, les actions alignées à droite. Le
 * retour, quand il existe, est un vrai lien avec son chevron.
 *
 * Le composant vit DANS la colonne centrée (en premier enfant d'AdminContent) :
 * il partage donc naturellement la largeur du contenu qu'il annonce, et
 * défile avec lui — c'est un titre de page, pas une barre d'outils.
 */
export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  back?: { href: string; label: string }
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="-ml-1.5 mb-4 inline-flex h-8 items-center gap-1 rounded-[8px] pl-1 pr-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-[1.2] tracking-[-0.025em] text-foreground sm:text-[26px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-[62ch] text-[14px] leading-[1.55] text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  )
}
