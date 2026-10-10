import kanjiDataN5 from './kanji_n5.json'

export type KanjiItem = {
  id: string;
  kanji: string;
  meaning_en: string;
  meaning_bn: string;
  onyomi: string[];
  kunyomi: string[];
  examples: {
    word: string;
    reading: string;
    meaning_en: string;
    meaning_bn: string;
  }[];
  sentences: {
    japanese: string;
    romaji: string;
    english: string;
    bangla: string;
  }[];
  level: "N5" | "N4";
  lesson: number;
  mnemonic?: string;
  kun_yomi_new?: {
    reading: string;
    examples: { word: string; reading: string; meaning_bn: string }[];
  };
  on_yomi_new?: {
    reading: string;
    examples: { word: string; reading: string; meaning_bn: string }[];
  };
}

export const KANJI_DATA: KanjiItem[] = kanjiDataN5 as KanjiItem[];
