'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { KanjiItem } from './kanjiData'
import { WhitelistLevel } from './vocabularyData'
import {
  setKanjiRecapLevelAction,
  clearKanjiRecapsAction,
  getUserKanjiRecapItems,
  KanjiRecapItem,
} from './actions'

const KANJI_RECAP_STORAGE_KEY = 'learn_japanese_recap_kanji'

export const getRecapKanji = (): KanjiRecapItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KANJI_RECAP_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => Boolean(item && item.id && item.kanji))
        .map((item) => ({
          ...item,
          level: (['normal', 'medium', 'hard'].includes(item.level)
            ? item.level
            : 'normal') as WhitelistLevel,
        }))
    }
    return []
  } catch (error) {
    console.error('Failed to read recap kanji from storage:', error)
    return []
  }
}

export const saveRecapKanji = (items: KanjiRecapItem[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KANJI_RECAP_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('kanji_recap_updated', { detail: items }))
  } catch (error) {
    console.error('Failed to save recap kanji to storage:', error)
  }
}

export function useRecapKanji(initialItems?: KanjiRecapItem[], userId?: string) {
  const [recapList, setRecapList] = useState<KanjiRecapItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((item) => ({
        ...item,
        level: (['normal', 'medium', 'hard'].includes(item.level || '')
          ? item.level
          : 'normal') as WhitelistLevel,
      }))
    }
    return getRecapKanji()
  })

  const [isLoaded, setIsLoaded] = useState(Boolean(initialItems && initialItems.length > 0))
  const syncAttemptedRef = useRef(false)

  // Sync with initialItems or DB on mount
  useEffect(() => {
    let isMounted = true

    const syncWithDb = async () => {
      try {
        const localItems = getRecapKanji()

        if (initialItems && initialItems.length > 0) {
          if (isMounted) {
            setRecapList(initialItems)
            saveRecapKanji(initialItems)
          }
        } else if (localItems.length > 0) {
          if (isMounted) {
            setRecapList(localItems)
          }
        } else {
          const dbItems = await getUserKanjiRecapItems(userId)
          if (isMounted) {
            setRecapList(dbItems)
            saveRecapKanji(dbItems)
          }
        }
      } catch (error) {
        console.error('Error syncing kanji recap with DB:', error)
      } finally {
        if (isMounted) setIsLoaded(true)
      }
    }

    if (!syncAttemptedRef.current) {
      syncAttemptedRef.current = true
      syncWithDb()
    }

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<KanjiRecapItem[]>
      if (customEvent.detail) {
        setRecapList(customEvent.detail)
      }
    }

    window.addEventListener('kanji_recap_updated', handleCustomEvent)
    return () => {
      isMounted = false
      window.removeEventListener('kanji_recap_updated', handleCustomEvent)
    }
  }, [initialItems, userId])

  const getItemLevel = useCallback(
    (kanjiId: string): WhitelistLevel | null => {
      const found = recapList.find((item) => item.id === kanjiId)
      return found ? found.level : null
    },
    [recapList]
  )

  const setLevel = useCallback(
    async (kanji: KanjiItem, targetLevel: WhitelistLevel) => {
      // 1. Optimistic update
      const existing = recapList.find((i) => i.id === kanji.id)
      let nextList: KanjiRecapItem[]

      if (existing) {
        if (existing.level === targetLevel) {
          // Toggle off
          nextList = recapList.filter((i) => i.id !== kanji.id)
        } else {
          // Switch level
          nextList = recapList.map((i) => (i.id === kanji.id ? { ...i, level: targetLevel } : i))
        }
      } else {
        // Add new
        const newItem: KanjiRecapItem = {
          id: kanji.id,
          kanji: kanji.kanji,
          meaning_en: kanji.meaning_en,
          meaning_bn: kanji.meaning_bn,
          level: targetLevel,
          lesson: kanji.lesson,
          kanjiLevel: kanji.level,
        }
        nextList = [newItem, ...recapList]
      }

      setRecapList(nextList)
      saveRecapKanji(nextList)

      // 2. Persist to server / PostgreSQL DB
      try {
        await setKanjiRecapLevelAction(kanji, targetLevel, userId)
      } catch (error) {
        console.error('Failed to sync kanji recap to DB:', error)
      }
    },
    [recapList, userId]
  )

  const clear = useCallback(async () => {
    setRecapList([])
    saveRecapKanji([])
    try {
      await clearKanjiRecapsAction(userId)
    } catch (error) {
      console.error('Failed to clear kanji recaps on DB:', error)
    }
  }, [userId])

  const normalList = useMemo(() => recapList.filter((i) => i.level === 'normal'), [recapList])
  const mediumList = useMemo(() => recapList.filter((i) => i.level === 'medium'), [recapList])
  const hardList = useMemo(() => recapList.filter((i) => i.level === 'hard'), [recapList])

  return {
    recapList,
    normalList,
    mediumList,
    hardList,
    getItemLevel,
    setLevel,
    clear,
    isLoaded,
  }
}
