import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { VocabularyItem, WhitelistLevel } from '@/lib/vocabularyData'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.recapItem.findMany({
      where: { user_id: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    const result: VocabularyItem[] = items.map(item => ({
      nihongo: item.nihongo,
      romaji: item.romaji,
      uchharon: item.uchharon,
      kanji: item.kanji,
      english: item.english,
      bangla: item.bangla,
      level: (['normal', 'medium', 'hard'].includes(item.level) ? item.level : 'normal') as WhitelistLevel,
    }))

    return NextResponse.json({ items: result })
  } catch (error) {
    console.error('API /api/recap GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch recap items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, vocab, targetLevel, level, items } = body
    const userId = session.user.id

    if (action === 'setLevel' && vocab) {
      const nihongo = vocab.nihongo.trim()
      const bangla = vocab.bangla.trim()
      const lvl = (['normal', 'medium', 'hard'].includes(targetLevel) ? targetLevel : 'normal') as WhitelistLevel

      const existing = await prisma.recapItem.findUnique({
        where: {
          user_id_nihongo_bangla: {
            user_id: userId,
            nihongo,
            bangla
          }
        }
      })

      if (existing) {
        if (existing.level === lvl) {
          await prisma.recapItem.delete({ where: { id: existing.id } })
          return NextResponse.json({ success: true, activeLevel: null })
        } else {
          await prisma.recapItem.update({
            where: { id: existing.id },
            data: { level: lvl }
          })
          return NextResponse.json({ success: true, activeLevel: lvl })
        }
      } else {
        await prisma.recapItem.create({
          data: {
            user_id: userId,
            nihongo,
            romaji: vocab.romaji || '',
            uchharon: vocab.uchharon || '',
            kanji: vocab.kanji || '',
            english: vocab.english || '',
            bangla,
            level: lvl
          }
        })
        return NextResponse.json({ success: true, activeLevel: lvl })
      }
    }

    if (action === 'toggle' && vocab) {
      const nihongo = vocab.nihongo.trim()
      const bangla = vocab.bangla.trim()
      const lvl = (['normal', 'medium', 'hard'].includes(vocab.level) ? vocab.level : 'normal') as WhitelistLevel

      const existing = await prisma.recapItem.findUnique({
        where: {
          user_id_nihongo_bangla: {
            user_id: userId,
            nihongo,
            bangla
          }
        }
      })
      if (existing) {
        await prisma.recapItem.delete({ where: { id: existing.id } })
        return NextResponse.json({ added: false })
      } else {
        await prisma.recapItem.create({
          data: {
            user_id: userId,
            nihongo,
            romaji: vocab.romaji || '',
            uchharon: vocab.uchharon || '',
            kanji: vocab.kanji || '',
            english: vocab.english || '',
            bangla,
            level: lvl
          }
        })
        return NextResponse.json({ added: true })
      }
    }

    if (action === 'add' && vocab) {
      const lvl = (['normal', 'medium', 'hard'].includes(vocab.level) ? vocab.level : 'normal') as WhitelistLevel
      await prisma.recapItem.upsert({
        where: {
          user_id_nihongo_bangla: {
            user_id: userId,
            nihongo: vocab.nihongo.trim(),
            bangla: vocab.bangla.trim()
          }
        },
        update: {
          romaji: vocab.romaji || '',
          uchharon: vocab.uchharon || '',
          kanji: vocab.kanji || '',
          english: vocab.english || '',
          level: lvl
        },
        create: {
          user_id: userId,
          nihongo: vocab.nihongo.trim(),
          romaji: vocab.romaji || '',
          uchharon: vocab.uchharon || '',
          kanji: vocab.kanji || '',
          english: vocab.english || '',
          bangla: vocab.bangla.trim(),
          level: lvl
        }
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'remove' && vocab) {
      await prisma.recapItem.deleteMany({
        where: {
          user_id: userId,
          nihongo: vocab.nihongo.trim(),
          bangla: vocab.bangla.trim()
        }
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'clear') {
      await prisma.recapItem.deleteMany({
        where: { 
          user_id: userId,
          ...(level ? { level } : {})
        }
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'sync' && Array.isArray(items)) {
      for (const item of items) {
        if (item?.nihongo?.trim() && item?.bangla?.trim()) {
          const itemLvl = (['normal', 'medium', 'hard'].includes(item.level) ? item.level : 'normal') as WhitelistLevel
          await prisma.recapItem.upsert({
            where: {
              user_id_nihongo_bangla: {
                user_id: userId,
                nihongo: item.nihongo.trim(),
                bangla: item.bangla.trim()
              }
            },
            update: {
              romaji: item.romaji || '',
              uchharon: item.uchharon || '',
              kanji: item.kanji || '',
              english: item.english || '',
              level: itemLvl
            },
            create: {
              user_id: userId,
              nihongo: item.nihongo.trim(),
              romaji: item.romaji || '',
              uchharon: item.uchharon || '',
              kanji: item.kanji || '',
              english: item.english || '',
              bangla: item.bangla.trim(),
              level: itemLvl
            }
          })
        }
      }
      const updated = await prisma.recapItem.findMany({
        where: { user_id: userId },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({
        items: updated.map(item => ({
          nihongo: item.nihongo,
          romaji: item.romaji,
          uchharon: item.uchharon,
          kanji: item.kanji,
          english: item.english,
          bangla: item.bangla,
          level: (['normal', 'medium', 'hard'].includes(item.level) ? item.level : 'normal') as WhitelistLevel,
        }))
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API /api/recap POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
