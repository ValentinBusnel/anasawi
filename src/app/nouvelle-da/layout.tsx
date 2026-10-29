import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

/**
 * `/nouvelle-da` — le site d'Anne avec ses propres composants
 * (`components/anasawi`), dans l'esprit des sites produits modernes
 * (comme Qeeps) mais avec sa propre identité : Plus Jakarta Sans, encre
 * ardoise, dégradé « lagon », fenêtres arrondies. Ni indexée, ni liée.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function NouvelleDaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${jakarta.variable} ad min-h-screen overflow-x-clip bg-[var(--ad-ivoire)] antialiased`}>{children}</div>
}
