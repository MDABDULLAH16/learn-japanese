import { getCurrentUser, getUserKanjiRecapItems } from '@/lib/actions'
import { connection } from 'next/server'
import { KanjiClient } from './KanjiClient'

export const instant = false

export default async function KanjiPage({
  searchParams,
}: {
  searchParams?: Promise<{ level?: string; lesson?: string }>
}) {
  await connection()
  const user = await getCurrentUser()

  const resolvedParams = searchParams ? await searchParams : {}
  const initialLevel = (resolvedParams.level as 'N5' | 'N4') || 'N5'
  const initialLesson =
    resolvedParams.lesson === 'recap'
      ? 'recap'
      : resolvedParams.lesson
        ? parseInt(resolvedParams.lesson, 10)
        : 1

  const initialKanjiRecaps = user ? await getUserKanjiRecapItems(user.id) : []

  return (
    <KanjiClient
      userId={user ? user.id : ''}
      initialLevel={initialLevel}
      initialLesson={initialLesson}
      initialRecapList={initialKanjiRecaps}
    />
  )
}
