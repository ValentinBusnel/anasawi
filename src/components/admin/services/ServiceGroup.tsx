'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Check, Pencil, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { ConfirmDelete } from '../ConfirmDelete'
import { ServiceRow } from './ServiceRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/server/actions/types'
import type { ServiceGroup, ServiceWithMedia } from '@/server/db/schema'

/** Conteneur des accompagnements sans famille — jamais un identifiant réel. */
export const SANS_FAMILLE = 'sans-famille'

/* ── Une famille, ou le bloc des accompagnements sans famille ────────── */

export function Famille({
  group,
  services,
  dragged,
  onRename,
  onDelete,
  onEdit,
  onToggle,
  onDeleted,
}: {
  /** `null` pour le bloc des accompagnements présentés seuls. */
  group: ServiceGroup | null
  services: ServiceWithMedia[]
  dragged: string | null
  onRename?: (label: string) => void
  onDelete?: () => Promise<ActionResult<unknown>>
  onEdit: (service: ServiceWithMedia) => void
  onToggle: (service: ServiceWithMedia, checked: boolean) => void
  onDeleted: (service: ServiceWithMedia) => Promise<ActionResult<unknown>>
}) {
  /* Le bloc reçoit les accompagnements qu'on y dépose. L'ORDRE des
     titres, lui, se change dans la colonne de gauche (les « dossiers ») :
     le bloc n'a plus de poignée. */
  const { setNodeRef, isOver } = useDroppable({ id: group?.id ?? SANS_FAMILLE })

  /* Le bloc sans famille ne s'affiche que s'il contient quelque chose — ou
     pendant un glisser, pour qu'on puisse y déposer. */
  if (!group && services.length === 0 && !dragged) return null

  return (
    <section
      ref={setNodeRef}
      className={cn(
        /* Un bloc gris de l'espace Qeeps : le titre, puis les lignes
           blanches arrondies. Survolé pendant un glisser : il prend le
           pastel de l'écran. */
        'rounded-[24px] p-2 transition-[background-color,box-shadow] duration-300',
        isOver
          ? 'bg-[color-mix(in_srgb,var(--page-bg)_60%,white)] shadow-[0_0_0_2px_var(--page-fg)]'
          : 'bg-block',
      )}
    >
      {group ? (
        <TitreFamille
          label={group.label}
          onRename={onRename}
          onDelete={onDelete}
        />
      ) : (
        <p className="flex items-center gap-2.5 px-4 pb-2.5 pt-3 text-[15px] font-semibold text-foreground">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#8aa4a8] opacity-70" />
          Sans titre — présentés seuls
        </p>
      )}

      <SortableContext
        items={services.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {services.length === 0 ? (
          <p className="rounded-[16px] border border-dashed border-[#cfd9db] px-4 py-6 text-center text-[13px] text-muted-foreground">
            Aucun accompagnement sous ce titre. Glissez-en un ici.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {services.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                onEdit={() => onEdit(service)}
                onToggle={(checked) => onToggle(service, checked)}
                onDeleted={() => onDeleted(service)}
              />
            ))}
          </ul>
        )}
      </SortableContext>
    </section>
  )
}

/** Intitulé modifiable au clic, et poignée pour déplacer la famille entière. */
function TitreFamille({
  label,
  onRename,
  onDelete,
}: {
  label: string
  onRename?: (label: string) => void
  onDelete?: () => Promise<ActionResult<unknown>>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const champId = useId()

  useEffect(() => setValue(label), [label])
  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function valider() {
    const propre = value.trim()
    if (propre && propre !== label) onRename?.(propre)
    else setValue(label)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-2 pb-1.5 pt-1.5 sm:px-3">
      {editing ? (
        <>
          <Label htmlFor={champId} className="sr-only">
            Nom du titre
          </Label>
          <Input
            id={champId}
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') valider()
              if (e.key === 'Escape') {
                setValue(label)
                setEditing(false)
              }
            }}
            className="max-w-sm"
          />
          <Button variant="ghost" size="icon" onClick={valider} aria-label="Valider">
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setValue(label)
              setEditing(false)
            }}
            aria-label="Annuler"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Cliquer pour renommer"
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 text-left transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="truncate text-[15px] font-semibold text-foreground">
              {label}
            </span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          </button>

          {onDelete && (
            <ConfirmDelete
              label={label}
              description="Le titre disparaît du site, les accompagnements restent : ils rejoignent la liste sans titre, à leur place."
              succes="Titre retiré — les accompagnements sont conservés."
              onConfirm={onDelete}
            />
          )}
        </>
      )}
    </div>
  )
}

