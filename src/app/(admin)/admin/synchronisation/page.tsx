import { redirect } from 'next/navigation'

/** L'ancienne adresse : la synchronisation est un onglet des Réglages. */
export default function SynchronisationPage() {
  redirect('/admin/reglages#synchronisation')
}
