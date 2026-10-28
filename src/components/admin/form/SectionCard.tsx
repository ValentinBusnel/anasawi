import { cn } from '@/lib/utils'

/**
 * Une carte de formulaire : un titre net, une note qui dit à
 * quoi servent les champs, puis les champs — en grille de deux colonnes
 * par défaut, ou libres (`layout="stack"`) quand la carte compose sa
 * propre mise en page.
 *
 * `id` sert d'ancre (`#horaires`) : `scroll-mt` laisse l'air du haut.
 */
export function SectionCard({
  id,
  title,
  note,
  actions,
  layout = 'grid',
  children,
}: {
  id: string
  title: string
  note?: string
  /** Boutons à droite du titre (ex. « Revenir à la charte »). */
  actions?: React.ReactNode
  layout?: 'grid' | 'stack'
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-[14px] border border-border bg-card p-5 shadow-xs sm:p-6"
    >
      <div
        className={cn(
          actions && 'flex flex-wrap items-start justify-between gap-3',
        )}
      >
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {title}
          </h2>
          {note && (
            <p className="mt-1 max-w-[62ch] text-[13.5px] leading-[1.55] text-muted-foreground">
              {note}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-1.5">{actions}</div>}
      </div>
      <div className={cn('mt-5', layout === 'grid' && 'grid gap-x-5 gap-y-5 sm:grid-cols-2')}>
        {children}
      </div>
    </section>
  )
}
