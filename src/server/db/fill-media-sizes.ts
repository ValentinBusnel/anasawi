import './load-env'

import { eq } from 'drizzle-orm'

import { db } from './index'
import { media } from './schema'

/**
 * Complète le poids des médias enregistrés sans (`size = 0`).
 *
 * Les images posées par les semis (`db:seed-images`, `db:seed-site`) ont
 * été insérées sans leur poids : l'écran Médias affichait « Image » au
 * lieu de « Image · 412 ko ». Ce script télécharge chaque fichier concerné
 * — par son adresse publique, quel que soit le stockage — et écrit le
 * nombre d'octets. Il ne touche à rien d'autre, et ne refait rien pour
 * un média déjà renseigné : on peut le relancer sans risque.
 *
 *   npm run db:fill-media-sizes
 *
 * Les adresses relatives (`/api/media/…`) sont lues sur le site en cours
 * d'exécution : `npm run dev` doit tourner (ou définir MEDIA_BASE_URL).
 */
const BASE = process.env.MEDIA_BASE_URL ?? 'http://localhost:3000'

async function main() {
  const rows = await db.select().from(media).where(eq(media.size, 0))
  console.log(`\n${rows.length} média(s) sans poids.\n`)

  let faits = 0
  for (const m of rows) {
    const url = m.url.startsWith('http') ? m.url : new URL(m.url, BASE).toString()
    try {
      const reponse = await fetch(url)
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`)
      const octets = (await reponse.arrayBuffer()).byteLength
      if (octets === 0) throw new Error('fichier vide')
      await db.update(media).set({ size: octets }).where(eq(media.id, m.id))
      faits += 1
      console.log(`  ✓ ${String(Math.round(octets / 1024)).padStart(6)} ko  ${m.alt.slice(0, 60)}`)
    } catch (erreur) {
      console.log(`  ✗ ${m.alt.slice(0, 60)} — ${(erreur as Error).message}`)
    }
  }

  console.log(`\n${faits} / ${rows.length} complété(s).\n`)
}

main()
  .then(() => process.exit(0))
  .catch((erreur) => {
    console.error(erreur)
    process.exit(1)
  })
