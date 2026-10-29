import type { Metadata } from 'next'

/**
 * `/qeeps` — le site d'Anne refait dans la direction artistique de
 * l'espace Qeeps (Poppins, blocs gris, cartes blanches, pastels), avec
 * son contenu réel. Une démonstration : ni indexée, ni liée depuis le
 * site, et sans effet sur la page en ligne ni sur l'éditeur.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function QeepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="qeeps-da min-h-screen scroll-smooth bg-white font-[family-name:var(--font-poppins)] text-[#164951] antialiased">
      {children}
    </div>
  )
}
