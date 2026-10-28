'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { Reveal } from '@/components/site/anim'
import { ServicePanel } from '@/components/site/ServicePanel'
import type { ServiceWithMedia } from '@/server/db/schema'
import { numberWordFr } from '@/lib/format'

/*
 * Liste des accompagnements — les rangées et la fiche qu'elles ouvrent.
 *
 * Chaque rangée est un vrai lien vers `?accompagnement=<slug>` : le clic est
 * intercepté pour ouvrir le panneau sans recharger, mais l'adresse reste
 * partageable, un clic du milieu ouvre un onglet, et un moteur de recherche
 * y voit un lien. L'historique est tenu à jour pour que le bouton Retour
 * referme le panneau plutôt que de quitter la page.
 *
 * Dans l'aperçu du constructeur (`interactive` faux), les rangées restent
 * de simples lignes : on y sélectionne des sections, on n'y navigue pas.
 */

const PARAM = 'accompagnement'



function slugFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get(PARAM)
}

function writeLocation(slug: string | null, mode: 'push' | 'replace') {
  const url = new URL(window.location.href)
  if (slug) url.searchParams.set(PARAM, slug)
  else url.searchParams.delete(PARAM)
  const state = { ...(window.history.state ?? {}), servicePanel: slug }
  if (mode === 'push') window.history.pushState(state, '', url)
  else window.history.replaceState(state, '', url)
}

export function ServiceRows({
  items,
  bookingHref,
  ctaLabel,
  interactive = true,
}: {
  items: ServiceWithMedia[]
  bookingHref: string
  ctaLabel?: string
  interactive?: boolean
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const openIndex = useMemo(
    () => items.findIndex((item) => item.slug === openSlug),
    [items, openSlug],
  )
  const openService = openIndex >= 0 ? (items[openIndex] ?? null) : null

  /* Lien profond : `?accompagnement=…` à l'arrivée ouvre la fiche. */
  useEffect(() => {
    if (!interactive) return
    const initial = slugFromLocation()
    if (initial && items.some((item) => item.slug === initial)) {
      setOpenSlug(initial)
    }
  }, [interactive, items])

  /* Retour / Avancer du navigateur : l'URL fait foi. */
  useEffect(() => {
    if (!interactive) return
    const onPop = () => setOpenSlug(slugFromLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [interactive])

  const open = useCallback(
    (slug: string) => {
      /* Déjà ouverte (double clic) : rien à faire — surtout pas une
         deuxième entrée d'historique, que Retour devrait consommer deux
         fois. Une autre fiche déjà ouverte : on remplace l'entrée, pour
         que Retour ferme au lieu de revenir à la fiche précédente. */
      if (openSlug === slug) return
      writeLocation(slug, openSlug ? 'replace' : 'push')
      setOpenSlug(slug)
    },
    [openSlug],
  )

  const close = useCallback(() => {
    /* Si l'ouverture a poussé une entrée, revenir en arrière la consomme ;
       sinon (lien profond direct), on nettoie l'adresse sur place. */
    if (window.history.state?.servicePanel) window.history.back()
    else writeLocation(null, 'replace')
    setOpenSlug(null)
  }, [])

  /* Départ vers le rendez-vous (ancre ou agenda) : on nettoie l'adresse
     SUR PLACE. Un `history.back()` ici entrerait en concurrence avec la
     navigation qui suit, et le `popstate` tardif rouvrirait la fiche. */
  const leave = useCallback(() => {
    writeLocation(null, 'replace')
    setOpenSlug(null)
  }, [])

  return (
    <>
      {/* Survol réduit à l'essentiel : le titre prend le bleu, la flèche
          avance. Plus de carte flottante, plus de rangée qui s'assombrit,
          s'arrondit et passe en italique — un clic ouvre la fiche. */}
      <div className="mt-10 md:mt-12">
        {items.map((service, i) => {
          const last = i === items.length - 1

          /* Première ligne d'une famille : on annonce l'intitulé. La
             comparaison porte sur l'identité de la famille, pas sur son
             texte — deux familles peuvent porter le même nom sans se
             confondre, et renommer n'en scinde aucune. */
          const groupStart =
            service.groupId && service.groupId !== items[i - 1]?.groupId
              ? service.group?.label.trim() || null
              : null
          const rowClass = `group grid grid-cols-1 gap-y-2 border-line px-[var(--spacing-gutter)] py-7 text-left md:py-9 lg:grid-cols-12 lg:items-baseline lg:gap-x-5 ${
            /* L'intitulé de famille porte déjà le filet du dessus. */
            groupStart ? '' : 'border-t'
          } ${last ? 'border-b' : ''}`

          const inner = (
            <>
              <span className="font-serif text-[16px] font-light italic text-stone lg:col-span-1">
                {numberWordFr(i)}
              </span>

              {/* Plus petit que l'intitulé de famille : la hiérarchie se lit
                  à la taille, puisqu'il n'y a plus de filet pour la marquer. */}
              <h3 className="font-serif text-[clamp(23px,2.5vw,35px)] font-light leading-[1.15] transition-colors duration-200 group-hover:text-blue-deep lg:col-span-7">
                {service.title}
              </h3>

              {/* Colonne de droite : la méthode sur grand écran — les
                  rangées restent sobres, la fiche porte le texte. Le
                  résumé ne s'affiche qu'en petit écran, sous le titre. */}
              <div className="lg:col-span-3">
                {service.method && (
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-stone lg:block lg:text-right">
                    {service.method}
                  </span>
                )}

                <p className="mt-1 max-w-[40ch] text-[14.5px] leading-[1.75] text-stone lg:hidden">
                  {service.excerpt}
                  {service.duration ? (
                    <span className="mt-2 block text-[10.5px] font-semibold uppercase tracking-[0.2em] opacity-80">
                      {service.duration}
                    </span>
                  ) : null}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="mt-1 block text-left font-serif text-[22px] text-stone transition-[transform,color] duration-200 ease-out group-hover:translate-x-1 group-hover:text-blue-deep lg:mt-0 lg:col-span-1 lg:text-right"
              >
                →
              </span>
            </>
          )

          return (
            <Fragment key={service.id}>
              {groupStart && (
                <Reveal delay={Math.min(i * 0.07, 0.35)}>
                  {/* Ni filet ni fond, et presque la taille des rangées :
                      ce sont l'italique, le bleu et le centrage qui font
                      lire un titre, pas une échelle plus grande. */}
                  <p
                    className="px-[var(--spacing-gutter)] pb-3 pt-6 text-center font-serif text-[clamp(22px,2.4vw,33px)] font-light italic text-blue-deep md:pb-4 md:pt-8"
                  >
                    {groupStart}
                  </p>
                </Reveal>
              )}

            <Reveal delay={Math.min(i * 0.07, 0.35)}>
              {interactive ? (
                <a
                  href={`?${PARAM}=${encodeURIComponent(service.slug)}`}
                  onClick={(event) => {
                    /* Clic modifié (nouvel onglet, etc.) : on laisse faire. */
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    ) {
                      return
                    }
                    event.preventDefault()
                    open(service.slug)
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={openSlug === service.slug}
                  className={`${rowClass} cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-deep focus-visible:ring-offset-2 focus-visible:ring-offset-ivory`}
                >
                  {inner}
                </a>
              ) : (
                <article className={rowClass}>{inner}</article>
              )}
            </Reveal>
            </Fragment>
          )
        })}
      </div>

      {interactive && (
        <ServicePanel
          service={openService}
          index={Math.max(openIndex, 0)}
          onClose={close}
          onLeave={leave}
          bookingHref={bookingHref}
          ctaLabel={ctaLabel}
        />
      )}
    </>
  )
}
