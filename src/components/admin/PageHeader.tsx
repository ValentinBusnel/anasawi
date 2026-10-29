import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { SpaceIcon } from './SpaceIcon'

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
    <div>
      {back && (
        <Link
          href={back.href}
          className="group mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground transition-[color,gap] duration-300 hover:gap-2.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          {back.label}
        </Link>
      )}

      <SpaceIcon className="mb-3.5" />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[36px] sm:leading-[43px]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-[62ch] text-[16px] leading-[22px] text-muted-foreground">
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
