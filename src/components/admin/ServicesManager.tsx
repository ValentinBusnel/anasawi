'use client'

import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  useDroppable,
  type DropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, HeartHandshake, Layers, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { useActionForm } from './hooks/useActionForm'
import { useSortableSensors } from './hooks/useSortableSensors'
import { PASTELS } from './editor/pastels'
import { PageHeader } from './PageHeader'
import { NAV, useServiceArrangement } from './services/hooks/useServiceArrangement'
import {
  emptyServiceDraft,
  ServiceFormDialog,
  type ServiceDraft,
} from './services/ServiceFormDialog'
import { Famille, SANS_FAMILLE } from './services/ServiceGroup'
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

  /* ── Les titres, à gauche ─────────────────────────────────────────
     Comme les dossiers de Médias : un clic n'affiche que ce titre-là.
     « Tous les accompagnements » remet la liste entière — c'est là qu'on
     glisse une ligne d'un titre à l'autre. */
  type Vue = 'tous' | 'seuls' | string
  const [vue, setVue] = useState<Vue>('tous')
  /* Un titre supprimé alors qu'il était ouvert : retour à la liste entière. */
  const vueValide =
    vue === 'tous' || (vue === 'seuls' ? blocs.orphelins.length > 0 : groups.some((g) => g.id === vue))
      ? vue
      : 'tous'
  const groupesVisibles =
    vueValide === 'tous' ? groups : groups.filter((g) => g.id === vueValide)
  const seulsVisibles = vueValide === 'tous' || vueValide === 'seuls'
  const titreVue =
    vueValide === 'tous'
      ? 'Tous les accompagnements'
      : vueValide === 'seuls'
        ? 'Présentés seuls'
        : (groups.find((g) => g.id === vueValide)?.label ?? '')
  const nVue =
    vueValide === 'tous'
      ? items.length
      : vueValide === 'seuls'
        ? blocs.orphelins.length
        : (blocs.parFamille.get(vueValide) ?? []).length

  const lignes = [
    {
      id: 'tous',
      cle: 'tous',
      label: 'Tous',
      n: items.length,
      tone: PASTELS[0]!,
    },
    ...groups.map((g, i) => ({
      id: g.id,
      cle: g.id,
      label: g.label,
      n: (blocs.parFamille.get(g.id) ?? []).length,
      tone: PASTELS[(i + 3) % PASTELS.length]!,
    })),
    ...(blocs.orphelins.length > 0
      ? [{ id: 'seuls', cle: 'seuls', label: 'Présentés seuls', n: blocs.orphelins.length, tone: { bg: '#e9eced', fg: '#6b8186' } }]
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
        <div className="bloc-ecran grid gap-2 rounded-[24px] bg-block p-2 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* ── Les titres — les « dossiers » ─────────────────────────
              On les réordonne en les glissant ICI ; on y dépose aussi un
              accompagnement tiré de la liste pour le ranger sous ce titre. */}
          <nav aria-label="Titres" className="min-h-0 overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin] lg:p-2">
            <ul className="flex flex-col gap-0.5">
              {lignes.slice(0, 1).map((l) => (
                <LigneTitre key={l.cle} ligne={l} actif={vueValide === l.cle} onOpen={() => setVue(l.cle)} />
              ))}
            </ul>
            <p className="px-3 pb-1.5 pt-4 text-[13px] font-medium text-[#8aa4a8]">Titres</p>
            <SortableContext
              items={groups.map((g) => `${NAV}${g.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-0.5">
                {lignes.slice(1).map((l) => (
                  <LigneTitre
                    key={l.cle}
                    ligne={l}
                    actif={vueValide === l.cle}
                    onOpen={() => setVue(l.cle)}
                    triable={l.cle !== 'seuls'}
                    glisseEnCours={dragged !== null}
                  />
                ))}
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      /* Le nouveau titre arrive en bas de la liste entière. */
                      setVue('tous')
                      ajouterFamille()
                    }}
                    disabled={pending}
                    className="group/add flex items-center gap-[7px] rounded-[8px] px-3 py-2 text-[13.5px] font-medium text-[#176c79] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 transition-transform duration-300 group-hover/add:rotate-90" strokeWidth={1.8} />
                    Ajouter un titre
                  </button>
                </li>
              </ul>
            </SortableContext>
          </nav>

          {/* ── La liste ─────────────────────────────────────────────── */}
          <section aria-label="Vos accompagnements" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#eef1f2] px-5 py-4 sm:px-6">
              <h2 key={vueValide} className="text-[16px] font-semibold text-foreground animate-[adm-fade_0.3s_ease_both]">
                {titreVue}
                <span className="ml-2 text-[13px] font-medium text-[#8aa4a8]">{nVue}</span>
              </h2>
              <p className="text-[13px] text-[#8aa4a8]">
                Glissez une ligne pour la déplacer — sur un titre à gauche pour l’y ranger
              </p>
            </div>
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
              <div className="space-y-3">
                {groupesVisibles.map((group) => (
                  <div key={group.id} className="animate-[adm-fade_0.3s_ease_both]">
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

                {seulsVisibles && (
                  <Famille
                    group={null}
                    services={blocs.orphelins}
                    dragged={dragged}
                    onEdit={ouvrirDraft}
                    onToggle={basculer}
                    onDeleted={supprimer}
                  />
                )}
              </div>
            </div>
          </section>
        </div>

          {/* Calque de glisser : une copie qui suit le pointeur au pixel.
              Sans lui, avec deux niveaux de tri imbriqués, les mesures se
              chassent et l'élément paraît sauter d'une position à l'autre. */}
          <DragOverlay dropAnimation={dropAnimation}>
            {draggedGroup ? (
              <div className="flex h-[52px] w-[244px] items-center gap-3 rounded-[14px] bg-white px-3 text-[14px] font-medium text-foreground shadow-[0_16px_40px_rgba(22,73,81,0.18)]">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className="min-w-0 flex-1 truncate">{draggedGroup.label}</span>
                <span className="text-[12px] tabular-nums text-[#8aa4a8]">
                  {(blocs.parFamille.get(draggedGroup.id) ?? []).length}
                </span>
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

/* ── Une ligne de la colonne des titres ───────────────────────────────
   Un clic l'ouvre ; glissée, elle change l'ordre des titres ; survolée
   par un accompagnement qu'on tire, elle s'allume — le relâcher le range
   sous ce titre. « Tous » n'est ni triable ni une cible. */
type Ligne = {
  cle: string
  label: string
  n: number
  tone: { bg: string; fg: string }
}

function LigneTitre({
  ligne,
  actif,
  onOpen,
  triable = false,
  glisseEnCours = false,
}: {
  ligne: Ligne
  actif: boolean
  onOpen: () => void
  /** Titre réel : triable et cible de dépôt. Faux pour « Tous » et
      « Présentés seuls » (ce dernier reste une cible). */
  triable?: boolean
  glisseEnCours?: boolean
}) {
  const estTous = ligne.cle === 'tous'
  const sortable = useSortable({ id: `${NAV}${ligne.cle}`, disabled: !triable })
  /* « Présentés seuls » : pas de place à défendre, mais on peut y déposer. */
  const depot = useDroppable({
    /* Un identifiant par ligne : deux enregistrements au même nom se
       remplaceraient l'un l'autre dans dnd-kit. */
    id: ligne.cle === 'seuls' ? `${NAV}${SANS_FAMILLE}` : `${NAV}depot-${ligne.cle}`,
    disabled: ligne.cle !== 'seuls',
  })
  const ref = triable ? sortable.setNodeRef : ligne.cle === 'seuls' ? depot.setNodeRef : undefined
  const survole = !estTous && glisseEnCours && (triable ? sortable.isOver : depot.isOver)

  return (
    <li
      ref={ref}
      style={
        triable
          ? { transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition }
          : undefined
      }
      className={cn('relative', triable && sortable.isDragging && 'opacity-35')}
    >
      <button
        type="button"
        /* À la souris et au doigt, toute la ligne se glisse (au-delà de
           6 px : un clic reste un clic). Au clavier, Entrée ouvre le
           titre ; le déplacement passe par la poignée, à gauche. */
        onPointerDown={triable ? (sortable.listeners?.onPointerDown as React.PointerEventHandler | undefined) : undefined}
        onClick={onOpen}
        /* « Afficher… » : jamais le libellé seul — le titre lui-même, dans
           la liste, est le bouton qui le renomme. */
        aria-label={`Afficher « ${ligne.label} »`}
        aria-roledescription={triable ? 'titre déplaçable' : undefined}
        aria-current={actif ? 'true' : undefined}
        className={cn(
          'group flex h-[52px] w-full items-center gap-3 rounded-[14px] px-3 text-left text-[14px] font-medium transition-[background-color,color,box-shadow] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          /* La poignée à GAUCHE, comme partout dans l'admin (lignes
             d'accompagnements, questions, sections) : la ligne lui fait
             de la place. */
          triable && 'cursor-grab touch-none pl-8 active:cursor-grabbing',
          actif
            ? 'bg-white text-foreground shadow-[0_1px_2px_rgba(22,73,81,0.06)]'
            : 'text-[#46606c] hover:bg-white/60 hover:text-foreground',
          survole && 'bg-white shadow-[0_0_0_2px_var(--page-fg)]',
        )}
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06]"
          style={{ background: ligne.tone.bg, color: ligne.tone.fg }}
        >
          {estTous ? (
            <Layers className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <HeartHandshake className="h-4 w-4" strokeWidth={1.8} />
          )}
        </span>
        <span aria-hidden="true" className="min-w-0 flex-1 truncate">{ligne.label}</span>
        <span aria-hidden="true" className="text-[12px] tabular-nums text-[#8aa4a8]">{ligne.n}</span>
      </button>
      {triable && (
        <button
          type="button"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label={`Déplacer le titre ${ligne.label}`}
          className="absolute left-1.5 top-1/2 z-[1] grid h-7 w-6 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-[8px] text-[#8aa4a8] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
    </li>
  )
}
