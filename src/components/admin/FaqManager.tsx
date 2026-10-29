'use client'

import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, HelpCircle, Pencil, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDelete } from './ConfirmDelete'
import { FieldError } from './form/FieldError'
import { useActionForm } from './hooks/useActionForm'
import { useSortableSensors } from './hooks/useSortableSensors'
import { PASTELS } from './editor/pastels'
import { PageHeader } from './PageHeader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn, truncate } from '@/lib/utils'
import {
  createFaq,
  deleteFaq,
  reorderFaq,
  toggleFaq,
  updateFaq,
} from '@/server/actions/content'
import type { ActionResult } from '@/server/actions/types'
import type { FaqItem } from '@/server/db/schema'

type Draft = {
  id: string | null
  question: string
  answer: string
  category: string
  isActive: boolean
}

const emptyDraft: Draft = {
  id: null,
  question: '',
  answer: '',
  category: '',
  isActive: true,
}

export function FaqManager({ items: initial }: { items: FaqItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [draft, setDraft] = useState<Draft | null>(null)
  /* Erreurs du serveur, champ par champ, affichées sous le champ fautif. */
  const { pending, start, fieldErrors: erreurs, run } = useActionForm()

  const sensors = useSortableSensors()
  const visibles = items.filter((i) => i.isActive).length

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)

    start(async () => {
      const result = await reorderFaq(next.map((i) => i.id))
      if (result.ok) toast.success('Ordre enregistré.')
      else {
        setItems(items)
        toast.error(result.error)
      }
    })
  }

  function save() {
    if (!draft) return

    const payload = {
      question: draft.question,
      answer: draft.answer,
      category: draft.category || null,
      isActive: draft.isActive,
    }

    /*
     * L'état local fait foi — comme dans l'écran des accompagnements, et
     * pour la même raison : un effet qui recopierait les props écraserait
     * l'ordre obtenu au glisser-déposer. Il faut donc écrire ici ce que
     * le serveur vient d'enregistrer. Sans cela, `router.refresh()` seul
     * ne changeait RIEN à l'écran : la question créée n'apparaissait pas,
     * et la question modifiée gardait son ancien texte. La notification
     * confirmait pourtant, ce qui est la pire des combinaisons.
     */
    if (draft.id) {
      const id = draft.id
      run(() => updateFaq(id, payload), {
        success: 'Question modifiée.',
        onSuccess: () => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id ? { ...i, ...payload, updatedAt: new Date() } : i,
            ),
          )
          setDraft(null)
          router.refresh()
        },
      })
    } else {
      run(() => createFaq(payload), {
        success: 'Question ajoutée.',
        onSuccess: (data) => {
          const maintenant = new Date()
          setItems((prev) => [
            ...prev,
            {
              ...payload,
              id: data.id,
              sortOrder: prev.length,
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

  return (
    <>
      <PageHeader
        overline="Affichées sur le site"
        title="Questions fréquentes"
        description={
          items.length === 0
            ? 'Les questions que vos visiteurs se posent souvent, et vos réponses.'
            : `${items.length} ${items.length > 1 ? 'questions' : 'question'} · ${visibles} ${visibles > 1 ? 'visibles' : 'visible'} sur le site`
        }
        action={
          <Button size="sm" onClick={() => setDraft(emptyDraft)}>
            <Plus />
            Nouvelle question
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-[24px] bg-block px-6 py-16 text-center">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#8aa4a8]">
            <HelpCircle className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="text-[16px] font-semibold text-foreground">Aucune question pour l’instant</p>
          <p className="max-w-[44ch] text-[14px] text-muted-foreground">
            Commencez par celles qu’on vous pose le plus souvent : elles
            aident aussi Google à mieux présenter votre site.
          </p>
          <Button className="mt-4" onClick={() => setDraft(emptyDraft)}>
            <Plus />
            Ajouter une question
          </Button>
        </div>
      ) : (
        /* Le cadre gris de l'espace Qeeps : il remplit l'écran, la liste
           défile à l'intérieur — la page, elle, reste immobile. */
        <div className="bloc-ecran flex flex-col rounded-[24px] bg-block p-2">
          <div className="flex min-h-0 flex-1 flex-col rounded-[20px] bg-white">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#eef1f2] px-5 py-4 sm:px-6">
              <h2 className="text-[16px] font-semibold text-foreground">
                Vos questions
                <span className="ml-2 text-[13px] font-medium text-[#8aa4a8]">{items.length}</span>
              </h2>
              <p className="text-[13px] text-[#8aa4a8]">
                Glissez la poignée pour changer l’ordre · visible sur le site dès l’enregistrement
              </p>
            </div>
            <DndContext
              /* Identifiant fixe : sans lui, dnd-kit génère un compteur différent
                 côté serveur et côté client (`DndDescribedBy-N`) — erreur
                 d'hydratation React à chaque ouverture de l'écran. */
              id="faq-sortable"
              sensors={sensors}
              collisionDetection={closestCenter}
              /* Bornée à la liste : une ligne tirée au-delà disparaissait
                 à moitié sous le bord arrondi. */
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin] sm:p-3">
                  {items.map((item, index) => (
                    <FaqRow
                      key={item.id}
                      item={item}
                      tone={PASTELS[index % PASTELS.length]!}
                      onEdit={() =>
                        setDraft({
                          id: item.id,
                          question: item.question,
                          answer: item.answer,
                          category: item.category ?? '',
                          isActive: item.isActive,
                        })
                      }
                      onToggle={(checked) =>
                        run(() => toggleFaq(item.id, checked), {
                          success: checked
                            ? 'Question affichée sur le site.'
                            : 'Question masquée du site.',
                          onSuccess: () =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id ? { ...i, isActive: checked } : i,
                              ),
                            ),
                        })
                      }
                      onDeleted={async () => {
                        const result = await deleteFaq(item.id)
                        if (result.ok) {
                          setItems((prev) => prev.filter((i) => i.id !== item.id))
                        }
                        return result
                      }}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? 'Modifier la question' : 'Nouvelle question'}
            </DialogTitle>
            <DialogDescription>
              {draft?.id
                ? 'Vos changements seront visibles sur le site dès l’enregistrement.'
                : 'Écrivez la question comme vos visiteurs la posent, puis votre réponse.'}
            </DialogDescription>
          </DialogHeader>

          {/* Un vrai formulaire : Entrée dans la question vaut
              « Enregistrer », et reste sans effet tant qu'il manque la
              question ou la réponse — comme le bouton. */}
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
          {draft && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="f-question" className="mb-2 block">
                  Question
                </Label>
                <Input
                  id="f-question"
                  value={draft.question}
                  placeholder="Combien de temps dure une séance ?"
                  aria-invalid={erreurs.question ? true : undefined}
                  aria-describedby={erreurs.question ? 'f-question-erreur' : undefined}
                  onChange={(e) =>
                    setDraft({ ...draft, question: e.target.value })
                  }
                />
                <FieldError id="f-question-erreur" messages={erreurs.question} />
              </div>

              <div>
                <Label htmlFor="f-answer" className="mb-2 block">
                  Réponse
                </Label>
                <Textarea
                  id="f-answer"
                  rows={6}
                  value={draft.answer}
                  aria-invalid={erreurs.answer ? true : undefined}
                  aria-describedby={erreurs.answer ? 'f-answer-erreur' : undefined}
                  onChange={(e) =>
                    setDraft({ ...draft, answer: e.target.value })
                  }
                />
                <FieldError id="f-answer-erreur" messages={erreurs.answer} />
                <p className="mt-1.5 text-xs leading-[1.5] text-muted-foreground">
                  Quelques phrases suffisent. Ce texte apparaît tel quel sur
                  le site.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
                <Label htmlFor="f-active" className="cursor-pointer text-[13px] text-foreground">
                  Visible sur le site
                </Label>
                <Switch
                  id="f-active"
                  checked={draft.isActive}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, isActive: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(null)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                pending || !draft?.question.trim() || !draft?.answer.trim()
              }
              aria-busy={pending}
            >
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FaqRow({
  item,
  tone,
  onEdit,
  onToggle,
  onDeleted,
}: {
  item: FaqItem
  /** Le pastel de sa place dans la liste. */
  tone: { bg: string; fg: string }
  onEdit: () => void
  onToggle: (checked: boolean) => void
  onDeleted: () => Promise<ActionResult<unknown>>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        /* `flex-wrap` : sur téléphone, les commandes passent sous le texte
           plutôt que de l'écraser. */
        'group flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] bg-white px-2 py-2.5 transition-colors duration-[250ms] hover:bg-[#f7f8f8] sm:px-3',
        /* Un anneau et une ombre, pas une bordure : une bordure ajoutée
           au départ du glisser grandissait la ligne de 2 px, et toute la
           liste sautait sous le pointeur. */
        isDragging && 'relative z-10 shadow-[0_10px_30px_rgba(22,73,81,0.14)]',
        !item.isActive && 'opacity-60',
      )}
    >
      {/* Poignée toujours visible — rien n'apparaît seulement au survol,
          qui n'existe pas au doigt. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Déplacer « ${item.question} »`}
        className="flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06]"
        style={{ background: tone.bg, color: tone.fg }}
      >
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>

      <div className="min-w-[9rem] flex-1">
        <p className="flex items-center gap-2 truncate text-[14px] font-medium text-foreground">
          {item.question}
          {!item.isActive && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
              Masquée
            </span>
          )}
        </p>
        <p className="truncate text-[13px] text-muted-foreground">
          {truncate(item.answer, 110)}
        </p>
      </div>

      {/* Chaque commande NOMME sa question. « Modifier » et « Afficher
          cette question » répétés à l'identique sur dix lignes ne disent
          rien à qui navigue au lecteur d'écran : il entend dix fois le
          même libellé sans savoir lequel agit sur quoi. */}
      <span className="ml-auto flex shrink-0 items-center gap-1">
        <span className="mr-1 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="hidden text-[13px] text-muted-foreground sm:inline"
          >
            Visible
          </span>
          <Switch
            checked={item.isActive}
            onCheckedChange={onToggle}
            aria-label={`Afficher « ${item.question} »`}
          />
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label={`Modifier « ${item.question} »`}
          title="Modifier"
        >
          <Pencil />
        </Button>

        <ConfirmDelete
          label={item.question}
          description="Cette question disparaîtra du site immédiatement. Cette action est définitive."
          onConfirm={onDeleted}
        />
      </span>
    </li>
  )
}
