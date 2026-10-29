'use client'

import { usePathname } from 'next/navigation'

import { espaceDe } from './spaces'
import { cn } from '@/lib/utils'

/**
 * La grande icône teintée de l'espace courant — en tête de chaque écran,
 * comme l'en-tête de section de l'espace Qeeps. Elle éclot avec un léger
 * rebond à l'arrivée.
 */
export function SpaceIcon({ className }: { className?: string }) {
  const espace = espaceDe(usePathname() ?? '/admin')
  const Icone = espace.icon
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-[46px] w-[46px] place-items-center rounded-[14px] motion-safe:animate-[adm-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]',
        className,
      )}
      style={{ background: espace.tone.bg, color: espace.tone.fg }}
    >
      <Icone className="h-[21px] w-[21px]" strokeWidth={1.8} />
    </span>
  )
}
