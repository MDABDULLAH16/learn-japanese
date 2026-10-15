import vocabularyRaw from './vocabulary_1-20.json';

export type VocabularyItem = {
  nihongo: string;
  romaji: string;
  uchharon: string;
  kanji: string;
  english: string;
  bangla: string;
};

export type Lesson = {
  lesson_number: number;
  vocabularies: VocabularyItem[];
};

export const VOCABULARY_DATA: { lessons: Lesson[] } = {
  lessons: (vocabularyRaw as Lesson[]).map(lesson => ({
    ...lesson,
    vocabularies: lesson.vocabularies.filter(v => 
      Boolean(v && v.nihongo && v.nihongo.trim() && v.bangla && v.bangla.trim())
    )
  }))
};
