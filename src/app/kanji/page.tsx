import { getCurrentUser, getUserKanjiRecapItems } from '@/lib/actions'
import { redirect } from 'next/navigation'
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
  if (!user) redirect('/login')

  const resolvedParams = searchParams ? await searchParams : {}
  const initialLevel = (resolvedParams.level as 'N5' | 'N4') || 'N5'
  const initialLesson =
    resolvedParams.lesson === 'recap'
      ? 'recap'
      : resolvedParams.lesson
        ? parseInt(resolvedParams.lesson, 10)
        : 1

  const initialKanjiRecaps = await getUserKanjiRecapItems(user.id)

  return (
    <KanjiClient
      userId={user.id}
      initialLevel={initialLevel}
      initialLesson={initialLesson}
      initialRecapList={initialKanjiRecaps}
    />
  )
}
