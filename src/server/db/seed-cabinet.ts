import './load-env'

import { eq } from 'drizzle-orm'

import { db } from './index'
import { media, mediaFolders } from './schema'

/**
 * Ajoute des photos « cabinet » (Unsplash, libres de droits) à la
 * médiathèque, rangées dans le dossier « Intérieurs ».
 *
 *   npm run db:seed-cabinet
 *
 * Sur la base de PRODUCTION : préfixer par sa `DATABASE_URL` (une variable
 * du shell l'emporte sur `.env.local`) :
 *
 *   DATABASE_URL="postgres://…" npm run db:seed-cabinet
 *
 * - N'ajoute que des médias : aucune section, aucun réglage n'est modifié.
 *   On choisit ensuite où les utiliser depuis l'administration.
 * - Idempotent : chaque photo est retrouvée par son `pathname` ; relancer
 *   ne crée pas de doublon.
 * - Le dossier « Intérieurs » est créé s'il n'existe pas.
 */

type Photo = {
  unsplashId: string
  orientation: 'portrait' | 'paysage'
  alt: string
  caption: string
}

const DOSSIER = 'Intérieurs'

const PHOTOS: Photo[] = [
  {
    unsplashId: '1754037783933-c25ff9f68f87',
    orientation: 'portrait',
    alt: 'Coin lecture avec un fauteuil et une plante — photo d’attente',
    caption: 'Le coin lecture',
  },
  {
    unsplashId: '1488901512066-cd403111aeb2',
    orientation: 'paysage',
    alt: 'Une chaise vide devant une table, lumière du jour — photo d’attente',
    caption: 'La table',
  },
  {
    unsplashId: '1520605728164-b6a5c6814203',
    orientation: 'paysage',
    alt: 'Deux coussins blancs sur un canapé gris — photo d’attente',
    caption: 'Le canapé',
  },
  {
    unsplashId: '1519710164239-da123dc03ef4',
    orientation: 'paysage',
    alt: 'Chaise blanche et table ronde sur un tapis clair — photo d’attente',
    caption: 'L’accueil',
  },
  {
    unsplashId: '1546387903-6d82d96ccca6',
    orientation: 'portrait',
    alt: 'Branches d’eucalyptus dans un vase de verre — photo d’attente',
    caption: 'Un détail',
  },
  {
    unsplashId: '1554325139-bbd006cd3e5a',
    orientation: 'paysage',
    alt: 'Un livre ouvert sur un bureau — photo d’attente',
    caption: 'Le bureau',
  },
  {
    unsplashId: '1541533260371-b8fc9b596d84',
    orientation: 'portrait',
    alt: 'Un fauteuil près d’une fenêtre lumineuse — photo d’attente',
    caption: 'Près de la fenêtre',
  },
]

function dimensions(photo: Photo) {
  return photo.orientation === 'portrait' ? { width: 1400, height: 1750 } : { width: 1800, height: 1200 }
}

function url(photo: Photo): string {
  const { width, height } = dimensions(photo)
  return `https://images.unsplash.com/photo-${photo.unsplashId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`
}

async function dossier(): Promise<string> {
  const [existant] = await db.select().from(mediaFolders).where(eq(mediaFolders.name, DOSSIER)).limit(1)
  if (existant) return existant.id
  const tous = await db.select({ ordre: mediaFolders.sortOrder }).from(mediaFolders)
  const [cree] = await db
    .insert(mediaFolders)
    .values({ name: DOSSIER, sortOrder: tous.reduce((m, d) => Math.max(m, d.ordre + 1), 0) })
    .returning({ id: mediaFolders.id })
  if (!cree) throw new Error('Création du dossier impossible')
  return cree.id
}

async function main() {
  const folderId = await dossier()
  let ajoutees = 0
  for (const photo of PHOTOS) {
    const pathname = `unsplash/${photo.unsplashId}`
    const [existe] = await db.select({ id: media.id }).from(media).where(eq(media.pathname, pathname)).limit(1)
    if (existe) {
      console.log(`  · déjà là : ${photo.caption}`)
      continue
    }
    await db.insert(media).values({
      folderId,
      url: url(photo),
      pathname,
      filename: `${photo.unsplashId}.jpg`,
      alt: photo.alt,
      caption: photo.caption,
      ...dimensions(photo),
      mimeType: 'image/jpeg',
      size: 0,
    })
    ajoutees++
    console.log(`  + ${photo.caption}`)
  }
  console.log(`\n✓ ${ajoutees} photo(s) ajoutée(s) au dossier « ${DOSSIER} ».`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
