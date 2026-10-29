import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { Media } from '@/server/db/schema'

/**
 * Les briques du SITE VITRINE de Qeeps (byqeeps.com), pour le site
 * d'Anne — pas son espace de travail.
 *
 * Ce qui fait la DA, relevé sur le site et repris de la candidature :
 *   - fond var(--a-bg), barre du haut var(--a-nav) de 80 px, logo-mot « Anasawi. » ;
 *   - titres en Poppins gras, le grand titre en dégradé pétrole ;
 *   - surtitres gris 18 px CENTRÉS au-dessus de titres 36 px ;
 *   - boutons 10 × 16 px, rayon 8 : pétrole plein, ou contour fin ;
 *   - blocs gris var(--a-block) de 24 px de rayon, 828 px de large ;
 *   - cartes blanches rayon 10 sous une ombre longue et douce ;
 *   - étiquettes de 24 px, rayon 6, contour ou turquoise doux ;
 *   - chiffres géants en dégradé ; pied de page pétrole ;
 *   - une seule apparition : 20 px de montée, 1,1 s.
 */

export const ENCRE = 'var(--a-ink)'

/** Une section : 96 px en haut et en bas (56 sous 1200 px). */
export function Section({
  id,
  className,
  children,
  etroite = false,
}: {
  id?: string
  className?: string
  children: React.ReactNode
  /** La colonne étroite des blocs (828 px). */
  etroite?: boolean
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 py-14 xl:py-24', className)}>
      <div className={cn('mx-auto w-full px-6', etroite ? 'max-w-[876px]' : 'max-w-[1200px]')}>{children}</div>
    </section>
  )
}

/** Surtitre gris, titre centré — l'en-tête de section de byqeeps.com. */
export function Titre({
  surtitre,
  titre,
  sous,
  serre = false,
  className,
}: {
  surtitre?: string
  titre: React.ReactNode
  sous?: React.ReactNode
  /** 36 px sous le titre au lieu de 88. */
  serre?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-1 text-center', serre ? 'mb-9' : 'mb-14 xl:mb-[88px]', className)}>
      {surtitre && <p className="a-surtitre text-[14px] font-medium leading-[1.2] text-[var(--a-muted)] xl:text-[18px]">{surtitre}</p>}
      <h2 className="text-balance text-[24px] font-semibold leading-[1.2] text-[var(--a-ink)] xl:text-[36px] xl:leading-[49px]">{titre}</h2>
      {sous && <p className="mt-2 max-w-[620px] text-pretty text-[15px] font-medium leading-[1.5] text-[var(--a-muted)]">{sous}</p>}
    </div>
  )
}

/** Le texte courant « gris, avec des mots en pétrole » : *mot* = mis en avant. */
export function Accent({ texte, className }: { texte: string; className?: string }) {
  const morceaux = texte.split(/(\*[^*]+\*)/g)
  return (
    <p className={cn('text-pretty text-[15px] font-medium leading-[1.5] text-[var(--a-muted)] xl:text-[16px]', className)}>
      {morceaux.map((m, i) =>
        m.startsWith('*') && m.endsWith('*') ? (
          <strong key={i} className="font-medium text-[var(--a-ink)]">
            {m.slice(1, -1)}
          </strong>
        ) : (
          m
        ),
      )}
    </p>
  )
}

const BOUTON =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--a-r-btn)] px-4 py-2.5 text-[16px] font-medium leading-[1.2] transition-[opacity,background-color,box-shadow,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--a-accent)] [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:shrink-0'

export const classesBouton = {
  plein: cn(BOUTON, 'bg-[var(--a-ink)] text-white hover:opacity-85'),
  contour: cn(BOUTON, 'bg-transparent text-[var(--a-ink)] shadow-[inset_0_0_0_1px_var(--a-line)] hover:bg-[rgba(var(--a-ombre),0.04)]'),
  blanc: cn(BOUTON, 'bg-white text-[var(--a-ink)] hover:opacity-90'),
}

export function Bouton({
  href,
  children,
  variante = 'plein',
  className,
}: {
  href: string
  children: React.ReactNode
  variante?: keyof typeof classesBouton
  className?: string
}) {
  const externe = /^https?:/.test(href)
  return (
    <Link
      href={href}
      {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(classesBouton[variante], className)}
    >
      {children}
    </Link>
  )
}

/** L'étiquette de 24 px : contour, turquoise doux, ou vert. */
export function Etiquette({
  children,
  ton = 'contour',
  className,
}: {
  children: React.ReactNode
  ton?: 'contour' | 'cyan' | 'vert'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-[5px] whitespace-nowrap rounded-[var(--a-r-tag)] px-[9px] text-[12px] font-medium [&_svg]:h-3 [&_svg]:w-3',
        ton === 'contour' && 'bg-white text-[var(--a-ink)] shadow-[inset_0_0_0_1px_var(--a-line)]',
        ton === 'cyan' && 'bg-[var(--a-tint)] text-[var(--a-ink)]',
        ton === 'vert' && 'bg-[#d1ede0] text-[#3d8a56]',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Le logo-mot, avec son point turquoise (« Valentin. », « Qeeps. »). */
export function LogoMot({ nom, clair = false, className }: { nom: string; clair?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'a-logo whitespace-nowrap text-[26px] font-semibold leading-[27px] tracking-[-0.02em]',
        clair ? 'text-white' : 'text-[var(--a-ink)]',
        className,
      )}
    >
      {nom}
      <span className={clair ? 'text-white' : 'text-[var(--a-accent)]'}>.</span>
    </span>
  )
}

/** Une photo de la photothèque. */
export function Photo({
  media,
  sizes,
  className,
  priorite = false,
}: {
  media: Media | null
  sizes: string
  className?: string
  priorite?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden bg-[var(--a-line)]', className)}>
      {media && (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priorite}
          className="object-cover"
          {...(media.blurDataUrl ? { placeholder: 'blur' as const, blurDataURL: media.blurDataUrl } : {})}
        />
      )}
    </div>
  )
}

/** Étiquette de variante, dans la vitrine des modèles. */
export function Variante({ categorie, nom }: { categorie: string; nom: string }) {
  return (
    <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 pt-16">
      <Etiquette ton="cyan">{categorie}</Etiquette>
      <span className="text-[14px] font-medium text-[var(--a-soft)]">{nom}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--a-line)]" />
    </div>
  )
}
