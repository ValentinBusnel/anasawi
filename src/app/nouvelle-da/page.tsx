import type { Metadata } from 'next'

import { PageAnasawi } from '@/components/anasawi/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ANASAWI — nouvelle direction artistique',
}

export default function NouvelleDaPage() {
  return <PageAnasawi base="/nouvelle-da" />
}
