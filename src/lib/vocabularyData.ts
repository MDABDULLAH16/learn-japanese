import vocabulary1to20 from './vocabulary_1-20.json'
import vocabulary21to25 from './vocabulary_21-25.json'

export type WhitelistLevel = 'normal' | 'medium' | 'hard'

export type VocabularyItem = {
  nihongo: string
  romaji: string
  uchharon: string
  kanji: string
  english: string
  bangla: string
  level?: WhitelistLevel
}

export type Lesson = {
  lesson_number: number
  vocabularies: VocabularyItem[]
}

const vocabularyRaw: Lesson[] = [
  ...(vocabulary1to20 as Lesson[]),
  ...(vocabulary21to25 as Lesson[]),
]

export const VOCABULARY_DATA: { lessons: Lesson[] } = {
  lessons: vocabularyRaw.map((lesson) => ({
    ...lesson,
    vocabularies: lesson.vocabularies.filter((v) =>
      Boolean(v && v.nihongo && v.nihongo.trim() && v.bangla && v.bangla.trim())
    ),
  })),
}
