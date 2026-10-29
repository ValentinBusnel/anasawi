import { AdminContent } from '@/components/admin/AdminContent'
import { MessagesList } from '@/components/admin/MessagesList'
import { getMessages } from '@/server/queries'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const messages = await getMessages(200)

  return (
    <AdminContent width="wide">
      {/* L'en-tête (« N non lus sur N ») vit dans la liste : il suit les
          lectures sans recharger. */}
      <MessagesList messages={messages} />
    </AdminContent>
  )
}
