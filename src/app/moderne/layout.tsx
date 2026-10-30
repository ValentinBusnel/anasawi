import type { Metadata } from 'next'

import { EssaiTypo } from '@/components/anasawi/EssaiTypo'
import { PoliceModerne } from '@/components/anasawi/PoliceModerne'
import { AdminBar } from '@/components/site/AdminBar'

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
  return (
    <div className="ad min-h-screen overflow-x-clip bg-[var(--ad-ivoire)] antialiased">
      <PoliceModerne />
      {children}
      {/* Banc d'essai typographique (temporaire, voir typos.ts). */}
      <EssaiTypo />
      {/* Connecté : la pastille « Aperçu · Modifier », vers l'éditeur moderne. */}
      <AdminBar editHref="/admin/accueil?theme=moderne" className="bottom-5 lg:bottom-7" />
    </div>
  )
}
