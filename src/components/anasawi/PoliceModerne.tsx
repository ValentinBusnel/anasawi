/**
 * Les polices de la VERSION MODERNE — Fraunces (titres, réglée « douce »)
 * et Figtree (texte) —, chargées depuis
 * Google Fonts par une feuille de style (React la remonte dans <head>).
 *
 * Pourquoi pas `next/font` : pour cette police, Google sert des adresses
 * de fichiers (`/l/font?kit=…`) que Turbopack ne sait pas télécharger —
 * tout le site tombait en erreur de compilation. Le temps de
 * l'arbitrage, la feuille de Google suffit (CSP : déjà autorisée). Si
 * la version moderne est retenue : auto-héberger le fichier (`next/font/
 * local`). Dans l'éditeur, l'aperçu recopie les feuilles de <head> :
 * la police y arrive aussi.
 */
export function PoliceModerne(): React.ReactElement {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Voulu : chargée sur /moderne et l'éditeur seulement (voir plus haut). */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,100;1,9..144,300..700,100&family=Figtree:wght@400..700&display=swap"
        precedence="default"
      />
    </>
  )
}
