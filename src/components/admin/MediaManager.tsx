'use client'

import { Clapperboard, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDelete } from './ConfirmDelete'
import { type MediaKind, UploadField, type UploadFieldHandle } from './MediaPicker'
import { MediaMeta, MediaThumb } from './MediaThumb'
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
import { isVideoMimeType } from '@/lib/media-kind'
import { cn } from '@/lib/utils'
import { updateMedia } from '@/server/actions/media'
import { deleteMedia } from '@/server/actions/media'
import type { Media } from '@/server/db/schema'

/** Les deux genres qu'on peut ajouter — libellés attendus par les tests. */
const GENRES: readonly { valeur: MediaKind; libelle: string }[] = [
  { valeur: 'image', libelle: 'Une image' },
  { valeur: 'video', libelle: 'Une vidéo' },
]

export function MediaManager({ items: initial }: { items: Media[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Media | null>(null)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [pending, start] = useTransition()
  /** Ce qu'on ajoute : une image, ou une vidéo. */
  const [genre, setGenre] = useState<MediaKind>('image')
  /** Un fichier est choisi et attend sa description : l'ajout est en cours. */
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const upload = useRef<UploadFieldHandle>(null)
  const boutonsGenre = useRef<(HTMLButtonElement | null)[]>([])
  const nom = genre === 'video' ? 'vidéo' : 'image'

  function openEditor(media: Media) {
    setEditing(media)
    setAlt(media.alt)
    setCaption(media.caption ?? '')
  }

  function save() {
    if (!editing) return

    start(async () => {
      const result = await updateMedia(editing.id, {
        alt,
        caption: caption || null,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setItems((prev) =>
        prev.map((m) =>
          m.id === editing.id ? { ...m, alt, caption: caption || null } : m,
        ),
      )
      toast.success('Modifications enregistrées.')
      setEditing(null)
      router.refresh()
    })
  }

  /* Flèches gauche/droite entre les deux genres, comme des onglets. */
  function surToucheGenre(e: React.KeyboardEvent, index: number) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const suivant =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? GENRES.length - 1
          : (index + (e.key === 'ArrowRight' ? 1 : -1) + GENRES.length) % GENRES.length
    const cible = GENRES[suivant]
    if (!cible) return
    setGenre(cible.valeur)
    setAjoutEnCours(false)
    boutonsGenre.current[suivant]?.focus()
  }

  return (
    <>
      {/* Ajouter : on choisit d'abord le genre, puis le fichier. */}
      <section aria-labelledby="medias-ajouter" className="rounded-[24px] bg-block p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id="medias-ajouter" className="flex items-center gap-2.5 text-[16px] font-semibold text-foreground">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--page-fg)] opacity-70" />
            Ajouter
          </h2>
          <div
            role="group"
            aria-label="Que voulez-vous ajouter ?"
            className="flex gap-0.5 rounded-[12px] bg-white p-1 shadow-field"
          >
            {GENRES.map(({ valeur, libelle }, index) => (
              <button
                key={valeur}
                ref={(el) => {
                  boutonsGenre.current[index] = el
                }}
                type="button"
                aria-pressed={genre === valeur}
                onClick={() => {
                  setGenre(valeur)
                  setAjoutEnCours(false)
                }}
                onKeyDown={(e) => surToucheGenre(e, index)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[13px] font-medium transition-[background-color,color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  genre === valeur
                    ? 'bg-[var(--page-bg)] text-[var(--page-fg)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {valeur === 'video' ? (
                  <Clapperboard className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {libelle}
              </button>
            ))}
          </div>
        </div>

        <UploadField
          key={genre}
          ref={upload}
          kind={genre}
          onFileChange={(file) => setAjoutEnCours(file !== null)}
          onUploaded={(media) => setItems((prev) => [media, ...prev])}
        />
      </section>

      {items.length === 0 ? (
        <div className="rounded-[24px] bg-block px-6 py-16 text-center">
          <p className="text-[13px] text-ink-soft">Aucune {nom} pour l’instant.</p>
          {/* Pendant qu'un fichier attend sa description, le bouton se tait :
              l'ajout est déjà en cours, juste au-dessus. */}
          {!ajoutEnCours && (
            <Button type="button" className="mt-4" onClick={() => upload.current?.choisir()}>
              {genre === 'video' ? <Clapperboard aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
              Ajouter une {nom}
            </Button>
          )}
        </div>
      ) : (
        <ul
          aria-label="Vos médias"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((media) => {
            const estVideo = isVideoMimeType(media.mimeType)
            return (
              <li
                key={media.id}
                className="flex flex-col overflow-hidden rounded-[16px] bg-block p-1.5 transition-shadow duration-300 hover:shadow-sm"
                title={media.alt}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-[11px] bg-muted">
                  <MediaThumb media={media} sizes="(max-width: 640px) 50vw, 240px" />
                  {estVideo && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-medium text-foreground">
                      Vidéo
                    </span>
                  )}
                </div>

                <div className="min-w-0 px-1.5 pt-2.5">
                  <p className="truncate text-[14px] font-medium text-foreground">{media.alt}</p>
                  <MediaMeta media={media} className="mt-0.5" />
                </div>

                {/* Actions toujours visibles — au doigt, au clavier, sans survol. */}
                <div className="mt-auto flex items-center gap-1.5 px-0.5 pb-0.5 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 flex-1"
                    onClick={() => openEditor(media)}
                  >
                    Modifier
                  </Button>
                  <ConfirmDelete
                    label={media.alt}
                    description={`Si cette ${estVideo ? 'vidéo' : 'image'} est utilisée sur le site, elle n’y apparaîtra plus.`}
                    onConfirm={async () => {
                      const result = await deleteMedia(media.id)
                      if (result.ok) {
                        setItems((prev) => prev.filter((m) => m.id !== media.id))
                      }
                      return result
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modifier {editing && isVideoMimeType(editing.mimeType) ? 'la vidéo' : 'l’image'}
            </DialogTitle>
            <DialogDescription>
              La description s’applique partout où ce média est utilisé sur le site.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="flex items-center gap-3 rounded-[8px] border border-border bg-muted/40 p-2.5">
              <span className="relative block h-[56px] w-[74px] shrink-0 overflow-hidden rounded-[8px] bg-muted">
                <MediaThumb media={editing} sizes="74px" />
              </span>
              <MediaMeta media={editing} />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="m-alt" className="mb-2 block">
                Description{' '}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="m-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                required
                aria-describedby="m-alt-aide"
              />
              <p id="m-alt-aide" className="mt-1.5 text-[12px] leading-[17px] text-muted-foreground">
                Obligatoire. Ce qu’on voit, en une phrase : lue à voix haute par les
                lecteurs d’écran, et utile à Google.
              </p>
            </div>

            <div>
              <Label htmlFor="m-caption" className="mb-2 block">
                Légende
              </Label>
              <Input
                id="m-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                aria-describedby="m-caption-aide"
              />
              <p id="m-caption-aide" className="mt-1.5 text-[12px] leading-[17px] text-muted-foreground">
                Facultatif. Un texte affiché sous le média, quand la section le prévoit.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button onClick={save} disabled={pending || !alt.trim()}>
              {pending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
