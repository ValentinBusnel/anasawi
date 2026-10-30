import './load-env'

import { neon } from '@neondatabase/serverless'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'

/**
 * CONFIGURE LA SYNCHRONISATION PRÉPROD ⇄ PROD, en une commande :
 *
 *   npm run sync:configurer
 *
 * 1. Dans chaque base (prod, préprod) : crée — ou remet à neuf — le rôle
 *    `sync_lecture`, en LECTURE SEULE, avec un mot de passe aléatoire.
 *    (Accès administrateur lu dans .env.local : PROD_DATABASE_URL,
 *    PREPROD_DATABASE_URL.)
 * 2. Dans Netlify (site « anasawi ») : écrit les variables SYNC_… de
 *    chaque contexte — la production lit la préprod, la préprod
 *    (branche `preprod`) lit la production. Via la CLI Netlify : la
 *    première fois, elle demande de se connecter dans le navigateur.
 *
 * Aucun mot de passe n'est affiché ni écrit sur le disque. Relancer la
 * commande change les mots de passe et met les variables à jour.
 * Il reste ensuite à redéployer les deux sites (un push suffit).
 */

const SITE = 'anasawi'
const ROLE = 'sync_lecture'
const PROD_URL = 'https://anasawi.com'
const PREPROD_URL = 'https://preprod--anasawi.netlify.app'

function requis(nom: string): string {
  const v = process.env[nom]
  if (!v) {
    console.error(`\n  ✗ ${nom} manquant dans .env.local.\n`)
    process.exit(1)
  }
  return v
}

/** Un mot de passe aléatoire, sans caractère à échapper (URL comme SQL). */
const motDePasse = () => randomBytes(30).toString('base64url')

async function roleLecture(urlAdmin: string, nom: string): Promise<string> {
  const sql = neon(urlAdmin)
  const mdp = motDePasse()
  await sql.query(`DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${ROLE}') THEN CREATE ROLE ${ROLE} LOGIN; END IF;
  END $$`)
  await sql.query(`ALTER ROLE ${ROLE} WITH LOGIN PASSWORD '${mdp}'`)
  const base = new URL(urlAdmin).pathname.slice(1) || 'neondb'
  for (const requete of [
    `GRANT CONNECT ON DATABASE ${base} TO ${ROLE}`,
    `GRANT USAGE ON SCHEMA public TO ${ROLE}`,
    `GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${ROLE}`,
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${ROLE}`,
    `GRANT USAGE ON SCHEMA drizzle TO ${ROLE}`,
    `GRANT SELECT ON ALL TABLES IN SCHEMA drizzle TO ${ROLE}`,
  ]) {
    await sql.query(requete)
  }
  /* Vérification : le rôle lit, et ne peut pas écrire. */
  const u = new URL(urlAdmin)
  u.username = ROLE
  u.password = mdp
  const lecteur = neon(u.toString())
  await lecteur.query('SELECT count(*) FROM settings')
  let ecritRefusee = false
  try {
    await lecteur.query('UPDATE settings SET id = id WHERE false')
  } catch {
    ecritRefusee = true
  }
  if (!ecritRefusee) throw new Error(`Le rôle ${ROLE} de ${nom} peut écrire : arrêt par prudence.`)
  console.log(`  ✓ ${nom} : rôle ${ROLE} prêt (lecture seule vérifiée)`)
  return u.toString()
}

function netlify(args: string[], secret = false) {
  /* Les valeurs secrètes ne passent jamais par la sortie. */
  execFileSync('npx', ['-y', 'netlify-cli', ...args], { stdio: secret ? ['inherit', 'ignore', 'inherit'] : 'inherit' })
}

async function main() {
  const prodAdmin = requis('PROD_DATABASE_URL')
  const preprodAdmin = requis('PREPROD_DATABASE_URL')
  if (new URL(prodAdmin).host === new URL(preprodAdmin).host) {
    console.error('\n  ✗ PROD_DATABASE_URL et PREPROD_DATABASE_URL désignent la même base.\n')
    process.exit(1)
  }

  console.log('\n  1. Rôles en lecture seule\n')
  const lectureProd = await roleLecture(prodAdmin, 'production')
  const lecturePreprod = await roleLecture(preprodAdmin, 'préprod')

  console.log('\n  2. Variables Netlify (connexion demandée la première fois)\n')
  netlify(['link', '--name', SITE])
  const contextes = [
    { contexte: 'production', base: lecturePreprod, site: PREPROD_URL, source: 'la préprod', cible: 'la production' },
    { contexte: 'branch:preprod', base: lectureProd, site: PROD_URL, source: 'la production', cible: 'la préprod' },
  ]
  for (const c of contextes) {
    netlify(['env:set', 'SYNC_SOURCE_DATABASE_URL', c.base, '--context', c.contexte, '--secret', '--force'], true)
    netlify(['env:set', 'SYNC_SOURCE_SITE_URL', c.site, '--context', c.contexte, '--force'])
    netlify(['env:set', 'SYNC_SOURCE_NOM', c.source, '--context', c.contexte, '--force'])
    netlify(['env:set', 'SYNC_CIBLE_NOM', c.cible, '--context', c.contexte, '--force'])
    console.log(`  ✓ ${c.cible} : lit ${c.source}`)
  }

  console.log('\n  ✓ Configuré. Redéployez les deux sites (git push sur preprod puis main) pour l’activer.\n')
}

main().catch((e) => {
  console.error('\n  ✗ Échec :', e instanceof Error ? e.message : e, '\n')
  process.exit(1)
})
