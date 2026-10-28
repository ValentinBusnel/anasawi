import { AdminContent } from '@/components/admin/AdminContent'

/**
 * Squelette d'attente d'un écran du CMS — rendu par les `loading.tsx` des
 * segments qui chargent leurs données depuis Neon (`force-dynamic`).
 *
 * Trois points qui rebondissent au centre — le chargement de l'espace
 * Qeeps.
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
      {/* Trois points qui rebondissent, comme sur l'espace Qeeps. */}
      <div
        role="status"
        aria-label="Chargement"
        aria-busy="true"
        className="flex justify-center gap-1.5 py-20"
      >
        {[0, 0.15, 0.3].map((delai) => (
          <span
            key={delai}
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-primary motion-safe:animate-[adm-bounce_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${delai}s` }}
          />
        ))}
        <span className="sr-only">Chargement…</span>
      </div>
    </AdminContent>
  )
}
