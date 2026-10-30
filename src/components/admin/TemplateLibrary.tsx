'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Bookmark, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  blockRegistry,
  CATEGORY_HINT,
  getBlock,
  bibliotheque,
  type BlockType,
  type TemplateCategory,
  type TemplateOption,
} from '@/blocks/registry'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { ICONE_PAR_CATEGORIE, PASTELS } from './editor/sectionTone'
import { AnimProvider } from '@/components/site/anim'
import {
  SectionsView,
  type SectionsViewData,
} from '@/components/site/SectionsView'
import { makeSectionRow } from '@/lib/snapshot'
import { cn } from '@/lib/utils'
import type { Media, SavedSection } from '@/server/db/schema'

const MINE = '__mine__'

/**
 * Bibliothèque de modèles — la fenêtre « Ajouter une section ».
 *
 * Les modèles sont rangés par BESOIN (« Qui je suis », « Accompagnements »,
 * « Contact & rendez-vous »…), dans l'ordre où l'on lit un site, chacun
 * avec une phrase qui dit à quoi sert la catégorie. Chaque modèle est
 * prévisualisé par un VRAI rendu : son composant, ses contenus d'exemple,
 * les images de la médiathèque, le tout à l'échelle. « Mes modèles »
 * liste les sections qu'Anne a enregistrées pour les réutiliser.
 */
export function TemplateLibrary({
  open,
  onOpenChange,
  data,
  saved,
  onPick,
  onPickSaved,
  onDeleteSaved,
  theme = 'classique',
}: {
  /** Le site édité : seuls ses modèles sont proposés. */
  theme?: 'classique' | 'moderne'
  open: boolean
  onOpenChange: (open: boolean) => void
  data: SectionsViewData
  saved: SavedSection[]
  onPick: (type: string, label: string) => Promise<void>
  onPickSaved: (saved: SavedSection) => Promise<void>
  onDeleteSaved: (id: string) => Promise<void>
}) {
  const templateLibrary = useMemo(() => bibliotheque(theme), [theme])
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  /** Modèle personnel dont la suppression attend confirmation. */
  const [confirmSavedId, setConfirmSavedId] = useState<string | null>(null)
  const [active, setActive] = useState<string>(
    templateLibrary[0]?.category ?? '',
  )

  const searching = query.trim().length > 0
  const q = query.trim().toLowerCase()

  /* Dernier modèle personnel supprimé : l'onglet « Mes sections »
     disparaît, on revient à la première catégorie plutôt que sur une
     grille vide. */
  useEffect(() => {
    if (active === MINE && saved.length === 0) {
      setActive(templateLibrary[0]?.category ?? '')
    }
  }, [active, saved.length, templateLibrary])

  const results = useMemo(() => {
    if (!searching) return null
    const options = templateLibrary
      .flatMap((g) => g.options)
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q),
      )
    const mine = saved.filter((s) => s.name.toLowerCase().includes(q))
    return { options, mine }
  }, [q, saved, searching, templateLibrary])

  const currentGroup = templateLibrary.find((g) => g.category === active)

  /* Miroir synchrone de `busy` : deux clics dans le même tour de boucle
     (double-clic sur une carte) n'ajoutaient DEUX sections, le rendu
     n'ayant pas encore désactivé les cartes. */
  const busyRef = useRef(false)

  const pick = async (fn: () => Promise<void>, key: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(key)
    try {
      await fn()
      onOpenChange(false)
      setQuery('')
    } catch {
      toast.error('Impossible d’ajouter cette section.')
    } finally {
      busyRef.current = false
      setBusy(null)
    }
  }

  const templateCard = (option: TemplateOption) => (
    /* Une carte, et un bouton qui la couvre entièrement : l'aperçu peut
       contenir des boutons (formulaire de contact…), qu'un <button>
       englobant rendrait invalide. */
    <div
      key={option.type}
      className={cn(
        /* Les cartes de l'espace Qeeps : blanches sur le gris, arrondies à
           20 px, elles se soulèvent d'un rien au survol. */
        'group relative rounded-[20px] bg-white p-2 text-left shadow-[0_1px_2px_rgba(22,73,81,0.06)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(22,73,81,0.1)] has-[>button:focus-visible]:ring-2 has-[>button:focus-visible]:ring-ring',
        busy === option.type && 'opacity-60',
      )}
    >
      <TemplatePreview type={option.type} data={data} />
      <div className="flex items-start gap-3 px-2 pb-1.5 pt-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-foreground">{option.label}</p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.5] text-muted-foreground">
            {option.description}
          </p>
        </div>
        {/* L'action, écrite : on ajoute, on ne « sélectionne » pas. */}
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] bg-secondary px-3 text-[13px] font-medium text-foreground transition-colors group-hover:bg-primary group-hover:text-white group-has-[>button:focus-visible]:bg-primary group-has-[>button:focus-visible]:text-white"
        >
          {busy === option.type ? 'Ajout…' : (
            <>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Ajouter
            </>
          )}
        </span>
      </div>
      <button
        type="button"
        disabled={busy !== null}
        aria-label={`Ajouter la section « ${option.label} »`}
        onClick={() => void pick(() => onPick(option.type, option.label), option.type)}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none"
      >
        <span className="sr-only">{option.label}</span>
      </button>
    </div>
  )

  const savedCard = (model: SavedSection) => (
    <div
      key={model.id}
      className={cn(
        'group relative rounded-[20px] bg-white p-2 shadow-[0_1px_2px_rgba(22,73,81,0.06)] transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(22,73,81,0.1)]',
        busy === model.id && 'opacity-60',
      )}
    >
      <div className="text-left">
        <TemplatePreview
          type={model.type as BlockType}
          data={data}
          payloadOverride={model.payload}
          backgroundColor={model.backgroundColor}
        />
        <p className="mt-3 flex items-center gap-1.5 px-2 text-[14px] font-medium text-foreground">
          <Bookmark className="h-3 w-3 text-blue-deep" />
          {model.name}
        </p>
        <p className="mt-0.5 px-2 pb-1.5 text-[13px] text-muted-foreground">
          {getBlock(model.type)?.label ?? model.type}
        </p>
      </div>
      {/* Bouton couvrant (l'aperçu peut contenir ses propres boutons). */}
      <button
        type="button"
        disabled={busy !== null}
        aria-label={`Ajouter le modèle « ${model.name} »`}
        onClick={() => void pick(() => onPickSaved(model), model.id)}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {confirmSavedId === model.id ? (
        /* Confirmation en place : pas de corbeille qui efface d'un clic. */
        <div
          role="alertdialog"
          aria-label="Confirmer la suppression du modèle"
          className="absolute inset-x-2 top-2 z-20 flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1.5 text-[12px] text-foreground shadow-sm"
        >
          <span className="mr-auto">Supprimer ce modèle ?</span>
          <button
            type="button"
            autoFocus
            onClick={() => {
              setConfirmSavedId(null)
              /* Le constructeur retire le modèle tout de suite et signale
                 lui-même le résultat (succès ou erreur). */
              void onDeleteSaved(model.id)
            }}
            className="rounded-[5px] bg-red-600 px-2 py-[2px] text-[12px] font-medium text-white hover:bg-red-700"
          >
            Supprimer
          </button>
          <button
            type="button"
            onClick={() => setConfirmSavedId(null)}
            className="rounded-[5px] border border-line-strong px-2 py-[2px] text-[12px] text-ink-soft hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          type="button"
          title="Supprimer ce modèle"
          aria-label="Supprimer ce modèle"
          onClick={(e) => {
            e.stopPropagation()
            setConfirmSavedId(model.id)
          }}
          className="absolute right-2 top-2 z-20 hidden rounded-md bg-white/90 p-1.5 text-neutral-400 shadow-sm transition-colors hover:text-red-600 focus-visible:block group-hover:block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Large et haute : on choisit un modèle à ce qu'on voit, pas à son
          nom — les aperçus ont besoin de place. */}
      <DialogContent className="flex h-[90vh] w-[94vw] max-w-[1480px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-6 pr-8">
            <DialogTitle className="shrink-0">
              Que voulez-vous ajouter ?
            </DialogTitle>
            <div className="relative w-72 max-w-[45vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher… (ex. photo, contact)"
                aria-label="Rechercher un modèle"
                className="h-10 w-full rounded-[9px] border border-input bg-card pl-9 pr-3 text-[14px] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus:border-ring focus:ring-[3px] focus:ring-ring/25"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1">
          {/* Catégories */}
          {!searching && (
            <nav className="w-64 shrink-0 space-y-0.5 overflow-y-auto border-r border-[#eef1f2] bg-white p-3">
              <p className="px-2 pb-2 pt-1 text-[13px] font-medium text-[#8aa4a8]">
                Une section pour…
              </p>
              {templateLibrary.map((group, i) => {
                const pastel = PASTELS[i % PASTELS.length]!
                const Icone = ICONE_PAR_CATEGORIE[group.category]
                const actif = active === group.category
                return (
                <button
                  key={group.category}
                  type="button"
                  onClick={() => setActive(group.category)}
                  className={cn(
                    'group flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2 text-left text-[14px] font-medium transition-[background-color,color] duration-[250ms]',
                    actif ? 'font-semibold text-foreground' : 'text-[#6b8186] hover:bg-[#f7f8f8] hover:text-foreground',
                  )}
                  style={actif ? { background: `color-mix(in srgb, ${pastel.bg} 45%, white)` } : undefined}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                      actif ? 'scale-[1.06] opacity-100' : 'opacity-75 group-hover:opacity-100',
                    )}
                    style={{ background: pastel.bg, color: pastel.fg }}
                  >
                    <Icone className="h-[13px] w-[13px]" strokeWidth={2} />
                  </span>
                  <span className="flex-1 truncate">{group.category}</span>
                  <span className="text-[12px] tabular-nums text-[#8aa4a8]">
                    {group.options.length}
                  </span>
                </button>
                )
              })}
              {saved.length > 0 && (
                <>
                  <p className="px-2 pb-2 pt-4 text-[13px] font-medium text-[#8aa4a8]">
                    Personnel
                  </p>
                  <button
                    type="button"
                    onClick={() => setActive(MINE)}
                    className={cn(
                      'flex h-10 w-full items-center gap-2.5 rounded-[10px] px-2 text-left text-[14px] font-medium transition-[background-color,color] duration-[250ms]',
                      active === MINE
                        ? 'bg-block font-semibold text-foreground'
                        : 'text-[#6b8186] hover:bg-[#f7f8f8] hover:text-foreground',
                    )}
                  >
                    <span aria-hidden="true" className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] bg-block text-foreground">
                      <Bookmark className="h-[13px] w-[13px]" strokeWidth={2} />
                    </span>
                    <span className="flex-1">Mes modèles</span>
                    <span className="text-[12px] tabular-nums text-[#8aa4a8]">
                      {saved.length}
                    </span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Previews */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8f8] p-6">
            {searching && results ? (
              results.options.length + results.mine.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[14px] text-muted-foreground">
                    Aucun modèle ne correspond à « {query.trim()} ».
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-3 rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-blue-deep hover:text-blue-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-deep/50"
                  >
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {results.mine.map(savedCard)}
                  {results.options.map(templateCard)}
                </div>
              )
            ) : active === MINE ? (
              <>
                <p className="mb-5 text-[14px] text-muted-foreground">
                  Les sections que vous avez enregistrées comme modèles, avec
                  leur contenu — pour les réutiliser telles quelles.
                </p>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {saved.map(savedCard)}
                </div>
              </>
            ) : (
              <>
                {/* Ce que la catégorie sert à faire, en une phrase : on
                    cherche « une section pour… », pas un nom de modèle. */}
                <p className="mb-5 text-[14px] text-muted-foreground">
                  {CATEGORY_HINT[active as TemplateCategory]}
                </p>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {currentGroup?.options.map(templateCard)}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Preview : le vrai composant, à l'échelle ───────────────────────── */

/** Largeur de rendu simulée — un écran d'ordinateur. */
const PREVIEW_WIDTH = 1280
/** Au-delà, une section très haute (galerie, FAQ) écraserait la grille. */
const PREVIEW_MAX_HEIGHT = 340

/**
 * Cadres gris pour les aperçus : chaque emplacement de photo d'un modèle
 * en reçoit un, avec un petit pictogramme — on voit d'un coup d'œil où
 * la photo ira. Avant, l'aperçu glissait le PREMIER média de la
 * bibliothèque dans chaque emplacement : une vidéo, depuis qu'il y en a,
 * et l'image ne s'affichait pas du tout.
 */
function cadreGris(index: number, ratio: 'paysage' | 'portrait'): Media {
  const [w, h] = ratio === 'portrait' ? [1200, 1500] : [1600, 1000]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#e6e2da"/><g fill="none" stroke="#b9b3a8" stroke-width="${Math.round(w / 90)}" stroke-linejoin="round"><rect x="${w * 0.4}" y="${h / 2 - w * 0.075}" width="${w * 0.2}" height="${w * 0.15}" rx="${w / 80}"/><path d="M${w * 0.42} ${h / 2 + w * 0.05}l${w * 0.05}-${w * 0.055}l${w * 0.04} ${w * 0.04}l${w * 0.03}-${w * 0.03}l${w * 0.04} ${w * 0.045}"/><circle cx="${w * 0.53}" cy="${h / 2 - w * 0.04}" r="${w / 70}"/></g></svg>`
  /* Un identifiant au format UUID : les schémas des modèles l'exigent, et
     un cadre à l'identifiant fantaisiste rendait la section invalide —
     donc invisible dans l'aperçu. */
  return {
    id: `00000000-0000-4000-8000-00000000000${index}`,
    folderId: null,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    pathname: '',
    filename: 'cadre.svg',
    alt: 'Emplacement de photo',
    caption: null,
    width: w,
    height: h,
    blurDataUrl: null,
    mimeType: 'image/png',
    size: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }
}

const CADRES: Media[] = [cadreGris(1, 'paysage'), cadreGris(2, 'portrait'), cadreGris(3, 'paysage')]

/** Contenus d'exemple : les défauts du template ; un cadre gris dans
    chaque emplacement de photo vide, une vidéo de la bibliothèque dans
    chaque emplacement de vidéo. */
function previewPayload(type: BlockType, media: Media[]): unknown {
  const block = blockRegistry[type]
  const payload = block.schema.parse(block.defaults) as Record<string, unknown>
  const videos = media.filter((m) => m.mimeType.startsWith('video/'))

  for (const f of block.fields) {
    if (f.kind === 'media' && !payload[f.name]) {
      const choix = f.mediaKind === 'video' ? videos[0] : CADRES[0]
      if (choix) payload[f.name] = choix.id
    }
    if (
      f.kind === 'mediaList' &&
      Array.isArray(payload[f.name]) &&
      (payload[f.name] as unknown[]).length === 0
    ) {
      payload[f.name] = CADRES.map((m) => m.id)
    }
  }
  return payload
}

function TemplatePreview({
  type,
  data,
  payloadOverride,
  backgroundColor = '#fcfaf7',
}: {
  type: BlockType
  data: SectionsViewData
  /** Modèle personnel : son contenu réel plutôt que les défauts. */
  payloadOverride?: unknown
  backgroundColor?: string
}) {
  /* Une fausse ligne de section, jamais écrite en base — juste de quoi
     faire tourner le moteur de rendu réel. */
  const section = useMemo(
    () =>
      makeSectionRow({
        id: `apercu-${type}`,
        pageId: 'apercu',
        type,
        backgroundColor,
        payload: payloadOverride ?? previewPayload(type, data.media),
      }),
    [type, data.media, payloadOverride, backgroundColor],
  )
  /* Les cadres gris doivent se résoudre comme des médias : on les ajoute
     à la bibliothèque que voit le moteur de rendu. */
  const dataAvecCadres = useMemo(
    () => ({ ...data, media: [...data.media, ...CADRES] }),
    [data],
  )

  /* L'aperçu épouse la largeur de sa carte : l'échelle se déduit de la
     mesure, au lieu d'un facteur figé qui laissait un vide à droite et
     rendait les modèles minuscules. La hauteur suit celle du contenu. */
  const frameRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ scale: 0.3, height: 180, clipped: false })

  useLayoutEffect(() => {
    const frame = frameRef.current
    const inner = innerRef.current
    if (!frame || !inner) return

    const measure = () => {
      const width = frame.clientWidth
      if (width === 0) return
      const scale = width / PREVIEW_WIDTH
      const full = inner.scrollHeight * scale
      setBox({
        scale,
        height: Math.max(120, Math.min(Math.round(full), PREVIEW_MAX_HEIGHT)),
        clipped: full > PREVIEW_MAX_HEIGHT + 1,
      })
    }

    measure()
    /* Seule la carte (`frame`) est observée : sa largeur donne l'échelle.
       `inner` est lu dans le callback (scrollHeight) mais n'est pas observé —
       son échelle est justement modifiée par la mesure, l'observer aurait
       pu boucler (« ResizeObserver loop completed… »). Le changement de
       hauteur de la carte déclenche naturellement une seconde passe. */
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [section])

  return (
    <div
      ref={frameRef}
      className="pointer-events-none relative overflow-hidden rounded-[14px] bg-white ring-1 ring-black/[0.04]"
      style={{ height: box.height }}
      aria-hidden="true"
    >
      {/* `site-tokens` : l'aperçu garde les couleurs et la typographie du
          site, pas celles de l'outil. */}
      <div
        ref={innerRef}
        className="site-tokens bg-ivory"
        style={{
          width: PREVIEW_WIDTH,
          transform: `scale(${box.scale})`,
          transformOrigin: 'top left',
        }}
      >
        <MotionProvider>
          {/* Animations coupées : la vignette montre l'état final, jamais
              un contenu invisible. */}
          <AnimProvider enabled={false}>
            <SectionsView
              sections={[section]}
              data={dataAvecCadres}
              breakpoint="desktop"
            />
          </AnimProvider>
        </MotionProvider>
      </div>

      {/* Section plus haute que le cadre : un fondu dit que ça continue,
          plutôt qu'une coupe nette qui ressemble à un défaut. */}
      {box.clipped && (
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}
