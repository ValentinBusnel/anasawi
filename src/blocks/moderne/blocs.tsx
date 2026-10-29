import { z } from 'zod'

import { field } from '../field'
import type { BlockContext, BlockDefinition } from '../types'
import { construireContenu, type Contenu } from './contenu'
import {
  EnPratique,
  Phrase,
  Rencontre,
  RendezVous,
  Respiration,
  SectionArches,
  SectionChemin,
  SectionConversation,
  SectionPromenade,
  SectionSeuil,
} from '@/components/anasawi/sections'
import { ModeEdition } from '@/components/anasawi/vivant'

/**
 * LES BLOCS DE LA VERSION MODERNE — le site dans sa nouvelle direction
 * artistique, en cours d'arbitrage avec le site classique.
 *
 * Ils entrent dans le même registre, le même éditeur, la même
 * publication que les blocs classiques ; seul leur `theme` les distingue
 * (l'éditeur ne propose que ceux du site édité).
 *
 * LE CONTENU EST PARTAGÉ. Accompagnements, questions, médias, réglages
 * (nom, coordonnées, horaires) : une seule source, les deux sites. Les
 * TEXTES de présentation viennent des sections du site classique (le
 * « Qui je suis » classique nourrit la « Rencontre » moderne…) — sauf si
 * le bloc moderne les remplace par les siens : un champ laissé vide
 * suit le site classique.
 *
 * Pour supprimer la version moderne après l'arbitrage : voir ARBITRAGE.md.
 */

/** Le contenu partagé, ou — hors du site moderne (bibliothèque de
    modèles…) — un contenu minimal tiré du contexte. */
function contenuDe(ctx: BlockContext): Contenu {
  if (ctx.partage) return ctx.partage
  return construireContenu({
    settings: ctx.settings,
    services: ctx.services,
    faq: ctx.faqItems,
    media: [],
    dossiers: [],
    sections: [],
    categorieDe: () => undefined,
  })
}

const texte = z.string().default('')
const vide = (v: string | undefined) => !v || !v.trim()

function Enveloppe({ ctx, children }: { ctx: BlockContext; children: React.ReactNode }) {
  return <ModeEdition actif={Boolean(ctx.editable)}>{children}</ModeEdition>
}

const SUIT = 'Laissé vide, ce champ suit le site classique.'

/* ── Le seuil ─────────────────────────────────────────────────────────── */

const seuilSchema = z.object({ accroche: texte, intro: texte, mediaId: z.string().nullable().default(null) })
export const mSeuilBlock: BlockDefinition<typeof seuilSchema> = {
  label: 'Moderne — Le seuil',
  description: 'Votre nom en grand, une fenêtre sur le cabinet qui s’ouvre au défilement.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: seuilSchema,
  fields: [
    field.textarea('accroche', 'Phrase d’accueil (dans la photo)', { help: `Par défaut : l’accroche des Réglages. ${SUIT}` }),
    field.textarea('intro', 'Présentation (sous le nom)', { help: SUIT }),
    field.media('mediaId', 'Photo du cabinet'),
  ],
  defaults: { accroche: '', intro: '', mediaId: null },
  Component: ({ data, ctx }) => {
    const base = contenuDe(ctx)
    const photo = data.mediaId ? ctx.resolveMedia(data.mediaId) : null
    const c: Contenu = {
      ...base,
      accroche: vide(data.accroche) ? base.accroche : data.accroche,
      ouverture: { ...base.ouverture, intro: vide(data.intro) ? base.ouverture.intro : data.intro },
      ambiance: photo ?? base.ambiance,
    }
    return (
      <Enveloppe ctx={ctx}>
        <SectionSeuil c={c} />
      </Enveloppe>
    )
  },
}

/* ── Respiration ──────────────────────────────────────────────────────── */

const vierge = z.object({})
export const mRespirationBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — Respiration',
  description: 'Un cercle qui respire, et un exercice guidé d’une minute.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <Respiration c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/* ── Rencontre ────────────────────────────────────────────────────────── */

const rencontreSchema = z.object({ surtitre: texte, texte, citation: texte, mediaId: z.string().nullable().default(null) })
export const mRencontreBlock: BlockDefinition<typeof rencontreSchema> = {
  label: 'Moderne — Rencontre',
  description: 'Votre portrait, son sceau qui tourne, une présentation qui se lit en s’encrant.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: rencontreSchema,
  fields: [
    field.text('surtitre', 'Étiquette', { placeholder: 'Qui je suis' }),
    field.richtext('texte', 'Présentation', { help: SUIT }),
    field.textarea('citation', 'Citation', { help: SUIT }),
    field.media('mediaId', 'Portrait'),
  ],
  defaults: { surtitre: '', texte: '', citation: '', mediaId: null },
  dataSource: { label: 'Vos coordonnées (adresse, téléphone, horaires)', href: '/admin/reglages' },
  Component: ({ data, ctx }) => {
    const base = contenuDe(ctx)
    const portrait = data.mediaId ? ctx.resolveMedia(data.mediaId) : null
    const c: Contenu = {
      ...base,
      apropos: {
        ...base.apropos,
        surtitre: vide(data.surtitre) ? base.apropos.surtitre : data.surtitre,
        texte: vide(data.texte) ? base.apropos.texte : data.texte,
        citation: vide(data.citation) ? base.apropos.citation : data.citation,
      },
      portrait: portrait ?? base.portrait,
    }
    return (
      <Enveloppe ctx={ctx}>
        <Rencontre c={c} />
      </Enveloppe>
    )
  },
}

/* ── Chemin ───────────────────────────────────────────────────────────── */

const cheminSchema = z.object({ surtitre: texte, titre: texte, intro: texte })
export const mCheminBlock: BlockDefinition<typeof cheminSchema> = {
  label: 'Moderne — Le chemin',
  description: 'Vos étapes reliées par un trait qui se dessine à la lecture.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: cheminSchema,
  fields: [
    field.text('surtitre', 'Étiquette', { placeholder: 'Ma méthode' }),
    field.textarea('titre', 'Titre', { help: SUIT }),
    field.textarea('intro', 'Introduction', { help: SUIT }),
  ],
  defaults: { surtitre: '', titre: '', intro: '' },
  dataSource: { label: 'Les étapes : celles de « Ma méthode » du site classique', href: '/admin/accueil' },
  Component: ({ data, ctx }) => {
    const base = contenuDe(ctx)
    const c: Contenu = {
      ...base,
      methode: {
        ...base.methode,
        surtitre: vide(data.surtitre) ? base.methode.surtitre : data.surtitre,
        titre: vide(data.titre) ? base.methode.titre : data.titre,
        intro: vide(data.intro) ? base.methode.intro : data.intro,
      },
    }
    return (
      <Enveloppe ctx={ctx}>
        <SectionChemin c={c} />
      </Enveloppe>
    )
  },
}

/* ── Arches (accompagnements) ─────────────────────────────────────────── */

export const mArchesBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — Accompagnements',
  description: 'Une carte par accompagnement ; survolée, elle s’ouvre en fiche.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  dataSource: { label: 'Vos accompagnements', href: '/admin/accompagnements' },
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <SectionArches c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/* ── En pratique ──────────────────────────────────────────────────────── */

export const mEnPratiqueBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — En pratique',
  description: 'Le plan, les séances, la visio, les jours : tout ce qu’on cherche avant d’appeler.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  dataSource: { label: 'Vos coordonnées, horaires et accompagnements', href: '/admin/reglages' },
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <EnPratique c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/* ── Phrase ───────────────────────────────────────────────────────────── */

const phraseSchema = z.object({ texte, auteur: texte })
export const mPhraseBlock: BlockDefinition<typeof phraseSchema> = {
  label: 'Moderne — Phrase',
  description: 'Une conviction, en très grand, ligne après ligne.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: phraseSchema,
  fields: [
    field.textarea('texte', 'La phrase', { help: SUIT }),
    field.text('auteur', 'Signature', { help: SUIT }),
  ],
  defaults: { texte: '', auteur: '' },
  Component: ({ data, ctx }) => {
    const base = contenuDe(ctx)
    const c: Contenu = {
      ...base,
      citation: {
        texte: vide(data.texte) ? base.citation.texte : data.texte,
        auteur: vide(data.auteur) ? base.citation.auteur : data.auteur,
      },
    }
    return (
      <Enveloppe ctx={ctx}>
        <Phrase c={c} />
      </Enveloppe>
    )
  },
}

/* ── Promenade ────────────────────────────────────────────────────────── */

export const mPromenadeBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — Le cabinet',
  description: 'Les photos du cabinet, qui glissent de côté au défilement.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  dataSource: { label: 'Les photos de votre médiathèque', href: '/admin/medias' },
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <SectionPromenade c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/* ── Conversation ─────────────────────────────────────────────────────── */

export const mConversationBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — Questions',
  description: 'Vos questions fréquentes, comme une messagerie.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  dataSource: { label: 'Vos questions fréquentes', href: '/admin/faq' },
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <SectionConversation c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/* ── Rendez-vous ──────────────────────────────────────────────────────── */

export const mRendezVousBlock: BlockDefinition<typeof vierge> = {
  label: 'Moderne — Rendez-vous',
  description: 'La semaine allumée, vos coordonnées, et une lettre plutôt qu’un formulaire.',
  group: 'Sections',
  theme: 'moderne',
  bleed: true,
  schema: vierge,
  fields: [],
  defaults: {},
  dataSource: { label: 'Vos coordonnées et horaires', href: '/admin/reglages' },
  Component: ({ ctx }) => (
    <Enveloppe ctx={ctx}>
      <RendezVous c={contenuDe(ctx)} />
    </Enveloppe>
  ),
}

/** L'ordre de la page moderne quand on la crée. */
export const PAGE_MODERNE_PAR_DEFAUT = [
  'mSeuil',
  'mRespiration',
  'mRencontre',
  'mChemin',
  'mArches',
  'mEnPratique',
  'mPhrase',
  'mPromenade',
  'mConversation',
  'mRendezVous',
] as const
