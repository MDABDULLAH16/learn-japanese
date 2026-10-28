import { getCurrentUser, getUserRecapItems, getUserKanjiRecapItems } from '@/lib/actions'
import { connection } from 'next/server'
import { SearchClient } from './SearchClient'

export const instant = false

export const metadata = {
  title: 'Search Vocabulary & Kanji | Learn Japanese',
  description:
    'Search Japanese vocabularies and JLPT Kanji by Romaji, Bangla meaning, Uchharon, English, Hiragana, Katakana, and stroke count.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string
    tab?: string
    lesson?: string
    level?: string
    stroke?: string
  }>
}) {
  await connection()
  const user = await getCurrentUser()
  const resolvedParams = searchParams ? await searchParams : {}

  const initialVocabRecaps = user ? await getUserRecapItems(user.id) : []
  const initialKanjiRecaps = user ? await getUserKanjiRecapItems(user.id) : []

  return (
    <SearchClient
      userId={user ? user.id : ''}
      initialQuery={resolvedParams.q || ''}
      initialTab={(resolvedParams.tab as 'all' | 'vocabulary' | 'kanji') || 'all'}
      initialLesson={resolvedParams.lesson || 'all'}
      initialLevel={resolvedParams.level || 'all'}
      initialStroke={resolvedParams.stroke || 'all'}
      initialVocabRecaps={initialVocabRecaps}
      initialKanjiRecaps={initialKanjiRecaps}
    />
  )
}
