import type { Metadata } from 'next'

/**
 * `/qeeps` — le site d'Anne refait dans la direction artistique du SITE
 * VITRINE de Qeeps (byqeeps.com : fond #f7f7f7, grands titres en dégradé
 * pétrole, maquette fondue, blocs gris animés, pied de page pétrole),
 * avec son contenu réel. Une démonstration : ni indexée, ni liée depuis
 * le site, et sans effet sur la page en ligne ni sur l'éditeur.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function QeepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="qeeps-da min-h-screen scroll-smooth bg-[var(--a-bg)] font-[family-name:var(--font-poppins)] text-[var(--a-ink)] antialiased">
      {children}
    </div>
  )
}
