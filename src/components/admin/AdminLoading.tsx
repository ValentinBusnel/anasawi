import { AdminContent } from '@/components/admin/AdminContent'

/**
 * Squelette d'attente d'un écran du CMS — rendu par les `loading.tsx` des
 * segments qui chargent leurs données depuis Neon (`force-dynamic`).
 *
 * Sobre : la place de l'en-tête, puis trois cartes grises qui pulsent.
 * Posé sur chaque segment du CMS, éditeur de page compris : un
 * `router.refresh()` (Publier / Annuler) ne repasse PAS par ce squelette
 * — Next garde l'écran en place le temps de la transition — et l'état
 * local de l'éditeur (brouillon, historique, sélection) survit. Le fil
 * de progression en haut (`NavigationProgress`) complète : lui part dès
 * le clic, avant même que Next ait résolu le segment.
 */
export function AdminLoading({
  width = 'default',
}: {
  width?: 'narrow' | 'default' | 'wide'
}) {
  return (
    <AdminContent width={width}>
      <div
        role="status"
        aria-label="Chargement"
        aria-busy="true"
        className="animate-pulse"
      >
        {/* En-tête : titre + phrase d'accompagnement */}
        <div className="mb-8">
          <div className="h-7 w-52 rounded-[8px] bg-foreground/[0.07]" />
          <div className="mt-3 h-4 w-80 max-w-full rounded-[6px] bg-foreground/[0.05]" />
        </div>

        {/* Trois cartes, comme les blocs blancs des écrans réels */}
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[14px] border border-border bg-card p-6 shadow-xs"
            >
              <div className="h-4 w-40 rounded-[6px] bg-foreground/[0.07]" />
              <div className="mt-4 h-3 w-full rounded-[6px] bg-foreground/[0.045]" />
              <div className="mt-2.5 h-3 w-4/5 rounded-[6px] bg-foreground/[0.045]" />
            </div>
          ))}
        </div>

        <span className="sr-only">Chargement…</span>
      </div>
    </AdminContent>
  )
}
