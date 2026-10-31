import 'server-only'

import { neon } from '@neondatabase/serverless'
import { asc, isNotNull, isNull, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { timingSafeEqual } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { mimeTypeForKey, objectExists, putObject } from '@/lib/storage'
import { db } from '@/server/db'
import * as schema from '@/server/db/schema'

const {
  faqItems,
  media,
  mediaFolders,
  pages,
  savedSections,
  sections,
  seoMeta,
  serviceGroups,
  services,
  settings,
} = schema

/**
 * SYNCHRONISATION DU CONTENU ENTRE LA PRÉPROD ET LA PRODUCTION.
 *
 * Dans l'admin (Réglages › Synchronisation), on ENVOIE le contenu du
 * site où l'on est vers l'autre : depuis la préprod, « Envoyer vers la
 * production » ; depuis la production, « Envoyer vers la préprod ».
 *
 * Sous le capot, c'est le site qui REÇOIT qui fait le travail : le site
 * qui envoie lui demande (appel serveur signé d'un secret partagé) de
 * récupérer son contenu. Ainsi :
 *  - chaque site n'a qu'un accès en LECTURE à la base de l'autre (rôle
 *    Neon `sync_lecture`) — jamais d'écriture croisée ;
 *  - aucun jeton Netlify : les fichiers médias sont téléchargés depuis
 *    l'adresse publique de l'autre site et rangés dans le stockage du
 *    site qui reçoit ;
 *  - la sauvegarde avant remplacement est faite chez celui qui reçoit.
 *
 * Configuration (variables d'environnement de CHAQUE site ; voir
 * `npm run sync:configurer`, qui les pose toutes) :
 *   SYNC_AUTRE_DATABASE_URL  base de l'autre site (rôle en lecture seule)
 *   SYNC_AUTRE_SITE_URL      adresse publique de l'autre site
 *   SYNC_AUTRE_NOM           « la préprod » / « la production »
 *   SYNC_ICI_NOM             le nom de CE site
 *   SYNC_SECRET              secret partagé, identique sur les deux sites
 *
 * Ce qui est remplacé : médias (lignes) et dossiers, pages et leurs
 * versions publiées, sections, référencement, accompagnements et leurs
 * familles, questions, réglages, modèles enregistrés. Ce qui n'est
 * JAMAIS touché : comptes, invitations, messages reçus.
 *
 * Le remplacement part en UNE transaction (tout ou rien), après une
 * SAUVEGARDE du contenu remplacé, restaurable depuis le même écran.
 *
 * Vocabulaire du code : du point de vue du site qui reçoit, `source` est
 * l'autre site (celui qui envoie) et `cible` ce site-ci.
 */

export type ConfigSynchro = {
  /** L'autre site. */
  source: string
  /** Ce site. */
  cible: string
  urlSite: string
}

export function configSynchro(): ConfigSynchro | null {
  const url = process.env.SYNC_AUTRE_DATABASE_URL
  const urlSite = process.env.SYNC_AUTRE_SITE_URL
  const source = process.env.SYNC_AUTRE_NOM
  const cible = process.env.SYNC_ICI_NOM
  if (!url || !urlSite || !source || !cible || !process.env.SYNC_SECRET) return null
  return { source, cible, urlSite: urlSite.replace(/\/+$/, '') }
}

/** Le secret partagé est-il bien celui reçu ? (comparaison à temps constant) */
export function secretValide(recu: string | null): boolean {
  const attendu = process.env.SYNC_SECRET
  if (!attendu || !recu) return false
  const a = Buffer.from(attendu)
  const b = Buffer.from(recu)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Demande à L'AUTRE site d'exécuter une étape (il récupère notre contenu). */
export async function demanderALAutre<T>(corps: Record<string, unknown>): Promise<T> {
  const config = configSynchro()
  if (!config) throw new Error('Synchronisation non configurée.')
  let r: Response
  try {
    r = await fetch(`${config.urlSite}/api/synchronisation`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-synchro-secret': process.env.SYNC_SECRET ?? '' },
      body: JSON.stringify(corps),
      cache: 'no-store',
    })
  } catch {
    throw new Error(`${config.source} ne répond pas.`)
  }
  const reponse = (await r.json().catch(() => null)) as { ok: boolean; data?: T; error?: string } | null
  if (!r.ok || !reponse?.ok) {
    throw new Error(reponse?.error ?? `${config.source} a refusé la demande (${r.status}). Le code est-il à jour des deux côtés ?`)
  }
  return reponse.data as T
}

function baseSource() {
  const url = process.env.SYNC_AUTRE_DATABASE_URL
  if (!url) throw new Error('Synchronisation non configurée.')
  if (process.env.DATABASE_URL && new URL(url).host === new URL(process.env.DATABASE_URL).host) {
    throw new Error('La base source est la même que celle du site : rien à récupérer.')
  }
  return drizzle(neon(url), { schema })
}

type Base = ReturnType<typeof baseSource> | typeof db

/* ── Lecture d'un contenu complet ─────────────────────────────────────── */

export type Contenu = {
  dossiers: (typeof mediaFolders.$inferSelect)[]
  medias: (typeof media.$inferSelect)[]
  pages: (typeof pages.$inferSelect)[]
  racines: (typeof sections.$inferSelect)[]
  enfants: (typeof sections.$inferSelect)[]
  seo: (typeof seoMeta.$inferSelect)[]
  groupes: (typeof serviceGroups.$inferSelect)[]
  accompagnements: (typeof services.$inferSelect)[]
  questions: (typeof faqItems.$inferSelect)[]
  reglages: (typeof settings.$inferSelect)[]
  modeles: (typeof savedSections.$inferSelect)[]
}

async function lire(b: Base): Promise<Contenu> {
  const [dossiers, medias, pagesRows, racines, enfants, seo, groupes, accompagnements, questions, reglages, modeles] =
    await Promise.all([
      b.select().from(mediaFolders),
      b.select().from(media),
      b.select().from(pages),
      b.select().from(sections).where(isNull(sections.parentId)).orderBy(asc(sections.sortOrder)),
      b.select().from(sections).where(isNotNull(sections.parentId)).orderBy(asc(sections.sortOrder)),
      b.select().from(seoMeta),
      b.select().from(serviceGroups).orderBy(asc(serviceGroups.sortOrder)),
      b.select().from(services).orderBy(asc(services.sortOrder)),
      b.select().from(faqItems).orderBy(asc(faqItems.sortOrder)),
      b.select().from(settings),
      b.select().from(savedSections),
    ])
  return { dossiers, medias, pages: pagesRows, racines, enfants, seo, groupes, accompagnements, questions, reglages, modeles }
}

export type Comptes = {
  medias: number
  pages: number
  sections: number
  accompagnements: number
  questions: number
  publieLe: string | null
}

function compter(c: Contenu): Comptes {
  const accueil = c.pages.find((p) => p.isHome)
  return {
    medias: c.medias.length,
    pages: c.pages.length,
    sections: c.racines.length + c.enfants.length,
    accompagnements: c.accompagnements.length,
    questions: c.questions.length,
    publieLe: accueil?.publishedAt ? new Date(accueil.publishedAt).toISOString() : null,
  }
}

/** Le nombre de migrations appliquées : les deux bases doivent avoir le
    même schéma, sinon la copie échouerait (ou pire, à moitié). */
async function migrations(b: Base): Promise<number> {
  const r = await b.execute(sql`select count(*)::int as n from drizzle.__drizzle_migrations`)
  const ligne = (r as unknown as { rows?: { n: number }[] }).rows?.[0] ?? (r as unknown as { n: number }[])[0]
  return ligne?.n ?? 0
}

/* ── Sauvegardes ──────────────────────────────────────────────────────── */

const DOSSIER_LOCAL = path.join(process.cwd(), '.storage', 'sauvegardes')
const enLigne = () =>
  process.env.NETLIFY === 'true' || Boolean(process.env.NETLIFY_BLOBS_CONTEXT) || process.env.NODE_ENV === 'production'

async function magasin() {
  const { getStore } = await import('@netlify/blobs')
  return getStore({ name: 'sauvegardes', consistency: 'strong' })
}

async function ecrireSauvegarde(nom: string, texte: string) {
  if (enLigne()) return (await magasin()).set(nom, texte)
  await mkdir(DOSSIER_LOCAL, { recursive: true })
  await writeFile(path.join(DOSSIER_LOCAL, nom), texte)
}

async function lireSauvegarde(nom: string): Promise<string | null> {
  if (enLigne()) return (await magasin()).get(nom, { type: 'text' })
  try {
    return await readFile(path.join(DOSSIER_LOCAL, nom), 'utf8')
  } catch {
    return null
  }
}

export async function listeSauvegardes(): Promise<string[]> {
  let noms: string[]
  if (enLigne()) noms = (await (await magasin()).list()).blobs.map((b) => b.key)
  else {
    try {
      noms = await readdir(DOSSIER_LOCAL)
    } catch {
      noms = []
    }
  }
  return noms.filter((n) => n.endsWith('.json')).sort().reverse()
}

/* Les dates repassent du texte (JSON) aux objets Date attendus par la base. */
const DATE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
function ranimer(_cle: string, v: unknown) {
  return typeof v === 'string' && DATE_ISO.test(v) ? new Date(v) : v
}

/* ── Écriture d'un contenu complet, en une transaction ────────────────── */

async function remplacerPar(c: Contenu) {
  const [reglage] = c.reglages
  if (!reglage) throw new Error('Le contenu à copier n’a pas de réglages : base vide ?')
  if (!c.pages.some((p) => p.isHome)) throw new Error('Le contenu à copier n’a pas de page d’accueil.')
  const { id: _id, ...valeursReglages } = reglage
  void _id

  await db.batch([
    /* Les références vers les médias d'abord, pour pouvoir les remplacer. */
    db.update(settings).set({ logoMediaId: null, defaultOgMediaId: null }),
    db.delete(sections),
    db.delete(seoMeta),
    db.delete(pages),
    db.delete(services),
    db.delete(serviceGroups),
    db.delete(faqItems),
    db.delete(savedSections),
    db.delete(media),
    db.delete(mediaFolders),

    ...(c.dossiers.length ? [db.insert(mediaFolders).values(c.dossiers)] : []),
    ...(c.medias.length ? [db.insert(media).values(c.medias)] : []),
    db.insert(pages).values(c.pages),
    ...(c.racines.length ? [db.insert(sections).values(c.racines)] : []),
    ...(c.enfants.length ? [db.insert(sections).values(c.enfants)] : []),
    ...(c.seo.length ? [db.insert(seoMeta).values(c.seo)] : []),
    ...(c.groupes.length ? [db.insert(serviceGroups).values(c.groupes)] : []),
    ...(c.accompagnements.length ? [db.insert(services).values(c.accompagnements)] : []),
    ...(c.questions.length ? [db.insert(faqItems).values(c.questions)] : []),
    ...(c.modeles.length ? [db.insert(savedSections).values(c.modeles)] : []),
    db.insert(settings).values(reglage).onConflictDoUpdate({ target: settings.id, set: valeursReglages }),
  ])

  /* Relecture : les comptes doivent correspondre exactement. */
  const apres = compter(await lire(db))
  const attendu = compter(c)
  if (
    apres.medias !== attendu.medias ||
    apres.sections !== attendu.sections ||
    apres.accompagnements !== attendu.accompagnements ||
    apres.questions !== attendu.questions
  ) {
    throw new Error('Les comptes après copie ne correspondent pas : vérifiez le site, et restaurez la sauvegarde si besoin.')
  }
}

/**
 * La vraie raison d'un échec. Drizzle enveloppe l'erreur de Postgres
 * (« Failed query: select … ») : la cause utile (mot de passe refusé,
 * droit manquant, colonne absente…) est dans `cause`.
 */
export function raison(e: unknown): string {
  if (!(e instanceof Error)) return 'erreur inconnue.'
  const cause = (e as { cause?: unknown }).cause
  const fond = cause instanceof Error ? cause.message : null
  const surface = e.message.startsWith('Failed query') ? null : e.message
  const texte = [surface, fond].filter(Boolean).join(' — ') || e.message.split('\n')[0]!
  if (/password authentication failed/i.test(texte)) return 'mot de passe refusé — relancez npm run sync:configurer.'
  if (/permission denied/i.test(texte)) return `droit de lecture manquant (${texte}) — relancez npm run sync:configurer.`
  if (/does not exist/i.test(texte)) return `${texte} — les deux sites n’ont sans doute pas le même code : publiez-le des deux côtés.`
  return texte
}

/* ── API pour l'écran de l'admin ──────────────────────────────────────── */

export type Etat = {
  config: ConfigSynchro | null
  source: Comptes | null
  cible: Comptes
  memeSchema: boolean
  fichiersAcopier: number
  sauvegardes: string[]
  erreur: string | null
}

export async function etatSynchro(): Promise<Etat> {
  const config = configSynchro()
  const cible = compter(await lire(db))
  const sauvegardes = await listeSauvegardes().catch(() => [])
  if (!config) return { config, source: null, cible, memeSchema: false, fichiersAcopier: 0, sauvegardes, erreur: null }
  try {
    const autre = baseSource()
    /* La version d'abord : deux schémas différents feraient échouer la
       lecture avec un message obscur. */
    const [nSource, nCible] = await Promise.all([migrations(autre), migrations(db)])
    if (nSource !== nCible) {
      return {
        config,
        source: null,
        cible,
        memeSchema: false,
        fichiersAcopier: 0,
        sauvegardes,
        erreur: `Les deux bases n’ont pas la même version (${nSource} migrations pour ${config.source}, ${nCible} ici) : publiez d’abord le même code sur les deux sites.`,
      }
    }
    const contenu = await lire(autre)
    return {
      config,
      source: compter(contenu),
      cible,
      memeSchema: true,
      fichiersAcopier: fichiersDe(contenu).length,
      sauvegardes,
      erreur: null,
    }
  } catch (e) {
    return {
      config,
      source: null,
      cible,
      memeSchema: false,
      fichiersAcopier: 0,
      sauvegardes,
      erreur: `Impossible de lire ${config.source} : ${raison(e)}`,
    }
  }
}

function fichiersDe(c: Pick<Contenu, 'medias'>) {
  return c.medias
    .filter((m) => m.url.startsWith('/api/media/'))
    .map((m) => decodeURIComponent(m.url.slice('/api/media/'.length)))
}

/** Étape 1 (par lots, appelée en boucle) : les fichiers médias manquants
    sont téléchargés depuis l'autre site et rangés ici. Idempotent. */
export async function copierFichiers(depart: number, lot = 6): Promise<{ suivant: number | null; total: number; copies: number }> {
  const config = configSynchro()
  if (!config) throw new Error('Synchronisation non configurée.')
  const cles = fichiersDe({ medias: await baseSource().select().from(media) })
  let copies = 0
  for (const cle of cles.slice(depart, depart + lot)) {
    if (await objectExists(cle)) continue
    const mime = mimeTypeForKey(cle)
    if (!mime) continue
    const r = await fetch(`${config.urlSite}/api/media/${encodeURIComponent(cle)}`)
    if (!r.ok) throw new Error(`Fichier introuvable sur ${config.source} : ${cle} (${r.status}).`)
    await putObject(cle, await r.arrayBuffer(), mime)
    copies++
  }
  const suivant = depart + lot < cles.length ? depart + lot : null
  return { suivant, total: cles.length, copies }
}

/** Étape 2 : sauvegarde du contenu actuel, puis remplacement. */
export async function remplacerParLaSource(): Promise<{ sauvegarde: string }> {
  const config = configSynchro()
  if (!config) throw new Error('Synchronisation non configurée.')
  const autre = baseSource()
  if ((await migrations(autre)) !== (await migrations(db))) {
    throw new Error('Les deux bases n’ont pas la même version : déployez d’abord le même code sur les deux sites.')
  }
  const [contenuSource, contenuActuel] = await Promise.all([lire(autre), lire(db)])
  const nom = `contenu-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await ecrireSauvegarde(nom, JSON.stringify(contenuActuel))
  await remplacerPar(contenuSource)
  return { sauvegarde: nom }
}

/** Remet en place une sauvegarde (le contenu d'avant un remplacement). */
export async function restaurer(nom: string): Promise<void> {
  if (!/^contenu-[\w-]+\.json$/.test(nom)) throw new Error('Sauvegarde inconnue.')
  const texte = await lireSauvegarde(nom)
  if (!texte) throw new Error('Sauvegarde introuvable.')
  /* Le contenu actuel est sauvegardé lui aussi : une restauration se
     défait comme un remplacement. */
  await ecrireSauvegarde(`contenu-${new Date().toISOString().replace(/[:.]/g, '-')}-avant-restauration.json`, JSON.stringify(await lire(db)))
  await remplacerPar(JSON.parse(texte, ranimer) as Contenu)
}
