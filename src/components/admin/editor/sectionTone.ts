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
 * La teinte et l'icône d'une section, d'après la catégorie de son modèle —
 * le plan de page de l'espace Qeeps : chaque section a sa pastille de
 * couleur, on la reconnaît d'un coup d'œil dans la liste comme en tête du
 * formulaire.
 */

export type Tone = {
  icon: LucideIcon
  /** Fond doux de la pastille. */
  bg: string
  /** Encre de la pastille (icône, surtitre). */
  fg: string
}

const CYAN = { bg: '#ddf7f7', fg: '#176c79' }
const GREEN = { bg: '#d1ede0', fg: '#2f7d55' }
const PINK = { bg: '#f3dde2', fg: '#a4475f' }
const SAND = { bg: '#f6e9d3', fg: '#94681f' }

const PAR_CATEGORIE: Record<TemplateCategory, Tone> = {
  'Ouverture': { icon: Home, ...CYAN },
  'Qui je suis': { icon: UserRound, ...PINK },
  'Ma méthode': { icon: Compass, ...GREEN },
  'Accompagnements': { icon: HeartHandshake, ...SAND },
  'Questions': { icon: HelpCircle, ...CYAN },
  'Photos & vidéos': { icon: ImageIcon, ...PINK },
  'Textes': { icon: Type, ...GREEN },
  'Contact & rendez-vous': { icon: Mail, ...SAND },
}

const PAR_DEFAUT: Tone = { icon: LayoutTemplate, ...CYAN }

const CATEGORIE_DU_TYPE = new Map<string, TemplateCategory>(
  templateLibrary.flatMap((groupe) =>
    groupe.options.map((option) => [option.type, option.category] as const),
  ),
)

export function toneOf(type: string): Tone {
  const categorie = CATEGORIE_DU_TYPE.get(type)
  return categorie ? PAR_CATEGORIE[categorie] : PAR_DEFAUT
}
