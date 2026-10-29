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

import { PASTELS } from './pastels'
import { templateLibrary, type TemplateCategory } from '@/blocks/registry'

export { PASTELS }

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

/** L'icône dit la catégorie du modèle. */
export const ICONE_PAR_CATEGORIE: Record<TemplateCategory, LucideIcon> = {
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
