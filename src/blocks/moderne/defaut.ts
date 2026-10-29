import { PAGE_MODERNE_PAR_DEFAUT } from './blocs'
import type { Section } from '@/server/db/schema'

/** La page moderne avant sa création en base : les dix sections par
    défaut, en mémoire (payloads vides : tout suit le contenu partagé). */
export function sectionsModernesParDefaut(): Section[] {
  const maintenant = new Date(0)
  return PAGE_MODERNE_PAR_DEFAUT.map((type, i) => ({
    id: `moderne-${type}`,
    pageId: 'moderne',
    parentId: null,
    columnIndex: 0,
    placement: null,
    settings: null,
    styles: null,
    name: null,
    type,
    anchor: null,
    navLabel: null,
    showInNav: false,
    sortOrder: i,
    isActive: true,
    backgroundColor: '#f6f7f9',
    payload: {},
    createdAt: maintenant,
    updatedAt: maintenant,
  }))
}
