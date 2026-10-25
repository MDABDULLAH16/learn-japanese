'use server'
import path from 'path'

import prisma from './prisma'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'

export const getCurrentUser = async () => {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return null
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return null
    }

    const now = new Date()
    const lastLogin = new Date(user.lastLoginAt)
    const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24))

    if (diffDays === 1) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { streak: user.streak + 1, lastLoginAt: now },
      })
    } else if (diffDays > 1) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { streak: 1, lastLoginAt: now },
      })
    }
    return user
  } catch {
    return null
  }
}

export const requireCurrentUser = async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  return user
}

export const getUserProgress = async (userId: string) => {
  return await prisma.userProgress.findMany({
    where: { user_id: userId },
  })
}

export const markItemLearned = async (userId: string, itemId: string, itemType: string) => {
  try {
    await prisma.userProgress.upsert({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: itemId,
        },
      },
      update: {},
      create: {
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
      },
    })
    revalidatePath('/alphabet')
    revalidatePath('/')
  } catch (error) {
    console.error(error)
  }
}

export const markAllLearned = async (userId: string, itemIds: string[], itemType: string) => {
  try {
    const records = itemIds.map((id) => ({
      user_id: userId,
      item_id: id,
      item_type: itemType,
    }))

    // Efficiently add multiple by doing createMany with skipDuplicates
    await prisma.userProgress.createMany({
      data: records,
      skipDuplicates: true,
    })

    revalidatePath('/alphabet')
    revalidatePath('/')
  } catch (error) {
    console.error(error)
  }
}

export const saveQuizScore = async (userId: string, newScore: number) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalScore: {
        increment: newScore,
      },
    },
  })
  revalidatePath('/')
  revalidatePath('/quiz')
}

import type { VocabularyItem, WhitelistLevel } from './vocabularyData'

export const getUserRecapItems = async (userId?: string): Promise<VocabularyItem[]> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    const items = await prisma.recapItem.findMany({
      where: {
        user_id: targetUserId,
        NOT: { nihongo: { startsWith: '[KANJI]' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return items.map((item) => ({
      nihongo: item.nihongo,
      romaji: item.romaji,
      uchharon: item.uchharon,
      kanji: item.kanji,
      english: item.english,
      bangla: item.bangla,
      level: (['normal', 'medium', 'hard'].includes(item.level)
        ? item.level
        : 'normal') as WhitelistLevel,
    }))
  } catch (error) {
    console.error('Failed to get recap items:', error)
    return []
  }
}

export const setRecapItemLevelAction = async (
  vocab: VocabularyItem,
  targetLevel: WhitelistLevel,
  userId?: string
): Promise<{ success: boolean; activeLevel: WhitelistLevel | null }> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    const nihongo = vocab.nihongo.trim()
    const bangla = vocab.bangla.trim()

    const existing = await prisma.recapItem.findUnique({
      where: {
        user_id_nihongo_bangla: {
          user_id: targetUserId,
          nihongo,
          bangla,
        },
      },
    })

    if (existing) {
      if (existing.level === targetLevel) {
        // Toggle off / remove if clicking currently active level
        await prisma.recapItem.delete({
          where: { id: existing.id },
        })
        revalidatePath('/vocabulary')
        revalidatePath('/vocabulary-quiz')
        return { success: true, activeLevel: null }
      } else {
        // Switch difficulty level
        await prisma.recapItem.update({
          where: { id: existing.id },
          data: { level: targetLevel },
        })
        revalidatePath('/vocabulary')
        revalidatePath('/vocabulary-quiz')
        return { success: true, activeLevel: targetLevel }
      }
    } else {
      // Add to whitelist at targetLevel
      await prisma.recapItem.create({
        data: {
          user_id: targetUserId,
          nihongo,
          romaji: vocab.romaji || '',
          uchharon: vocab.uchharon || '',
          kanji: vocab.kanji || '',
          english: vocab.english || '',
          bangla,
          level: targetLevel,
        },
      })
      revalidatePath('/vocabulary')
      revalidatePath('/vocabulary-quiz')
      return { success: true, activeLevel: targetLevel }
    }
  } catch (error) {
    console.error('Failed to set recap item level:', error)
    return { success: false, activeLevel: null }
  }
}

export const toggleRecapItemAction = async (vocab: VocabularyItem, userId?: string) => {
  const targetLevel = vocab.level || 'normal'
  const res = await setRecapItemLevelAction(vocab, targetLevel, userId)
  return { success: res.success, added: res.activeLevel !== null }
}

export const addRecapItemAction = async (vocab: VocabularyItem, userId?: string) => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    const nihongo = vocab.nihongo.trim()
    const bangla = vocab.bangla.trim()
    const level = vocab.level || 'normal'

    await prisma.recapItem.upsert({
      where: {
        user_id_nihongo_bangla: {
          user_id: targetUserId,
          nihongo,
          bangla,
        },
      },
      update: {
        romaji: vocab.romaji || '',
        uchharon: vocab.uchharon || '',
        kanji: vocab.kanji || '',
        english: vocab.english || '',
        level,
      },
      create: {
        user_id: targetUserId,
        nihongo,
        romaji: vocab.romaji || '',
        uchharon: vocab.uchharon || '',
        kanji: vocab.kanji || '',
        english: vocab.english || '',
        bangla,
        level,
      },
    })
    revalidatePath('/vocabulary')
    revalidatePath('/vocabulary-quiz')
    return { success: true }
  } catch (error) {
    console.error('Failed to add recap item:', error)
    return { success: false }
  }
}

export const removeRecapItemAction = async (vocab: VocabularyItem, userId?: string) => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    await prisma.recapItem.deleteMany({
      where: {
        user_id: targetUserId,
        nihongo: vocab.nihongo.trim(),
        bangla: vocab.bangla.trim(),
      },
    })
    revalidatePath('/vocabulary')
    revalidatePath('/vocabulary-quiz')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove recap item:', error)
    return { success: false }
  }
}

export const clearRecapItemsAction = async (userId?: string, level?: WhitelistLevel) => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    await prisma.recapItem.deleteMany({
      where: {
        user_id: targetUserId,
        ...(level ? { level } : {}),
      },
    })
    revalidatePath('/vocabulary')
    revalidatePath('/vocabulary-quiz')
    return { success: true }
  } catch (error) {
    console.error('Failed to clear recap items:', error)
    return { success: false }
  }
}

export const syncRecapItemsAction = async (
  localItems: VocabularyItem[],
  userId?: string
): Promise<VocabularyItem[]> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }

    if (localItems && localItems.length > 0) {
      const validItems = localItems.filter((item) =>
        Boolean(item && item.nihongo?.trim() && item.bangla?.trim())
      )

      for (const item of validItems) {
        const itemLevel = (
          ['normal', 'medium', 'hard'].includes(item.level || '') ? item.level : 'normal'
        ) as WhitelistLevel
        await prisma.recapItem.upsert({
          where: {
            user_id_nihongo_bangla: {
              user_id: targetUserId,
              nihongo: item.nihongo.trim(),
              bangla: item.bangla.trim(),
            },
          },
          update: {
            romaji: item.romaji || '',
            uchharon: item.uchharon || '',
            kanji: item.kanji || '',
            english: item.english || '',
            level: itemLevel,
          },
          create: {
            user_id: targetUserId,
            nihongo: item.nihongo.trim(),
            romaji: item.romaji || '',
            uchharon: item.uchharon || '',
            kanji: item.kanji || '',
            english: item.english || '',
            bangla: item.bangla.trim(),
            level: itemLevel,
          },
        })
      }
    }

    const dbItems = await prisma.recapItem.findMany({
      where: { user_id: targetUserId },
      orderBy: { createdAt: 'desc' },
    })

    return dbItems.map((item) => ({
      nihongo: item.nihongo,
      romaji: item.romaji,
      uchharon: item.uchharon,
      kanji: item.kanji,
      english: item.english,
      bangla: item.bangla,
      level: (['normal', 'medium', 'hard'].includes(item.level)
        ? item.level
        : 'normal') as WhitelistLevel,
    }))
  } catch (error) {
    console.error('Failed to sync recap items:', error)
    return []
  }
}

type KuroshiroType = {
  init: (analyzer: unknown) => Promise<void>
  convert: (text: string, options?: Record<string, unknown>) => Promise<string>
}

let kuroshiroInstance: KuroshiroType | null = null

export const convertToRomaji = async (japaneseText: string) => {
  try {
    if (!kuroshiroInstance) {
      // Lazy load to avoid affecting startup performance
      // @ts-expect-error Kuroshiro module lacks TypeScript definitions
      const Kuroshiro = (await import('kuroshiro')).default
      // @ts-expect-error KuromojiAnalyzer module lacks TypeScript definitions
      const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default
      const instance: KuroshiroType = new Kuroshiro()
      const dictPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict')
      await instance.init(new KuromojiAnalyzer({ dictPath }))
      kuroshiroInstance = instance
    }
    if (!kuroshiroInstance) throw new Error('Kuroshiro failed to initialize')
    const romaji = await kuroshiroInstance.convert(japaneseText, { to: 'romaji', mode: 'spaced' })
    return romaji
  } catch (error: unknown) {
    console.error('Romaji conversion error:', error)
    return '[ERROR: ' + (error instanceof Error ? error.message : String(error)) + ']'
  }
}

import type { KanjiItem } from './kanjiData'

export type KanjiRecapItem = {
  id: string
  kanji: string
  meaning_en: string
  meaning_bn: string
  level: WhitelistLevel
  lesson: number
  kanjiLevel: 'N5' | 'N4'
}

export const getUserKanjiRecapItems = async (userId?: string): Promise<KanjiRecapItem[]> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    const items = await prisma.recapItem.findMany({
      where: {
        user_id: targetUserId,
        nihongo: { startsWith: '[KANJI]' },
      },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => {
      const kanjiId = item.nihongo.replace('[KANJI]', '')
      const [kLevel, lessonPart] = (item.uchharon || '').split('::Lesson ')
      return {
        id: kanjiId,
        kanji: item.kanji,
        meaning_en: item.english,
        meaning_bn: item.bangla,
        level: (['normal', 'medium', 'hard'].includes(item.level)
          ? item.level
          : 'normal') as WhitelistLevel,
        lesson: lessonPart ? parseInt(lessonPart, 10) : 1,
        kanjiLevel: (kLevel as 'N5' | 'N4') || 'N5',
      }
    })
  } catch (error) {
    console.error('Failed to get kanji recap items:', error)
    return []
  }
}

export const setKanjiRecapLevelAction = async (
  kanji: KanjiItem,
  targetLevel: WhitelistLevel,
  userId?: string
): Promise<{ success: boolean; activeLevel: WhitelistLevel | null }> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    const nihongoKey = `[KANJI]${kanji.id}`
    const banglaKey = kanji.meaning_bn.trim()

    const existing = await prisma.recapItem.findUnique({
      where: {
        user_id_nihongo_bangla: {
          user_id: targetUserId,
          nihongo: nihongoKey,
          bangla: banglaKey,
        },
      },
    })

    if (existing) {
      if (existing.level === targetLevel) {
        // Toggle off / remove from whitelist
        await prisma.recapItem.delete({
          where: { id: existing.id },
        })
        revalidatePath('/kanji')
        return { success: true, activeLevel: null }
      } else {
        // Switch difficulty level
        await prisma.recapItem.update({
          where: { id: existing.id },
          data: { level: targetLevel },
        })
        revalidatePath('/kanji')
        return { success: true, activeLevel: targetLevel }
      }
    } else {
      // Add to whitelist
      await prisma.recapItem.create({
        data: {
          user_id: targetUserId,
          nihongo: nihongoKey,
          kanji: kanji.kanji,
          english: kanji.meaning_en,
          bangla: banglaKey,
          romaji: [...kanji.kunyomi, ...kanji.onyomi].join(', '),
          uchharon: `${kanji.level}::Lesson ${kanji.lesson}`,
          level: targetLevel,
        },
      })
      revalidatePath('/kanji')
      return { success: true, activeLevel: targetLevel }
    }
  } catch (error) {
    console.error('Failed to set kanji recap level:', error)
    return { success: false, activeLevel: null }
  }
}

export const clearKanjiRecapsAction = async (userId?: string): Promise<{ success: boolean }> => {
  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await requireCurrentUser()
      targetUserId = user.id
    }
    await prisma.recapItem.deleteMany({
      where: {
        user_id: targetUserId,
        nihongo: { startsWith: '[KANJI]' },
      },
    })
    revalidatePath('/kanji')
    return { success: true }
  } catch (error) {
    console.error('Failed to clear kanji recaps:', error)
    return { success: false }
  }
}
