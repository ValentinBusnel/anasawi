'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useActionForm } from './hooks/useActionForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setPasswordFromInvitation } from '@/server/actions/users'

/**
 * Le formulaire du lien d'invitation : un mot de passe, sa confirmation.
 * Même dessin que la connexion — c'est la même porte.
 */
export function InvitationForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  /* Pas de notification ici (page publique, sans centre de messages) :
     l'erreur générale s'affiche sous le formulaire, les erreurs de champ
     sous leur champ. */
  const { pending, fieldErrors: erreurs, run } = useActionForm()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [fait, setFait] = useState(false)


  if (fait) {
    return (
      <div role="status" className="space-y-5">
        <p className="rounded-[10px] border border-success/20 bg-success-soft px-3.5 py-3 text-[14px] leading-relaxed text-success-ink">
          Votre mot de passe est enregistré. Vous pouvez vous connecter.
        </p>
        <Button type="button" size="lg" onClick={() => router.push('/login')} className="w-full">
          Se connecter
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setErreur(null)
        run(() => setPasswordFromInvitation(token, { password, confirmation }), {
          onSuccess: () => setFait(true),
          onError: (r) => setErreur(r.fieldErrors ? null : r.error),
        })
      }}
    >
      {/* L'adresse, pour que le navigateur associe le mot de passe au bon
          compte dans son trousseau. */}
      <input type="hidden" name="username" autoComplete="username" value={email} readOnly />

      <div>
        <Label htmlFor="password" className="mb-2 block">
          Mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          autoFocus
          value={password}
          aria-invalid={erreurs.password ? true : undefined}
          aria-describedby="password-aide"
          onChange={(e) => setPassword(e.target.value)}
          className="h-11"
        />
        <p id="password-aide" className={`mt-2 text-[12.5px] leading-[1.5] ${erreurs.password ? 'text-destructive' : 'text-[#696a65]'}`} role={erreurs.password ? 'alert' : undefined}>
          {erreurs.password?.[0] ?? 'Au moins 10 caractères. Une phrase facile à retenir fait un bon mot de passe.'}
        </p>
      </div>

      <div>
        <Label htmlFor="confirmation" className="mb-2 block">
          Le même, une seconde fois
        </Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          required
          autoComplete="new-password"
          value={confirmation}
          aria-invalid={erreurs.confirmation ? true : undefined}
          aria-describedby={erreurs.confirmation ? 'confirmation-erreur' : undefined}
          onChange={(e) => setConfirmation(e.target.value)}
          className="h-11"
        />
        {erreurs.confirmation && (
          <p id="confirmation-erreur" role="alert" className="mt-2 text-[12.5px] text-destructive">
            {erreurs.confirmation[0]}
          </p>
        )}
      </div>

      {erreur && (
        <p
          role="alert"
          className="rounded-[10px] border border-destructive/20 bg-danger-soft px-3.5 py-2.5 text-[13.5px] text-destructive"
        >
          {erreur}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}
      </Button>
    </form>
  )
}
