import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/admin/AuthShell'
import { LoginForm } from '@/components/admin/LoginForm'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Connexion — ANASAWI',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/admin')

  return (
    <AuthShell
      title="Bienvenue"
      description="Connectez-vous pour modifier votre site."
    >
      <LoginForm />
    </AuthShell>
  )
}
