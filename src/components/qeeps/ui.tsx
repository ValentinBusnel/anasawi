import Image from 'next/image'
import Link from 'next/link'

import { PASTELS } from '@/components/admin/editor/pastels'
import { cn } from '@/lib/utils'
import type { Media } from '@/server/db/schema'

/**
 * Les briques de la direction artistique Qeeps, pour le site.
 *
 * Le vocabulaire de l'espace de la candidature, transposé : Poppins, une
 * seule encre bleu pétrole, des BLOCS GRIS arrondis qui portent des
 * CARTES BLANCHES, des pastilles pastel pour reconnaître chaque chose,
 * des puces arrondies, des ombres à peine posées, et un halo qui dérive
 * doucement derrière l'ouverture.
 */

export { PASTELS }
export const ENCRE = '#164951'
export const ENCRE_VIVE = '#176c79'
export const GRIS = '#f2f3f4'
export const MUET = '#6b8186'
export const MUET_CLAIR = '#8aa4a8'

export const pastel = (i: number) => PASTELS[((i % PASTELS.length) + PASTELS.length) % PASTELS.length]!

/** Une section de page : largeur, marges, ancre. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-[1180px] scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16', className)}>
      {children}
    </section>
  )
}

/** Surtitre, titre, chapeau — l'en-tête de page de l'espace Qeeps. */
export function EnTete({
  surtitre,
  titre,
  intro,
  action,
  centre = false,
  niveau = 'h2',
}: {
  surtitre?: string
  titre: string
  intro?: string | null
  action?: React.ReactNode
  centre?: boolean
  niveau?: 'h1' | 'h2'
}) {
  const H = niveau
  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4',
        centre && 'flex-col items-center text-center',
      )}
    >
      <div className={cn('min-w-0', centre ? 'max-w-[720px]' : 'max-w-[680px]')}>
        {surtitre && <p className="mb-2 text-[14px] font-medium leading-[17px] text-[#8aa4a8]">{surtitre}</p>}
        <H className="text-balance text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#164951] sm:text-[38px]">
          {titre}
        </H>
        {intro && <p className="mt-3 text-pretty text-[16px] leading-[1.6] text-[#6b8186]">{intro}</p>}
      </div>
      {action}
    </div>
  )
}

/** Le bloc gris qui porte les cartes. */
export function Bloc({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-[28px] bg-[#f2f3f4] p-2', className)}>{children}</div>
}

/** Une carte blanche, posée dans un bloc gris. */
export function Carte({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-[22px] bg-white p-6 sm:p-7', className)}>{children}</div>
}

/** La pastille d'icône, au pastel donné. */
export function Tuile({
  rang,
  children,
  taille = 'md',
  className,
}: {
  rang: number
  children: React.ReactNode
  taille?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const p = pastel(rang)
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06]',
        taille === 'sm' && 'h-8 w-8 rounded-[10px] [&_svg]:h-4 [&_svg]:w-4',
        taille === 'md' && 'h-10 w-10 rounded-[12px] [&_svg]:h-[18px] [&_svg]:w-[18px]',
        taille === 'lg' && 'h-12 w-12 rounded-[14px] [&_svg]:h-5 [&_svg]:w-5',
        className,
      )}
      style={{ background: p.bg, color: p.fg }}
    >
      {children}
    </span>
  )
}

/** Une puce arrondie (« Site en ligne », « 50 min »…). */
export function Puce({
  children,
  ton = 'blanc',
  point,
  className,
}: {
  children: React.ReactNode
  ton?: 'blanc' | 'gris' | 'cyan'
  /** Un point de couleur devant le texte. */
  point?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[30px] items-center gap-[7px] whitespace-nowrap rounded-full px-3 text-[13px] font-medium',
        ton === 'blanc' && 'bg-white/80 text-[#164951]',
        ton === 'gris' && 'bg-[#f2f3f4] text-[#46606c]',
        ton === 'cyan' && 'bg-[#ddf7f7] text-[#176c79]',
        className,
      )}
    >
      {point && <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full" style={{ background: point }} />}
      {children}
    </span>
  )
}

const BOUTON =
  'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-5 text-[14px] font-medium transition-[background-color,box-shadow,transform] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176c79] focus-visible:ring-offset-2 [&_svg]:h-4 [&_svg]:w-4'

export function Bouton({
  href,
  children,
  variante = 'plein',
  className,
}: {
  href: string
  children: React.ReactNode
  variante?: 'plein' | 'blanc' | 'lien'
  className?: string
}) {
  const externe = /^https?:/.test(href)
  return (
    <Link
      href={href}
      {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        BOUTON,
        variante === 'plein' && 'bg-[#164951] text-white hover:bg-[#176c79]',
        variante === 'blanc' &&
          'bg-white text-[#164951] shadow-[0_1px_2px_rgba(22,73,81,0.06),0_6px_18px_rgba(22,73,81,0.06)] hover:shadow-[0_2px_4px_rgba(22,73,81,0.08),0_10px_26px_rgba(22,73,81,0.10)]',
        variante === 'lien' && 'h-auto px-0 text-[#176c79] hover:text-[#164951]',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export const classeBouton = BOUTON

/** Le halo pastel qui dérive derrière un bandeau. */
export function Halo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute -inset-[40%] -z-10 bg-[radial-gradient(closest-side_at_18%_30%,rgba(221,247,247,1),transparent),radial-gradient(closest-side_at_62%_70%,rgba(209,237,224,0.85),transparent),radial-gradient(closest-side_at_92%_25%,rgba(243,221,226,0.9),transparent)] blur-[10px] motion-safe:animate-[adm-drift_18s_ease-in-out_infinite_alternate]',
        className,
      )}
    />
  )
}

/** Une photo de la photothèque, dans un cadre arrondi. */
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
    <div className={cn('relative overflow-hidden bg-[#e9eced]', className)}>
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
export function Etiquette({ categorie, nom, rang }: { categorie: string; nom: string; rang: number }) {
  const p = pastel(rang)
  return (
    <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-5 pt-14 sm:px-8">
      <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: p.bg, color: p.fg }}>
        {categorie}
      </span>
      <span className="text-[14px] font-medium text-[#46606c]">{nom}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-[#e1e6e7]" />
    </div>
  )
}
