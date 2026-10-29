import 'server-only'

import { eq } from 'drizzle-orm'

import { PAGE_MODERNE_PAR_DEFAUT } from '@/blocks/moderne/blocs'
import { blockRegistry } from '@/blocks/registry'
import { projectSection } from '@/lib/snapshot'
import { db } from '@/server/db'
import { pages, sections } from '@/server/db/schema'
import { SLUG_MODERNE } from '@/server/queries'

/**
 * La page de la version moderne : créée au premier passage dans
 * l'éditeur, avec ses dix sections dans l'ordre, et publiée d'emblée
 * (sinon /moderne resterait vide jusqu'au premier « Publier »).
 *
 * Idempotente : si la page existe, rien n'est touché.
 */
export async function assurerPageModerne(): Promise<void> {
  const [existante] = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, SLUG_MODERNE)).limit(1)
  if (existante) return

  const [page] = await db
    .insert(pages)
    .values({ slug: SLUG_MODERNE, title: 'Accueil — version moderne', status: 'published', isHome: false })
    .onConflictDoNothing()
    .returning()
  if (!page) return

  const lignes = await db
    .insert(sections)
    .values(
      PAGE_MODERNE_PAR_DEFAUT.map((type, i) => ({
        pageId: page.id,
        type,
        sortOrder: i,
        payload: blockRegistry[type].defaults as Record<string, unknown>,
      })),
    )
    .returning()

  await db
    .update(pages)
    .set({ publishedSnapshot: lignes.map(projectSection), publishedAt: new Date() })
    .where(eq(pages.id, page.id))
}
