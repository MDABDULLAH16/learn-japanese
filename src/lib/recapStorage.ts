'use client'

import { useState, useEffect, useCallback } from 'react'
import { VocabularyItem } from './vocabularyData'

const RECAP_STORAGE_KEY = 'learn_japanese_recap_vocabs'

export const getVocabKey = (vocab: VocabularyItem): string => {
  return `${vocab.nihongo.trim()}::${vocab.bangla.trim()}`
}

export const getRecapVocabularies = (): VocabularyItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECAP_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(item => Boolean(item && item.nihongo && item.bangla))
    }
    return []
  } catch (error) {
    console.error('Failed to read recap vocabulary from storage:', error)
    return []
  }
}

export const saveRecapVocabularies = (items: VocabularyItem[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECAP_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('recap_vocab_updated', { detail: items }))
  } catch (error) {
    console.error('Failed to save recap vocabulary to storage:', error)
  }
}

export const isRecapVocabulary = (vocab: VocabularyItem, list?: VocabularyItem[]): boolean => {
  const currentList = list ?? getRecapVocabularies()
  const key = getVocabKey(vocab)
  return currentList.some(item => getVocabKey(item) === key)
}

export const toggleRecapVocabulary = (vocab: VocabularyItem): { items: VocabularyItem[]; added: boolean } => {
  const current = getRecapVocabularies()
  const key = getVocabKey(vocab)
  const exists = current.some(item => getVocabKey(item) === key)
  
  let updated: VocabularyItem[]
  if (exists) {
    updated = current.filter(item => getVocabKey(item) !== key)
  } else {
    updated = [vocab, ...current]
  }

  saveRecapVocabularies(updated)
  return { items: updated, added: !exists }
}

export const removeRecapVocabulary = (vocab: VocabularyItem): VocabularyItem[] => {
  const current = getRecapVocabularies()
  const key = getVocabKey(vocab)
  const updated = current.filter(item => getVocabKey(item) !== key)
  saveRecapVocabularies(updated)
  return updated
}

export const clearRecapVocabularies = (): void => {
  saveRecapVocabularies([])
}

export function useRecapVocabularies() {
  const [recapList, setRecapList] = useState<VocabularyItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setRecapList(getRecapVocabularies())
    setIsLoaded(true)

    const handleUpdate = () => {
      setRecapList(getRecapVocabularies())
    }

    window.addEventListener('recap_vocab_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('recap_vocab_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const isSaved = useCallback(
    (vocab: VocabularyItem): boolean => {
      const key = getVocabKey(vocab)
      return recapList.some(item => getVocabKey(item) === key)
    },
    [recapList]
  )

  const toggle = useCallback((vocab: VocabularyItem) => {
    return toggleRecapVocabulary(vocab)
  }, [])

  const remove = useCallback((vocab: VocabularyItem) => {
    return removeRecapVocabulary(vocab)
  }, [])

  const clear = useCallback(() => {
    clearRecapVocabularies()
  }, [])

  return {
    recapList,
    isLoaded,
    isSaved,
    toggle,
    remove,
    clear,
  }
}
