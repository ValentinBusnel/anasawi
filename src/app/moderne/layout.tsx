import type { Metadata } from 'next'

/**
 * `/moderne` — le site d'Anne dans sa NOUVELLE direction artistique, en
 * cours d'arbitrage avec le site classique (`/`). Même contenu (réglages,
 * accompagnements, questions, médias, textes), autre mise en forme.
 * Pas indexé tant que l'arbitrage n'est pas fait : un seul des deux
 * restera. Voir ARBITRAGE.md.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ModerneLayout({ children }: { children: React.ReactNode }) {
  return <div className="ad min-h-screen overflow-x-clip bg-[var(--ad-ivoire)] antialiased">{children}</div>
}
