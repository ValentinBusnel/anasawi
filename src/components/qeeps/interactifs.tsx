'use client'

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Folder,
  HeartHandshake,
  HelpCircle,
  Images,
  Layers,
  Loader2,
  Menu,
  Plus,
  Send,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { PASTELS } from '@/components/admin/editor/pastels'
import { cn } from '@/lib/utils'
import type { FaqItem, Media, MediaFolder, ServiceWithMedia } from '@/server/db/schema'

const pastel = (i: number) => PASTELS[((i % PASTELS.length) + PASTELS.length) % PASTELS.length]!

/* ══════════════════════════════════════════════════════════════════════
   Apparition au défilement — le geste Qeeps : quelques pixels de montée,
   un fondu, une fois. Ce qui est déjà à l'écran au chargement ne joue
   rien (pas de clignotement) ; sans JavaScript, tout reste visible.
   ══════════════════════════════════════════════════════════════════════ */

export function Apparait({
  children,
  className,
  delai = 0,
}: {
  children: React.ReactNode
  className?: string
  delai?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [etat, setEtat] = useState<'ssr' | 'cache' | 'vu'>('ssr')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setEtat('vu')
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight * 0.92) return setEtat('vu')
    setEtat('cache')
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setEtat('vu')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        etat === 'cache' && 'opacity-0',
        etat === 'vu' && 'motion-safe:animate-[adm-in_0.7s_cubic-bezier(0.02,0.45,0.56,1)_backwards]',
        className,
      )}
      style={etat === 'vu' && delai ? { animationDelay: `${delai}s` } : undefined}
    >
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   En-tête du site — la barre du haut de l'espace Qeeps : logo, onglets
   en pilule avec l'indicateur qui glisse, action principale.
   ══════════════════════════════════════════════════════════════════════ */

export function BarreSite({
  nom,
  liens,
  rdv,
}: {
  nom: string
  liens: { href: string; label: string }[]
  rdv: string
}) {
  const [ouvert, setOuvert] = useState(false)
  const [actif, setActif] = useState<string | null>(null)
  const liste = useRef<HTMLUListElement>(null)
  const [indicateur, setIndicateur] = useState<{ left: number; width: number } | null>(null)

  /* L'onglet de la section qu'on lit s'allume, l'indicateur le suit. */
  useEffect(() => {
    const ids = liens.map((l) => l.href.replace('#', ''))
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) if (e.isIntersecting) setActif(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [liens])

  useLayoutEffect(() => {
    const li = liste.current?.querySelector<HTMLElement>(`[data-href="${actif}"]`)
    setIndicateur(li ? { left: li.offsetLeft, width: li.offsetWidth } : null)
  }, [actif])

  return (
    <header className="sticky top-0 z-50 border-b border-[#eef1f2] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="#haut" className="flex items-center gap-2.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-[#176c79] to-[#164951] text-[15px] font-semibold text-white">
            {nom.charAt(0)}
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#164951]">{nom}</span>
        </Link>

        <nav aria-label="Sections" className="max-lg:hidden">
          <ul ref={liste} className="relative flex items-center gap-0.5 rounded-[12px] bg-[#f2f3f4] p-1">
            {indicateur && (
              <span
                aria-hidden="true"
                className="absolute bottom-1 top-1 rounded-[9px] bg-[color-mix(in_srgb,#ddf7f7_40%,white)] shadow-[0_1px_2px_rgba(22,73,81,0.08),0_4px_12px_rgba(22,73,81,0.06)] transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ left: indicateur.left, width: indicateur.width }}
              />
            )}
            {liens.map((l) => (
              <li key={l.href} data-href={l.href} className="relative z-[1]">
                <a
                  href={l.href}
                  aria-current={actif === l.href ? 'location' : undefined}
                  className={cn(
                    'flex h-9 items-center rounded-[9px] px-3.5 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]',
                    actif === l.href ? 'text-[#164951]' : 'text-[#6b8186] hover:text-[#164951]',
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={rdv}
            className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#164951] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#176c79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79] focus-visible:ring-offset-2 max-sm:hidden"
          >
            Prendre rendez-vous
          </a>
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-expanded={ouvert}
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#f2f3f4] text-[#164951] lg:hidden"
          >
            {ouvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="border-t border-[#eef1f2] bg-white px-5 pb-5 pt-2 lg:hidden">
          <ul className="flex flex-col gap-0.5 rounded-[20px] bg-[#f2f3f4] p-2">
            {liens.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  className="group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[15px] font-medium text-[#164951] hover:bg-white"
                >
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: pastel(i).fg }} />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={rdv}
            onClick={() => setOuvert(false)}
            className="mt-3 flex h-11 items-center justify-center rounded-[12px] bg-[#164951] text-[15px] font-medium text-white"
          >
            Prendre rendez-vous
          </a>
        </div>
      )}
    </header>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Accompagnements « en dossiers » — l'écran Fichiers de Qeeps : les
   titres à gauche, les cartes à droite ; une carte ouverte devient une
   fiche, comme un message dans le lecteur.
   ══════════════════════════════════════════════════════════════════════ */

export function AccompagnementsDossiers({
  services,
  rdv,
}: {
  services: ServiceWithMedia[]
  rdv: string
}) {
  const familles = [...new Map(services.filter((s) => s.group).map((s) => [s.group!.id, s.group!])).values()]
  const seuls = services.filter((s) => !s.group)
  const [vue, setVue] = useState<string>('tous')
  const [fiche, setFiche] = useState<ServiceWithMedia | null>(null)

  const visibles =
    vue === 'tous' ? services : vue === 'seuls' ? seuls : services.filter((s) => s.group?.id === vue)
  const titre =
    vue === 'tous' ? 'Tous les accompagnements' : vue === 'seuls' ? 'Présentés seuls' : familles.find((f) => f.id === vue)?.label

  const lignes = [
    { cle: 'tous', label: 'Tous', n: services.length, icone: <Layers /> },
    ...familles.map((f) => ({
      cle: f.id,
      label: f.label,
      n: services.filter((s) => s.group?.id === f.id).length,
      icone: <HeartHandshake />,
    })),
    ...(seuls.length ? [{ cle: 'seuls', label: 'Présentés seuls', n: seuls.length, icone: <HeartHandshake /> }] : []),
  ]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-[28px] bg-[#f2f3f4] p-2 lg:grid-cols-[270px_minmax(0,1fr)]">
      <nav aria-label="Familles d’accompagnements" className="min-w-0 p-1 lg:p-2">
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
          {lignes.map((l, i) => {
            const actif = vue === l.cle
            return (
              <li key={l.cle} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setVue(l.cle)
                    setFiche(null)
                  }}
                  aria-current={actif ? 'true' : undefined}
                  className={cn(
                    'group flex h-[52px] w-full items-center gap-3 rounded-[14px] px-3 text-left text-[14px] font-medium transition-[background-color,box-shadow,color] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]',
                    actif ? 'bg-white text-[#164951] shadow-[0_1px_2px_rgba(22,73,81,0.06)]' : 'text-[#46606c] hover:bg-white/60',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] [&_svg]:h-4 [&_svg]:w-4"
                    style={{ background: pastel(i).bg, color: pastel(i).fg }}
                  >
                    {l.icone}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  <span className="text-[12px] tabular-nums text-[#8aa4a8]">{l.n}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="min-w-0 rounded-[22px] bg-white p-5 sm:p-6">
        {fiche ? (
          <article key={fiche.id} className="motion-safe:animate-[adm-fade_0.3s_ease_both]">
            <button
              type="button"
              onClick={() => setFiche(null)}
              className="mb-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#6b8186] transition-[color,gap] duration-300 hover:gap-2.5 hover:text-[#164951]"
            >
              <ArrowLeft className="h-4 w-4" />
              {titre}
            </button>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#e9eced]">
                {fiche.media && (
                  <Image src={fiche.media.url} alt={fiche.media.alt} fill sizes="(max-width: 768px) 100vw, 460px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {fiche.method && <span className="rounded-full bg-[#ddf7f7] px-3 py-1 text-[12px] font-semibold text-[#176c79]">{fiche.method}</span>}
                  {fiche.duration && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-[#46606c]">
                      <Clock className="h-3.5 w-3.5" />
                      {fiche.duration}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.01em] text-[#164951]">{fiche.title}</h3>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-[#46606c]">
                  {(fiche.body || fiche.excerpt).replace(/\*/g, '')}
                </p>
                <a
                  href={rdv}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#164951] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#176c79]"
                >
                  Prendre rendez-vous
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        ) : (
          <>
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h3 key={vue} className="text-[16px] font-semibold text-[#164951] motion-safe:animate-[adm-fade_0.3s_ease_both]">
                {titre}
                <span className="ml-2 text-[13px] font-medium text-[#8aa4a8]">{visibles.length}</span>
              </h3>
            </div>
            <ul key={vue} className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((s, i) => (
                <li key={s.id} className="motion-safe:animate-[adm-pop_0.4s_cubic-bezier(0.22,1,0.36,1)_backwards]" style={{ animationDelay: `${i * 0.04}s` }}>
                  <button
                    type="button"
                    onClick={() => setFiche(s)}
                    className="group block w-full text-left focus-visible:outline-none"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-[14px] bg-[#e9eced] transition-shadow duration-300 group-hover:shadow-[0_10px_30px_rgba(22,73,81,0.14)] group-focus-visible:ring-2 group-focus-visible:ring-[#176c79]">
                      {s.media ? (
                        <Image
                          src={s.media.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 280px"
                          className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center" style={{ background: pastel(i).bg, color: pastel(i).fg }}>
                          <HeartHandshake className="h-7 w-7" strokeWidth={1.5} />
                        </span>
                      )}
                      {s.duration && (
                        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-[#164951] backdrop-blur">
                          <Clock className="h-3 w-3" />
                          {s.duration}
                        </span>
                      )}
                    </span>
                    <span className="mt-3 flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold text-[#164951]">{s.title}</span>
                        <span className="mt-1 line-clamp-2 block text-[13px] leading-[1.5] text-[#6b8186]">{s.excerpt.replace(/\*/g, '')}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8aa4a8] transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-[#164951]" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Galerie « en dossiers » — les dossiers de la photothèque à gauche, les
   vignettes à droite, une visionneuse au clic.
   ══════════════════════════════════════════════════════════════════════ */

export function GalerieDossiers({ photos, dossiers }: { photos: Media[]; dossiers: MediaFolder[] }) {
  const [vue, setVue] = useState('tous')
  const visibles = vue === 'tous' ? photos : photos.filter((p) => p.folderId === vue)
  const [ouverte, setOuverte] = useState<number | null>(null)

  const lignes = [
    { cle: 'tous', label: 'Toutes les photos', n: photos.length, icone: <Images /> },
    ...dossiers.map((d) => ({
      cle: d.id,
      label: d.name,
      n: photos.filter((p) => p.folderId === d.id).length,
      icone: <Folder />,
    })),
  ]

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-[28px] bg-[#f2f3f4] p-2 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Dossiers de photos" className="min-w-0 p-1 lg:p-2">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {lignes.map((l, i) => {
              const actif = vue === l.cle
              return (
                <li key={l.cle} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setVue(l.cle)}
                    aria-current={actif ? 'true' : undefined}
                    className={cn(
                      'group flex h-[52px] w-full items-center gap-3 rounded-[14px] px-3 text-left text-[14px] font-medium transition-[background-color,box-shadow] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]',
                      actif ? 'bg-white text-[#164951] shadow-[0_1px_2px_rgba(22,73,81,0.06)]' : 'text-[#46606c] hover:bg-white/60',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] [&_svg]:h-4 [&_svg]:w-4"
                      style={{ background: pastel(i + 6).bg, color: pastel(i + 6).fg }}
                    >
                      {l.icone}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                    <span className="text-[12px] tabular-nums text-[#8aa4a8]">{l.n}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="min-w-0 rounded-[22px] bg-white p-4 sm:p-5">
          <ul key={vue} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visibles.map((p, i) => (
              <li key={p.id} className="motion-safe:animate-[adm-pop_0.4s_cubic-bezier(0.22,1,0.36,1)_backwards]" style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}>
                <button
                  type="button"
                  onClick={() => setOuverte(i)}
                  aria-label={`Agrandir : ${p.alt}`}
                  className="group relative block aspect-square w-full overflow-hidden rounded-[14px] bg-[#e9eced] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]"
                >
                  <Image
                    src={p.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 220px"
                    className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {ouverte !== null && visibles[ouverte] && (
        <Visionneuse photos={visibles} index={ouverte} onIndex={setOuverte} onClose={() => setOuverte(null)} />
      )}
    </>
  )
}

function Visionneuse({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Media[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const photo = photos[index]!
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', touche)
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', touche)
      document.body.style.overflow = avant
    }
  }, [index, photos.length, onClose, onIndex])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(22,73,81,0.55)] p-4 backdrop-blur-sm motion-safe:animate-[adm-fade_0.2s_ease_both]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[980px] rounded-[24px] bg-white p-2 shadow-[0_30px_80px_rgba(22,73,81,0.35)] motion-safe:animate-[adm-dialog-in_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[3/2] overflow-hidden rounded-[18px] bg-[#e9eced]">
          <Image key={photo.id} src={photo.url} alt={photo.alt} fill sizes="980px" className="object-contain motion-safe:animate-[adm-fade_0.3s_ease_both]" />
        </div>
        <div className="flex items-center gap-3 px-3 py-3">
          <p className="min-w-0 flex-1 truncate text-[14px] text-[#46606c]">{photo.caption || photo.alt}</p>
          <span className="text-[13px] tabular-nums text-[#8aa4a8]">
            {index + 1} / {photos.length}
          </span>
          <button type="button" onClick={() => onIndex((index - 1 + photos.length) % photos.length)} aria-label="Photo précédente" className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f2f3f4] text-[#164951] hover:bg-[#e9eced]">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onIndex((index + 1) % photos.length)} aria-label="Photo suivante" className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f2f3f4] text-[#164951] hover:bg-[#e9eced]">
            <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#164951] text-white hover:bg-[#176c79]">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Questions — deux façons : le lecteur à deux volets de la messagerie
   Qeeps, et l'accordéon de cartes.
   ══════════════════════════════════════════════════════════════════════ */

export function QuestionsVolets({ faq }: { faq: FaqItem[] }) {
  const [ouverte, setOuverte] = useState(0)
  const q = faq[ouverte]
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-[28px] bg-[#f2f3f4] p-2 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <ul className="flex flex-col gap-0.5 p-1 lg:p-2">
        {faq.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setOuverte(i)}
              aria-current={ouverte === i ? 'true' : undefined}
              className={cn(
                'group flex w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left transition-[background-color,box-shadow] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]',
                ouverte === i ? 'bg-white shadow-[0_1px_2px_rgba(22,73,81,0.06)]' : 'hover:bg-white/60',
              )}
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06]"
                style={{ background: pastel(i).bg, color: pastel(i).fg }}
              >
                <HelpCircle className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className={cn('min-w-0 flex-1 pt-1.5 text-[14px] leading-[1.4]', ouverte === i ? 'font-semibold text-[#164951]' : 'font-medium text-[#46606c]')}>
                {f.question}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {q && (
        <div className="rounded-[22px] bg-white p-6 sm:p-8">
          <div key={q.id} className="motion-safe:animate-[adm-fade_0.3s_ease_both]">
            {q.category && <p className="mb-2 text-[13px] font-medium text-[#8aa4a8]">{q.category}</p>}
            <h3 className="text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#164951]">{q.question}</h3>
            <p className="mt-4 max-w-[62ch] whitespace-pre-line text-[15px] leading-[1.75] text-[#46606c]">{q.answer.replace(/\*/g, '')}</p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eef1f2] pt-5">
            <span className="text-[13px] tabular-nums text-[#8aa4a8]">
              Question {ouverte + 1} sur {faq.length}
            </span>
            <button
              type="button"
              onClick={() => setOuverte((ouverte + 1) % faq.length)}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#176c79] transition-[gap,color] duration-300 hover:gap-2.5 hover:text-[#164951]"
            >
              Question suivante
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function QuestionsAccordeon({ faq }: { faq: FaqItem[] }) {
  const [ouverte, setOuverte] = useState<string | null>(faq[0]?.id ?? null)
  return (
    <ul className="flex flex-col gap-1.5 rounded-[28px] bg-[#f2f3f4] p-2">
      {faq.map((f, i) => {
        const open = ouverte === f.id
        return (
          <li key={f.id} className="rounded-[20px] bg-white">
            <button
              type="button"
              onClick={() => setOuverte(open ? null : f.id)}
              aria-expanded={open}
              className="group flex w-full items-center gap-4 rounded-[20px] px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79]"
            >
              <span className="w-6 shrink-0 text-[13px] font-semibold tabular-nums" style={{ color: pastel(i).fg }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-medium text-[#164951]">{f.question}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-300',
                  open ? 'rotate-45 bg-[#164951] text-white' : 'bg-[#f2f3f4] text-[#164951] group-hover:bg-[#e9eced]',
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div className={cn('grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="max-w-[70ch] whitespace-pre-line px-5 pb-5 pl-[64px] text-[14.5px] leading-[1.75] text-[#46606c]">
                  {f.answer.replace(/\*/g, '')}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Formulaire de contact — le VRAI : il écrit dans « Messages » de
   l'administration, par la même route que le site (`/api/contact`).
   ══════════════════════════════════════════════════════════════════════ */

const CHAMP =
  'h-11 w-full rounded-[12px] border-0 bg-white px-3.5 text-[14px] text-[#164951] shadow-[0_0_0_1px_#e1e6e7,0_1px_2px_rgba(22,73,81,0.04)] outline-none transition-shadow placeholder:text-[#a8bbbe] focus:shadow-[0_0_0_2px_#176c79]'

export function FormulaireContact() {
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'ok' | 'erreur'>('repos')
  const [message, setMessage] = useState<string | null>(null)

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setEtat('envoi')
    setMessage(null)
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          email: f.get('email'),
          phone: f.get('phone'),
          message: f.get('message'),
          consent: f.get('consent') === 'on',
          website: f.get('website'),
        }),
      })
      if (r.ok) return setEtat('ok')
      const corps = (await r.json().catch(() => null)) as { error?: string } | null
      setMessage(corps?.error ?? 'L’envoi n’a pas abouti. Réessayez dans un instant.')
      setEtat('erreur')
    } catch {
      setMessage('Connexion interrompue. Réessayez dans un instant.')
      setEtat('erreur')
    }
  }

  if (etat === 'ok') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[22px] bg-white p-8 text-center motion-safe:animate-[adm-pop_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
        <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#d1ede0] text-[#2f7d55]">
          <Check className="h-5 w-5" />
        </span>
        <p className="text-[18px] font-semibold text-[#164951]">Message envoyé</p>
        <p className="max-w-[36ch] text-[14px] text-[#6b8186]">Merci. Je vous réponds personnellement, en général sous 48 heures.</p>
      </div>
    )
  }

  return (
    <form onSubmit={envoyer} className="grid min-w-0 gap-3.5 rounded-[22px] bg-white p-6 sm:p-7">
      <p className="text-[16px] font-semibold text-[#164951]">Écrire un message</p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-medium text-[#46606c]">
          Nom
          <input name="name" required minLength={2} autoComplete="name" className={CHAMP} />
        </label>
        <label className="grid gap-1.5 text-[13px] font-medium text-[#46606c]">
          Téléphone <span className="sr-only">(facultatif)</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Facultatif" className={CHAMP} />
        </label>
      </div>
      <label className="grid gap-1.5 text-[13px] font-medium text-[#46606c]">
        Adresse e-mail
        <input name="email" type="email" required autoComplete="email" className={CHAMP} />
      </label>
      <label className="grid gap-1.5 text-[13px] font-medium text-[#46606c]">
        Votre message
        <textarea name="message" required minLength={20} rows={4} className={cn(CHAMP, 'h-auto resize-none py-3')} />
      </label>
      {/* Champ piège : invisible pour un humain. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="flex items-start gap-2.5 text-[13px] leading-[1.5] text-[#6b8186]">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[#164951]" />
        J’accepte que mes coordonnées servent uniquement à me répondre.
      </label>
      {message && (
        <p role="alert" className="rounded-[12px] bg-[#fbe1d6] px-3.5 py-2.5 text-[13px] text-[#a8512e]">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={etat === 'envoi'}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#164951] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#176c79] disabled:opacity-60"
      >
        {etat === 'envoi' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {etat === 'envoi' ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}
