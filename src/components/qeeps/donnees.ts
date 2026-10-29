import { templateLibrary, type TemplateCategory } from '@/blocks/registry'
import { isVideoMimeType } from '@/lib/media-kind'
import type {
  FaqItem,
  Media,
  MediaFolder,
  OpeningHour,
  Section,
  ServiceWithMedia,
} from '@/server/db/schema'
import {
  getActiveFaq,
  getActiveServices,
  getAllMedia,
  getMediaFolders,
  getPublishedHome,
  getSettings,
} from '@/server/queries'

/**
 * Le contenu RÉEL d'Anne, mis à plat pour les sections façon Qeeps.
 *
 * Rien n'est inventé quand la base a la réponse : réglages (nom, titre,
 * coordonnées, horaires), accompagnements, questions, photothèque et
 * dossiers, et les textes de la page d'accueil PUBLIÉE — lus section par
 * section selon la catégorie de leur modèle (Ouverture, Qui je suis…).
 * Un texte d'appoint ne sert que si la page n'en a pas.
 */

export type Etape = { titre: string; texte: string }

export type Contenu = {
  nom: string
  metier: string
  accroche: string
  ville: string
  adresse: string | null
  telephone: string | null
  email: string | null
  horaires: OpeningHour[]
  infoPratique: string | null
  rdv: string
  ouverture: { surtitre: string; titre: string; intro: string }
  apropos: { surtitre: string; titre: string; texte: string; citation: string | null }
  methode: { surtitre: string; titre: string; intro: string; etapes: Etape[] }
  citation: { texte: string; auteur: string }
  services: ServiceWithMedia[]
  faq: FaqItem[]
  photos: Media[]
  dossiers: MediaFolder[]
  portrait: Media | null
  ambiance: Media | null
  /** Le logo choisi dans les Réglages (adresse), sinon nul : celui livré. */
  logo: string | null
}

const CATEGORIE = new Map<string, TemplateCategory>(
  templateLibrary.flatMap((g) => g.options.map((o) => [o.type, o.category] as const)),
)

/** Sans l'astérisque d'italique du CMS (`*son souffle*`) ni balise. */
const propre = (t: string) =>
  t.replace(/<[^>]+>/g, ' ').replace(/\*/g, '').replace(/\s+/g, ' ').trim()

function texte(payload: Record<string, unknown>, cles: string[]): string | null {
  for (const cle of cles) {
    const v = payload[cle]
    if (typeof v === 'string' && v.trim()) return propre(v)
    /* Les titres en lignes du hero : `[{ text, align }]`. */
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
      const lignes = v
        .map((l) => (l && typeof l === 'object' ? (l as { text?: unknown }).text : null))
        .filter((l): l is string => typeof l === 'string' && Boolean(l.trim()))
      if (lignes.length) return propre(lignes.join(' '))
    }
  }
  return null
}

function etapes(payload: Record<string, unknown>): Etape[] {
  for (const cle of ['steps', 'items']) {
    const v = payload[cle]
    if (!Array.isArray(v)) continue
    const liste = v
      .map((e) => {
        if (!e || typeof e !== 'object') return null
        const o = e as Record<string, unknown>
        const titre = texte(o, ['title', 'label', 'name', 'value'])
        const corps = texte(o, ['text', 'body', 'description', 'intro'])
        return titre ? { titre, texte: corps ?? '' } : null
      })
      .filter((e): e is Etape => e !== null)
    if (liste.length >= 2) return liste
  }
  return []
}

export async function chargerContenu(): Promise<Contenu> {
  const [settings, services, faq, media, dossiers, home] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getActiveFaq(),
    getAllMedia(),
    getMediaFolders(),
    getPublishedHome(),
  ])

  const sections: Section[] = (home?.sections ?? [])
    .filter((s) => !s.parentId && s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  /** La première section d'une catégorie qui porte le texte cherché. */
  const lire = (categorie: TemplateCategory, cles: string[]) => {
    for (const s of sections) {
      if (CATEGORIE.get(s.type) !== categorie) continue
      const t = texte((s.payload ?? {}) as Record<string, unknown>, cles)
      if (t) return t
    }
    return null
  }
  const etapesDe = (categorie: TemplateCategory) => {
    for (const s of sections) {
      if (CATEGORIE.get(s.type) !== categorie) continue
      const e = etapes((s.payload ?? {}) as Record<string, unknown>)
      if (e.length) return e
    }
    return []
  }

  const photos = media.filter((m) => !isVideoMimeType(m.mimeType))
  const dossierPortraits = dossiers.find((d) => /portrait/i.test(d.name))
  const portrait =
    photos.find((m) => dossierPortraits && m.folderId === dossierPortraits.id && !/substitution/i.test(m.alt)) ??
    photos.find((m) => /portrait/i.test(m.alt)) ??
    photos[0] ??
    null
  const dossierInterieurs = dossiers.find((d) => /int[ée]rieur/i.test(d.name))
  const ambiance =
    photos.find((m) => dossierInterieurs && m.folderId === dossierInterieurs.id) ??
    photos.find((m) => m.id !== portrait?.id) ??
    null

  const nom = settings.practitionerName || settings.siteName
  const metier = settings.practitionerTitle || 'Thérapeute'
  const ville = settings.addressCity || 'Cesson-Sévigné'

  const methodeEtapes = etapesDe('Ma méthode')

  return {
    nom,
    metier,
    accroche: settings.tagline || 'Un espace stable et confidentiel pour déposer ce qui pèse.',
    ville,
    adresse:
      [settings.addressStreet, [settings.addressPostalCode, settings.addressCity].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ') || null,
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    horaires: ((settings.openingHours as OpeningHour[]) ?? []).filter((h) => h.day && h.hours),
    infoPratique: settings.practicalInfo,
    rdv: settings.bookingUrl || '#contact',
    ouverture: {
      surtitre: lire('Ouverture', ['eyebrow']) ?? `${metier} · ${ville}`,
      titre: lire('Ouverture', ['titleLines', 'title']) ?? nom,
      intro: lire('Ouverture', ['intro', 'text', 'note']) ?? settings.tagline ?? '',
    },
    apropos: {
      surtitre: lire('Qui je suis', ['eyebrow']) ?? 'Qui je suis',
      titre: lire('Qui je suis', ['title', 'name']) ?? nom,
      texte:
        lire('Qui je suis', ['body', 'text', 'intro']) ??
        'Un accompagnement attentif, au rythme de chacun, pour remettre du mouvement là où les choses se sont figées.',
      citation: lire('Qui je suis', ['quote']),
    },
    methode: {
      surtitre: lire('Ma méthode', ['eyebrow']) ?? 'Ma méthode',
      titre: lire('Ma méthode', ['title']) ?? 'Comment se passe un accompagnement',
      intro: lire('Ma méthode', ['intro', 'text', 'body']) ?? '',
      etapes: methodeEtapes.length
        ? methodeEtapes.slice(0, 4)
        : [
            { titre: 'Un premier échange', texte: 'Au téléphone ou par écrit, pour faire connaissance et voir si nous pouvons travailler ensemble.' },
            { titre: 'La première séance', texte: 'On pose ce qui vous amène, sans obligation de tout dire, ni d’aller vite.' },
            { titre: 'Un rythme qui vous ressemble', texte: 'Chaque semaine ou tous les quinze jours, le temps qu’il faudra.' },
          ],
    },
    citation: {
      texte:
        lire('Textes', ['quote', 'statement', 'text', 'title']) ??
        'On ne répare pas les gens. On les écoute, jusqu’à ce qu’ils s’entendent.',
      auteur: lire('Textes', ['attribution', 'caption']) ?? nom,
    },
    services,
    faq,
    photos,
    dossiers: dossiers.filter((d) => photos.some((m) => m.folderId === d.id)),
    portrait,
    ambiance,
    logo: media.find((m) => m.id === settings.logoMediaId)?.url ?? null,
  }
}
