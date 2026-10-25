import { getCurrentUser } from '@/lib/actions'
import { redirect, notFound } from 'next/navigation'
import { connection } from 'next/server'
import { KANJI_DATA } from '@/lib/kanjiData'
import { KanjiDetailClient } from './KanjiDetailClient'

export const instant = false

export default async function KanjiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ level?: string; lesson?: string }>
}) {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { level, lesson } = await searchParams

  const kanji = KANJI_DATA.find((k) => k.id === id)
  if (!kanji) {
    notFound()
  }

  const initialLevel = (level as 'N5' | 'N4') || kanji.level
  const initialLesson = lesson ? parseInt(lesson, 10) : kanji.lesson

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <KanjiDetailClient
        initialKanji={kanji}
        initialLevel={initialLevel}
        initialLesson={initialLesson}
        userId={user.id}
      />
    </main>
  )
}
