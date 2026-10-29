'use client'

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  TextCursorInput,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { getBlock } from '@/blocks/registry'
import { ActionMenu } from '@/components/ui/action-menu'
import { toneOf } from './editor/sectionTone'
import { cn } from '@/lib/utils'
import type { Section } from '@/server/db/schema'

/**
 * Liste des sections de la page — la colonne gauche de l'éditeur.
 *
 * Chaque ligne est un bouton (clavier, doigt, souris) qui sélectionne la
 * section, avec un menu « ⋯ » TOUJOURS visible : Modifier, Monter,
 * Descendre, Dupliquer, Masquer/Afficher, Renommer, Supprimer. Rien ne
 * dépend d'un survol ni d'un double-clic que rien n'annonce — la
 * première version cachait tout cela, et une personne qui découvre
 * l'outil ne le trouvait pas. La poignée reste pour glisser à la souris,
 * en plus de Monter/Descendre.
 *
 * Aucune action serveur ici : chaque geste remonte au constructeur, qui
 * met son état à jour tout de suite et écrit en base via sa file.
 */

/** Le nom qu'Anne lit : celui qu'elle a donné, sinon celui du modèle. */
export function labelOf(section: Section): string {
  return section.name ?? getBlock(section.type)?.label ?? 'Section'
}

export function SectionRail({
  roots,
  selectedId,
  highlightId,
  confirmId,
  onConfirmChange,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
  onRename,
  reorderTo,
  onAdd,
  floating = false,
  onCollapse,
}: {
  /** Sections racine, dans l'ordre de la page. */
  roots: Section[]
  selectedId: string | null
  /** Ligne mise en évidence brièvement (section tout juste ajoutée). */
  highlightId: string | null
  /** Ligne dont la suppression attend confirmation — état porté par le
      constructeur, pour que la touche Suppr l'ouvre aussi. */
  confirmId: string | null
  onConfirmChange: (id: string | null) => void
  onSelect: (id: string) => void
  onToggle: (section: Section) => void
  onDuplicate: (section: Section) => void
  /** Suppression optimiste avec instantané (⌘Z), fournie par le
      constructeur — la confirmation vit ici, dans la ligne. */
  onDelete: (id: string) => Promise<unknown>
  /** Renommage optimiste, fourni par le constructeur. */
  onRename: (section: Section, value: string) => void
  /** Réordonnancement partagé avec le canvas : (id, from, boundary). */
  reorderTo: (id: string, from: number, boundary: number) => Promise<void>
  /** Ouvre la bibliothèque : insertion après la sélection, sinon en fin. */
  onAdd: () => void
  /** Fenêtre étroite : la liste flotte au-dessus du canvas et se referme
      d'un clic sur la croix. */
  floating?: boolean
  onCollapse?: () => void
}) {
  /* ── Renommage en place ─────────────────────────────────────────── */

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const commitRename = (section: Section, value: string) => {
    setRenamingId(null)
    if (value.trim() === (section.name ?? '')) return
    onRename(section, value)
  }

  /* ── Suppression : confirmation inline, lisible ─────────────────── */

  const setConfirmId = onConfirmChange

  /* La ligne disparue (supprimée, ou annulée par ⌘Z) n'a plus rien à
     confirmer. */
  useEffect(() => {
    if (confirmId && !roots.some((r) => r.id === confirmId)) {
      onConfirmChange(null)
    }
  }, [confirmId, onConfirmChange, roots])

  /* ── Glisser vertical par pointeur ──────────────────────────────── */

  const listRef = useRef<HTMLUListElement>(null)
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  const [drag, setDrag] = useState<{
    id: string
    boundary: number
    delta: number
  } | null>(null)
  /** Repères figés au pointerdown — le DOM bouge pendant le glisser. */
  const frozen = useRef<{
    listTop: number
    rows: { top: number; height: number }[]
  } | null>(null)

  /* La ligne mise en évidence (ou à confirmer) est amenée dans la zone
     visible du rail. */
  useEffect(() => {
    const id = highlightId ?? confirmId
    if (!id) return
    rowRefs.current
      .get(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [highlightId, confirmId])

  const beginDrag = (e: React.PointerEvent, id: string, from: number) => {
    if (e.button !== 0) return
    e.preventDefault()
    const list = listRef.current
    if (!list) return
    /* Le rail défile (`overflow-y-auto`) : c'est lui qu'on fait défiler
       quand le pointeur approche d'un bord. */
    const scroller = list.closest<HTMLElement>('[data-rail-scroll]')

    /* Repères EN COORDONNÉES DE LA LISTE : ils restent justes même si le
       rail défile pendant le glisser. Avant, ils étaient figés en
       coordonnées d'écran — une molette pendant le glisser, et le trait
       d'insertion ne correspondait plus à rien. */
    const listTop0 = list.getBoundingClientRect().top
    const rows = roots.map((r) => {
      const el = rowRefs.current.get(r.id)
      const rect = el?.getBoundingClientRect()
      return rect
        ? { top: rect.top - listTop0, height: rect.height }
        : { top: 0, height: 0 }
    })
    frozen.current = { listTop: listTop0, rows }

    const startInList = e.clientY - listTop0
    let clientY = e.clientY
    let activated = false
    let frame = 0

    const yInList = () => clientY - list.getBoundingClientRect().top
    const boundaryAt = () => {
      const y = yInList()
      let boundary = 0
      for (const row of rows) if (y > row.top + row.height / 2) boundary++
      return boundary
    }
    const update = () =>
      setDrag({ id, boundary: boundaryAt(), delta: yInList() - startInList })

    /* Défilement automatique près des bords du rail : sans lui, une
       section ne pouvait pas être amenée au-delà de la partie visible. */
    const autoScroll = () => {
      frame = 0
      if (!activated || !scroller) return
      const box = scroller.getBoundingClientRect()
      const ZONE = 48
      const pas =
        clientY < box.top + ZONE
          ? -Math.ceil((box.top + ZONE - clientY) / 4)
          : clientY > box.bottom - ZONE
            ? Math.ceil((clientY - (box.bottom - ZONE)) / 4)
            : 0
      if (pas === 0) return
      const avant = scroller.scrollTop
      scroller.scrollTop += pas
      if (scroller.scrollTop !== avant) update()
      frame = requestAnimationFrame(autoScroll)
    }

    const handle = e.currentTarget as HTMLElement
    /* Capture : le relâché nous parvient même hors de la fenêtre. */
    try {
      handle.setPointerCapture(e.pointerId)
    } catch {
      /* Pointeur déjà relâché : rien à capturer. */
    }

    const finish = (commit: boolean) => {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey)
      if (frame) cancelAnimationFrame(frame)
      const boundary = boundaryAt()
      frozen.current = null
      setDrag(null)
      if (commit && activated) void reorderTo(id, from, boundary)
    }

    const onMove = (ev: PointerEvent) => {
      clientY = ev.clientY
      if (!activated && Math.abs(clientY - e.clientY) < 4) return
      activated = true
      update()
      if (!frame) frame = requestAnimationFrame(autoScroll)
    }
    const onUp = () => finish(true)
    /* Geste interrompu (appel entrant, défilement système…) : avant, les
       écouteurs restaient posés et la ligne restait « tenue ». */
    const onCancel = () => finish(false)
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') finish(false)
    }

    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
  }

  /* Position du trait bleu d'insertion, en coordonnées de la liste. */
  const insertY = (() => {
    if (!drag || !frozen.current) return null
    const rows = frozen.current.rows
    const row = rows[drag.boundary]
    if (row) return row.top
    const last = rows[rows.length - 1]
    return last ? last.top + last.height : 0
  })()

  return (
    <aside
      className={cn(
        'flex w-[264px] shrink-0 flex-col bg-white',
        floating && 'shadow-pop',
      )}
    >
      <div data-rail-scroll className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-7">
        <div className="flex items-center justify-between px-3 pb-2.5">
          {/* « Sections de la page » reste le nom (lecteurs d'écran,
              tests) ; l'œil lit « Votre page », comme sur l'espace Qeeps. */}
          <h3 className="text-[13px] font-medium text-[#8aa4a8]">
            <span aria-hidden="true">Votre page</span>
            <span className="sr-only">Sections de la page</span>
          </h3>
          {floating && onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Replier la liste"
              title="Replier la liste"
              className="-mr-1 rounded-md p-1 text-stone transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-deep/50"
            >
              <X className="h-[13px] w-[13px]" strokeWidth={1.7} />
            </button>
          )}
        </div>

        <ul ref={listRef} className="relative flex flex-col gap-0.5">
          {roots.map((section, index) => {
            const active = section.id === selectedId
            const renaming = renamingId === section.id
            const confirming = confirmId === section.id
            const dragged = drag?.id === section.id
            const highlighted = highlightId === section.id
            const nom = labelOf(section)
            const premiere = index === 0
            const derniere = index === roots.length - 1
            const tone = toneOf(section.type)
            const Icone = tone.icon

            return (
              <li
                key={section.id}
                data-section-id={section.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(section.id, el)
                  else rowRefs.current.delete(section.id)
                }}
                className={cn(
                  'group relative flex select-none flex-col rounded-[10px] text-[14px] font-medium transition-[background-color,color] duration-[250ms]',
                  active ? 'font-semibold text-foreground' : 'text-[#6b8186] hover:bg-[#f7f8f8] hover:text-foreground',
                  highlighted && 'bg-accent',
                  !section.isActive && !confirming && 'opacity-45',
                  dragged && 'z-10 bg-white shadow-sm',
                )}
                style={{
                  /* La teinte de la section, adoucie : le fond de la ligne
                     active, comme le plan de page de l'espace Qeeps. */
                  ...(active && !highlighted
                    ? { background: `color-mix(in srgb, ${tone.bg} 45%, white)` }
                    : {}),
                  ...(drag && drag.id === section.id
                    ? { transform: `translateY(${drag.delta}px)` }
                    : {}),
                }}
              >
                <div className="flex h-10 items-center gap-1 pl-1 pr-1">
                  {/* Poignée : glisser à la souris. Monter/Descendre, dans
                      le menu, font la même chose au clavier et au doigt. */}
                  <span
                    aria-hidden="true"
                    onPointerDown={(e) => beginDrag(e, section.id, index)}
                    /* `touch-none` : au doigt, le navigateur ne prend plus
                       le geste pour un défilement (qui annulait le glisser). */
                    className="flex h-6 w-3.5 shrink-0 cursor-grab touch-none items-center justify-center text-[#8aa4a8] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                  >
                    <GripVertical className="h-[13px] w-[13px]" strokeWidth={1.7} />
                  </span>

                  {renaming ? (
                    <input
                      autoFocus
                      aria-label={`Nouveau nom de « ${nom} »`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitRename(section, draft)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(section, draft)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 rounded-md border border-blue-deep/50 bg-white px-1.5 py-1 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-blue-deep/40"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirming) onSelect(section.id)
                      }}
                      aria-current={active ? 'true' : undefined}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-[8px] py-1 pl-0.5 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                          active ? 'scale-[1.06] opacity-100' : 'opacity-75 group-hover:opacity-100',
                        )}
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        <Icone className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{nom}</span>
                      {!section.isActive && (
                        <span className="shrink-0 rounded-full bg-stone/15 px-1.5 py-px text-[12px] font-medium text-stone">
                          masquée
                        </span>
                      )}
                    </button>
                  )}

                  {!renaming && !confirming && (
                    <ActionMenu
                      label={`Actions de « ${nom} »`}
                      /* Discret, comme le plan de Qeeps : visible au survol
                         de la ligne, sur la ligne active, au clavier, et
                         toujours au doigt (pas de survol). */
                      className={cn(
                        'transition-opacity duration-200 [@media(hover:none)]:opacity-100',
                        active ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100',
                      )}
                      items={[
                        { label: 'Modifier', icon: <Pencil />, onSelect: () => onSelect(section.id) },
                        {
                          label: 'Monter',
                          icon: <ArrowUp />,
                          disabled: premiere,
                          onSelect: () => void reorderTo(section.id, index, index - 1),
                        },
                        {
                          label: 'Descendre',
                          icon: <ArrowDown />,
                          disabled: derniere,
                          onSelect: () => void reorderTo(section.id, index, index + 2),
                        },
                        { label: 'Dupliquer', icon: <Copy />, hint: 'Une copie juste en dessous', onSelect: () => onDuplicate(section) },
                        {
                          label: section.isActive ? 'Masquer' : 'Afficher',
                          icon: section.isActive ? <EyeOff /> : <Eye />,
                          hint: section.isActive
                            ? 'La section reste ici, mais disparaît du site'
                            : 'La section revient sur le site',
                          onSelect: () => onToggle(section),
                        },
                        {
                          label: 'Renommer',
                          icon: <TextCursorInput />,
                          hint: 'Le nom dans cette liste seulement',
                          onSelect: () => {
                            setRenamingId(section.id)
                            setDraft(section.name ?? '')
                          },
                        },
                        { label: 'Supprimer', icon: <Trash2 />, danger: true, onSelect: () => setConfirmId(section.id) },
                      ]}
                    />
                  )}
                </div>

                {/* Confirmation en clair, dans la ligne : pas de corbeille
                    « armée » qui semble ne rien faire au premier clic. */}
                {confirming && (
                  <div
                    role="alertdialog"
                    aria-label="Confirmer la suppression"
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-wrap items-center gap-1.5 border-t border-border/70 px-2.5 pb-2 pt-1.5 text-[12.5px] text-foreground"
                  >
                    <span className="mr-auto basis-full leading-snug">
                      Supprimer « {nom} » ? Elle disparaîtra du site à la
                      prochaine publication — vous pourrez annuler juste après.
                    </span>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => {
                        setConfirmId(null)
                        void onDelete(section.id)
                      }}
                      className="rounded-[6px] bg-red-600 px-2 py-[3px] text-[12px] font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setConfirmId(null)
                      }}
                      className="rounded-[6px] border border-line-strong bg-white px-2 py-[3px] text-[12px] text-ink-soft transition-colors hover:text-foreground"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </li>
            )
          })}

          {/* Trait bleu d'insertion pendant le glisser. */}
          {insertY !== null && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1 z-20 h-[2px] rounded-full bg-[#176c79]"
              style={{ top: insertY - 2 }}
            />
          )}
        </ul>

        <button
          type="button"
          onClick={onAdd}
          className="group/add mt-2 flex items-center gap-[7px] rounded-[8px] px-3 py-2 text-[13.5px] font-medium text-[#176c79] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus
            className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/add:rotate-90"
            strokeWidth={2}
          />
          Ajouter une section
        </button>
      </div>
    </aside>
  )
}
