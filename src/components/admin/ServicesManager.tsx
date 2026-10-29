'use client'

import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  type DropAnimation,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { GripVertical, HeartHandshake, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useActionForm } from './hooks/useActionForm'
import { useSortableSensors } from './hooks/useSortableSensors'
import { PASTELS } from './editor/pastels'
import { PageHeader } from './PageHeader'
import { useServiceArrangement } from './services/hooks/useServiceArrangement'
import {
  emptyServiceDraft,
  ServiceFormDialog,
  type ServiceDraft,
} from './services/ServiceFormDialog'
import { Famille } from './services/ServiceGroup'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import {
  createService,
  createServiceGroup,
  deleteService,
  deleteServiceGroup,
  renameServiceGroup,
  toggleService,
  updateService,
} from '@/server/actions/content'
import type { ActionResult } from '@/server/actions/types'
import type {
  Media,
  ServiceGroup,
  ServiceWithMedia,
} from '@/server/db/schema'

/*
 * Écran « Accompagnements ».
 *
 * La liste se lit comme le site : des familles titrées, et en dernier les
 * accompagnements présentés seuls. Tout se manipule directement — on glisse
 * une ligne d'une famille à l'autre, on renomme un titre en cliquant dessus,
 * on en ajoute ou on en retire.
 *
 * Un point de vocabulaire : supprimer un titre ne supprime jamais ce qu'il
 * coiffait. Les accompagnements redescendent simplement parmi ceux qui n'ont
 * pas de famille. C'est ce que la clé étrangère `set null` garantit en base.
 */

/* Le calque retrouve sa place d'arrivée en s'estompant : sans cela, il
   disparaîtrait net et l'œil perdrait le fil du déplacement. */
const dropAnimation: DropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
}

export function ServicesManager({
  services: initial,
  groups: initialGroups,
  library,
}: {
  services: ServiceWithMedia[]
  groups: ServiceGroup[]
  library: Media[]
}) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [groups, setGroups] = useState(initialGroups)
  const [draft, setDraft] = useState<ServiceDraft | null>(null)
  const { pending, start, fieldErrors: erreurs, run } = useActionForm()

  /* Pas d'effet qui recopie les props dans l'état : l'écriture serveur
     revalide la route, les props reviennent, et l'effet écraserait alors le
     résultat optimiste par une version parfois plus ancienne — le
     déplacement semblait « ne pas s'enregistrer ». L'état local fait foi
     jusqu'au prochain rendu complet ; en cas d'échec, on restaure. */

  const sensors = useSortableSensors()
  const {
    blocs,
    dragged,
    draggedGroup,
    draggedService,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useServiceArrangement({ items, setItems, groups, setGroups, start })

  function ajouterFamille() {
    run(() => createServiceGroup('Nouveau titre'), {
      onSuccess: (data) => {
        /* L'état local fait foi (voir plus haut) : `router.refresh()` seul
           ne changeait donc RIEN à l'écran. On cliquait, la notification
           confirmait, et rien n'apparaissait avant un rechargement manuel.
           On pose donc nous-mêmes ce que le serveur vient d'enregistrer. */
        const maintenant = new Date()
        setGroups((prev) => [
          ...prev,
          {
            id: data.id,
            label: 'Nouveau titre',
            sortOrder: prev.length,
            createdAt: maintenant,
            updatedAt: maintenant,
          },
        ])
        router.refresh()
      },
    })
  }

  function renommerFamille(id: string, label: string) {
    const avant = groups
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, label } : g)))

    /* Seule écriture de cet écran qui ne confirmait rien. Le libellé
       changeait sous les yeux avant même la réponse du serveur : en cas
       d'échec silencieux, Anne partait convaincue d'avoir enregistré. */
    run(() => renameServiceGroup(id, label), {
      success: 'Titre renommé.',
      onError: (r) => {
        setGroups(avant)
        toast.error(r.error)
      },
    })
  }

  /* Rend le résultat du serveur : la confirmation attend qu'il soit là
     avant d'annoncer « supprimé ». Avant, elle l'annonçait tout de suite,
     et un rechargement rapide annulait la requête en vol — le titre
     réapparaissait, malgré la notification. */
  async function supprimerFamille(id: string): Promise<ActionResult<unknown>> {
    const result = await deleteServiceGroup(id)
    if (!result.ok) return result
    start(() => {
      /* La clé étrangère est en `set null` côté base : les
         accompagnements rejoignent la liste sans titre. L'écran doit
         montrer exactement cela, tout de suite. */
      setGroups((prev) => prev.filter((g) => g.id !== id))
      setItems((prev) =>
        prev.map((s) =>
          s.groupId === id ? { ...s, groupId: null, group: null } : s,
        ),
      )
      router.refresh()
    })
    return result
  }

  function save() {
    if (!draft) return

    const existant = draft.id ? items.find((s) => s.id === draft.id) : null
    const payload = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      excerpt: draft.excerpt,
      body: draft.body,
      duration: draft.duration || null,
      method: draft.method.trim() || null,
      groupId: existant?.groupId ?? null,
      mediaId: draft.mediaId,
      isActive: draft.isActive,
    }

    /*
     * Les deux chemins sont écrits séparément parce que l'état local
     * fait foi (voir plus haut) : sans écriture locale, l'accompagnement
     * créé n'apparaissait NULLE PART et le titre modifié restait
     * l'ancien à l'écran. Anne enregistrait, voyait la confirmation, ne
     * voyait aucun changement — et recommençait, pour se heurter cette
     * fois à « Cette adresse est déjà utilisée ».
     */
    const image = library.find((m) => m.id === payload.mediaId) ?? null

    if (draft.id) {
      const id = draft.id
      run(() => updateService(id, payload), {
        success: 'Accompagnement enregistré.',
        onSuccess: () => {
          setItems((prev) =>
            prev.map((s) =>
              s.id === id
                ? { ...s, ...payload, media: image, updatedAt: new Date() }
                : s,
            ),
          )
          setDraft(null)
          router.refresh()
        },
      })
    } else {
      run(() => createService(payload), {
        success: 'Accompagnement créé.',
        onSuccess: (data) => {
          const maintenant = new Date()
          setItems((prev) => [
            ...prev,
            {
              ...payload,
              id: data.id,
              sortOrder: prev.length,
              media: image,
              group: null,
              createdAt: maintenant,
              updatedAt: maintenant,
            },
          ])
          setDraft(null)
          router.refresh()
        },
      })
    }
  }

  const ouvrirDraft = (service: ServiceWithMedia) =>
    setDraft({
      id: service.id,
      title: service.title,
      slug: service.slug,
      slugEdite: true,
      excerpt: service.excerpt,
      body: service.body,
      duration: service.duration ?? '',
      method: service.method ?? '',
      mediaId: service.mediaId,
      isActive: service.isActive,
    })

  const basculer = (service: ServiceWithMedia, checked: boolean) =>
    run(() => toggleService(service.id, checked), {
      success: checked
        ? 'Accompagnement affiché sur le site.'
        : 'Accompagnement masqué du site.',
      onSuccess: () =>
        setItems((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: checked } : s)),
        ),
    })

  const supprimer = async (service: ServiceWithMedia) => {
    const result = await deleteService(service.id)
    if (result.ok) setItems((prev) => prev.filter((s) => s.id !== service.id))
    return result
  }

  const vide = items.length === 0 && groups.length === 0
  const enLigne = items.filter((s) => s.isActive).length

  /* ── Le sommaire de gauche ────────────────────────────────────────
     Les titres ne sont pas des filtres : la liste de droite les montre
     TOUS, parce qu'on glisse une ligne d'un titre à l'autre. Le sommaire
     y mène (défilement) et suit la lecture (titre allumé). */
  const defilement = useRef<HTMLDivElement>(null)
  const [courant, setCourant] = useState<string | null>(null)
  /* Le temps du défilement demandé, le suivi se tait : sinon il rallumait
     le titre précédent quand le dernier ne peut pas monter tout en haut. */
  const clicRecent = useRef(0)
  const ancre = (id: string | null) => `famille-${id ?? 'seuls'}`

  function allerA(id: string | null) {
    const cible = document.getElementById(ancre(id))
    const boite = defilement.current
    if (!cible || !boite) return
    setCourant(id ?? 'seuls')
    clicRecent.current = Date.now()
    boite.scrollTo({
      top:
        boite.scrollTop +
        cible.getBoundingClientRect().top -
        boite.getBoundingClientRect().top -
        12,
      behavior: 'smooth',
    })
  }

  function suivreLecture() {
    const boite = defilement.current
    if (!boite || Date.now() - clicRecent.current < 900) return
    /* Tout en bas : c'est le dernier titre qu'on lit. */
    if (boite.scrollTop + boite.clientHeight >= boite.scrollHeight - 2) {
      setCourant(lignes.at(-1)?.cle ?? null)
      return
    }
    const haut = boite.getBoundingClientRect().top + 40
    let actif: string | null = null
    for (const el of boite.querySelectorAll<HTMLElement>('[data-famille]')) {
      if (el.getBoundingClientRect().top <= haut) actif = el.dataset.famille ?? null
    }
    setCourant(actif ?? groups[0]?.id ?? 'seuls')
  }

  const lignes = [
    ...groups.map((g, i) => ({
      id: g.id as string | null,
      cle: g.id,
      label: g.label,
      n: (blocs.parFamille.get(g.id) ?? []).length,
      tone: PASTELS[(i + 3) % PASTELS.length]!,
    })),
    ...(blocs.orphelins.length > 0
      ? [{ id: null, cle: 'seuls', label: 'Présentés seuls', n: blocs.orphelins.length, tone: { bg: '#e9eced', fg: '#6b8186' } }]
      : []),
  ]

  return (
    <>
      <PageHeader
        overline="Ce que vous proposez"
        title="Accompagnements"
        description={
          vide
            ? 'Ce que vous proposez, dans l’ordre où vos visiteurs le découvrent.'
            : `${items.length} ${items.length > 1 ? 'accompagnements' : 'accompagnement'} · ${enLigne} en ligne`
        }
        action={
          <Button size="sm" onClick={() => setDraft(emptyServiceDraft)}>
            <Plus />
            Nouvel accompagnement
          </Button>
        }
      />

      {vide ? (
        <div className="flex flex-col items-center gap-1.5 rounded-[24px] bg-block px-6 py-16 text-center">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#8aa4a8]">
            <HeartHandshake className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="text-[16px] font-semibold text-foreground">Aucun accompagnement pour l’instant</p>
          <p className="max-w-[40ch] text-[14px] text-muted-foreground">
            Créez le premier pour le présenter sur votre site.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={ajouterFamille} disabled={pending}>
              <Plus />
              Ajouter un titre
            </Button>
            <Button onClick={() => setDraft(emptyServiceDraft)}>
              <Plus />
              Créer un accompagnement
            </Button>
          </div>
        </div>
      ) : (
        <div className="bloc-ecran grid gap-2 rounded-[24px] bg-block p-2 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* ── Le sommaire ───────────────────────────────────────── */}
          <nav aria-label="Titres" className="min-h-0 overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin] lg:p-2">
            <p className="px-3 pb-1.5 pt-1 text-[13px] font-medium text-[#8aa4a8]">Titres</p>
            <ul className="flex flex-col gap-0.5">
              {lignes.map((l) => {
                const actif = courant === l.cle
                return (
                  <li key={l.cle}>
                    <button
                      type="button"
                      onClick={() => allerA(l.id)}
                      aria-label={`Aller à « ${l.label} »`}
                      aria-current={actif ? 'true' : undefined}
                      className={cn(
                        'group flex h-[52px] w-full items-center gap-3 rounded-[14px] px-3 text-left text-[14px] font-medium transition-[background-color,color,box-shadow] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        actif
                          ? 'bg-white text-foreground shadow-[0_1px_2px_rgba(22,73,81,0.06)]'
                          : 'text-[#46606c] hover:bg-white/60 hover:text-foreground',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06]"
                        style={{ background: l.tone.bg, color: l.tone.fg }}
                      >
                        <HeartHandshake className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <span aria-hidden="true" className="min-w-0 flex-1 truncate">{l.label}</span>
                      <span aria-hidden="true" className="text-[12px] tabular-nums text-[#8aa4a8]">{l.n}</span>
                    </button>
                  </li>
                )
              })}
              <li className="pt-1">
                <button
                  type="button"
                  onClick={ajouterFamille}
                  disabled={pending}
                  className="group/add flex items-center gap-[7px] rounded-[8px] px-3 py-2 text-[13.5px] font-medium text-[#176c79] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" strokeWidth={1.8} />
                  Ajouter un titre
                </button>
              </li>
            </ul>
          </nav>

          {/* ── La liste, toute entière ───────────────────────────── */}
          <section aria-label="Vos accompagnements" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#eef1f2] px-5 py-4 sm:px-6">
              <h2 className="text-[16px] font-semibold text-foreground">
                Vos accompagnements
                <span className="ml-2 text-[13px] font-medium text-[#8aa4a8]">{items.length}</span>
              </h2>
              <p className="text-[13px] text-[#8aa4a8]">
                Glissez une ligne pour la déplacer, y compris d’un titre à l’autre
              </p>
            </div>
            <div
              ref={defilement}
              onScroll={suivreLecture}
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4"
            >
              <DndContext
                /* Identifiant fixe : sans lui, dnd-kit génère un compteur différent
                   côté serveur et côté client (`DndDescribedBy-N`) — erreur
                   d'hydratation React à chaque ouverture de l'écran. */
                id="services-sortable"
                sensors={sensors}
                /* `closestCorners` plutôt que `closestCenter` : avec plusieurs
                   conteneurs, c'est lui qui vise juste près des bordures. */
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="space-y-3">
                  {/* Deux niveaux de tri imbriqués : les familles entre elles, et
                      les accompagnements dans chacune. dnd-kit distingue les deux
                      par l'identifiant saisi au départ du glisser. */}
                  <SortableContext
                    items={groups.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {groups.map((group) => (
                      <div key={group.id} id={ancre(group.id)} data-famille={group.id}>
                        <Famille
                          group={group}
                          services={blocs.parFamille.get(group.id) ?? []}
                          dragged={dragged}
                          onRename={(label) => renommerFamille(group.id, label)}
                          onDelete={() => supprimerFamille(group.id)}
                          onEdit={ouvrirDraft}
                          onToggle={basculer}
                          onDeleted={supprimer}
                        />
                      </div>
                    ))}
                  </SortableContext>

                  <div id={ancre(null)} data-famille="seuls">
                    <Famille
                      group={null}
                      services={blocs.orphelins}
                      dragged={dragged}
                      onEdit={ouvrirDraft}
                      onToggle={basculer}
                      onDeleted={supprimer}
                    />
                  </div>
                </div>

                {/* Calque de glisser : une copie qui suit le pointeur au pixel.
                    Sans lui, avec deux niveaux de tri imbriqués, les mesures se
                    chassent et l'élément paraît sauter d'une position à l'autre. */}
                <DragOverlay dropAnimation={dropAnimation}>
                  {draggedGroup ? (
                    <div className="w-full overflow-hidden rounded-[20px] bg-white shadow-[0_16px_40px_rgba(22,73,81,0.18)]">
                      <p className="px-5 pb-1 pt-4 text-[15px] font-semibold text-foreground">
                        {draggedGroup.label}
                      </p>
                      <p className="px-5 pb-4 text-[13px] text-muted-foreground">
                        {(blocs.parFamille.get(draggedGroup.id) ?? []).length}{' '}
                        accompagnement(s)
                      </p>
                    </div>
                  ) : draggedService ? (
                    <div className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(22,73,81,0.18)]">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-muted">
                        {draggedService.media && (
                          <Image
                            src={draggedService.media.url}
                            alt={draggedService.media.alt}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="text-[14px] font-medium">
                        {draggedService.title}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </section>
        </div>
      )}

      <ServiceFormDialog
        draft={draft}
        onChange={setDraft}
        onClose={() => setDraft(null)}
        onSubmit={save}
        pending={pending}
        erreurs={erreurs}
        library={library}
      />
    </>
  )
}
