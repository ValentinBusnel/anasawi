/**
 * LES TYPOGRAPHIES À ESSAYER sur le site moderne — une sélection resserrée
 * de six paires, toutes gratuites et libres (licence SIL Open Font
 * License, servies par Google Fonts), retenues pour leur douceur.
 *
 * Banc d'essai : /moderne/typos (spécimens), et sur /moderne le
 * sélecteur en bas à gauche (en développement, ou après une visite de
 * /moderne?typo=…). Une fois le choix fait : reporter la paire dans
 * `--ad-titre` / `--ad-texte` (globals.css) et `PoliceModerne`, puis
 * supprimer ce fichier et `EssaiTypo`.
 */

export type Typo = {
  id: string
  nom: string
  /** En une phrase : ce qu'elle apporte. */
  esprit: string
  titre: string
  texte: string
  /** Feuille Google Fonts (les deux familles). */
  url: string
  /** Graisse des titres, des petits textes en police de titre, du mot clé. */
  poids: number
  poidsFort: number
  poidsEm: number
  /** Le mot clé en italique (si la police en a un vrai). */
  italique: boolean
  /** Interlettrage des titres. */
  espace: string
}

const G = 'https://fonts.googleapis.com/css2?'

export const TYPOS: Typo[] = [
  {
    id: 'fraunces',
    nom: 'Fraunces + Nunito',
    esprit: 'La version actuelle : une serif légère aux terminaisons arrondies, un texte rond.',
    titre: 'Fraunces',
    texte: 'Nunito',
    url: `${G}family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,100;1,9..144,300..700,100&family=Nunito:wght@300..700&display=swap`,
    poids: 340,
    poidsFort: 380,
    poidsEm: 320,
    italique: true,
    espace: '-0.015em',
  },
  {
    id: 'instrument',
    nom: 'Instrument Serif + Instrument Sans',
    esprit: 'Élégante et éditoriale, très fine, avec un italique superbe.',
    titre: 'Instrument Serif',
    texte: 'Instrument Sans',
    url: `${G}family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400..700&display=swap`,
    poids: 400,
    poidsFort: 400,
    poidsEm: 400,
    italique: true,
    espace: '-0.01em',
  },
  {
    id: 'newsreader',
    nom: 'Newsreader + Nunito Sans',
    esprit: 'Une serif de lecture, calme et chaleureuse, en version légère.',
    titre: 'Newsreader',
    texte: 'Nunito Sans',
    url: `${G}family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Nunito+Sans:wght@400..700&display=swap`,
    poids: 340,
    poidsFort: 400,
    poidsEm: 320,
    italique: true,
    espace: '-0.02em',
  },
  {
    id: 'lora',
    nom: 'Lora + Mulish',
    esprit: 'Une serif aux courbes calligraphiques, très douce en italique.',
    titre: 'Lora',
    texte: 'Mulish',
    url: `${G}family=Lora:ital,wght@0,400..600;1,400..600&family=Mulish:wght@400..700&display=swap`,
    poids: 400,
    poidsFort: 500,
    poidsEm: 400,
    italique: true,
    espace: '-0.02em',
  },
  {
    id: 'cormorant',
    nom: 'Cormorant Garamond + Karla',
    esprit: 'Le duo du site classique : raffiné, littéraire, très léger.',
    titre: 'Cormorant Garamond',
    texte: 'Karla',
    url: `${G}family=Cormorant+Garamond:ital,wght@0,400..600;1,400..600&family=Karla:wght@400..700&display=swap`,
    poids: 500,
    poidsFort: 600,
    poidsEm: 500,
    italique: true,
    espace: '-0.01em',
  },
  {
    id: 'nunito',
    nom: 'Nunito (tout rond)',
    esprit: 'Sans serif, aux bouts de lettres arrondis : l’effet « cocon ».',
    titre: 'Nunito',
    texte: 'Nunito',
    url: `${G}family=Nunito:ital,wght@0,300..800;1,300..800&display=swap`,
    poids: 500,
    poidsFort: 600,
    poidsEm: 500,
    italique: false,
    espace: '-0.025em',
  },
]

/** La paire d'un identifiant (null si inconnue, ex. une paire retirée). */
export const typoDe =(id: string | null | undefined) => TYPOS.find((t) => t.id === id) ?? null

/** Les variables CSS qui appliquent une typographie au site moderne. */
export function variablesDe(t: Typo): Record<string, string> {
  return {
    '--ad-titre': `'${t.titre}', ui-serif, Georgia, serif`,
    '--ad-texte': `'${t.texte}', ui-sans-serif, system-ui, sans-serif`,
    '--ad-titre-poids': String(t.poids),
    '--ad-titre-poids-fort': String(t.poidsFort),
    '--ad-em-poids': String(t.poidsEm),
    '--ad-em-style': t.italique ? 'italic' : 'normal',
    '--ad-titre-espace': t.espace,
  }
}
