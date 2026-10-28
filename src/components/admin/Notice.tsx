import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Une indication en tête d'écran (« visible dès que vous enregistrez »).
 *
 * Un seul style pour toutes les notes de l'outil : une bande neutre, une
 * icône discrète, le texte. Pas de bordure colorée — c'est un repère, pas
 * une alerte.
 */
export function Notice({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-[16px] bg-accent px-4 py-3 text-[14px] leading-[1.5] text-foreground',
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#176c79]" strokeWidth={1.75} />
      <span>{children}</span>
    </p>
  )
}
