import type { Metadata } from 'next'

/**
 * `/nouvelle-da` — le site d'Anne dans SA PROPRE direction artistique,
 * avec ses propres composants (`components/anasawi`) : rien de Qeeps.
 * L'ivoire et le sable, l'encre nuit, Cormorant et Karla, l'arche — et
 * des mouvements lents qui suivent la lecture. Ni indexée, ni liée.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function NouvelleDaLayout({ children }: { children: React.ReactNode }) {
  return <div className="ad min-h-screen overflow-x-clip bg-[var(--ad-ivoire)] antialiased">{children}</div>
}
