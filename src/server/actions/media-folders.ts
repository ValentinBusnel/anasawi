'use server'

import { count, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

import { adminAction } from './admin'
import { MESSAGES } from './messages'
import { fail, formError, isUuid, ok, type ActionResult } from './types'
import { db } from '@/server/db'
import { media, mediaFolders, type MediaFolder } from '@/server/db/schema'
import { tags } from '@/server/queries'

/**
 * Les dossiers de la médiathèque : un seul niveau, un nom, un ordre.
 *
 * Supprimer un dossier ne supprime AUCUN fichier : la clé étrangère est en
 * `ON DELETE SET NULL`, ses fichiers redeviennent « non classés ».
 */

const nomSchema = z
  .string()
  .trim()
  .min(1, 'Donnez un nom au dossier.')
  .max(60, 'Le nom est trop long (60 caractères maximum).')

function rafraichir() {
  revalidateTag(tags.media)
  revalidatePath('/admin/medias')
}

export async function createMediaFolder(
  name: string,
): Promise<ActionResult<MediaFolder>> {
  return adminAction(async () => {
    const parsed = z.object({ name: nomSchema }).safeParse({ name })
    if (!parsed.success) return formError(parsed.error, MESSAGES.champsACorriger)

    /* En dernier : le nouveau dossier arrive en bas de la liste. */
    const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(mediaFolders)
    const [created] = await db
      .insert(mediaFolders)
      .values({ name: parsed.data.name, sortOrder: n })
      .returning()
    if (!created) return fail(MESSAGES.enregistrementEchoue)

    rafraichir()
    return ok(created)
  })
}

export async function renameMediaFolder(
  id: string,
  name: string,
): Promise<ActionResult<void>> {
  return adminAction(async () => {
    if (!isUuid(id)) return fail('Ce dossier n’existe plus.')
    const parsed = z.object({ name: nomSchema }).safeParse({ name })
    if (!parsed.success) return formError(parsed.error, MESSAGES.champsACorriger)

    const [updated] = await db
      .update(mediaFolders)
      .set({ name: parsed.data.name, updatedAt: new Date() })
      .where(eq(mediaFolders.id, id))
      .returning({ id: mediaFolders.id })
    if (!updated) return fail('Ce dossier n’existe plus.')

    rafraichir()
    return ok()
  })
}

export async function deleteMediaFolder(id: string): Promise<ActionResult<void>> {
  return adminAction(async () => {
    if (!isUuid(id)) return fail('Ce dossier n’existe plus.')
    await db.delete(mediaFolders).where(eq(mediaFolders.id, id))
    rafraichir()
    return ok()
  })
}

/** Range un fichier dans un dossier (`null` : non classé). */
export async function moveMediaToFolder(
  mediaId: string,
  folderId: string | null,
): Promise<ActionResult<void>> {
  return adminAction(async () => {
    if (!isUuid(mediaId)) return fail(MESSAGES.imageIntrouvable)
    if (folderId !== null && !isUuid(folderId)) return fail('Ce dossier n’existe plus.')

    if (folderId !== null) {
      const [dossier] = await db
        .select({ id: mediaFolders.id })
        .from(mediaFolders)
        .where(eq(mediaFolders.id, folderId))
        .limit(1)
      if (!dossier) return fail('Ce dossier n’existe plus.')
    }

    const [updated] = await db
      .update(media)
      .set({ folderId, updatedAt: new Date() })
      .where(eq(media.id, mediaId))
      .returning({ id: media.id })
    if (!updated) return fail(MESSAGES.imageIntrouvable)

    rafraichir()
    return ok()
  })
}
