import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/utils'
import { getActiveServices, getPublishedHome } from '@/server/queries'

/**
 * Une image DU SITE, en adresse absolue (le plan du site l'exige) — ou
 * null. Les images de démonstration hébergées ailleurs (Unsplash, semis)
 * ne sont pas déclarées : elles ne sont pas les nôtres.
 */
function imageDuSite(url: string): string | null {
  if (url.startsWith('/')) return absoluteUrl(url)
  try {
    return new URL(url).host === new URL(absoluteUrl('/')).host ? url : null
  } catch {
    return null
  }
}

/**
 * Le site est une page unique : le plan du site, c'est elle.
 *
 * Elle déclare aussi ses images (photos des accompagnements) : Google
 * Images les découvre alors sans attendre de les trouver dans le rendu —
 * celles des fiches n'apparaissent qu'à l'ouverture, côté navigateur.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [accueil, services] = await Promise.all([
    getPublishedHome().catch(() => null),
    getActiveServices().catch(() => []),
  ])

  const images = [
    ...new Set(
      services
        .map((s) => (s.media?.url ? imageDuSite(s.media.url) : null))
        .filter((url): url is string => !!url),
    ),
  ]

  return [
    {
      url: absoluteUrl('/'),
      lastModified: accueil?.publishedAt ?? accueil?.updatedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      ...(images.length > 0 ? { images } : {}),
    },
  ]
}
