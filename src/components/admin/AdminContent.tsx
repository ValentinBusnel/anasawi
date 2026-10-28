import { cn } from '@/lib/utils'

/**
 * Zone de contenu défilante d'un écran du CMS.
 *
 * Le layout de l'administration est une colonne flex sans débordement :
 * c'est ce conteneur — et lui seul — qui défile. `min-h-0` est indispensable,
 * sans quoi un enfant flex refuse de rétrécir en dessous de sa hauteur de
 * contenu et le défilement remonte au document.
 *
 * La colonne est centrée, sur le canevas neutre : le contenu se lit au
 * centre, les surfaces blanches respirent, rien ne s'étale.
 */
export function AdminContent({
  children,
  className,
  width = 'default',
}: {
  children: React.ReactNode
  className?: string
  /** `narrow` pour les formulaires courts, `wide` pour les listes. */
  width?: 'narrow' | 'default' | 'wide'
}) {
  const maxWidth = {
    narrow: 'max-w-[640px]',
    default: 'max-w-[760px]',
    wide: 'max-w-[960px]',
  }[width]

  return (
    <div
      className={cn('min-h-0 flex-1 overflow-y-auto bg-background', className)}
    >
      <div className={cn('mx-auto px-5 pb-28 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-14', maxWidth)}>
        {children}
      </div>
    </div>
  )
}
