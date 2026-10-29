'use client'

import { usePathname } from 'next/navigation'

import { espaceDe } from './spaces'

/**
 * Le repère « contenu principal » de l'administration, teinté par
 * l'espace courant : `--page-bg` / `--page-fg` y sont posés, et tout ce
 * qui doit porter la couleur de l'écran (notes, pastilles, onglets,
 * états vides) les lit.
 */
export function TonedMain({ children }: { children: React.ReactNode }) {
  const espace = espaceDe(usePathname() ?? '/admin')
  return (
    <main
      className="flex min-w-0 flex-1 flex-col overflow-hidden max-lg:pb-[80px]"
      style={
        {
          '--page-bg': espace.tone.bg,
          '--page-fg': espace.tone.fg,
        } as React.CSSProperties
      }
    >
      {children}
    </main>
  )
}
