'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { KANJI_DATA, KanjiItem, LESSON_TITLES } from '@/lib/kanjiData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Volume2,
  Lightbulb,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  Sparkles,
  Undo2,
  RotateCcw,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
  PenTool,
  AlertCircle,
  Play,
  Pause,
  Lock,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRecapKanji } from '@/lib/kanjiRecapStorage'
import {
  saveKanjiCustomMnemonicAction,
  getKanjiCustomMnemonicAction,
  deleteKanjiCustomMnemonicAction,
} from '@/lib/actions'
import kanjiStrokesData from '@/lib/kanji_strokes.json'

export interface KanjiStrokeInfo {
  index: number
  path: string
  numX: number
  numY: number
}

const kanjiStrokesMap = kanjiStrokesData as Record<string, KanjiStrokeInfo[]>

function toBengaliDigits(n: number | string | undefined): string {
  if (n === undefined || n === null || n === '') return ''
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  const s = String(n).padStart(2, '0')
  return s
    .split('')
    .map((d) => bnDigits[parseInt(d, 10)] ?? d)
    .join('')
}

export interface KanjiValidationResult {
  status: 'idle' | 'in_progress' | 'success' | 'warning' | 'needs_practice'
  score: number
  coverage: number
  precision: number
  missingStrokes?: number[]
  message: string
}

function evaluateCanvasKanjiAccuracy(
  userCanvas: HTMLCanvasElement,
  kanjiChar: string,
  strokeList: KanjiStrokeInfo[]
): {
  score: number
  coverage: number
  precision: number
  missingStrokes: number[]
} {
  const size = 260
  const gridDim = 65
  const step = size / gridDim

  const userCtx = userCanvas.getContext('2d', { willReadFrequently: true })
  if (!userCtx) return { score: 0, coverage: 0, precision: 0, missingStrokes: [] }
  const userImg = userCtx.getImageData(0, 0, size, size)

  // 1. Render all SVG stroke paths onto off-screen canvas with exact 1:1 scale
  const offCanvas = document.createElement('canvas')
  offCanvas.width = size
  offCanvas.height = size
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })
  if (!offCtx) return { score: 0, coverage: 0, precision: 0, missingStrokes: [] }

  offCtx.clearRect(0, 0, size, size)
  offCtx.save()
  offCtx.scale(size / 109, size / 109)
  offCtx.strokeStyle = '#000000'
  offCtx.lineWidth = 10
  offCtx.lineCap = 'round'
  offCtx.lineJoin = 'round'

  if (strokeList && strokeList.length > 0) {
    for (const s of strokeList) {
      try {
        offCtx.stroke(new Path2D(s.path))
      } catch {}
    }
  } else {
    offCtx.restore()
    offCtx.save()
    offCtx.font = '900 145px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif'
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'
    offCtx.fillStyle = '#000000'
    offCtx.fillText(kanjiChar, size / 2, size / 2 + 5)
  }
  offCtx.restore()

  const targetImg = offCtx.getImageData(0, 0, size, size)

  const targetGrid = new Uint8Array(gridDim * gridDim)
  const userGrid = new Uint8Array(gridDim * gridDim)

  let targetPointCount = 0
  let userPointCount = 0

  for (let gy = 0; gy < gridDim; gy++) {
    const py = Math.floor(gy * step + step / 2)
    for (let gx = 0; gx < gridDim; gx++) {
      const px = Math.floor(gx * step + step / 2)
      const idx = (py * size + px) * 4

      if (targetImg.data[idx + 3] > 40) {
        targetGrid[gy * gridDim + gx] = 1
        targetPointCount++
      }

      if (userImg.data[idx + 3] > 40) {
        userGrid[gy * gridDim + gx] = 1
        userPointCount++
      }
    }
  }

  if (targetPointCount === 0 || userPointCount === 0) {
    return { score: 0, coverage: 0, precision: 0, missingStrokes: [] }
  }

  // Radius of 3 grid units (~12px tolerance) for natural handwriting
  const maxRadius = 3
  const hasNeighbor = (grid: Uint8Array, cx: number, cy: number, r: number) => {
    const minX = Math.max(0, cx - r)
    const maxX = Math.min(gridDim - 1, cx + r)
    const minY = Math.max(0, cy - r)
    const maxY = Math.min(gridDim - 1, cy + r)
    const rSq = r * r

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy)
        if (dSq <= rSq && grid[y * gridDim + x] === 1) {
          return true
        }
      }
    }
    return false
  }

  // Calculate total coverage
  let coveredTargetCount = 0
  for (let gy = 0; gy < gridDim; gy++) {
    for (let gx = 0; gx < gridDim; gx++) {
      if (targetGrid[gy * gridDim + gx] === 1) {
        if (hasNeighbor(userGrid, gx, gy, maxRadius)) {
          coveredTargetCount++
        }
      }
    }
  }
  const coverage = coveredTargetCount / targetPointCount

  // Calculate user precision: percentage of user drawing that is strictly ON the stroke paths
  let validUserCount = 0
  for (let gy = 0; gy < gridDim; gy++) {
    for (let gx = 0; gx < gridDim; gx++) {
      if (userGrid[gy * gridDim + gx] === 1) {
        if (hasNeighbor(targetGrid, gx, gy, 2)) {
          validUserCount++
        }
      }
    }
  }
  const precision = validUserCount / userPointCount

  // Check each individual stroke to detect specifically which stroke was skipped
  const missingStrokes: number[] = []
  if (strokeList && strokeList.length > 0) {
    const sCanvas = document.createElement('canvas')
    sCanvas.width = size
    sCanvas.height = size
    const sCtx = sCanvas.getContext('2d', { willReadFrequently: true })

    if (sCtx) {
      for (const stroke of strokeList) {
        sCtx.clearRect(0, 0, size, size)
        sCtx.save()
        sCtx.scale(size / 109, size / 109)
        sCtx.strokeStyle = '#000000'
        sCtx.lineWidth = 10
        sCtx.lineCap = 'round'
        sCtx.lineJoin = 'round'
        try {
          sCtx.stroke(new Path2D(stroke.path))
        } catch {}
        sCtx.restore()

        const sImg = sCtx.getImageData(0, 0, size, size)
        let sTotal = 0
        let sCovered = 0

        for (let gy = 0; gy < gridDim; gy++) {
          const py = Math.floor(gy * step + step / 2)
          for (let gx = 0; gx < gridDim; gx++) {
            const px = Math.floor(gx * step + step / 2)
            const idx = (py * size + px) * 4
            if (sImg.data[idx + 3] > 40) {
              sTotal++
              if (hasNeighbor(userGrid, gx, gy, maxRadius)) {
                sCovered++
              }
            }
          }
        }

        const sRatio = sTotal > 0 ? sCovered / sTotal : 1
        if (sRatio < 0.45) {
          missingStrokes.push(stroke.index)
        }
      }
    }
  }

  // Harmonic F1 score
  const f1 =
    coverage > 0 && precision > 0
      ? (2 * coverage * precision) / (coverage + precision)
      : 0

  const score = Math.min(100, Math.max(0, Math.round(f1 * 100)))

  return {
    score,
    coverage: Math.round(coverage * 100),
    precision: Math.round(precision * 100),
    missingStrokes,
  }
}

export function KanjiDetailClient({
  initialKanji,
  initialLevel,
  initialLesson,
  userId,
}: {
  initialKanji: KanjiItem
  initialLevel: 'N5' | 'N4'
  initialLesson: number
  userId: string
}) {
  const router = useRouter()
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem>(initialKanji)
  const [showGuide, setShowGuide] = useState(false)
  const [showSentences, setShowSentences] = useState(false)

  // --- KANJI STROKE DRAWING TOUCH PAD ---
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokeCountRef = useRef(0)
  const isDrawingRef = useRef(false)
  const lastImageDataBeforeStrokeRef = useRef<ImageData | null>(null)
  const [currentStrokeCount, setCurrentStrokeCount] = useState(0)
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([])
  const [guideMode, setGuideMode] = useState<'numbered' | 'ghost' | 'off'>('numbered')
  const [isDemoPlaying, setIsDemoPlaying] = useState(false)
  const [activeDemoStroke, setActiveDemoStroke] = useState<number>(-1)
  const [isPracticeActive, setIsPracticeActive] = useState<boolean>(false)
  const [isTouchpadCollapsed, setIsTouchpadCollapsed] = useState<boolean>(false)
  const [validationResult, setValidationResult] = useState<KanjiValidationResult>({
    status: 'idle',
    score: 0,
    coverage: 0,
    precision: 0,
    message: '',
  })

  // Strict drawing lock: locked when target strokes are reached, or on success
  const isDrawingLocked = Boolean(
    (selectedKanji.stroke_count && currentStrokeCount >= selectedKanji.stroke_count) ||
    validationResult.status === 'success'
  )

  // Precompiled vector strokes for active kanji
  const currentKanjiStrokes = useMemo(() => {
    return kanjiStrokesMap[selectedKanji.kanji] || []
  }, [selectedKanji.kanji])

  // Animated stroke demo player (Human-like slow calligraphy pace)
  const playStrokeDemo = useCallback(() => {
    if (isDemoPlaying) {
      setIsDemoPlaying(false)
      setActiveDemoStroke(-1)
      return
    }

    if (currentKanjiStrokes.length === 0) return

    setIsDemoPlaying(true)
    setActiveDemoStroke(0)

    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < currentKanjiStrokes.length) {
        setActiveDemoStroke(step)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsDemoPlaying(false)
          setActiveDemoStroke(-1)
        }, 1200)
      }
    }, 1500)
  }, [isDemoPlaying, currentKanjiStrokes])

  const validateDrawing = useCallback(
    (explicitStrokes?: number, explicitTarget?: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const currentStrokes =
        explicitStrokes !== undefined ? explicitStrokes : strokeCountRef.current
      const targetStrokes =
        explicitTarget !== undefined
          ? explicitTarget
          : selectedKanji.stroke_count || 0

      if (currentStrokes === 0) {
        setValidationResult({
          status: 'idle',
          score: 0,
          coverage: 0,
          precision: 0,
          message: 'টাচপ্যাডে স্ট্রোক টেনে কানজিটি লিখুন।',
        })
        return
      }

      // Exact target strokes & shape accuracy evaluation with SVG vector paths
      const { score, coverage, precision, missingStrokes } = evaluateCanvasKanjiAccuracy(
        canvas,
        selectedKanji.kanji,
        currentKanjiStrokes
      )

      // 1. SPECIFIC MISSING STROKE CHECK:
      // If user completely skipped any stroke (e.g. stroke 4 in 分)
      if (missingStrokes.length > 0) {
        const missingListBn = missingStrokes.map((n) => toBengaliDigits(n)).join(', ')
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          missingStrokes,
          message: `কানজিটি অসম্পূর্ণ! ${missingListBn}নং স্ট্রোকটি আঁকা হয়নি (লাল বৃত্ত ${missingListBn} দেখুন)। সম্পূর্ণ কানজিটি লিখুন।`,
        })
        return
      }

      // 2. EXACT STROKE COUNT CHECK:
      // Cannot be less, cannot be more! ("kom diyew hobe na besio hobe na")
      if (targetStrokes > 0 && currentStrokes < targetStrokes) {
        const remaining = targetStrokes - currentStrokes
        setValidationResult({
          status: 'in_progress',
          score,
          coverage,
          precision,
          message: `অসম্পূর্ণ কানজি! ${toBengaliDigits(targetStrokes)}টির মধ্যে ${toBengaliDigits(currentStrokes)}টি স্ট্রোক লেখা হয়েছে। বাকি ${toBengaliDigits(remaining)}টি স্ট্রোক সম্পূর্ণ করুন।`,
        })
        return
      }

      if (targetStrokes > 0 && currentStrokes > targetStrokes) {
        setValidationResult({
          status: 'warning',
          score,
          coverage,
          precision,
          message: `অতিরিক্ত স্ট্রোক! লক্ষ্য ছিল ${toBengaliDigits(targetStrokes)}টি স্ট্রোক, কিন্তু আপনি ${toBengaliDigits(currentStrokes)}টি দিয়েছেন। অতিরিক্ত দাগগুলো আনডু করুন।`,
        })
        return
      }

      // 3. OVERALL COVERAGE CHECK:
      if (coverage < 60) {
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          message: `কানজির অবস্থান বা আকার সঠিক হয়নি (কভারেজ ${toBengaliDigits(coverage)}%)। গাইডের দাগের ওপর ঠিকভাবে টানুন।`,
        })
        return
      }

      // 4. STRICT PRECISION CHECK:
      // Lines outside the guide stroke paths fail immediately!
      if (precision < 70) {
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          message: `স্ট্রোকগুলো গাইডের দাগের বাইরে চলে গেছে (নির্ভুলতা ${toBengaliDigits(precision)}%)। গাইডের বাইরে কোনো দাগ টানা যাবে না, আনডু করে আবার লিখুন।`,
        })
        return
      }

      // ALL TESTS PASSED!
      setValidationResult({
        status: 'success',
        score,
        coverage,
        precision,
        message: `অসাধারণ! সঠিক ${toBengaliDigits(targetStrokes)}টি স্ট্রোকে নিখুঁতভাবে কানজিটি লেখা হয়েছে (${toBengaliDigits(score)}%)। 🎉 (পুনরায় লিখতে 'মুছুন' বা 'আনডু' করুন)`,
      })
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
        })
      } catch {}
    },
    [selectedKanji.kanji, selectedKanji.stroke_count, currentKanjiStrokes]
  )

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setStrokeHistory([])
    strokeCountRef.current = 0
    isDrawingRef.current = false
    lastImageDataBeforeStrokeRef.current = null
    setCurrentStrokeCount(0)
    setIsDemoPlaying(false)
    setActiveDemoStroke(-1)
    setValidationResult({
      status: 'idle',
      score: 0,
      coverage: 0,
      precision: 0,
      message: '',
    })
  }, [])

  // Clear canvas whenever active kanji changes & reset practice active state
  useEffect(() => {
    clearCanvas()
    setIsPracticeActive(false)
  }, [selectedKanji.id, clearCanvas])

  // Non-passive native touch event listeners on canvas to block mobile gestures/scrolling ONLY when practice is active
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleCanvasTouch = (e: TouchEvent) => {
      if (!isPracticeActive) return
      if (e.cancelable) {
        e.preventDefault()
      }
    }

    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false })
    canvas.addEventListener('touchmove', handleCanvasTouch, { passive: false })
    canvas.addEventListener('touchend', handleCanvasTouch, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleCanvasTouch)
      canvas.removeEventListener('touchmove', handleCanvasTouch)
      canvas.removeEventListener('touchend', handleCanvasTouch)
    }
  }, [isPracticeActive])

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPracticeActive) return
    if (isDrawingLocked) return
    if (isDemoPlaying) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (e.cancelable) {
      e.preventDefault()
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Save pre-stroke snapshot in ref (zero React state updates / zero re-render on click)
    lastImageDataBeforeStrokeRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    isDrawingRef.current = true

    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#dc2626' // Red brush matching book's stroke order
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    if (e.cancelable) {
      e.preventDefault()
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    // Push pre-stroke snapshot to undo history once stroke is finished
    if (lastImageDataBeforeStrokeRef.current) {
      const snap = lastImageDataBeforeStrokeRef.current
      setStrokeHistory((prev) => [...prev, snap])
      lastImageDataBeforeStrokeRef.current = null
    }

    strokeCountRef.current += 1
    const newCount = strokeCountRef.current
    setCurrentStrokeCount(newCount)

    const targetStrokes = selectedKanji.stroke_count || 0

    if (targetStrokes > 0) {
      if (newCount === targetStrokes) {
        // Target stroke count reached! Automatically validate and lock
        validateDrawing(newCount, targetStrokes)
      } else if (newCount > targetStrokes) {
        setValidationResult({
          status: 'warning',
          score: 0,
          coverage: 0,
          precision: 0,
          message: `অতিরিক্ত স্ট্রোক হয়েছে (${toBengaliDigits(newCount)} / ${toBengaliDigits(targetStrokes)})। অতিরিক্ত দাগগুলো আনডু করুন।`,
        })
      } else {
        setValidationResult({
          status: 'in_progress',
          score: 0,
          coverage: 0,
          precision: 0,
          message: '',
        })
      }
    }
  }

  const undoLastStroke = () => {
    const canvas = canvasRef.current
    if (!canvas || strokeHistory.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const previousState = strokeHistory[strokeHistory.length - 1]
    ctx.putImageData(previousState, 0, 0)
    setStrokeHistory((prev) => prev.slice(0, prev.length - 1))
    const newStrokes = Math.max(0, strokeCountRef.current - 1)
    strokeCountRef.current = newStrokes
    setCurrentStrokeCount(newStrokes)

    const targetStrokes = selectedKanji.stroke_count || 0
    if (newStrokes === 0) {
      setValidationResult({
        status: 'idle',
        score: 0,
        coverage: 0,
        precision: 0,
        message: '',
      })
    } else if (newStrokes === targetStrokes || newStrokes === targetStrokes + 1) {
      validateDrawing(newStrokes, targetStrokes)
    } else if (newStrokes > targetStrokes + 1) {
      setValidationResult({
        status: 'warning',
        score: 0,
        coverage: 0,
        precision: 0,
        message: `অতিরিক্ত স্ট্রোক দেওয়া হয়েছে (${toBengaliDigits(newStrokes)} / ${toBengaliDigits(targetStrokes)})।`,
      })
    } else {
      setValidationResult({
        status: 'in_progress',
        score: 0,
        coverage: 0,
        precision: 0,
        message: '',
      })
    }
  }

  // --- CUSTOM MNEMONIC SENTENCE (ACCOUNT SCOPED) ---
  const [customMnemonic, setCustomMnemonic] = useState<string>('')
  const [isEditingMnemonic, setIsEditingMnemonic] = useState(false)
  const [editMnemonicText, setEditMnemonicText] = useState('')
  const [isSavingMnemonic, setIsSavingMnemonic] = useState(false)

  // Load custom mnemonic on kanji change or mount
  useEffect(() => {
    setIsEditingMnemonic(false)
    const storageKey = `learn_japanese_custom_mnemonic_${userId || 'guest'}_${selectedKanji.id}`
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
    if (localSaved) {
      setCustomMnemonic(localSaved)
      setEditMnemonicText(localSaved)
    } else {
      setCustomMnemonic('')
      setEditMnemonicText('')
    }

    if (userId) {
      getKanjiCustomMnemonicAction(selectedKanji.id, userId)
        .then((dbSaved) => {
          if (dbSaved) {
            setCustomMnemonic(dbSaved)
            setEditMnemonicText(dbSaved)
            if (typeof window !== 'undefined') {
              localStorage.setItem(storageKey, dbSaved)
            }
          }
        })
        .catch(() => {})
    }
  }, [selectedKanji.id, userId])

  const handleSaveMnemonic = async () => {
    const trimmed = editMnemonicText.trim()
    if (!trimmed) return
    setIsSavingMnemonic(true)
    const storageKey = `learn_japanese_custom_mnemonic_${userId || 'guest'}_${selectedKanji.id}`
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, trimmed)
    }
    setCustomMnemonic(trimmed)
    setIsEditingMnemonic(false)

    if (userId) {
      try {
        await saveKanjiCustomMnemonicAction(selectedKanji.id, trimmed, userId)
      } catch (err) {
        console.error('Failed to save custom mnemonic to DB:', err)
      }
    }
    setIsSavingMnemonic(false)
  }

  const handleResetMnemonic = async () => {
    setIsSavingMnemonic(true)
    const storageKey = `learn_japanese_custom_mnemonic_${userId || 'guest'}_${selectedKanji.id}`
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
    setCustomMnemonic('')
    setEditMnemonicText('')
    setIsEditingMnemonic(false)

    if (userId) {
      try {
        await deleteKanjiCustomMnemonicAction(selectedKanji.id, userId)
      } catch (err) {
        console.error('Failed to reset custom mnemonic on DB:', err)
      }
    }
    setIsSavingMnemonic(false)
  }

  const { getItemLevel, setLevel } = useRecapKanji(undefined, userId)
  const currentLevel = getItemLevel(selectedKanji.id)

  const filteredKanji = useMemo(
    () => KANJI_DATA.filter((k) => k.level === initialLevel && k.lesson === initialLesson),
    [initialLevel, initialLesson]
  )

  const currentIndex = useMemo(
    () => filteredKanji.findIndex((k) => k.id === selectedKanji.id),
    [filteredKanji, selectedKanji.id]
  )

  const navigateToKanji = useCallback(
    (target: KanjiItem) => {
      setSelectedKanji(target)
      window.history.replaceState(
        null,
        '',
        `/kanji/${target.id}?level=${initialLevel}&lesson=${initialLesson}`
      )
    },
    [initialLevel, initialLesson]
  )

  const handlePrevKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex > 0) {
      navigateToKanji(filteredKanji[currentIndex - 1])
    } else {
      navigateToKanji(filteredKanji[filteredKanji.length - 1])
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, filteredKanji, navigateToKanji])

  const handleNextKanji = useCallback(() => {
    if (filteredKanji.length === 0) return
    if (currentIndex >= 0 && currentIndex < filteredKanji.length - 1) {
      navigateToKanji(filteredKanji[currentIndex + 1])
    } else {
      navigateToKanji(filteredKanji[0])
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, filteredKanji, navigateToKanji])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(`/kanji?level=${initialLevel}&lesson=${initialLesson}`)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevKanji()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextKanji()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevKanji, handleNextKanji, router, initialLevel, initialLesson])

  const speakJapanese = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!text) return
    const cleanText = text
      .replace(/\([^)]*\)/g, '')
      .replace(/‹[^›]*›/g, '')
      .replace(/[-~、。,]/g, '')
      .trim()
    if (!cleanText) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.85
      utterance.pitch = 1.0
      const voices = window.speechSynthesis.getVoices()
      const jpVoice =
        voices.find((v) => v.lang === 'ja-JP' && v.name.includes('Google')) ||
        voices.find((v) => v.lang === 'ja-JP' && !v.name.toLowerCase().includes('espeak')) ||
        voices.find((v) => v.lang === 'ja-JP') ||
        voices.find((v) => v.lang.startsWith('ja'))
      if (jpVoice) utterance.voice = jpVoice
      window.speechSynthesis.speak(utterance)
    }
  }

  const bnKanjiNo = toBengaliDigits(selectedKanji.id)
  const bnStroke = selectedKanji.stroke_count ? toBengaliDigits(selectedKanji.stroke_count) : ''

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-8 pb-28 sm:pb-12 space-y-5">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href={`/kanji?level=${initialLevel}&lesson=${initialLesson}`}
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Kanji List
        </Link>

        {/* Level, Lesson & Index Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant="outline"
            className="font-bold border-primary/30 text-primary px-3 py-1 text-xs"
          >
            {selectedKanji.level} • Lesson {selectedKanji.lesson}:{' '}
            {selectedKanji.lesson_title_bn || LESSON_TITLES[selectedKanji.lesson]?.bn}
          </Badge>
          {selectedKanji.book_no && (
            <Badge
              variant="secondary"
              className="font-bold text-muted-foreground px-2.5 py-1 text-xs"
              title="মূল মেগুরো বইয়ের কানজি ক্রম"
            >
              বইয়ের ক্রম: #{toBengaliDigits(selectedKanji.book_no)}
            </Badge>
          )}
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Kanji {currentIndex >= 0 ? currentIndex + 1 : 1} of {filteredKanji.length}
          </span>

          {/* Guide toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="h-8 px-2.5 text-xs rounded-full gap-1 text-muted-foreground hover:text-primary"
            title="পড়ার নিয়ম ও নির্দেশিকা"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">নির্দেশিকা</span>
          </Button>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1.5 ml-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevKanji}
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs rounded-full gap-1 hover:bg-secondary cursor-pointer"
              title="Previous Kanji (← Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextKanji}
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs rounded-full gap-1 hover:bg-secondary cursor-pointer"
              title="Next Kanji (→ Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Guide Card (Collapsible) */}
      {showGuide && (
        <Card className="p-4 sm:p-5 bg-secondary/30 border border-border/80 rounded-2xl shadow-xs text-xs sm:text-sm space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-foreground pb-1 border-b border-border/60">
            <span className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-4 h-4" /> বেসিক কানজি ১২০ · বাংলা ব্যাখ্যা ও উচ্চারণ সহায়িকা
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuide(false)}
              className="h-6 px-2 text-xs"
            >
              বন্ধ করুন
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground leading-relaxed pt-1">
            <p>
              <strong className="text-foreground">Kun (J) · কুন-ইয়োমি:</strong> জাপানি মূল উচ্চারণ। সাধারণত একা কানজি বা হিরাগানার সাথে বসে।
            </p>
            <p>
              <strong className="text-foreground">On (C) · অন-ইয়োমি:</strong> চীনা-মূল উচ্চারণ। সাধারণত একাধিক কানজি মিলে যুক্ত শব্দ গঠন করে।
            </p>
            <p>
              <strong className="text-foreground">বিশেষ · অনিয়মিত পড়া:</strong> ব্যাকরণের নিয়ম মানে না — পুরো শব্দটি আলাদা করে মুখস্থ করতে হয়।
            </p>
            <p>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">লাল বাংলা উচ্চারণ:</strong> জাপানি শব্দ বাংলা অক্ষরে — আসল উচ্চারণ শুনে মিলিয়ে নাও।
            </p>
          </div>
        </Card>
      )}

      {/* THE MAIN BOOK CARD TABLE (Exact PDF Layout) */}
      <div className="border-2 border-border/90 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden bg-card divide-y-2 divide-border/80">
        {/* ROW 1: TOP HEADER & HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border/80">
          {/* Box 1: Kanji Number & Stroke Count */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-amber-500/10 dark:bg-amber-950/25 p-4 sm:p-5 flex flex-col items-center justify-center text-center select-none">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {bnKanjiNo}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">
              কানজি
            </span>
            {selectedKanji.book_no && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                বই: #{toBengaliDigits(selectedKanji.book_no)}
              </span>
            )}
            {bnStroke && (
              <span className="text-xs sm:text-sm font-bold text-primary mt-1 bg-background/80 dark:bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-border/60">
                {bnStroke} স্ট্রোক
              </span>
            )}
          </div>

          {/* Box 2: Giant Kanji, Meaning & Audio */}
          <div className="col-span-1 md:col-span-9 lg:col-span-4 p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-2.5 bg-card">
            <div
              onClick={(e) => speakJapanese(selectedKanji.kanji, e)}
              className="relative group cursor-pointer inline-flex items-center justify-center p-2 rounded-2xl hover:bg-secondary/30 transition-all active:scale-95"
              title="Click to Pronounce Kanji"
            >
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-foreground tracking-normal select-none drop-shadow-sm font-japanese">
                {selectedKanji.kanji}
              </h1>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Volume2 className="w-4 h-4" />
              </div>
            </div>

            {/* Meanings */}
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                ({selectedKanji.meaning_bn})
              </p>
              <p className="text-sm sm:text-base font-semibold text-muted-foreground italic">
                {selectedKanji.meaning_en}
              </p>
            </div>

            {/* Pronounce Button & Whitelist Pills */}
            <div className="pt-2 flex flex-col items-center gap-2.5 w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full gap-1.5 text-xs font-bold border-primary/25 bg-primary/5 hover:bg-primary/10 shadow-2xs text-primary"
                onClick={(e) => speakJapanese(selectedKanji.kanji, e)}
                title="Pronounce Kanji"
              >
                <Volume2 className="w-3.5 h-3.5" />
                উচ্চারণ শুনুন
              </Button>

              {/* Whitelist Level Pill Buttons */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/40 border border-border/70 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLevel(selectedKanji, 'normal')}
                  title={
                    currentLevel === 'normal'
                      ? 'Normal (Click to remove from Whitelist)'
                      : 'Add to Normal: একবার রিভিশন করলেই হবে'
                  }
                  className={`h-6 sm:h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    currentLevel === 'normal'
                      ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/60 scale-105'
                      : 'text-muted-foreground/70 hover:text-emerald-600 hover:bg-emerald-500/15'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Normal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLevel(selectedKanji, 'medium')}
                  title={
                    currentLevel === 'medium'
                      ? 'Medium (Click to remove from Whitelist)'
                      : 'Add to Medium: মাঝারি প্র্যাকটিস প্রয়োজন'
                  }
                  className={`h-6 sm:h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    currentLevel === 'medium'
                      ? 'bg-amber-500 text-white shadow-xs ring-1 ring-amber-400/60 scale-105'
                      : 'text-muted-foreground/70 hover:text-amber-600 hover:bg-amber-500/15'
                  }`}
                >
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Medium</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLevel(selectedKanji, 'hard')}
                  title={
                    currentLevel === 'hard'
                      ? 'Hard (Click to remove from Whitelist)'
                      : 'Add to Hard: কঠিন, বারবার প্র্যাকটিস লাগবে'
                  }
                  className={`h-6 sm:h-7 px-2.5 rounded-full flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    currentLevel === 'hard'
                      ? 'bg-rose-500 text-white shadow-xs ring-1 ring-rose-400/60 scale-105'
                      : 'text-muted-foreground/70 hover:text-rose-600 hover:bg-rose-500/15'
                  }`}
                >
                  <Flame
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentLevel === 'hard' ? 'fill-white' : ''}`}
                  />
                  <span>Hard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Box 3: Origin & Visual Mnemonic ("ছবি থেকে কানজি") with Custom Text Edit */}
          <div
            className={`col-span-1 p-4 sm:p-5 bg-secondary/15 flex flex-col justify-between space-y-3 transition-all duration-300 ${
              isTouchpadCollapsed
                ? 'md:col-span-12 lg:col-span-5'
                : 'md:col-span-6 lg:col-span-3'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1.5 pb-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>ছবি থেকে কানজি (Visual Origin / Mnemonic)</span>
                </div>
                {customMnemonic && !isEditingMnemonic && (
                  <Badge variant="secondary" className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                    আপনার কাস্টম
                  </Badge>
                )}
              </div>

              {isEditingMnemonic ? (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <textarea
                    value={editMnemonicText}
                    onChange={(e) => setEditMnemonicText(e.target.value)}
                    placeholder="কানজিটি সহজে মনে রাখার আপনার নিজস্ব বাক্য লিখুন..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-amber-500/50 bg-background focus:outline-hidden focus:ring-2 focus:ring-primary min-h-[105px] resize-none leading-relaxed"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditMnemonicText(customMnemonic || selectedKanji.origin || selectedKanji.mnemonic || '')
                        setIsEditingMnemonic(false)
                      }}
                      className="h-7 px-2.5 text-xs text-muted-foreground"
                    >
                      বাতিল
                    </Button>
                    <div className="flex items-center gap-1.5">
                      {customMnemonic && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleResetMnemonic}
                          disabled={isSavingMnemonic}
                          className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          title="মূল বইয়ের ডিফল্ট বাক্য ফিরিয়ে আনুন"
                        >
                          ডিফল্ট
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleSaveMnemonic}
                        disabled={isSavingMnemonic || !editMnemonicText.trim()}
                        className="h-7 px-3 text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingMnemonic ? 'সেভ হচ্ছে...' : 'সংরক্ষণ'}</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic leading-tight">
                    * এটি শুধুমাত্র আপনার অ্যাকাউন্টে সংরক্ষিত থাকবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="relative group">
                    <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed bg-background/85 dark:bg-zinc-900/80 p-3.5 rounded-xl border border-border/70 shadow-2xs">
                      {customMnemonic || selectedKanji.origin || selectedKanji.mnemonic || 'কোনো ব্যাখ্যা পাওয়া যায়নি।'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMnemonicText(customMnemonic || selectedKanji.origin || selectedKanji.mnemonic || '')
                        setIsEditingMnemonic(true)
                      }}
                      className="h-7 px-2.5 text-xs font-bold rounded-lg gap-1 border-primary/25 bg-background hover:bg-secondary text-primary cursor-pointer"
                      title="কানজি মনে রাখার নিজস্ব বাক্য এডিট করুন"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>{customMnemonic ? 'বাক্য পরিবর্তন করুন' : 'কাস্টম বাক্য লিখুন'}</span>
                    </Button>

                    {customMnemonic && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetMnemonic}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-600 cursor-pointer"
                        title="মূল বইয়ের ডিফল্ট বাক্য ফিরিয়ে আনুন"
                      >
                        ডিফল্ট দেখুন
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>ব্যক্তিগত মেমোনিক নোট</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">অ্যাকাউন্টে সেভড</span>
            </div>
          </div>

          {/* Box 4: Touch Pad for Stroke Order & Writing Practice (Placed on the Right Side, Collapsible & Icon-first) */}
          <div
            className={`col-span-1 bg-card transition-all duration-300 flex flex-col justify-between ${
              isTouchpadCollapsed
                ? 'md:col-span-12 lg:col-span-1 p-2 sm:p-2.5 items-center'
                : 'md:col-span-6 lg:col-span-3 p-3.5 sm:p-4 items-center space-y-2'
            }`}
          >
            {isTouchpadCollapsed ? (
              <>
                {/* Collapsed View for Desktop (lg:col-span-1 on the Right Edge) */}
                <div
                  onClick={() => setIsTouchpadCollapsed(false)}
                  className="hidden lg:flex w-full h-full min-h-[260px] flex-col items-center justify-center p-2 text-center cursor-pointer group bg-muted/20 hover:bg-primary/5 transition-all rounded-xl select-none"
                  title="টাচপ্যাড খুলুন"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-2xs">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground mt-2 tracking-tight">
                    টাচপ্যাড
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {selectedKanji.stroke_count ? `${toBengaliDigits(selectedKanji.stroke_count)} স্ট্রোক` : ''}
                  </span>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full group-hover:bg-primary group-hover:text-white transition shadow-2xs">
                    <span>খুলুন</span>
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Collapsed View for Mobile & Tablet (< lg) */}
                <div
                  onClick={() => setIsTouchpadCollapsed(false)}
                  className="flex lg:hidden w-full items-center justify-between p-3.5 cursor-pointer rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition group"
                  title="টাচপ্যাড খুলুন"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                      <PenTool className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-foreground block">
                        ড্রয়িং টাচপ্যাড (ঐচ্ছিক)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {selectedKanji.stroke_count ? `${toBengaliDigits(selectedKanji.stroke_count)} স্ট্রোক হ্যান্ডরাইটিং` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition">
                    <span>খুলুন</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Header: Title, Stroke Count & Controls */}
                <div className="w-full flex items-center justify-between pb-0.5">
                  <span className="text-xs font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-primary" />
                    <span>টাচপ্যাড</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      ({selectedKanji.stroke_count ? `${toBengaliDigits(selectedKanji.stroke_count)} স্ট্রোক` : ''})
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    {isPracticeActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPracticeActive(false)
                          clearCanvas()
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                        title="লক করুন"
                      >
                        <Lock className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsTouchpadCollapsed(true)}
                      className="px-1.5 py-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
                      title="লুকান"
                    >
                      <span className="text-[10px] text-muted-foreground hover:text-foreground">লুকান</span>
                      <ChevronRight className="hidden lg:block w-3.5 h-3.5 text-muted-foreground" />
                      <ChevronUp className="lg:hidden w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Kanji Canvas Square with Grid, Stroke Numbers & Vector Guide */}
                <div
                  className={`relative w-[185px] h-[185px] sm:w-[195px] sm:h-[195px] shrink-0 rounded-xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-inner select-none touch-none ${
                    validationResult.status === 'success'
                      ? 'border-emerald-500 ring-4 ring-emerald-500/25 shadow-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : validationResult.status === 'warning'
                      ? 'border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : validationResult.status === 'needs_practice'
                      ? 'border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
                      : 'border-amber-600/40 dark:border-amber-500/30 bg-amber-50/25 dark:bg-zinc-950'
                  }`}
                >
                  {/* Floating lock / celebration status tag */}
                  {validationResult.status === 'success' ? (
                    <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 animate-in zoom-in-50">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>পাস</span>
                    </div>
                  ) : isDrawingLocked ? (
                    <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-amber-600/90 text-white text-[10px] font-bold shadow-md flex items-center gap-1 animate-in zoom-in-50">
                      <Lock className="w-3 h-3" />
                      <span>লকড</span>
                    </div>
                  ) : null}

                  {/* Dotted Center Cross Grid Lines */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-amber-500/35 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r-2 border-dashed border-amber-500/35 pointer-events-none" />

                  {/* Numbered Vector Stroke Order Guide */}
                  {guideMode === 'numbered' && currentKanjiStrokes.length > 0 && (
                    <svg
                      viewBox="0 0 109 109"
                      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
                    >
                      {/* Stroke Paths */}
                      <g>
                        {currentKanjiStrokes.map((s, idx) => {
                          const isDemoActive = isDemoPlaying && activeDemoStroke === idx
                          const isDrawn = isDemoPlaying ? idx <= activeDemoStroke : currentStrokeCount > idx
                          const isNext = currentStrokeCount === idx && !isDemoPlaying

                          return (
                            <path
                              key={`path-${idx}-${isDemoActive ? 'active' : 'idle'}`}
                              d={s.path}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={isDemoActive ? '6' : isNext ? '4.5' : '3.5'}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={
                                isDemoActive
                                  ? {
                                      strokeDasharray: 200,
                                      strokeDashoffset: 0,
                                      animation:
                                        'drawStrokeHuman 1.25s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards',
                                    }
                                  : undefined
                              }
                              className={
                                isDemoActive
                                  ? 'text-rose-600 dark:text-rose-400 opacity-100'
                                  : isNext
                                  ? 'text-rose-500/60 dark:text-rose-400/60'
                                  : isDrawn
                                  ? 'text-emerald-600/30 dark:text-emerald-400/30'
                                  : 'text-foreground/20 dark:text-foreground/25'
                              }
                            />
                          )
                        })}
                      </g>

                      {/* Numbered Sequence Badges (১, ২, ৩, ৪...) at exact start coordinates */}
                      <g>
                        {currentKanjiStrokes.map((s, idx) => {
                          const isNext = currentStrokeCount === idx && !isDemoPlaying
                          const isDone = currentStrokeCount > idx && !isDemoPlaying
                          const isDemoActive = isDemoPlaying && activeDemoStroke === idx

                          return (
                            <g key={`num-${idx}`} className="select-none transition-all">
                              {(isNext || isDemoActive) && (
                                <circle
                                  cx={s.numX}
                                  cy={s.numY - 2}
                                  r="8"
                                  className="fill-none stroke-rose-500 stroke-1 animate-ping opacity-75 origin-center"
                                />
                              )}
                              <circle
                                cx={s.numX}
                                cy={s.numY - 2}
                                r="5.5"
                                className={
                                  isNext || isDemoActive
                                    ? 'fill-rose-600 stroke-2 stroke-white dark:stroke-zinc-950 shadow-md'
                                    : isDone
                                    ? 'fill-emerald-600/80 stroke-1 stroke-white dark:stroke-zinc-950'
                                    : 'fill-zinc-500/70 dark:fill-zinc-600/70 stroke-1 stroke-white dark:stroke-zinc-900'
                                }
                              />
                              <text
                                x={s.numX}
                                y={s.numY - 0.2}
                                textAnchor="middle"
                                fontSize="5.2"
                                fontWeight="900"
                                className="fill-white pointer-events-none font-bold"
                              >
                                {toBengaliDigits(s.index)}
                              </text>
                            </g>
                          )
                        })}
                      </g>
                    </svg>
                  )}

                  {/* Ghost Character Fallback Mode */}
                  {guideMode === 'ghost' && (
                    <span className="absolute inset-0 flex items-center justify-center font-japanese text-8xl font-black text-foreground/15 dark:text-foreground/20 pointer-events-none select-none z-0">
                      {selectedKanji.kanji}
                    </span>
                  )}

                  {/* Inactive Practice Overlay: Clean Icon Button (No verbose paragraphs) */}
                  {!isPracticeActive && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-3 text-center bg-background/80 dark:bg-zinc-950/80 backdrop-blur-[2px] transition-all duration-200 select-none">
                      <Button
                        size="sm"
                        onClick={() => setIsPracticeActive(true)}
                        className="h-8 px-4 text-xs font-bold rounded-xl gap-1.5 bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>প্র্যাকটিস শুরু</span>
                      </Button>
                    </div>
                  )}

                  {/* Interactive Unified Pointer Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={260}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onPointerCancel={stopDrawing}
                    style={{ touchAction: isPracticeActive ? 'none' : 'auto' }}
                    className={`w-full h-full z-10 select-none outline-none ${
                      !isPracticeActive
                        ? 'pointer-events-none'
                        : isDrawingLocked
                        ? 'cursor-not-allowed touch-none'
                        : 'cursor-crosshair touch-none'
                    }`}
                  />
                </div>

                {/* Canvas Actions: Clean Icon-Only Row with Tooltips */}
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-5 gap-1.5 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undoLastStroke}
                      disabled={strokeHistory.length === 0}
                      className="h-7.5 p-0 flex items-center justify-center rounded-lg cursor-pointer"
                      title="আনডু (Undo)"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      disabled={strokeHistory.length === 0}
                      className="h-7.5 p-0 flex items-center justify-center rounded-lg hover:text-rose-600 cursor-pointer"
                      title="মুছুন (Clear)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={guideMode !== 'off' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setGuideMode((prev) =>
                          prev === 'numbered' ? 'ghost' : prev === 'ghost' ? 'off' : 'numbered'
                        )
                      }}
                      className="h-7.5 p-0 flex items-center justify-center rounded-lg cursor-pointer"
                      title={
                        guideMode === 'numbered'
                          ? 'গাইড: নম্বর'
                          : guideMode === 'ghost'
                          ? 'গাইড: ঘোস্ট'
                          : 'গাইড: অফ'
                      }
                    >
                      {guideMode !== 'off' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant={isDemoPlaying ? 'default' : 'outline'}
                      size="sm"
                      onClick={playStrokeDemo}
                      disabled={currentKanjiStrokes.length === 0}
                      className={`h-7.5 p-0 flex items-center justify-center rounded-lg cursor-pointer ${
                        isDemoPlaying ? 'bg-amber-600 text-white animate-pulse' : 'text-amber-800 dark:text-amber-400'
                      }`}
                      title={isDemoPlaying ? 'অ্যানিমেশন থামান' : 'স্ট্রোক অ্যানিমেশন ডেমো'}
                    >
                      {isDemoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => validateDrawing()}
                      disabled={strokeHistory.length === 0}
                      className="h-7.5 p-0 flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-primary text-white cursor-pointer shadow-2xs hover:opacity-90"
                      title="যাচাই করুন (Validate accuracy)"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Compact Status Indicator (No redundant verbose sentences) */}
                  {validationResult.message ? (
                    <div
                      className={`w-full px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 animate-in fade-in-50 ${
                        validationResult.status === 'success'
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : validationResult.status === 'warning'
                          ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                          : validationResult.status === 'needs_practice'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-secondary/60 text-foreground/80 border border-border/50'
                      }`}
                    >
                      {validationResult.status === 'success' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {validationResult.status === 'warning' && (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      {validationResult.status === 'needs_practice' && (
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      {validationResult.status === 'in_progress' && (
                        <PenTool className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                      )}
                      <span className="leading-tight text-[11px] truncate">
                        {validationResult.message}
                      </span>
                    </div>
                  ) : selectedKanji.stroke_count && currentStrokeCount < selectedKanji.stroke_count ? (
                    <div className="w-full px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between shadow-2xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
                        <span>
                          স্ট্রোক {toBengaliDigits(currentStrokeCount + 1)} / {toBengaliDigits(selectedKanji.stroke_count)}
                        </span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {toBengaliDigits(selectedKanji.stroke_count - currentStrokeCount)}টি বাকি
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ROW 2: KUN-YOMI (J) • কুন-ইয়োমি · জাপানি */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border/80 bg-amber-500/[0.03] dark:bg-amber-950/[0.08]">
          {/* Label Header */}
          <div className="md:col-span-2 bg-amber-500/10 dark:bg-amber-950/25 p-4 sm:p-5 flex flex-col justify-center text-left md:text-center">
            <span className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-300">
              Kun (J)
            </span>
            <span className="text-xs font-bold text-amber-700/90 dark:text-amber-400 mt-0.5">
              কুন-ইয়ো মি · জাপানি
            </span>
            <span className="text-[10px] text-muted-foreground mt-1 hidden md:block">
              জাপানি মূল উচ্চারণ
            </span>
          </div>

          {/* Readings breakdown */}
          <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-center space-y-3">
            {selectedKanji.kun_section &&
            selectedKanji.kun_section.available &&
            selectedKanji.kun_section.readings &&
            selectedKanji.kun_section.readings.length > 0 ? (
              selectedKanji.kun_section.readings.map((reading, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xl sm:text-2xl text-foreground font-japanese">
                      {reading.kana}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                      ({reading.romaji})
                    </span>
                    <span className="font-extrabold text-lg sm:text-xl text-rose-600 dark:text-rose-400">
                      {reading.bangla}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full"
                      onClick={(e) => speakJapanese(reading.kana, e)}
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {reading.context && (
                    <p className="text-xs text-muted-foreground font-medium pl-0.5">
                      {reading.context}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm font-medium text-muted-foreground italic">
                {selectedKanji.kun_section?.note || '— এই কানজির কুন-ইয়োমি শব্দ বইতে নেই'}
              </p>
            )}
          </div>

          {/* Examples Table */}
          <div className="md:col-span-7 p-4 sm:p-5 space-y-2.5">
            {selectedKanji.kun_section &&
            selectedKanji.kun_section.available &&
            selectedKanji.kun_section.examples &&
            selectedKanji.kun_section.examples.length > 0 ? (
              selectedKanji.kun_section.examples.map((ex, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-background/90 dark:bg-zinc-900/80 rounded-xl border border-border/60 hover:border-primary/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xl sm:text-2xl text-foreground font-japanese">
                      {ex.word}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground font-japanese">
                      ‹{ex.kana}›
                    </span>
                    <span className="font-extrabold text-base sm:text-lg text-rose-600 dark:text-rose-400">
                      ({ex.bangla_reading})
                    </span>
                    <span className="text-xs font-medium text-muted-foreground font-mono">
                      {ex.romaji}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {ex.meaning_bn}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary shrink-0"
                      onClick={(e) => speakJapanese(ex.kana || ex.word, e)}
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm font-medium text-muted-foreground italic py-2">
                {selectedKanji.kun_section?.note || 'এই কানজির কুন-ইয়োমি শব্দ বইতে দেওয়া নেই।'}
              </p>
            )}
          </div>
        </div>

        {/* ROW 3: ON-YOMI (C) • অন-ইয়োমি · চীনা */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border/80 bg-blue-500/[0.03] dark:bg-blue-950/[0.08]">
          {/* Label Header */}
          <div className="md:col-span-2 bg-blue-500/10 dark:bg-blue-950/25 p-4 sm:p-5 flex flex-col justify-center text-left md:text-center">
            <span className="text-lg sm:text-xl font-black text-blue-800 dark:text-blue-300">
              On (C)
            </span>
            <span className="text-xs font-bold text-blue-700/90 dark:text-blue-400 mt-0.5">
              অন-ইয়ো মি · চীনা
            </span>
            <span className="text-[10px] text-muted-foreground mt-1 hidden md:block">
              চীনা-মূল উচ্চারণ
            </span>
          </div>

          {/* Readings breakdown */}
          <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-center space-y-3">
            {selectedKanji.on_section &&
            selectedKanji.on_section.available &&
            selectedKanji.on_section.readings &&
            selectedKanji.on_section.readings.length > 0 ? (
              selectedKanji.on_section.readings.map((reading, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xl sm:text-2xl text-foreground font-japanese">
                      {reading.kana}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                      ({reading.romaji})
                    </span>
                    <span className="font-extrabold text-lg sm:text-xl text-rose-600 dark:text-rose-400">
                      {reading.bangla}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full"
                      onClick={(e) => speakJapanese(reading.kana, e)}
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {reading.context && (
                    <p className="text-xs text-muted-foreground font-medium pl-0.5">
                      {reading.context}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm font-medium text-muted-foreground italic">
                {selectedKanji.on_section?.note || '— এই কানজির অন-ইয়োমি শব্দ বইতে নেই'}
              </p>
            )}
          </div>

          {/* Examples Table */}
          <div className="md:col-span-7 p-4 sm:p-5 space-y-2.5">
            {selectedKanji.on_section &&
            selectedKanji.on_section.available &&
            selectedKanji.on_section.examples &&
            selectedKanji.on_section.examples.length > 0 ? (
              selectedKanji.on_section.examples.map((ex, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-background/90 dark:bg-zinc-900/80 rounded-xl border border-border/60 hover:border-primary/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xl sm:text-2xl text-foreground font-japanese">
                      {ex.word}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground font-japanese">
                      ‹{ex.kana}›
                    </span>
                    <span className="font-extrabold text-base sm:text-lg text-rose-600 dark:text-rose-400">
                      ({ex.bangla_reading})
                    </span>
                    <span className="text-xs font-medium text-muted-foreground font-mono">
                      {ex.romaji}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {ex.meaning_bn}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary shrink-0"
                      onClick={(e) => speakJapanese(ex.kana || ex.word, e)}
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm font-medium text-muted-foreground italic py-2">
                {selectedKanji.on_section?.note || 'এই কানজির অন-ইয়োমি শব্দ বইতে দেওয়া নেই।'}
              </p>
            )}
          </div>
        </div>

        {/* ROW 4: বিশেষ (অনিয়মিত পড়া) (If present) */}
        {selectedKanji.special_section && (
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-border/80 bg-purple-500/[0.03] dark:bg-purple-950/[0.08]">
            {/* Label Header */}
            <div className="md:col-span-2 bg-purple-500/10 dark:bg-purple-950/25 p-4 sm:p-5 flex flex-col justify-center text-left md:text-center">
              <span className="text-lg sm:text-xl font-black text-purple-800 dark:text-purple-300">
                বিশেষ
              </span>
              <span className="text-xs font-bold text-purple-700/90 dark:text-purple-400 mt-0.5">
                অনিয়মিত পড়া
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 hidden md:block">
                নিয়ম মানে না
              </span>
            </div>

            {/* Note Column */}
            <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-lg border border-border/50">
                {selectedKanji.special_section.note ||
                  'পুরো শব্দটির আলাদা পড়া — নিয়ম মেনে নয়, মুখস্থ করতে হয়।'}
              </p>
            </div>

            {/* Examples Column */}
            <div className="md:col-span-7 p-4 sm:p-5 space-y-2.5">
              {selectedKanji.special_section.examples &&
              selectedKanji.special_section.examples.length > 0 ? (
                selectedKanji.special_section.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-background/90 dark:bg-zinc-900/80 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-xl sm:text-2xl text-foreground font-japanese">
                        {ex.word}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground font-japanese">
                        ‹{ex.kana}›
                      </span>
                      <span className="font-extrabold text-base sm:text-lg text-rose-600 dark:text-rose-400">
                        ({ex.bangla_reading})
                      </span>
                      <span className="text-xs font-medium text-muted-foreground font-mono">
                        {ex.romaji}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {ex.meaning_bn}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary shrink-0"
                        onClick={(e) => speakJapanese(ex.kana || ex.word, e)}
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm font-medium text-muted-foreground italic py-2">
                  কোনো অনিয়মিত শব্দ তালিকায় নেই।
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE EXAMPLE SENTENCES SECTION */}
      {selectedKanji.sentences && selectedKanji.sentences.length > 0 && (
        <div className="border-2 border-border/80 rounded-2xl md:rounded-3xl shadow-md overflow-hidden bg-card transition-all">
          <button
            type="button"
            onClick={() => setShowSentences((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 sm:p-5 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    উদাহরণ বাক্য (Example Sentences)
                  </h3>
                  <Badge variant="outline" className="text-xs font-bold bg-background text-primary border-primary/30">
                    ২টি বাক্য
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {showSentences ? 'বাক্যগুলো লুকাতে ক্লিক করুন' : 'বাস্তব বাক্যে কানজির ব্যবহার শিখতে ক্লিক করুন (ঐচ্ছিক)'}
                </p>
              </div>
            </div>
            <div
              className={`p-1.5 rounded-full bg-background border border-border/80 text-muted-foreground transition-transform duration-200 ${
                showSentences ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {showSentences && (
            <div className="p-4 sm:p-6 space-y-4 border-t border-border/70 bg-background/50 divide-y divide-border/60">
              {selectedKanji.sentences.map((sent, idx) => (
                <div key={idx} className={`space-y-2.5 ${idx > 0 ? 'pt-4' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0 mt-0.5">
                        {toBengaliDigits(idx + 1)}
                      </span>
                      <p className="text-lg sm:text-xl font-bold text-foreground font-japanese leading-relaxed">
                        {sent.japanese}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary shrink-0"
                      onClick={(e) => speakJapanese(sent.japanese, e)}
                      title="বাক্যের উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="pl-8.5 space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground font-mono">
                      {sent.romaji}
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      <span className="text-primary font-bold">বাংলা: </span>
                      {sent.bangla}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      <span className="font-semibold text-muted-foreground">English: </span>
                      {sent.english}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons (Desktop & Tablet: hidden on mobile to avoid duplication with sticky bottom bar) */}
      <div className="hidden sm:flex items-center justify-between gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevKanji}
          className="flex-1 sm:flex-initial h-11 sm:h-12 px-6 rounded-xl font-bold gap-2 hover:bg-secondary transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous Kanji</span>
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span>
            Kanji {currentIndex >= 0 ? currentIndex + 1 : 1} of {filteredKanji.length}
          </span>
          <span>•</span>
          <span>← / → keyboard keys</span>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={handleNextKanji}
          className="flex-1 sm:flex-initial h-11 sm:h-12 px-6 rounded-xl font-bold gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <span>Next Kanji</span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-2xl sm:hidden flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevKanji}
          className="flex-1 h-11 rounded-xl font-bold gap-1 text-sm active:scale-95 shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </Button>

        <div className="flex flex-col items-center justify-center px-2 shrink-0">
          <span className="text-xl font-black text-primary leading-tight">
            {selectedKanji.kanji}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {currentIndex >= 0 ? currentIndex + 1 : 1} / {filteredKanji.length}
          </span>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleNextKanji}
          className="flex-1 h-11 rounded-xl font-bold gap-1 text-sm active:scale-95 shadow-2xs cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
