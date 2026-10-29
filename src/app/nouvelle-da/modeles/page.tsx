import type { Metadata } from 'next'

import { ModelesAnasawi } from '@/components/anasawi/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sections — nouvelle DA — ANASAWI',
}

export default function NouvelleDaModelesPage() {
  return <ModelesAnasawi base="/nouvelle-da" />
}
