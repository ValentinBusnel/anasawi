import {
  CheckCircle2,
  ChevronRight,
  Eye,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  PenLine,
  Settings,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { AdminContent } from '@/components/admin/AdminContent'
import { PageHeader } from '@/components/admin/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { hasUnpublishedChanges } from '@/lib/publish'
import { getDashboardCounts, getHomePageForAdmin, getSettings } from '@/server/queries'

export const dynamic = 'force-dynamic'

const pluriel = (n: number, un: string, plusieurs: string) =>
  `${n} ${n > 1 ? plusieurs : un}`

/**
 * Tableau de bord — un accueil, pas un cockpit.
 *
 * Trois blocs, dans l'ordre où l'on se pose les questions : où en est mon
 * site (et le bouton pour le modifier) ; qu'est-ce qui m'attend (messages,
 * modifications à publier, informations manquantes — et rien d'autre) ;
 * où gérer le reste, en liste. Pas de statistiques décoratives.
 */
export default async function DashboardPage() {
  const [home, settings] = await Promise.all([getHomePageForAdmin(), getSettings()])
  const stats = await getDashboardCounts(home?.id ?? null)

  const prenom = settings.practitionerName?.split(' ')[0]

  /* Le MÊME état que dans l'éditeur : en ligne, modifications à publier,
     ou jamais publié. Le tableau de bord disait « En ligne » avec des
     modifications en attente — deux vérités pour une seule page. */
  const etatSite = !home?.publishedAt
    ? { texte: 'Jamais publié', classe: 'bg-muted text-muted-foreground' }
    : hasUnpublishedChanges(home.sections, home.publishedSnapshot)
      ? { texte: 'Modifications à publier', classe: 'bg-warning-soft text-warning-ink' }
      : { texte: 'En ligne', classe: 'bg-success-soft text-success-ink' }

  const manque = [
    !settings.practitionerName && 'votre nom',
    !settings.contactEmail && 'votre e-mail de contact',
    !settings.contactPhone && 'votre téléphone',
    !settings.addressCity && 'l’adresse du cabinet',
    !settings.defaultSeoDescription && 'la description pour Google',
  ].filter((w): w is string => Boolean(w))

  /* L'état du site, en une phrase et une couleur. */
  const etat = !home?.publishedAt
    ? {
        ton: 'muted' as const,
        titre: 'Votre site n’est pas encore publié',
        texte: 'Préparez vos sections, puis publiez quand vous le souhaitez.',
      }
    : hasUnpublishedChanges(home.sections, home.publishedSnapshot)
      ? {
          ton: 'warning' as const,
          titre: 'Des modifications attendent d’être publiées',
          texte: 'Vos visiteurs voient encore l’ancienne version.',
        }
      : {
          ton: 'success' as const,
          titre: 'Votre site est en ligne et à jour',
          texte: 'Ce que vous voyez dans l’éditeur est ce que vos visiteurs voient.',
        }

  /* Ce qui demande une action, par ordre d'importance. Rien d'autre. */
  const aFaire = [
    stats.nonLus > 0 && {
      href: '/admin/messages',
      icone: Mail,
      texte: `${pluriel(stats.nonLus, 'message à lire', 'messages à lire')}`,
      detail: 'Quelqu’un vous a écrit depuis le site.',
    },
    etat.ton === 'warning' && {
      href: '/admin/accueil',
      icone: PenLine,
      texte: 'Publier vos modifications',
      detail: 'Ouvrez l’éditeur et cliquez sur « Publier ».',
    },
    manque.length > 0 && {
      href: '/admin/reglages',
      icone: Settings,
      texte: 'Compléter mes informations',
      detail: `Il manque ${manque.join(', ')} — cela aide Google à présenter votre site.`,
    },
  ].filter(Boolean) as {
    href: string
    icone: typeof Mail
    texte: string
    detail: string
  }[]

  const acces = [
    {
      href: '/admin/accompagnements',
      icone: Sparkles,
      label: 'Accompagnements',
      detail: stats.services > 0 ? pluriel(stats.services, 'accompagnement', 'accompagnements') : 'Aucun pour l’instant',
    },
    {
      href: '/admin/faq',
      icone: HelpCircle,
      label: 'Questions fréquentes',
      detail: stats.faq > 0 ? pluriel(stats.faq, 'question', 'questions') : 'Aucune pour l’instant',
    },
    {
      href: '/admin/medias',
      icone: ImageIcon,
      label: 'Médias',
      detail: stats.media > 0 ? pluriel(stats.media, 'photo ou vidéo', 'photos et vidéos') : 'Aucun pour l’instant',
    },
    {
      href: '/admin/messages',
      icone: Mail,
      label: 'Messages',
      detail: stats.nonLus > 0 ? pluriel(stats.nonLus, 'non lu', 'non lus') : 'Tout est lu',
    },
    {
      href: '/admin/reglages',
      icone: Settings,
      label: 'Réglages',
      detail: 'Coordonnées, apparence, menu, référencement',
    },
  ]

  const pastille = {
    success: 'bg-success',
    warning: 'bg-warning',
    muted: 'bg-muted-foreground/50',
  }[etat.ton]

  return (
    <AdminContent width="default">
      <PageHeader
        title={prenom ? `Bonjour ${prenom}` : 'Bonjour'}
        description="Voici où en est votre site aujourd’hui."
        action={
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            <Eye strokeWidth={1.75} />
            Voir le site
          </Link>
        }
      />

      {/* ── L'état du site, et l'action principale ─────────────────── */}
      <section
        aria-label="État du site"
        className="rounded-[16px] border border-border bg-card p-6 shadow-xs sm:p-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${pastille}`} />
              {etatSite.texte}
              <span aria-hidden="true">·</span>
              {pluriel(stats.sections, 'section', 'sections')}
            </p>
            <h2 className="mt-2 text-[19px] tracking-[-0.02em]">{etat.titre}</h2>
            <p className="mt-1 text-[14px] text-muted-foreground">{etat.texte}</p>
          </div>
          <Link
            href="/admin/accueil"
            className={`${buttonVariants({ size: 'lg' })} shrink-0`}
          >
            <PenLine strokeWidth={1.75} />
            Modifier mon site
          </Link>
        </div>
      </section>

      {/* ── À faire ────────────────────────────────────────────────── */}
      <section aria-labelledby="a-faire" className="mt-10">
        <h2 id="a-faire" className="text-[15px] tracking-[-0.01em]">
          À faire
        </h2>
        {aFaire.length === 0 ? (
          <p className="mt-3 flex items-center gap-2.5 rounded-[14px] border border-dashed border-border px-5 py-4 text-[14px] text-muted-foreground">
            <CheckCircle2 className="h-[18px] w-[18px] text-success" strokeWidth={1.75} />
            Rien d’urgent — tout est à jour.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card shadow-xs">
            {aFaire.map((item) => {
              const Icone = item.icone
              return (
                <li key={item.href + item.texte}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-primary/10 text-primary">
                      <Icone className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-foreground">{item.texte}</span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">{item.detail}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Accès ─────────────────────────────────────────────────── */}
      <section aria-labelledby="acces" className="mt-10">
        <h2 id="acces" className="text-[15px] tracking-[-0.01em]">
          Gérer le contenu
        </h2>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card shadow-xs">
          {acces.map((item) => {
            const Icone = item.icone
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:outline-none"
                >
                  <Icone className="h-[18px] w-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.75} />
                  <span className="flex-1 text-[14px] font-medium text-foreground">{item.label}</span>
                  <span className="hidden text-[13px] text-muted-foreground sm:block">{item.detail}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </AdminContent>
  )
}
