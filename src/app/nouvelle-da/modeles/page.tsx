import type { Metadata } from 'next'

import { PageModeles } from '@/components/qeeps/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sections — nouvelle DA — ANASAWI',
}

export default function NouvelleDaModelesPage() {
  return <PageModeles base="/nouvelle-da" />
}
