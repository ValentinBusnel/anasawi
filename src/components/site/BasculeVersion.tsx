import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * La bascule entre les deux versions du site, le temps de l'arbitrage :
 * « Classique » (/) et « Moderne » (/moderne). Deux segments, celui où
 * l'on est allumé. À SUPPRIMER avec la version écartée (ARBITRAGE.md).
 */
export function BasculeVersion({
  actuelle,
  className,
  sombre = false,
}: {
  actuelle: 'classique' | 'moderne'
  className?: string
  /** Sur fond sombre (menu plein écran du site classique). */
  sombre?: boolean
}) {
  const segment = (version: 'classique' | 'moderne', href: string, libelle: string) => {
    const ici = actuelle === version
    return (
      <Link
        href={href}
        aria-current={ici ? 'page' : undefined}
        className={cn(
          'rounded-full px-3 py-1.5 transition-colors duration-300',
          ici
            ? sombre
              ? 'bg-ivory text-night'
              : 'bg-white text-[#14232e] shadow-[0_1px_2px_rgba(20,35,46,0.08)]'
            : sombre
              ? 'text-ivory/70 hover:text-ivory'
              : 'text-current opacity-60 hover:opacity-100',
        )}
      >
        {libelle}
      </Link>
    )
  }
  return (
    <span
      role="group"
      aria-label="Version du site"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-[3px] text-[11px] font-semibold',
        sombre ? 'bg-ivory/10' : 'bg-black/[0.05]',
        className,
      )}
    >
      {segment('classique', '/', 'Classique')}
      {segment('moderne', '/moderne', 'Moderne')}
    </span>
  )
}
