'use client'

import { Check, Loader2, Plus, Send } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { classesBouton, LogoMot } from './ui'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/server/db/schema'

/* ══════════════════════════════════════════════════════════════════════
   Apparition — l'« appear » Framer de byqeeps.com : 20 px de montée,
   1,1 s, courbe (0.02, 0.45, 0.56, 1). Ce qui est déjà à l'écran au
   chargement ne rejoue rien ; sans JavaScript, tout reste visible.
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
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return setEtat('vu')
    setEtat('cache')
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setEtat('vu')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        etat === 'cache' && 'opacity-0',
        etat === 'vu' && 'motion-safe:animate-[q-appear_1.1s_cubic-bezier(0.02,0.45,0.56,1)_backwards]',
        className,
      )}
      style={etat === 'vu' && delai ? { animationDelay: `${delai}s` } : undefined}
    >
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   La barre du haut de byqeeps.com : 80 px, fond var(--a-nav), logo-mot, liens
   soulignés au survol et pour la section lue, deux boutons à droite.
   Sous 1200 px : 64 px et un menu qui se déroule en panneau arrondi.
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

  useEffect(() => {
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) if (e.isIntersecting) setActif(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const l of liens) {
      const el = document.getElementById(l.href.slice(1))
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [liens])

  const lien = (l: { href: string; label: string }) => (
    <a
      key={l.href}
      href={l.href}
      onClick={() => setOuvert(false)}
      aria-current={actif === l.href ? 'location' : undefined}
      className={cn(
        'text-[15px] font-medium leading-[30px] tracking-[-0.01em] text-[var(--a-ink)] underline-offset-[3px] hover:underline',
        actif === l.href && 'underline',
      )}
    >
      {l.label}
    </a>
  )

  return (
    <header className="sticky top-0 z-50">
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 bg-[var(--a-nav)] transition-[height,border-radius,box-shadow] duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)]',
          'h-16 xl:h-20',
          ouvert && 'max-xl:h-[197px] max-xl:rounded-b-[16px] max-xl:shadow-[0_12px_30px_rgba(var(--a-ombre),0.08),0_2px_6px_rgba(var(--a-ombre),0.04)]',
        )}
      />
      <div className="relative flex h-16 items-center justify-between gap-4 pl-5 pr-2.5 xl:h-20 xl:py-5 xl:pl-[50px] xl:pr-5">
        <div className="flex items-center gap-16">
          <Link href="#haut" className="rounded-[6px]">
            <LogoMot nom={nom} />
          </Link>
          <nav aria-label="Sections" className="flex items-center gap-2.5 max-xl:hidden">
            {liens.map(lien)}
          </nav>
        </div>
        <div className="flex items-center gap-4 max-xl:hidden">
          <a href="#contact" className={classesBouton.contour}>
            Me contacter
          </a>
          <a href={rdv} className={classesBouton.plein}>
            Prendre rendez-vous
          </a>
        </div>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="relative h-11 w-11 xl:hidden"
        >
          <i
            className={cn(
              'absolute left-3 h-0.5 w-5 rounded-[var(--a-r-carte)] bg-[#999] transition-[transform,top] duration-[350ms] ease-[cubic-bezier(0.44,0,0.56,1)]',
              ouvert ? 'top-[21px] rotate-45' : 'top-4',
            )}
          />
          <i
            className={cn(
              'absolute left-3 h-0.5 w-5 rounded-[var(--a-r-carte)] bg-[#999] transition-[transform,top] duration-[350ms] ease-[cubic-bezier(0.44,0,0.56,1)]',
              ouvert ? 'top-[21px] -rotate-45' : 'top-[27px]',
            )}
          />
        </button>
      </div>
      {/* Le panneau du menu, sous 1200 px. */}
      <div
        className={cn(
          'absolute inset-x-5 top-16 transition-[opacity,transform,visibility] duration-[350ms] ease-[cubic-bezier(0.44,0,0.56,1)] xl:hidden',
          ouvert ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0',
        )}
      >
        <nav aria-label="Sections" className="flex h-14 items-center gap-[15px] overflow-x-auto">
          {liens.map(lien)}
        </nav>
        <div className="mt-4 flex gap-4">
          <a href="#contact" onClick={() => setOuvert(false)} className={cn(classesBouton.contour, 'flex-1')}>
            Me contacter
          </a>
          <a href={rdv} onClick={() => setOuvert(false)} className={cn(classesBouton.plein, 'flex-1')}>
            Rendez-vous
          </a>
        </div>
      </div>
    </header>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   La maquette du hero, qui s'incline doucement sous la souris (comme la
   capture de l'espace Qeeps sur byqeeps.com).
   ══════════════════════════════════════════════════════════════════════ */

export function Inclinaison({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return
    const bouge = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      el.style.transform = `rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`
    }
    window.addEventListener('pointermove', bouge)
    return () => window.removeEventListener('pointermove', bouge)
  }, [])
  return (
    <div className={cn('[perspective:1200px]', className)}>
      <div ref={ref} className="transition-transform duration-[400ms] ease-out will-change-transform">
        {children}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Questions — l'accordéon, en cartes blanches à l'ombre de citation.
   ══════════════════════════════════════════════════════════════════════ */

export function Accordeon({ faq }: { faq: FaqItem[] }) {
  const [ouverte, setOuverte] = useState<string | null>(faq[0]?.id ?? null)
  return (
    <ul className="flex flex-col gap-3">
      {faq.map((f) => {
        const open = ouverte === f.id
        return (
          <li
            key={f.id}
            className={cn(
              'rounded-[20px] transition-[background-color,box-shadow] duration-500',
              open ? 'bg-white shadow-[var(--q-shadow-quote)]' : 'bg-[var(--a-block)]',
            )}
          >
            <button
              type="button"
              onClick={() => setOuverte(open ? null : f.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-4 rounded-[20px] px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-[var(--a-accent)]"
            >
              <span className="min-w-0 flex-1 text-[16px] font-semibold leading-[1.35] text-[var(--a-ink)] xl:text-[18px]">{f.question}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300',
                  open ? 'rotate-45 bg-[var(--a-ink)] text-white' : 'bg-white text-[var(--a-ink)]',
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div className={cn('grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-6 pb-6 text-[15px] font-medium leading-[1.6] text-[var(--a-muted)]">
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
  'h-11 w-full rounded-[var(--a-r-champ)] border border-[var(--a-line)] bg-white px-3.5 text-[15px] text-[var(--a-ink)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--a-muted)] focus:border-[var(--a-accent)] focus:shadow-[0_0_0_4px_var(--a-tint)]'
const LIBELLE = 'flex flex-col gap-1.5 text-[14px] font-medium text-[var(--a-ink)]'

export function FormulaireContact({ className }: { className?: string }) {
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
      <div className={cn('flex flex-col items-center justify-center gap-2 rounded-[var(--a-r-carte)] bg-white p-10 text-center shadow-[var(--q-shadow-card)]', className)}>
        <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#d1ede0] text-[#3d8a56]">
          <Check className="h-5 w-5" />
        </span>
        <p className="text-[24px] font-semibold text-[var(--a-ink)]">Message envoyé</p>
        <p className="max-w-[36ch] text-[15px] font-medium text-[var(--a-muted)]">Merci. Je vous réponds personnellement, en général sous 48 heures.</p>
      </div>
    )
  }

  return (
    <form onSubmit={envoyer} className={cn('flex flex-col gap-4 rounded-[var(--a-r-carte)] bg-white p-6 shadow-[var(--q-shadow-card)] sm:p-8', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={LIBELLE}>
          Nom
          <input name="name" required minLength={2} autoComplete="name" className={CHAMP} />
        </label>
        <label className={LIBELLE}>
          Téléphone
          <input name="phone" type="tel" autoComplete="tel" placeholder="Facultatif" className={CHAMP} />
        </label>
      </div>
      <label className={LIBELLE}>
        Adresse e-mail
        <input name="email" type="email" required autoComplete="email" className={CHAMP} />
      </label>
      <label className={LIBELLE}>
        Votre message
        <textarea name="message" required minLength={20} rows={5} className={cn(CHAMP, 'h-auto min-h-[130px] resize-y py-3')} />
      </label>
      {/* Champ piège : invisible pour un humain. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="flex items-start gap-2.5 text-[13px] font-medium leading-[1.5] text-[var(--a-muted)]">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--a-ink)]" />
        J’accepte que mes coordonnées servent uniquement à me répondre.
      </label>
      {message && (
        <p role="alert" className="rounded-[8px] bg-[#f3dde2] px-3.5 py-2.5 text-[14px] font-medium text-[#a4475f]">
          {message}
        </p>
      )}
      <button type="submit" disabled={etat === 'envoi'} className={cn(classesBouton.plein, 'w-full disabled:opacity-50')}>
        {etat === 'envoi' ? <Loader2 className="animate-spin" /> : <Send />}
        {etat === 'envoi' ? 'Envoi…' : 'Envoyer mon message'}
      </button>
    </form>
  )
}
