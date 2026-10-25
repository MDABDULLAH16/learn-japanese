export const instant = false

import { getCurrentUser, getUserRecapItems } from '@/lib/actions'
import { VocabularyClient } from './VocabularyClient'

export default async function VocabularyPage() {
  const user = await getCurrentUser()
  const initialRecaps = user ? await getUserRecapItems(user.id) : []

  return <VocabularyClient userId={user ? user.id : ''} initialRecapList={initialRecaps} />
}
