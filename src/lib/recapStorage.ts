'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { VocabularyItem, WhitelistLevel } from './vocabularyData'
import {
  setRecapItemLevelAction,
  removeRecapItemAction,
  clearRecapItemsAction,
  syncRecapItemsAction,
  getUserRecapItems,
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
      return parsed
        .filter((item) => Boolean(item && item.nihongo && item.bangla))
        .map((item) => ({
          ...item,
          level: (['normal', 'medium', 'hard'].includes(item.level)
            ? item.level
            : 'normal') as WhitelistLevel,
        }))
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
  return currentList.some((item) => getVocabKey(item) === key)
}

export const getVocabLevel = (
  vocab: VocabularyItem,
  list?: VocabularyItem[]
): WhitelistLevel | null => {
  const currentList = list ?? getRecapVocabularies()
  const key = getVocabKey(vocab)
  const item = currentList.find((i) => getVocabKey(i) === key)
  if (!item) return null
  return (
    ['normal', 'medium', 'hard'].includes(item.level || '') ? item.level : 'normal'
  ) as WhitelistLevel
}

export const setLevelRecapVocabulary = (
  vocab: VocabularyItem,
  targetLevel: WhitelistLevel,
  userId?: string
): { items: VocabularyItem[]; activeLevel: WhitelistLevel | null } => {
  const current = getRecapVocabularies()
  const key = getVocabKey(vocab)
  const existingIndex = current.findIndex((item) => getVocabKey(item) === key)

  let updated: VocabularyItem[]
  let activeLevel: WhitelistLevel | null = null

  if (existingIndex >= 0) {
    const existing = current[existingIndex]
    const currentLevel = (
      ['normal', 'medium', 'hard'].includes(existing.level || '') ? existing.level : 'normal'
    ) as WhitelistLevel

    if (currentLevel === targetLevel) {
      // Toggle off / remove from whitelist
      updated = current.filter((item) => getVocabKey(item) !== key)
      activeLevel = null
    } else {
      // Switch difficulty level
      updated = current.map((item, idx) => {
        if (idx === existingIndex) {
          return { ...item, level: targetLevel }
        }
        return item
      })
      activeLevel = targetLevel
    }
  } else {
    // Add new to whitelist with targetLevel
    const newItem: VocabularyItem = {
      ...vocab,
      level: targetLevel,
    }
    updated = [newItem, ...current]
    activeLevel = targetLevel
  }

  saveRecapVocabularies(updated)

  // Persist to database in background
  setRecapItemLevelAction(vocab, targetLevel, userId).catch((err) => {
    console.error('Failed to set recap level in DB:', err)
  })

  return { items: updated, activeLevel }
}

export const toggleRecapVocabulary = (
  vocab: VocabularyItem,
  userId?: string
): { items: VocabularyItem[]; added: boolean } => {
  const currentLevel = getVocabLevel(vocab)
  const targetLevel = currentLevel || 'normal'
  const res = setLevelRecapVocabulary(vocab, targetLevel, userId)
  return { items: res.items, added: res.activeLevel !== null }
}

export const removeRecapVocabulary = (vocab: VocabularyItem, userId?: string): VocabularyItem[] => {
  const current = getRecapVocabularies()
  const key = getVocabKey(vocab)
  const updated = current.filter((item) => getVocabKey(item) !== key)
  saveRecapVocabularies(updated)

  // Persist to database in background
  removeRecapItemAction(vocab, userId).catch((err) => {
    console.error('Failed to remove recap from DB:', err)
  })

  return updated
}

export const clearRecapVocabularies = (userId?: string, level?: WhitelistLevel): void => {
  if (level) {
    const current = getRecapVocabularies()
    const updated = current.filter((item) => (item.level || 'normal') !== level)
    saveRecapVocabularies(updated)
  } else {
    saveRecapVocabularies([])
  }

  // Persist to database in background
  clearRecapItemsAction(userId, level).catch((err) => {
    console.error('Failed to clear recap from DB:', err)
  })
}

export function useRecapVocabularies(initialItems?: VocabularyItem[], userId?: string) {
  const [recapList, setRecapList] = useState<VocabularyItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((item) => ({
        ...item,
        level: (['normal', 'medium', 'hard'].includes(item.level || '')
          ? item.level
          : 'normal') as WhitelistLevel,
      }))
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
          const dbKeys = new Set(initialItems.map(getVocabKey))
          const unSyncedLocal = localItems.filter((item) => !dbKeys.has(getVocabKey(item)))

          if (unSyncedLocal.length > 0) {
            const merged = await syncRecapItemsAction(localItems, userId)
            if (isMounted && merged.length > 0) {
              setRecapList(merged)
              saveRecapVocabularies(merged)
            }
          } else {
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

  const normalList = useMemo(() => {
    return recapList.filter((item) => (item.level || 'normal') === 'normal')
  }, [recapList])

  const mediumList = useMemo(() => {
    return recapList.filter((item) => item.level === 'medium')
  }, [recapList])

  const hardList = useMemo(() => {
    return recapList.filter((item) => item.level === 'hard')
  }, [recapList])

  const getItemLevel = useCallback(
    (vocab: VocabularyItem): WhitelistLevel | null => {
      const key = getVocabKey(vocab)
      const found = recapList.find((item) => getVocabKey(item) === key)
      if (!found) return null
      return (
        ['normal', 'medium', 'hard'].includes(found.level || '') ? found.level : 'normal'
      ) as WhitelistLevel
    },
    [recapList]
  )

  const isSaved = useCallback(
    (vocab: VocabularyItem): boolean => {
      const key = getVocabKey(vocab)
      return recapList.some((item) => getVocabKey(item) === key)
    },
    [recapList]
  )

  const setLevel = useCallback(
    (vocab: VocabularyItem, level: WhitelistLevel) => {
      return setLevelRecapVocabulary(vocab, level, userId)
    },
    [userId]
  )

  const toggle = useCallback(
    (vocab: VocabularyItem) => {
      return toggleRecapVocabulary(vocab, userId)
    },
    [userId]
  )

  const remove = useCallback(
    (vocab: VocabularyItem) => {
      return removeRecapVocabulary(vocab, userId)
    },
    [userId]
  )

  const clear = useCallback(
    (level?: WhitelistLevel) => {
      clearRecapVocabularies(userId, level)
    },
    [userId]
  )

  return {
    recapList,
    normalList,
    mediumList,
    hardList,
    isLoaded,
    isSaved,
    getItemLevel,
    setLevel,
    toggle,
    remove,
    clear,
  }
}
