import { cn } from '@/lib/utils'

/**
 * Label supérieur de section — « QUI JE SUIS ».
 *
 * Capitales espacées, en gris pierre, sans ornement : il situe, il ne
 * doit pas attirer l'œil. L'astérisque qui le précédait et le bleu sont
 * retirés — répétés à chaque section, ils concurrençaient les titres et
 * les boutons. `tone` est conservé pour l'API.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
  /** Sans effet : un seul ton, le gris pierre. Conservé pour l'API. */
  tone?: 'accent' | 'muted'
}) {
  /* `justify-center` (les anciens appels) vaut `text-center`. */
  return (
    <p
      className={cn(
        'font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-stone',
        className?.includes('justify-center') && 'text-center',
        className,
      )}
    >
      {children}
    </p>
  )
}
