'use server'

import prisma from './prisma'
import { revalidatePath } from 'next/cache'

import { auth } from "@/auth"

export const getCurrentUser = async () => {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  let user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user) {
    throw new Error("User not found")
  }

  const now = new Date()
  const lastLogin = new Date(user.lastLoginAt)
  const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24))
  
  if (diffDays === 1) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { streak: user.streak + 1, lastLoginAt: now }
    })
  } else if (diffDays > 1) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { streak: 1, lastLoginAt: now }
    })
  }
  return user
}

export const getUserProgress = async (userId: string) => {
  return await prisma.userProgress.findMany({
    where: { user_id: userId }
  })
}

export const markItemLearned = async (userId: string, itemId: string, itemType: string) => {
  try {
    await prisma.userProgress.upsert({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: itemId
        }
      },
      update: {},
      create: {
        user_id: userId,
        item_id: itemId,
        item_type: itemType
      }
    })
    revalidatePath('/alphabet')
    revalidatePath('/')
  } catch (error) {
    console.error(error)
  }
}

export const markAllLearned = async (userId: string, itemIds: string[], itemType: string) => {
  try {
    const records = itemIds.map(id => ({
      user_id: userId,
      item_id: id,
      item_type: itemType
    }))
    
    // Efficiently add multiple by doing createMany with skipDuplicates
    await prisma.userProgress.createMany({
      data: records,
      skipDuplicates: true
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
        increment: newScore
      }
    }
  })
  revalidatePath('/')
  revalidatePath('/quiz')
}

let kuroshiroInstance: any = null

export const convertToRomaji = async (japaneseText: string) => {
  try {
    if (!kuroshiroInstance) {
      // Lazy load to avoid affecting startup performance
      // @ts-ignore
      const Kuroshiro = (await import("kuroshiro")).default
      // @ts-ignore
      const KuromojiAnalyzer = (await import("kuroshiro-analyzer-kuromoji")).default
      kuroshiroInstance = new Kuroshiro()
      await kuroshiroInstance.init(new KuromojiAnalyzer())
    }
    const romaji = await kuroshiroInstance.convert(japaneseText, { to: "romaji", mode: "spaced" })
    return romaji
  } catch (error) {
    console.error("Romaji conversion error:", error)
    return null
  }
}
