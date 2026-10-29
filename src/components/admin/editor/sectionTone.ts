import {
  Compass,
  HeartHandshake,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Mail,
  Type,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { templateLibrary, type TemplateCategory } from '@/blocks/registry'

/**
 * La teinte et l'icône d'une section — le plan de page de l'espace
 * Qeeps : chaque section a sa pastille de couleur, on la reconnaît d'un
 * coup d'œil dans la liste, en tête du formulaire et dans l'aperçu.
 */

export type Tone = {
  icon: LucideIcon
  /** Fond doux de la pastille. */
  bg: string
  /** Encre de la pastille (icône, surtitre). */
  fg: string
}

/**
 * Les dix pastels, dans l'ordre de la page : la 1re section prend le
 * premier, la 2e le deuxième… la 11e revient au premier. La couleur suit
 * la PLACE, pas la section : déplacée de la 4e à la 2e place, une section
 * prend le pastel n° 2.
 */
export const PASTELS: { bg: string; fg: string }[] = [
  { bg: '#ddf7f7', fg: '#176c79' }, // cyan
  { bg: '#d1ede0', fg: '#2f7d55' }, // vert d'eau
  { bg: '#f3dde2', fg: '#a4475f' }, // rose
  { bg: '#f6e9d3', fg: '#94681f' }, // sable
  { bg: '#e6e1f7', fg: '#5b4a9e' }, // lavande
  { bg: '#dbeafa', fg: '#2d5f93' }, // ciel
  { bg: '#fbe1d6', fg: '#a8512e' }, // pêche
  { bg: '#e6f2d6', fg: '#557a26' }, // tilleul
  { bg: '#f5dcef', fg: '#93407f' }, // lilas
  { bg: '#f7f0cc', fg: '#7d6a12' }, // beurre
]

/** L'icône dit la catégorie du modèle. */
const ICONE_PAR_CATEGORIE: Record<TemplateCategory, LucideIcon> = {
  'Ouverture': Home,
  'Qui je suis': UserRound,
  'Ma méthode': Compass,
  'Accompagnements': HeartHandshake,
  'Questions': HelpCircle,
  'Photos & vidéos': ImageIcon,
  'Textes': Type,
  'Contact & rendez-vous': Mail,
}

const CATEGORIE_DU_TYPE = new Map<string, TemplateCategory>(
  templateLibrary.flatMap((groupe) =>
    groupe.options.map((option) => [option.type, option.category] as const),
  ),
)

/**
 * La teinte d'une section : son icône (d'après le modèle) et son pastel
 * (d'après sa place dans la page, `index` à partir de 0).
 */
export function toneOf(type: string, index: number): Tone {
  const categorie = CATEGORIE_DU_TYPE.get(type)
  const pastel = PASTELS[((index % PASTELS.length) + PASTELS.length) % PASTELS.length]!
  return {
    icon: categorie ? ICONE_PAR_CATEGORIE[categorie] : LayoutTemplate,
    ...pastel,
  }
}
