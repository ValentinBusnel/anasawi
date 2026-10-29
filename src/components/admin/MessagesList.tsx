'use client'

import { Mail, MailOpen, Phone, Reply } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { ConfirmDelete } from './ConfirmDelete'
import { PASTELS } from './editor/pastels'
import { PageHeader } from './PageHeader'
import { Button } from '@/components/ui/button'
import { cn, formatDate, toE164, truncate } from '@/lib/utils'
import { deleteMessage, markMessageRead } from '@/server/actions/content'
import type { ContactMessage } from '@/server/db/schema'

/**
 * La boîte de réception — l'écran « Messages » de l'espace Qeeps.
 *
 * Un cadre gris à deux volets : à gauche la liste (initiale, point des non
 * lus, nom, début du message, date), à droite le message ouvert, sur fond
 * blanc.
 *
 * Le message ouvert reste DANS sa ligne de liste (un `li`) : c'est là que
 * les lecteurs d'écran — et les tests — le trouvent, juste après le nom
 * qu'on vient d'activer. Sur grand écran, il est seulement placé en
 * absolu dans le volet de droite ; sur mobile, il se déplie sous la ligne.
 */

/** Une couleur stable par expéditrice : la même personne, la même pastille. */
function pastelDe(nom: string) {
  let h = 0
  for (const c of nom) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PASTELS[h % PASTELS.length]!
}

function Initiale({ nom, nonLu }: { nom: string; nonLu: boolean }) {
  const p = pastelDe(nom)
  return (
    <span aria-hidden="true" className="relative shrink-0">
      <span
        className="grid h-10 w-10 place-items-center rounded-full text-[15px] font-semibold"
        style={{ background: p.bg, color: p.fg }}
      >
        {nom.trim().charAt(0).toUpperCase() || '?'}
      </span>
      {nonLu && (
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#f2f3f4] bg-[#176c79]" />
      )}
    </span>
  )
}

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter()
  const [items, setItems] = useState(messages)
  const [openId, setOpenId] = useState<string | null>(null)
  const [, start] = useTransition()

  const nonLus = items.filter((m) => !m.isRead).length

  function ouvrir(message: ContactMessage) {
    setOpenId(message.id)

    /* La pastille « Nouveau » ne s'efface qu'une fois le serveur
       d'accord : c'est l'accusé de réception. Avant, elle partait tout de
       suite, et un rechargement rapide la faisait revenir. */
    if (!message.isRead) {
      start(async () => {
        const result = await markMessageRead(message.id, true)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        setItems((prev) => prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m)))
        router.refresh()
      })
    }
  }

  return (
    <>
      <PageHeader
        overline="Formulaire de contact"
        title="Messages"
        description={
          items.length === 0
            ? 'Ce que vos visiteurs vous écrivent depuis le site.'
            : `${nonLus} non ${nonLus > 1 ? 'lus' : 'lu'} sur ${items.length}`
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-[24px] bg-block px-6 py-16 text-center">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#8aa4a8]">
            <Mail className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="text-[16px] font-semibold text-foreground">Aucun message pour l’instant</p>
          <p className="max-w-[40ch] text-[14px] text-muted-foreground">
            Ils arriveront ici quand un visiteur vous écrira depuis le site.
          </p>
        </div>
      ) : (
        <div className="relative grid gap-2 rounded-[24px] bg-block p-2 lg:h-[calc(100dvh-265px)] lg:min-h-[440px] lg:grid-cols-[340px_minmax(0,1fr)]">
          <ul aria-label="Messages reçus" className="flex min-h-0 min-w-0 flex-col gap-0.5 overflow-y-auto overscroll-contain p-1 [scrollbar-width:thin] lg:p-2">
            {items.map((message) => {
              const open = openId === message.id

              return (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => ouvrir(message)}
                    aria-expanded={open}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left transition-[background-color,box-shadow] duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      open
                        ? 'bg-white shadow-[0_1px_2px_rgba(22,73,81,0.06)]'
                        : 'hover:bg-white/60',
                    )}
                  >
                    {/* aria-hidden : le nom accessible du bouton commence
                        par celui de l'expéditrice, pas par son initiale. */}
                    <Initiale nom={message.name} nonLu={!message.isRead} />
                    <span className="min-w-0 flex-1 pt-0.5">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate text-[14px]',
                            message.isRead ? 'font-medium text-[#46606c]' : 'font-semibold text-foreground',
                          )}
                        >
                          {message.name}
                        </span>
                        <time
                          dateTime={message.createdAt.toISOString()}
                          className="shrink-0 text-[12px] text-[#8aa4a8]"
                        >
                          {formatDate(message.createdAt)}
                        </time>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                          {truncate(message.message, 90)}
                        </span>
                        {!message.isRead && (
                          <span className="shrink-0 rounded-full bg-[#ddf7f7] px-2 py-px text-[11px] font-semibold text-[#176c79]">
                            Nouveau
                          </span>
                        )}
                      </span>
                    </span>
                  </button>

                  {open && (
                    <article
                      aria-label={`Message de ${message.name}`}
                      className="mt-1 flex flex-col rounded-[20px] bg-white p-5 animate-[adm-fade_0.3s_ease_both] lg:absolute lg:inset-y-2 lg:left-[350px] lg:right-2 lg:mt-0 lg:overflow-y-auto lg:overscroll-contain lg:p-8"
                    >
                      <header className="flex items-start gap-3.5 border-b border-[#eef1f2] pb-5">
                        <Initiale nom={message.name} nonLu={false} />
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-[18px] font-semibold text-foreground">{message.name}</h2>
                          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{message.email}</p>
                        </div>
                        <time
                          dateTime={message.createdAt.toISOString()}
                          className="shrink-0 pt-1 text-[13px] text-[#8aa4a8]"
                        >
                          {formatDate(message.createdAt)}
                        </time>
                      </header>

                      <p className="mt-5 max-w-[68ch] whitespace-pre-wrap text-[14px] leading-[1.7] text-foreground">
                        {message.message}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[#eef1f2] pt-5">
                        <Button size="sm" asChild>
                          <a href={`mailto:${message.email}`}>
                            <Reply />
                            Répondre par e-mail
                          </a>
                        </Button>

                        {message.phone && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${toE164(message.phone)}`}>
                              <Phone />
                              {message.phone}
                            </a>
                          </Button>
                        )}

                        <span className="flex-1" />

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            start(async () => {
                              const result = await markMessageRead(message.id, false)
                              if (result.ok) {
                                setItems((prev) =>
                                  prev.map((m) => (m.id === message.id ? { ...m, isRead: false } : m)),
                                )
                                setOpenId(null)
                              } else toast.error(result.error)
                            })
                          }
                        >
                          <MailOpen />
                          Marquer comme non lu
                        </Button>

                        <ConfirmDelete
                          label={`le message de ${message.name}`}
                          onConfirm={async () => {
                            const result = await deleteMessage(message.id)
                            if (result.ok) {
                              setItems((prev) => prev.filter((m) => m.id !== message.id))
                              setOpenId(null)
                            }
                            return result
                          }}
                        />
                      </div>
                    </article>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Le volet de droite quand rien n'est ouvert. */}
          <div className="hidden flex-col items-center justify-center gap-1.5 rounded-[20px] bg-white px-6 text-center lg:flex">
            <span className="mb-2 grid h-12 w-12 place-items-center rounded-[14px] bg-block text-[#8aa4a8]">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="text-[16px] font-semibold text-foreground">Choisissez un message à lire</p>
            <p className="max-w-[36ch] text-[14px] text-muted-foreground">
              Il s’affichera ici, avec de quoi répondre en un clic.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
