import type { Metadata } from 'next'
import { ActionLink } from '@/components/site/ActionLink'
import { LogoMark } from '@/components/site/Logo'

/* Une page d'erreur indexée serait une page de plus offerte à Google —
   avec un titre qui n'a rien à voir avec le cabinet. */
export const metadata: Metadata = {
  title: 'Page introuvable — ANASAWI',
  /* Pas de `robots` ici : Next ajoute lui-même `noindex` à toute page
     introuvable — le déclarer une seconde fois doublait la balise. */
}

export default function NotFound() {
  return (
    <main className="grain flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="h-12 w-12 text-stone" />

      <p className="label-eyebrow mt-12 text-stone">Erreur 404</p>

      <h1 className="mt-7 max-w-[16ch] text-[clamp(2.2rem,5vw,4rem)] leading-[1.08]">
        Cette page n’existe <em className="italic">plus</em>.
      </h1>

      <p className="mt-7 max-w-[42ch] leading-[1.7] text-ink-soft">
        Le lien que vous avez suivi est peut-être ancien, ou l’adresse
        comporte une erreur.
      </p>

      {/* Le bouton du site — pilule, encre liquide — et non un style à part. */}
      <ActionLink href="/" variant="outline" className="mt-12">
        Retour à l’accueil
      </ActionLink>
    </main>
  )
}
