'use client'

import {
  Eye,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu as MenuIcon,
  PenLine,
  Settings,
  Users,
  Sparkles,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LogoMark } from '@/components/site/Logo'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/server/actions/auth'

/**
 * La navigation de l'administration.
 *
 * Les écrans sont regroupés par intention — le contenu du site, les
 * échanges avec les visiteurs, l'administration de l'outil — sous de
 * petits intitulés. L'entrée courante est une surface blanche, nette,
 * avec son icône en bleu : on sait toujours où l'on est.
 *
 * En bas, le compte : l'initiale, le nom, et les deux gestes qu'on y
 * cherche (voir le site, se déconnecter). Sous 1024 px, la colonne devient
 * une barre en haut et un tiroir latéral, avec un voile pour refermer.
 */

type Entree = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  /** L'entrée est courante pour ces chemins (préfixes). */
  chemins: string[]
}

type Groupe = { titre?: string; entrees: Entree[] }

const GROUPES: Groupe[] = [
  {
    entrees: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, chemins: ['/admin'] },
    ],
  },
  {
    titre: 'Contenu',
    entrees: [
      { href: '/admin/accueil', label: 'Mon site', icon: PenLine, chemins: ['/admin/accueil'] },
      {
        href: '/admin/accompagnements',
        label: 'Accompagnements',
        icon: Sparkles,
        chemins: ['/admin/accompagnements'],
      },
      { href: '/admin/faq', label: 'Questions fréquentes', icon: HelpCircle, chemins: ['/admin/faq'] },
      { href: '/admin/medias', label: 'Médias', icon: ImageIcon, chemins: ['/admin/medias'] },
    ],
  },
  {
    titre: 'Échanges',
    entrees: [
      { href: '/admin/messages', label: 'Messages', icon: Mail, chemins: ['/admin/messages'] },
    ],
  },
  {
    titre: 'Administration',
    entrees: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, chemins: ['/admin/utilisateurs'] },
      { href: '/admin/reglages', label: 'Réglages', icon: Settings, chemins: ['/admin/reglages'] },
    ],
  },
]

const ENTREES = GROUPES.flatMap((g) => g.entrees)

function courante(entree: Entree, pathname: string): boolean {
  if (entree.href === '/admin') return pathname === '/admin'
  return entree.chemins.some((c) => pathname === c || pathname.startsWith(`${c}/`))
}

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30'

export function AdminSidebar({
  userName,
  nonLus = 0,
}: {
  userName: string
  /** Messages non lus — la pastille de l'entrée Messages. */
  nonLus?: number
}) {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState(false)

  /* Le tiroir mobile se referme quand on change d'écran… */
  useEffect(() => {
    setOuvert(false)
  }, [pathname])

  /* …et à la touche Échap. */
  useEffect(() => {
    if (!ouvert) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ouvert])

  const initiale = userName.trim().charAt(0).toUpperCase() || '?'

  const groupes = (
    <div className="flex flex-col gap-5">
      {GROUPES.map((groupe, i) => (
        <div key={groupe.titre ?? i}>
          {groupe.titre && (
            <p className="mb-1.5 px-2.5 text-[11.5px] font-medium text-muted-foreground/80">
              {groupe.titre}
            </p>
          )}
          <ul className="flex flex-col gap-px">
            {groupe.entrees.map((entree) => {
              const active = courante(entree, pathname)
              const Icone = entree.icon
              return (
                <li key={entree.href}>
                  <Link
                    href={entree.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[14px] transition-colors duration-150',
                      FOCUS,
                      active
                        ? 'bg-card font-medium text-foreground shadow-xs ring-1 ring-border'
                        : 'text-ink-soft hover:bg-black/[0.04] hover:text-foreground',
                    )}
                  >
                    <Icone
                      className={cn(
                        'h-[17px] w-[17px] shrink-0 transition-colors',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="flex-1 truncate">{entree.label}</span>
                    {entree.href === '/admin/messages' && nonLus > 0 && (
                      <span
                        aria-label={`${nonLus} non lu${nonLus > 1 ? 's' : ''}`}
                        className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11.5px] font-semibold tabular-nums text-white"
                      >
                        {nonLus}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )

  const compte = (
    <div className="mt-auto pt-4">
      <div className="rounded-[12px] border border-border bg-card p-1.5 shadow-xs">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary"
          >
            {initiale}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-medium text-foreground" title={userName}>
              {userName}
            </span>
            <span className="block text-[12px] text-muted-foreground">Mon compte</span>
          </span>
        </div>
        <div className="mt-1 flex flex-col gap-px border-t border-border pt-1.5">
          <Link
            href="/"
            className={cn(
              'flex h-8 items-center gap-2.5 rounded-[8px] px-2 text-[13px] text-ink-soft transition-colors hover:bg-secondary hover:text-foreground',
              FOCUS,
            )}
          >
            <Eye className="h-[15px] w-[15px]" strokeWidth={1.75} />
            Voir le site
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className={cn(
                'flex h-8 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-secondary hover:text-foreground',
                FOCUS,
              )}
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  const marque = (
    <Link
      href="/admin"
      className={cn('flex items-center gap-2.5 rounded-[9px] px-1.5 py-1', FOCUS)}
    >
      <LogoMark className="h-8 w-8" />
      <span className="leading-tight">
        <span className="block text-[14px] font-semibold tracking-[0.12em] text-foreground">ANASAWI</span>
        <span className="block text-[11.5px] text-muted-foreground">Administration</span>
      </span>
    </Link>
  )

  return (
    <>
      {/* ── Colonne, à partir de 1024 px ──────────────────────────── */}
      <nav
        aria-label="Administration"
        className="hidden w-[248px] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 pb-3 pt-4 lg:flex"
      >
        <div className="mb-6">{marque}</div>
        {groupes}
        {compte}
      </nav>

      {/* ── Barre + tiroir, sous 1024 px ─────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-controls="menu-administration"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-[9px] text-foreground transition-colors hover:bg-secondary',
            FOCUS,
          )}
        >
          {ouvert ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-[13.5px] font-semibold tracking-[0.12em]">ANASAWI</span>
        </Link>
        <span className="ml-auto truncate rounded-full bg-secondary px-2.5 py-1 text-[12.5px] font-medium text-ink-soft">
          {ENTREES.find((e) => courante(e, pathname))?.label ?? ''}
        </span>
      </div>
      {ouvert && (
        <>
          {/* Voile : un clic à côté referme le tiroir. */}
          <div
            aria-hidden="true"
            onClick={() => setOuvert(false)}
            className="fixed inset-0 top-14 z-30 bg-[rgba(17,20,18,0.28)] lg:hidden"
          />
          <nav
            id="menu-administration"
            aria-label="Administration"
            className="fixed bottom-0 left-0 top-14 z-40 flex w-[min(300px,86vw)] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 pb-3 pt-4 shadow-pop lg:hidden"
          >
            {groupes}
            {compte}
          </nav>
        </>
      )}
    </>
  )
}
