import type { Metadata } from 'next'

import { PageAccueil } from '@/components/qeeps/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ANASAWI — dans la DA du site Qeeps',
}

/** La page d'accueil d'Anne, construite comme byqeeps.com. */
export default function QeepsPage() {
  return <PageAccueil base="/qeeps" />
}
