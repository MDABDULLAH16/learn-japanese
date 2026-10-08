'use server'

import prisma from './prisma'
import { revalidatePath } from 'next/cache'

// Mock a user for MVP
export const getOrCreateMockUser = async () => {
  let user = await prisma.user.findFirst({
    where: { email: 'student@example.com' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'JLPT N5 Student',
        email: 'student@example.com',
        streak: 1,
        totalScore: 0
      }
    })
  } else {
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
