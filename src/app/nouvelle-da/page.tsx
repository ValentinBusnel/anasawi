import type { Metadata } from 'next'

import { PageAccueil } from '@/components/qeeps/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ANASAWI — nouvelle direction artistique',
}

export default function NouvelleDaPage() {
  return <PageAccueil base="/nouvelle-da" />
}
