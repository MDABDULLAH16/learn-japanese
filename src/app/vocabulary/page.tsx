export const instant = false

import { getCurrentUser, getUserRecapItems } from '@/lib/actions'
import { connection } from 'next/server'
import { VocabularyClient } from './VocabularyClient'

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams?: Promise<{ lesson?: string; word?: string }>
}) {
  await connection()
  const user = await getCurrentUser()
  const initialRecaps = user ? await getUserRecapItems(user.id) : []

  const resolved = searchParams ? await searchParams : {}
  const initialLesson =
    resolved.lesson === 'recap'
      ? 'recap'
      : resolved.lesson
        ? parseInt(resolved.lesson, 10) || 1
        : 1
  const targetWord = resolved.word ? decodeURIComponent(resolved.word) : ''

  return (
    <VocabularyClient
      userId={user ? user.id : ''}
      initialRecapList={initialRecaps}
      initialLesson={initialLesson}
      targetWord={targetWord}
    />
  )
}
