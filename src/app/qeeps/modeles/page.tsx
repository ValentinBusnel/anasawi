import type { Metadata } from 'next'

import { PageModeles } from '@/components/qeeps/pages'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sections dans la DA du site Qeeps — ANASAWI',
}

export default function QeepsModelesPage() {
  return <PageModeles base="/qeeps" />
}
