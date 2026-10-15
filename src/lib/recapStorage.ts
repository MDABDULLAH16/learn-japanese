'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { VocabularyItem } from './vocabularyData'
import { 
  toggleRecapItemAction, 
  removeRecapItemAction, 
  clearRecapItemsAction, 
  syncRecapItemsAction,
  getUserRecapItems 
} from './actions'

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

export const toggleRecapVocabulary = (
  vocab: VocabularyItem, 
  userId?: string
): { items: VocabularyItem[]; added: boolean } => {
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

  // Persist to database in background
  toggleRecapItemAction(vocab, userId).catch(err => {
    console.error('Failed to toggle recap in DB:', err)
  })

  return { items: updated, added: !exists }
}

export const removeRecapVocabulary = (
  vocab: VocabularyItem, 
  userId?: string
): VocabularyItem[] => {
  const current = getRecapVocabularies()
  const key = getVocabKey(vocab)
  const updated = current.filter(item => getVocabKey(item) !== key)
  saveRecapVocabularies(updated)

  // Persist to database in background
  removeRecapItemAction(vocab, userId).catch(err => {
    console.error('Failed to remove recap from DB:', err)
  })

  return updated
}

export const clearRecapVocabularies = (userId?: string): void => {
  saveRecapVocabularies([])

  // Persist to database in background
  clearRecapItemsAction(userId).catch(err => {
    console.error('Failed to clear recap from DB:', err)
  })
}

export function useRecapVocabularies(initialItems?: VocabularyItem[], userId?: string) {
  const [recapList, setRecapList] = useState<VocabularyItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems
    }
    return getRecapVocabularies()
  })
  const [isLoaded, setIsLoaded] = useState(Boolean(initialItems && initialItems.length > 0))
  const syncAttemptedRef = useRef(false)

  // Sync with initialItems or DB on mount
  useEffect(() => {
    let isMounted = true

    const syncWithDb = async () => {
      try {
        const localItems = getRecapVocabularies()
        
        // If we have initial items from server
        if (initialItems && initialItems.length > 0) {
          // If local items exist that might not be in DB, sync them
          const dbKeys = new Set(initialItems.map(getVocabKey))
          const unSyncedLocal = localItems.filter(item => !dbKeys.has(getVocabKey(item)))

          if (unSyncedLocal.length > 0) {
            const merged = await syncRecapItemsAction(localItems, userId)
            if (isMounted && merged.length > 0) {
              setRecapList(merged)
              saveRecapVocabularies(merged)
            }
          } else {
            // Initial items from DB are the source of truth
            if (isMounted) {
              setRecapList(initialItems)
              saveRecapVocabularies(initialItems)
            }
          }
        } else {
          // No initialItems provided from SSR: fetch or sync with DB
          if (localItems.length > 0) {
            const merged = await syncRecapItemsAction(localItems, userId)
            if (isMounted) {
              const listToUse = merged.length > 0 ? merged : localItems
              setRecapList(listToUse)
              saveRecapVocabularies(listToUse)
            }
          } else {
            const dbItems = await getUserRecapItems(userId)
            if (isMounted) {
              setRecapList(dbItems)
              saveRecapVocabularies(dbItems)
            }
          }
        }
      } catch (error) {
        console.error('Error syncing recap with DB:', error)
      } finally {
        if (isMounted) setIsLoaded(true)
      }
    }

    if (!syncAttemptedRef.current) {
      syncAttemptedRef.current = true
      syncWithDb()
    }

    const handleUpdate = () => {
      setRecapList(getRecapVocabularies())
    }

    window.addEventListener('recap_vocab_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('recap_vocab_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [initialItems, userId])

  const isSaved = useCallback(
    (vocab: VocabularyItem): boolean => {
      const key = getVocabKey(vocab)
      return recapList.some(item => getVocabKey(item) === key)
    },
    [recapList]
  )

  const toggle = useCallback((vocab: VocabularyItem) => {
    return toggleRecapVocabulary(vocab, userId)
  }, [userId])

  const remove = useCallback((vocab: VocabularyItem) => {
    return removeRecapVocabulary(vocab, userId)
  }, [userId])

  const clear = useCallback(() => {
    clearRecapVocabularies(userId)
  }, [userId])

  return {
    recapList,
    isLoaded,
    isSaved,
    toggle,
    remove,
    clear,
  }
}
