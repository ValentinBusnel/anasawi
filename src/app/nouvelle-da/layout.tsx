import type { Metadata } from 'next'

/**
 * `/nouvelle-da` — le site d'Anne dans SA PROPRE direction artistique :
 * la mise en page moderne de la démonstration `/qeeps` (maquette fondue,
 * blocs animés, chiffres, cartes), habillée de l'identité d'Anasawi —
 * ivoire et sable, encre nuit et bleu profond, Cormorant et Karla,
 * pilules et arches. Les valeurs vivent dans `.anasawi-da`
 * (`styles/globals.css`). Ni indexée, ni liée depuis le site.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function NouvelleDaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="qeeps-da anasawi-da min-h-screen scroll-smooth bg-[var(--a-bg)] text-[var(--a-ink)] antialiased">
      {children}
    </div>
  )
}
