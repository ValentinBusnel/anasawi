import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthShell } from '@/components/admin/AuthShell'
import { InvitationForm } from '@/components/admin/InvitationForm'
import { readInvitation } from '@/server/queries/users'

export const metadata: Metadata = {
  title: 'Choisir mon mot de passe — ANASAWI',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * La page du lien d'invitation : la personne invitée y choisit son mot de
 * passe. Un lien périmé ou déjà utilisé le dit en clair, sans dévoiler
 * pour qui il était.
 */
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invitation = await readInvitation(token)

  if (!invitation) {
    return (
      <AuthShell
        title="Ce lien n’est plus valable."
        description="Il a peut-être déjà servi, ou il a plus de sept jours. Demandez un nouveau lien à la personne qui vous a invité·e."
        footer={
          <Link href="/login" className="transition-colors hover:text-[#164951]">
            Vous avez déjà un mot de passe ? Se connecter
          </Link>
        }
      >
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-[#164951] text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Aller à la connexion
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={`Bienvenue, ${invitation.name}.`}
      description={
        <>
          Choisissez le mot de passe qui vous servira à vous connecter avec
          l’adresse <strong className="font-medium text-[#191b1a]">{invitation.email}</strong>.
        </>
      }
    >
      <InvitationForm token={token} email={invitation.email} />
    </AuthShell>
  )
}
