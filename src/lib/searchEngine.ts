import { VOCABULARY_DATA, VocabularyItem, Lesson } from './vocabularyData'
import { KANJI_DATA, KanjiItem } from './kanjiData'
import { toHiragana, toKatakana } from './romajiConverter'

export type SearchableVocabItem = VocabularyItem & {
  lesson_number: number
}

export type SearchResultVocab = {
  type: 'vocabulary'
  item: SearchableVocabItem
  score: number
  matchedField: 'nihongo' | 'kanji' | 'romaji' | 'uchharon' | 'bangla' | 'english'
  matchedLabel: string
  matchedSnippet: string
}

export type SearchResultKanji = {
  type: 'kanji'
  item: KanjiItem
  score: number
  matchedField:
    | 'kanji'
    | 'meaning_bn'
    | 'meaning_en'
    | 'onyomi'
    | 'kunyomi'
    | 'stroke_count'
    | 'example'
  matchedLabel: string
  matchedSnippet: string
}

export type SearchResult = SearchResultVocab | SearchResultKanji

export type SearchFilterOptions = {
  category?: 'all' | 'vocabulary' | 'kanji'
  jlptLevel?: 'all' | 'N5' | 'N4'
  lesson?: 'all' | number
  strokeCount?: 'all' | number
  limit?: number
}

// Flatten all vocabularies once with lesson numbers attached
export const ALL_SEARCHABLE_VOCABULARIES: SearchableVocabItem[] = VOCABULARY_DATA.lessons.flatMap(
  (lesson: Lesson) =>
    lesson.vocabularies.map((v) => ({
      ...v,
      lesson_number: lesson.lesson_number,
    }))
)

// Helper to normalize strings for comparison
function normalize(str?: string | null): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

// Check if string contains query with flexible matching
function containsWord(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false
  return normalize(haystack).includes(normalize(needle))
}

// Parse stroke query from text (e.g. "4 strokes", "4 stroke", "stroke 4", "৪ স্ট্রোক")
function extractStrokeCountFromQuery(query: string): number | null {
  const normalized = query.toLowerCase().trim()
  const strokeRegex = /(?:(\d+)\s*(?:stroke|strokes|kaku|str|কাকু|স্ট্রোক))|(?:(?:stroke|strokes|স্ট্রোক)\s*(\d+))/
  const match = normalized.match(strokeRegex)
  if (match) {
    const num = parseInt(match[1] || match[2], 10)
    if (!isNaN(num) && num > 0 && num <= 40) return num
  }
  return null
}

export function searchJapaneseData(
  rawQuery: string,
  options: SearchFilterOptions = {}
): {
  results: SearchResult[]
  vocabResults: SearchResultVocab[]
  kanjiResults: SearchResultKanji[]
  totalCount: number
  detectedQueries: {
    original: string
    hiragana: string
    katakana: string
    extractedStroke: number | null
  }
} {
  const query = rawQuery.trim()
  const normQuery = normalize(query)
  const category = options.category || 'all'
  const jlptLevel = options.jlptLevel || 'all'
  const lesson = options.lesson || 'all'
  const strokeFilter = options.strokeCount || 'all'
  const limit = options.limit || 100

  if (!normQuery && strokeFilter === 'all' && lesson === 'all' && jlptLevel === 'all') {
    return {
      results: [],
      vocabResults: [],
      kanjiResults: [],
      totalCount: 0,
      detectedQueries: {
        original: query,
        hiragana: '',
        katakana: '',
        extractedStroke: null,
      },
    }
  }

  // Pre-generate Kana forms for Romaji query (Feature 2: Romaji auto-matching)
  const hiraganaQuery = normQuery ? toHiragana(normQuery) : ''
  const katakanaQuery = normQuery ? toKatakana(normQuery) : ''
  const extractedStroke = normQuery ? extractStrokeCountFromQuery(normQuery) : null
  const targetStroke = strokeFilter !== 'all' ? strokeFilter : extractedStroke

  const vocabResults: SearchResultVocab[] = []
  const kanjiResults: SearchResultKanji[] = []

  // 1. Search Vocabularies if category allows
  if (category === 'all' || category === 'vocabulary') {
    for (const item of ALL_SEARCHABLE_VOCABULARIES) {
      // Filter: Lesson
      if (lesson !== 'all' && item.lesson_number !== lesson) {
        continue
      }

      if (!normQuery) {
        // If query is empty but filter applied, return item
        vocabResults.push({
          type: 'vocabulary',
          item,
          score: 10,
          matchedField: 'nihongo',
          matchedLabel: 'Lesson Filter',
          matchedSnippet: item.nihongo,
        })
        continue
      }

      let bestScore = 0
      let matchedField: SearchResultVocab['matchedField'] = 'nihongo'
      let matchedLabel = ''
      let matchedSnippet = ''

      const normNihongo = normalize(item.nihongo)
      const normRomaji = normalize(item.romaji)
      const normUchharon = normalize(item.uchharon)
      const normBangla = normalize(item.bangla)
      const normEnglish = normalize(item.english)
      const normKanji = normalize(item.kanji)

      // Priority 1: Exact matches
      if (normNihongo === normQuery || normKanji === normQuery) {
        bestScore = 100
        matchedField = normKanji === normQuery ? 'kanji' : 'nihongo'
        matchedLabel = 'সরাসরি জাপানিজ মিল'
        matchedSnippet = item.kanji || item.nihongo
      } else if (normBangla === normQuery) {
        bestScore = 95
        matchedField = 'bangla'
        matchedLabel = 'বাংলা অর্থ (সরাসরি মিল)'
        matchedSnippet = item.bangla
      } else if (normRomaji === normQuery) {
        bestScore = 95
        matchedField = 'romaji'
        matchedLabel = 'Romaji (সরাসরি মিল)'
        matchedSnippet = item.romaji
      } else if (normUchharon === normQuery) {
        bestScore = 90
        matchedField = 'uchharon'
        matchedLabel = 'উচ্চারণ (সরাসরি মিল)'
        matchedSnippet = item.uchharon
      } else if (normEnglish === normQuery) {
        bestScore = 90
        matchedField = 'english'
        matchedLabel = 'English Meaning (Exact)'
        matchedSnippet = item.english
      }

      // Priority 2: StartsWith / Prefix matches
      if (bestScore < 90) {
        if (normNihongo.startsWith(normQuery) || (normKanji && normKanji.startsWith(normQuery))) {
          bestScore = 85
          matchedField = normKanji.startsWith(normQuery) ? 'kanji' : 'nihongo'
          matchedLabel = 'জাপানিজ শব্দ শুরু'
          matchedSnippet = item.kanji || item.nihongo
        } else if (normRomaji.startsWith(normQuery)) {
          bestScore = 80
          matchedField = 'romaji'
          matchedLabel = 'Romaji দিয়ে শুরু'
          matchedSnippet = item.romaji
        } else if (normBangla.startsWith(normQuery)) {
          bestScore = 80
          matchedField = 'bangla'
          matchedLabel = 'বাংলা অর্থ দিয়ে শুরু'
          matchedSnippet = item.bangla
        } else if (normUchharon.startsWith(normQuery)) {
          bestScore = 75
          matchedField = 'uchharon'
          matchedLabel = 'উচ্চারণ দিয়ে শুরু'
          matchedSnippet = item.uchharon
        } else if (normEnglish.startsWith(normQuery)) {
          bestScore = 75
          matchedField = 'english'
          matchedLabel = 'English Starts With'
          matchedSnippet = item.english
        }
      }

      // Priority 3: Romaji-to-Kana conversion matching
      if (bestScore < 75 && hiraganaQuery && hiraganaQuery !== normQuery) {
        if (normNihongo === hiraganaQuery) {
          bestScore = 80
          matchedField = 'nihongo'
          matchedLabel = `Romaji → Hiragana (${hiraganaQuery})`
          matchedSnippet = item.nihongo
        } else if (normNihongo.includes(hiraganaQuery)) {
          bestScore = 70
          matchedField = 'nihongo'
          matchedLabel = `Romaji → Hiragana (${hiraganaQuery})`
          matchedSnippet = item.nihongo
        }
      }

      // Priority 4: Contains / Substring matches
      if (bestScore < 70) {
        if (containsWord(item.bangla, normQuery)) {
          bestScore = 65
          matchedField = 'bangla'
          matchedLabel = 'বাংলা অর্থ'
          matchedSnippet = item.bangla
        } else if (containsWord(item.uchharon, normQuery)) {
          bestScore = 60
          matchedField = 'uchharon'
          matchedLabel = 'বাংলা উচ্চারণ'
          matchedSnippet = item.uchharon
        } else if (containsWord(item.romaji, normQuery)) {
          bestScore = 60
          matchedField = 'romaji'
          matchedLabel = 'Romaji মিল'
          matchedSnippet = item.romaji
        } else if (containsWord(item.english, normQuery)) {
          bestScore = 55
          matchedField = 'english'
          matchedLabel = 'English Meaning'
          matchedSnippet = item.english
        } else if (containsWord(item.nihongo, normQuery)) {
          bestScore = 55
          matchedField = 'nihongo'
          matchedLabel = 'Japanese Characters'
          matchedSnippet = item.nihongo
        } else if (item.kanji && containsWord(item.kanji, normQuery)) {
          bestScore = 55
          matchedField = 'kanji'
          matchedLabel = 'Kanji Match'
          matchedSnippet = item.kanji
        }
      }

      if (bestScore > 0) {
        vocabResults.push({
          type: 'vocabulary',
          item,
          score: bestScore,
          matchedField,
          matchedLabel,
          matchedSnippet,
        })
      }
    }
  }

  // 2. Search Kanji if category allows
  if (category === 'all' || category === 'kanji') {
    for (const item of KANJI_DATA) {
      // Filter: JLPT Level
      if (jlptLevel !== 'all' && item.level !== jlptLevel) {
        continue
      }

      // Filter: Lesson
      if (lesson !== 'all' && item.lesson !== lesson) {
        continue
      }

      // Filter: Stroke Count
      if (targetStroke !== null && item.stroke_count !== targetStroke) {
        continue
      }

      if (!normQuery && (targetStroke !== null || lesson !== 'all' || jlptLevel !== 'all')) {
        kanjiResults.push({
          type: 'kanji',
          item,
          score: 10,
          matchedField: 'kanji',
          matchedLabel: targetStroke !== null ? `${targetStroke} Strokes` : 'Filter Result',
          matchedSnippet: item.kanji,
        })
        continue
      }

      let bestScore = 0
      let matchedField: SearchResultKanji['matchedField'] = 'kanji'
      let matchedLabel = ''
      let matchedSnippet = ''

      const normKanjiChar = normalize(item.kanji)
      const normMeaningBn = normalize(item.meaning_bn)
      const normMeaningEn = normalize(item.meaning_en)
      const onyomiList = item.onyomi || []
      const kunyomiList = item.kunyomi || []

      // Priority 1: Exact Kanji character match
      if (normKanjiChar === normQuery) {
        bestScore = 100
        matchedField = 'kanji'
        matchedLabel = 'সরাসরি মূল কাঞ্জি'
        matchedSnippet = item.kanji
      }

      // Priority 2: Exact Bangla meaning match
      if (bestScore < 95 && normMeaningBn === normQuery) {
        bestScore = 95
        matchedField = 'meaning_bn'
        matchedLabel = 'বাংলা অর্থ (সরাসরি)'
        matchedSnippet = item.meaning_bn
      }

      // Priority 3: Exact English meaning match
      if (bestScore < 90 && normMeaningEn === normQuery) {
        bestScore = 90
        matchedField = 'meaning_en'
        matchedLabel = 'English Meaning (Exact)'
        matchedSnippet = item.meaning_en
      }

      // Priority 4: Onyomi or Kunyomi Reading match (with Romaji & Kana conversion)
      if (bestScore < 85) {
        // Kunyomi checks
        for (const kun of kunyomiList) {
          const normKun = normalize(kun.replace(/[.-]/g, ''))
          if (
            normKun === normQuery ||
            normKun === hiraganaQuery ||
            kun.includes(normQuery) ||
            kun.includes(hiraganaQuery)
          ) {
            bestScore = 85
            matchedField = 'kunyomi'
            matchedLabel = `Kunyomi রিডিং (${kun})`
            matchedSnippet = kun
            break
          }
        }

        // Onyomi checks
        if (bestScore < 85) {
          for (const on of onyomiList) {
            const normOn = normalize(on.replace(/[.-]/g, ''))
            if (
              normOn === normQuery ||
              normOn === katakanaQuery ||
              on.includes(normQuery) ||
              on.includes(katakanaQuery)
            ) {
              bestScore = 85
              matchedField = 'onyomi'
              matchedLabel = `Onyomi রিডিং (${on})`
              matchedSnippet = on
              break
            }
          }
        }
      }

      // Priority 5: StartsWith on Bangla or English
      if (bestScore < 80) {
        if (normMeaningBn.startsWith(normQuery)) {
          bestScore = 80
          matchedField = 'meaning_bn'
          matchedLabel = 'বাংলা অর্থ শুরু'
          matchedSnippet = item.meaning_bn
        } else if (normMeaningEn.startsWith(normQuery)) {
          bestScore = 75
          matchedField = 'meaning_en'
          matchedLabel = 'English Starts With'
          matchedSnippet = item.meaning_en
        }
      }

      // Priority 6: Substring match in Bangla / English meanings
      if (bestScore < 70) {
        if (containsWord(item.meaning_bn, normQuery)) {
          bestScore = 65
          matchedField = 'meaning_bn'
          matchedLabel = 'বাংলা অর্থ মিল'
          matchedSnippet = item.meaning_bn
        } else if (containsWord(item.meaning_en, normQuery)) {
          bestScore = 60
          matchedField = 'meaning_en'
          matchedLabel = 'English Meaning'
          matchedSnippet = item.meaning_en
        }
      }

      // Priority 7: Kanji Compound Examples / Compound Words match
      if (bestScore < 60 && item.examples && item.examples.length > 0) {
        for (const ex of item.examples) {
          if (
            ex.word.includes(normQuery) ||
            ex.reading.includes(normQuery) ||
            (hiraganaQuery && ex.reading.includes(hiraganaQuery)) ||
            containsWord(ex.meaning_bn, normQuery) ||
            (ex.meaning_en && containsWord(ex.meaning_en, normQuery))
          ) {
            bestScore = 55
            matchedField = 'example'
            matchedLabel = `উদাহরণ শব্দ (${ex.word}: ${ex.meaning_bn})`
            matchedSnippet = `${ex.word} (${ex.reading}) - ${ex.meaning_bn}`
            break
          }
        }
      }

      // If stroke search query matched
      if (bestScore === 0 && targetStroke !== null && item.stroke_count === targetStroke) {
        bestScore = 50
        matchedField = 'stroke_count'
        matchedLabel = `${item.stroke_count} Strokes`
        matchedSnippet = `Stroke Count: ${item.stroke_count}`
      }

      if (bestScore > 0) {
        kanjiResults.push({
          type: 'kanji',
          item,
          score: bestScore,
          matchedField,
          matchedLabel,
          matchedSnippet,
        })
      }
    }
  }

  // Sort by score descending
  vocabResults.sort((a, b) => b.score - a.score)
  kanjiResults.sort((a, b) => b.score - a.score)

  // Merge results, alternating or top-scoring first
  const merged: SearchResult[] = [...vocabResults, ...kanjiResults].sort((a, b) => b.score - a.score)

  return {
    results: merged.slice(0, limit),
    vocabResults: vocabResults.slice(0, limit),
    kanjiResults: kanjiResults.slice(0, limit),
    totalCount: merged.length,
    detectedQueries: {
      original: query,
      hiragana: hiraganaQuery,
      katakana: katakanaQuery,
      extractedStroke,
    },
  }
}

// Text Highlight Helper for React components
export function splitHighlight(
  text: string,
  query: string
): Array<{ text: string; isMatch: boolean }> {
  if (!text || !query.trim()) {
    return [{ text, isMatch: false }]
  }

  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const hira = toHiragana(cleanQuery)
  const kata = toKatakana(cleanQuery)

  const patterns = Array.from(new Set([cleanQuery, hira, kata].filter(Boolean)))
  const regex = new RegExp(`(${patterns.join('|')})`, 'gi')

  const parts = text.split(regex)
  return parts.map((part) => ({
    text: part,
    isMatch: regex.test(part),
  }))
}
