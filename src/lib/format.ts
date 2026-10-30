/**
 * Petits formats typographiques partagés par le site et les blocs.
 *
 * Module neutre (ni serveur ni client) : les templates rendus côté
 * serveur comme les composants interactifs y puisent les mêmes lettres —
 * avant, la liste « un, deux, trois… » vivait en cinq exemplaires, et un
 * jour l'un d'eux aurait fini par diverger.
 */

const NUMBER_WORDS_FR = [
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
] as const

/**
 * Le rang `i` (à partir de zéro) en toutes lettres : « un » pour 0,
 * « dix » pour 9 ; au-delà, le chiffre lui-même — une liste de plus de
 * dix accompagnements n'a pas besoin de « onze » pour se lire.
 */
export function numberWordFr(i: number): string {
  return NUMBER_WORDS_FR[i] ?? String(i + 1)
}
