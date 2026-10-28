import kanjiDataN5 from './kanji_n5.json'

export type ReadingItem = {
  kana: string
  romaji: string
  bangla: string
  context?: string
}

export type ExampleItem = {
  word: string
  kana: string
  bangla_reading: string
  romaji: string
  meaning_bn: string
  meaning_en?: string
}

export type SectionDetails = {
  available: boolean
  note?: string
  readings?: ReadingItem[]
  examples?: ExampleItem[]
}

export type SpecialDetails = {
  title?: string
  note?: string
  examples?: ExampleItem[]
}

export type KanjiItem = {
  id: string
  book_no?: number
  kanji: string
  stroke_count?: number
  meaning_en: string
  meaning_bn: string
  onyomi: string[]
  kunyomi: string[]
  origin?: string
  examples: {
    word: string
    reading: string
    meaning_en: string
    meaning_bn: string
  }[]
  sentences: {
    japanese: string
    romaji: string
    english: string
    bangla: string
  }[]
  level: 'N5' | 'N4'
  lesson: number
  lesson_title_bn?: string
  lesson_title_en?: string
  mnemonic?: string
  kun_section?: SectionDetails
  on_section?: SectionDetails
  special_section?: SpecialDetails
  kun_yomi_new?: {
    reading: string
    examples: { word: string; reading: string; meaning_bn: string }[]
  }
  on_yomi_new?: {
    reading: string
    examples: { word: string; reading: string; meaning_bn: string }[]
  }
  source_academy?: string
}

export const LESSON_TITLES: Record<number, { bn: string; en: string }> = {
  1: { bn: 'মৌলিক সংখ্যা ১–১০', en: 'Basic Numbers 1–10' },
  2: { bn: 'ক্যালেন্ডার ও সপ্তাহের বার', en: 'Calendar & Weekdays' },
  3: { bn: 'ঘড়ির সময় ও দিনের প্রহর', en: 'Clock Time & Parts of the Day' },
  4: { bn: 'মানুষ, পরিবার ও আত্মপরিচয়', en: 'People, Family & Identity' },
  5: { bn: 'দিক ও অবস্থান', en: 'Spatial Directions & Compass' },
  6: { bn: 'স্থান, দূরত্ব ও নগর পরিবহন', en: 'Places, Distance & Transit' },
  7: { bn: 'বিপরীত বিশেষণ ও গুণাবলি', en: 'Opposite Adjectives & Qualities' },
  8: { bn: 'প্রকৃতি, আবহাওয়া ও রঙ', en: 'Nature, Elements & Colors' },
  9: { bn: 'মানব শরীর, পঞ্চেন্দ্রিয় ও প্রকাশ', en: 'Body Parts, Senses & Expression' },
  10: { bn: 'কেনাকাটা, মুদ্রা ও আহার', en: 'Shopping, Money & Dining' },
  11: { bn: 'দৈনন্দিন গতিবিধি ও ক্রিয়াপদ', en: 'Motion & Daily Verbs' },
  12: { bn: 'শিক্ষা, জ্ঞান ও মন', en: 'Education, Knowledge & Mind' },
}

export const KANJI_DATA: KanjiItem[] = kanjiDataN5 as unknown as KanjiItem[]
