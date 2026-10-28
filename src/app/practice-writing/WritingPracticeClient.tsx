'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Volume2,
  RotateCcw,
  Undo2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenTool,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import kanaStrokesData from '@/lib/kana_strokes.json'
import { HIRAGANA_DATA } from '@/lib/alphabetData'

export interface KanaStrokeInfo {
  index: number
  path: string
  numX: number
  numY: number
}

const kanaStrokesMap = kanaStrokesData as Record<string, KanaStrokeInfo[]>

function toBengaliDigits(n: number | string | undefined): string {
  if (n === undefined || n === null || n === '') return ''
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  const s = String(n).padStart(2, '0')
  return s
    .split('')
    .map((d) => bnDigits[parseInt(d, 10)] ?? d)
    .join('')
}

export interface KanaValidationResult {
  status: 'idle' | 'in_progress' | 'success' | 'warning' | 'needs_practice'
  score: number
  coverage: number
  precision: number
  missingStrokes?: number[]
  message: string
}

const KANA_LIST = [
  // Hiragana
  { char: 'あ', romaji: 'a', type: 'hiragana' },
  { char: 'い', romaji: 'i', type: 'hiragana' },
  { char: 'う', romaji: 'u', type: 'hiragana' },
  { char: 'え', romaji: 'e', type: 'hiragana' },
  { char: 'お', romaji: 'o', type: 'hiragana' },
  { char: 'か', romaji: 'ka', type: 'hiragana' },
  { char: 'き', romaji: 'ki', type: 'hiragana' },
  { char: 'く', romaji: 'ku', type: 'hiragana' },
  { char: 'け', romaji: 'ke', type: 'hiragana' },
  { char: 'こ', romaji: 'ko', type: 'hiragana' },
  { char: 'さ', romaji: 'sa', type: 'hiragana' },
  { char: 'し', romaji: 'shi', type: 'hiragana' },
  { char: 'す', romaji: 'su', type: 'hiragana' },
  { char: 'せ', romaji: 'se', type: 'hiragana' },
  { char: 'そ', romaji: 'so', type: 'hiragana' },
  { char: 'た', romaji: 'ta', type: 'hiragana' },
  { char: 'ち', romaji: 'chi', type: 'hiragana' },
  { char: 'つ', romaji: 'tsu', type: 'hiragana' },
  { char: 'て', romaji: 'te', type: 'hiragana' },
  { char: 'と', romaji: 'to', type: 'hiragana' },
  { char: 'な', romaji: 'na', type: 'hiragana' },
  { char: 'に', romaji: 'ni', type: 'hiragana' },
  { char: 'ぬ', romaji: 'nu', type: 'hiragana' },
  { char: 'ね', romaji: 'ne', type: 'hiragana' },
  { char: 'の', romaji: 'no', type: 'hiragana' },
  { char: 'は', romaji: 'ha', type: 'hiragana' },
  { char: 'ひ', romaji: 'hi', type: 'hiragana' },
  { char: 'ふ', romaji: 'fu', type: 'hiragana' },
  { char: 'へ', romaji: 'he', type: 'hiragana' },
  { char: 'ほ', romaji: 'ho', type: 'hiragana' },
  { char: 'ま', romaji: 'ma', type: 'hiragana' },
  { char: 'み', romaji: 'mi', type: 'hiragana' },
  { char: 'む', romaji: 'mu', type: 'hiragana' },
  { char: 'め', romaji: 'me', type: 'hiragana' },
  { char: 'も', romaji: 'mo', type: 'hiragana' },
  { char: 'や', romaji: 'ya', type: 'hiragana' },
  { char: 'ゆ', romaji: 'yu', type: 'hiragana' },
  { char: 'よ', romaji: 'yo', type: 'hiragana' },
  { char: 'ら', romaji: 'ra', type: 'hiragana' },
  { char: 'り', romaji: 'ri', type: 'hiragana' },
  { char: 'る', romaji: 'ru', type: 'hiragana' },
  { char: 'れ', romaji: 're', type: 'hiragana' },
  { char: 'ろ', romaji: 'ro', type: 'hiragana' },
  { char: 'わ', romaji: 'wa', type: 'hiragana' },
  { char: 'を', romaji: 'wo', type: 'hiragana' },
  { char: 'ん', romaji: 'n', type: 'hiragana' },
  // Katakana
  { char: 'ア', romaji: 'a', type: 'katakana' },
  { char: 'イ', romaji: 'i', type: 'katakana' },
  { char: 'ウ', romaji: 'u', type: 'katakana' },
  { char: 'エ', romaji: 'e', type: 'katakana' },
  { char: 'オ', romaji: 'o', type: 'katakana' },
  { char: 'カ', romaji: 'ka', type: 'katakana' },
  { char: 'キ', romaji: 'ki', type: 'katakana' },
  { char: 'ク', romaji: 'ku', type: 'katakana' },
  { char: 'ケ', romaji: 'ke', type: 'katakana' },
  { char: 'コ', romaji: 'ko', type: 'katakana' },
  { char: 'サ', romaji: 'sa', type: 'katakana' },
  { char: 'シ', romaji: 'shi', type: 'katakana' },
  { char: 'ス', romaji: 'su', type: 'katakana' },
  { char: 'セ', romaji: 'se', type: 'katakana' },
  { char: 'ソ', romaji: 'so', type: 'katakana' },
  { char: 'タ', romaji: 'ta', type: 'katakana' },
  { char: 'チ', romaji: 'chi', type: 'katakana' },
  { char: 'ツ', romaji: 'tsu', type: 'katakana' },
  { char: 'テ', romaji: 'te', type: 'katakana' },
  { char: 'ト', romaji: 'to', type: 'katakana' },
  { char: 'ナ', romaji: 'na', type: 'katakana' },
  { char: 'ニ', romaji: 'ni', type: 'katakana' },
  { char: 'ヌ', romaji: 'nu', type: 'katakana' },
  { char: 'ネ', romaji: 'ne', type: 'katakana' },
  { char: 'ノ', romaji: 'no', type: 'katakana' },
  { char: 'ハ', romaji: 'ha', type: 'katakana' },
  { char: 'ヒ', romaji: 'hi', type: 'katakana' },
  { char: 'フ', romaji: 'fu', type: 'katakana' },
  { char: 'ヘ', romaji: 'he', type: 'katakana' },
  { char: 'ホ', romaji: 'ho', type: 'katakana' },
  { char: 'マ', romaji: 'ma', type: 'katakana' },
  { char: 'ミ', romaji: 'mi', type: 'katakana' },
  { char: 'ム', romaji: 'mu', type: 'katakana' },
  { char: 'メ', romaji: 'me', type: 'katakana' },
  { char: 'モ', romaji: 'mo', type: 'katakana' },
  { char: 'ヤ', romaji: 'ya', type: 'katakana' },
  { char: 'ユ', romaji: 'yu', type: 'katakana' },
  { char: 'ヨ', romaji: 'yo', type: 'katakana' },
  { char: 'ラ', romaji: 'ra', type: 'katakana' },
  { char: 'リ', romaji: 'ri', type: 'katakana' },
  { char: 'ル', romaji: 'ru', type: 'katakana' },
  { char: 'レ', romaji: 're', type: 'katakana' },
  { char: 'ロ', romaji: 'ro', type: 'katakana' },
  { char: 'ワ', romaji: 'wa', type: 'katakana' },
  { char: 'ヲ', romaji: 'wo', type: 'katakana' },
  { char: 'ン', romaji: 'n', type: 'katakana' },
]

function evaluateCanvasKanaAccuracy(
  userCanvas: HTMLCanvasElement,
  kanaChar: string,
  strokeList: KanaStrokeInfo[]
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

  const offCanvas = document.createElement('canvas')
  offCanvas.width = size
  offCanvas.height = size
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })
  if (!offCtx) return { score: 0, coverage: 0, precision: 0, missingStrokes: [] }

  offCtx.clearRect(0, 0, size, size)
  offCtx.save()
  offCtx.scale(size / 109, size / 109)
  offCtx.strokeStyle = '#000000'
  offCtx.lineWidth = 11
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
    offCtx.font = '900 150px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif'
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'
    offCtx.fillStyle = '#000000'
    offCtx.fillText(kanaChar, size / 2, size / 2 + 5)
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

  // 1. Calculate overall target coverage
  let matchedTargetCount = 0
  for (let gy = 0; gy < gridDim; gy++) {
    for (let gx = 0; gx < gridDim; gx++) {
      if (targetGrid[gy * gridDim + gx] === 1) {
        if (hasNeighbor(userGrid, gx, gy, maxRadius)) {
          matchedTargetCount++
        }
      }
    }
  }
  const coverage = matchedTargetCount / targetPointCount

  // 2. Calculate user precision: how much of user drawing is strictly ON the target lines
  let matchedUserCount = 0
  for (let gy = 0; gy < gridDim; gy++) {
    for (let gx = 0; gx < gridDim; gx++) {
      if (userGrid[gy * gridDim + gx] === 1) {
        if (hasNeighbor(targetGrid, gx, gy, 2)) {
          matchedUserCount++
        }
      }
    }
  }
  const precision = matchedUserCount / userPointCount

  // 3. Strict per-stroke check: detect if ANY stroke in the stroke order was skipped or incomplete!
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
        sCtx.lineWidth = 11
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
        // If user covered less than 48% of this specific stroke, it is MISSING!
        if (sRatio < 0.48) {
          missingStrokes.push(stroke.index)
        }
      }
    }
  }

  // 4. Harmonic Mean (F1-score)
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

export function WritingPracticeClient() {
  const [scriptType, setScriptType] = useState<'hiragana' | 'katakana'>('hiragana')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentStrokeCount, setCurrentStrokeCount] = useState(0)
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([])
  const [guideMode, setGuideMode] = useState<'numbered' | 'ghost' | 'off'>('numbered')
  const [isDemoPlaying, setIsDemoPlaying] = useState(false)
  const [activeDemoStroke, setActiveDemoStroke] = useState<number>(-1)
  const [validationResult, setValidationResult] = useState<KanaValidationResult>({
    status: 'idle',
    score: 0,
    coverage: 0,
    precision: 0,
    message: '',
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const strokeCountRef = useRef(0)
  const strokeHistoryRef = useRef<ImageData[]>([])
  const lastImageDataBeforeStrokeRef = useRef<ImageData | null>(null)
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const strokePointsCountRef = useRef(0)
  const strokeDistanceRef = useRef(0)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const currentList = useMemo(() => KANA_LIST.filter((k) => k.type === scriptType), [scriptType])
  const activeChar = currentList[currentIndex] || currentList[0]

  const currentKanaStrokes = useMemo(() => {
    return kanaStrokesMap[activeChar.char] || []
  }, [activeChar.char])

  const targetStrokeCount = currentKanaStrokes.length || 1

  // Hint / Mnemonic from alphabetData
  const charHint = useMemo(() => {
    if (scriptType === 'hiragana') {
      const found = HIRAGANA_DATA.basic.items.find((item) => item.char === activeChar.char)
      return found?.hint || ''
    }
    return ''
  }, [scriptType, activeChar.char])

  // Drawing locked when target strokes are exhausted or on success
  const isDrawingLocked = Boolean(
    (targetStrokeCount > 0 && currentStrokeCount >= targetStrokeCount) ||
    validationResult.status === 'success'
  )

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    strokeHistoryRef.current = []
    setStrokeHistory([])
    strokeCountRef.current = 0
    setCurrentStrokeCount(0)
    setValidationResult({
      status: 'idle',
      score: 0,
      coverage: 0,
      precision: 0,
      message: '',
    })
  }, [])

  // Clear canvas whenever character or script changes
  useEffect(() => {
    clearCanvas()
    setIsDemoPlaying(false)
    setActiveDemoStroke(-1)
  }, [currentIndex, scriptType, clearCanvas])

  // Undo last stroke: always restores cleanly and unlocks canvas
  const undoLastStroke = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || strokeHistoryRef.current.length === 0) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const previousState = strokeHistoryRef.current[strokeHistoryRef.current.length - 1]
    ctx.putImageData(previousState, 0, 0)
    strokeHistoryRef.current.pop()
    setStrokeHistory([...strokeHistoryRef.current])

    const newCount = Math.max(0, strokeCountRef.current - 1)
    strokeCountRef.current = newCount
    setCurrentStrokeCount(newCount)

    if (newCount === 0) {
      setValidationResult({
        status: 'idle',
        score: 0,
        coverage: 0,
        precision: 0,
        message: '',
      })
    } else {
      const remaining = Math.max(0, targetStrokeCount - newCount)
      setValidationResult({
        status: 'in_progress',
        score: 0,
        coverage: 0,
        precision: 0,
        message:
          remaining > 0
            ? `${toBengaliDigits(newCount)}টি স্ট্রোক আঁকা আছে। বাকি ${toBengaliDigits(remaining)}টি সম্পন্ন করুন।`
            : '',
      })
    }
  }, [targetStrokeCount])

  // Validate drawing accuracy
  const validateDrawing = useCallback(
    (drawnStrokesCount?: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const strokesUsed = drawnStrokesCount !== undefined ? drawnStrokesCount : strokeCountRef.current

      // Check 0: Nothing drawn
      if (strokesUsed === 0) {
        setValidationResult({
          status: 'idle',
          score: 0,
          coverage: 0,
          precision: 0,
          message: 'প্রথমে ক্যানভাসে স্ট্রোক টানুন।',
        })
        return
      }

      // Check 1: Incomplete strokes count
      if (targetStrokeCount > 0 && strokesUsed < targetStrokeCount) {
        const remaining = targetStrokeCount - strokesUsed
        setValidationResult({
          status: 'in_progress',
          score: 0,
          coverage: 0,
          precision: 0,
          message: `অসম্পূর্ণ অক্ষর! ${toBengaliDigits(targetStrokeCount)}টির মধ্যে ${toBengaliDigits(strokesUsed)}টি স্ট্রোক লেখা হয়েছে। বাকি ${toBengaliDigits(remaining)}টি স্ট্রোক সম্পন্ন করুন।`,
        })
        return
      }

      // Check 2: Overdrawing
      if (targetStrokeCount > 0 && strokesUsed > targetStrokeCount) {
        setValidationResult({
          status: 'needs_practice',
          score: 0,
          coverage: 0,
          precision: 0,
          message: `অতিরিক্ত স্ট্রোক! লক্ষ্য ছিল ${toBengaliDigits(targetStrokeCount)}টি স্ট্রোক, কিন্তু আপনি ${toBengaliDigits(strokesUsed)}টি দিয়েছেন। আনডু করে অতিরিক্ত দাগগুলো মুছুন।`,
        })
        return
      }

      const evalResult = evaluateCanvasKanaAccuracy(canvas, activeChar.char, currentKanaStrokes)
      const { score, coverage, precision, missingStrokes } = evalResult

      // Check 3: SPECIFIC MISSING STROKE CHECK!
      // If user completely skipped any stroke (e.g. skipped stroke 3 in あ)
      if (missingStrokes && missingStrokes.length > 0) {
        const missingListBn = missingStrokes.map((n) => toBengaliDigits(n)).join(', ')
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          missingStrokes,
          message: `অক্ষরটি অসম্পূর্ণ! ${missingListBn}নং স্ট্রোকটি আঁকা হয়নি (লাল বৃত্ত ${missingListBn} দেখুন)। সম্পূর্ণ অক্ষরটি লিখুন।`,
        })
        return
      }

      // Check 4: Minimum overall coverage check (Must cover at least 62% of the glyph)
      if (coverage < 62) {
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          message: `অক্ষরের গঠন বা আকার অসম্পূর্ণ (কভারেজ ${toBengaliDigits(coverage)}%)। গাইডের দাগের ওপর ঠিকভাবে টানুন।`,
        })
        return
      }

      // Check 5: Strict precision check (User cannot scribble outside the guide)
      if (precision < 65) {
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          message: `দাগগুলো গাইডের লাইনের বাইরে চলে গেছে (নির্ভুলতা ${toBengaliDigits(precision)}%)। গাইডের বাইরে কোনো দাগ টানা যাবে না।`,
        })
        return
      }

      // Check 6: Final F1 Score check (Score must be at least 68% to pass!)
      if (score < 68) {
        setValidationResult({
          status: 'needs_practice',
          score,
          coverage,
          precision,
          message: `স্ট্রোক ও অক্ষরের গঠন আরও নিখুঁত হতে হবে (স্কোর: ${toBengaliDigits(score)}%)। আনডু করে পুনরায় চেষ্টা করুন।`,
        })
        return
      }

      // ALL STRICT TESTS PASSED!
      setValidationResult({
        status: 'success',
        score,
        coverage,
        precision,
        message: `চমৎকার! সঠিক ${toBengaliDigits(targetStrokeCount)}টি স্ট্রোকে নিখুঁতভাবে লেখা হয়েছে (স্কোর: ${toBengaliDigits(score)}%)। 🎉`,
      })

      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
        })
      } catch {}
    },
    [targetStrokeCount, activeChar.char, currentKanaStrokes]
  )

  // Animated Stroke Demo
  const playStrokeDemo = useCallback(() => {
    if (isDemoPlaying) {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      setIsDemoPlaying(false)
      setActiveDemoStroke(-1)
      return
    }

    if (currentKanaStrokes.length === 0) return

    clearCanvas()
    setIsDemoPlaying(true)
    let strokeIdx = 0
    setActiveDemoStroke(0)

    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)

    demoIntervalRef.current = setInterval(() => {
      strokeIdx++
      if (strokeIdx < currentKanaStrokes.length) {
        setActiveDemoStroke(strokeIdx)
      } else {
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
        setTimeout(() => {
          setIsDemoPlaying(false)
          setActiveDemoStroke(-1)
        }, 1200)
      }
    }, 1500)
  }, [isDemoPlaying, currentKanaStrokes, clearCanvas])

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    }
  }, [])

  // Canvas drawing handlers (Unified Pointer Events)
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
    if (isDemoPlaying || isDrawingLocked) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (e.cancelable) {
      e.preventDefault()
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}

    lastImageDataBeforeStrokeRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    isDrawingRef.current = true

    const { x, y } = getPointerPos(e)
    strokePointsCountRef.current = 1
    strokeDistanceRef.current = 0
    lastPointRef.current = { x, y }

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isDemoPlaying || isDrawingLocked) return
    if (e.cancelable) {
      e.preventDefault()
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const { x, y } = getPointerPos(e)
    if (lastPointRef.current) {
      strokeDistanceRef.current += Math.hypot(x - lastPointRef.current.x, y - lastPointRef.current.y)
      lastPointRef.current = { x, y }
    }
    strokePointsCountRef.current++

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {}

    const canvas = canvasRef.current
    if (!canvas || !lastImageDataBeforeStrokeRef.current) return

    // Accidental motionless micro-tap (zero movement): ignore
    if (strokeDistanceRef.current < 2 && strokePointsCountRef.current < 2) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.putImageData(lastImageDataBeforeStrokeRef.current, 0, 0)
      }
      lastImageDataBeforeStrokeRef.current = null
      lastPointRef.current = null
      return
    }

    const snap = lastImageDataBeforeStrokeRef.current
    strokeHistoryRef.current.push(snap)
    setStrokeHistory([...strokeHistoryRef.current])
    lastImageDataBeforeStrokeRef.current = null
    lastPointRef.current = null

    strokeCountRef.current += 1
    const newStrokeCount = strokeCountRef.current
    setCurrentStrokeCount(newStrokeCount)

    // Auto-validate when all target strokes are drawn
    if (targetStrokeCount > 0 && newStrokeCount >= targetStrokeCount) {
      setTimeout(() => {
        validateDrawing(newStrokeCount)
      }, 150)
    } else if (targetStrokeCount > 0) {
      const remaining = targetStrokeCount - newStrokeCount
      setValidationResult({
        status: 'in_progress',
        score: 0,
        coverage: 0,
        precision: 0,
        message: `${toBengaliDigits(newStrokeCount)}টি স্ট্রোক হয়েছে। বাকি ${toBengaliDigits(remaining)}টি স্ট্রোক সম্পন্ন করুন।`,
      })
    }
  }

  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <header className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide border border-primary/20">
          <PenTool className="w-3.5 h-3.5" />
          <span>ইন্টারেক্টিভ হ্যান্ডরাইটিং টাচপ্যাড</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
          Handwriting Practice Canvas
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          সঠিক স্ট্রোক অর্ডার (ক্রম) ও দিকনির্দেশনা মেনে হিরাগানা ও কাতাকানা লেখার পূর্ণাঙ্গ অনুশীলন।
        </p>

        {/* Script Selector Tabs */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setScriptType('hiragana')
              setCurrentIndex(0)
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
              scriptType === 'hiragana'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            <span>ひらがな (Hiragana)</span>
            <span className="text-[10px] opacity-80">(৪৬টি)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScriptType('katakana')
              setCurrentIndex(0)
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
              scriptType === 'katakana'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            <span>カタカナ (Katakana)</span>
            <span className="text-[10px] opacity-80">(৪৬টি)</span>
          </button>
        </div>
      </header>

      {/* Main Practice Pad Card */}
      <div className="max-w-md mx-auto p-4 sm:p-6 rounded-3xl bg-card border-2 border-border/90 shadow-xl space-y-4">
        {/* Top Navigator Bar: Prev, Character Info, Next */}
        <div className="flex items-center justify-between pb-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : currentList.length - 1))}
            className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer"
            title="পূর্ববর্তী অক্ষর"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-foreground font-japanese tracking-tight">
                {activeChar.char}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => playAudio(activeChar.char)}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary cursor-pointer"
                title="উচ্চারণ শুনুন"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mt-0.5">
              <span>{activeChar.romaji}</span>
              <span>•</span>
              <span>{toBengaliDigits(targetStrokeCount)} স্ট্রোক</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex((i) => (i < currentList.length - 1 ? i + 1 : 0))}
            className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer"
            title="পরবর্তী অক্ষর"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mnemonic / Hint banner if available */}
        {charHint && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="leading-tight text-[11px] font-semibold">{charHint}</span>
          </div>
        )}

        {/* Kanji-Style Unified Drawing Canvas Container with Grid & Vector Guide */}
        <div
          className={`relative w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] mx-auto rounded-2xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-inner select-none touch-none ${
            validationResult.status === 'success'
              ? 'border-emerald-500 ring-4 ring-emerald-500/25 shadow-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
              : validationResult.status === 'warning'
              ? 'border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
              : validationResult.status === 'needs_practice'
              ? 'border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-primary/30 bg-background/60 dark:bg-zinc-950/60'
          }`}
        >
          {/* Status Badge Tag */}
          {validationResult.status === 'success' && (
            <div className="absolute top-2 right-2 z-20 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black shadow-md flex items-center gap-1 animate-in zoom-in-50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পাস</span>
            </div>
          )}

          {/* Dotted Center Cross Quadrant Calligraphy Lines */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-primary/25 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r-2 border-dashed border-primary/25 pointer-events-none" />

          {/* Numbered Vector Stroke Order Guide */}
          {guideMode === 'numbered' && currentKanaStrokes.length > 0 && (
            <svg
              viewBox="0 0 109 109"
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            >
              {/* Stroke Paths */}
              <g>
                {currentKanaStrokes.map((s, idx) => {
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

              {/* Numbered Sequence Badges (১, ২, ৩...) at exact start coordinates */}
              <g>
                {currentKanaStrokes.map((s, idx) => {
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
            <span className="absolute inset-0 flex items-center justify-center font-japanese text-8xl sm:text-9xl font-black text-foreground/15 dark:text-foreground/20 pointer-events-none select-none z-0">
              {activeChar.char}
            </span>
          )}

          {/* Unified Pointer Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
            style={{ touchAction: 'none' }}
            className={`w-full h-full z-10 select-none outline-none ${
              isDrawingLocked
                ? 'cursor-not-allowed touch-none'
                : 'cursor-crosshair touch-none'
            }`}
          />
        </div>

        {/* Canvas Controls Row: 5 Clean Icon Buttons */}
        <div className="w-full space-y-2.5">
          <div className="grid grid-cols-5 gap-2 w-full">
            {/* 1. Undo */}
            <Button
              variant="outline"
              size="sm"
              onClick={undoLastStroke}
              disabled={strokeHistory.length === 0}
              className="h-8.5 p-0 flex items-center justify-center rounded-xl cursor-pointer hover:bg-secondary"
              title="আনডু (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>

            {/* 2. Clear */}
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={strokeHistory.length === 0}
              className="h-8.5 p-0 flex items-center justify-center rounded-xl hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              title="মুছুন (Clear)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* 3. Guide Mode Toggle */}
            <Button
              variant={guideMode !== 'off' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setGuideMode((prev) =>
                  prev === 'numbered' ? 'ghost' : prev === 'ghost' ? 'off' : 'numbered'
                )
              }}
              className="h-8.5 p-0 flex items-center justify-center rounded-xl cursor-pointer"
              title={
                guideMode === 'numbered'
                  ? 'গাইড: নম্বর ও ক্রম'
                  : guideMode === 'ghost'
                  ? 'গাইড: ঘোস্ট ক্যারেক্টার'
                  : 'গাইড: অফ'
              }
            >
              {guideMode !== 'off' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>

            {/* 4. Stroke Animation Demo */}
            <Button
              variant={isDemoPlaying ? 'default' : 'outline'}
              size="sm"
              onClick={playStrokeDemo}
              disabled={currentKanaStrokes.length === 0}
              className={`h-8.5 p-0 flex items-center justify-center rounded-xl cursor-pointer ${
                isDemoPlaying ? 'bg-amber-600 text-white animate-pulse' : 'text-amber-800 dark:text-amber-400'
              }`}
              title={isDemoPlaying ? 'অ্যানিমেশন থামান' : 'স্ট্রোক অ্যানিমেশন ডেমো'}
            >
              {isDemoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            {/* 5. Validate Accuracy */}
            <Button
              variant="default"
              size="sm"
              onClick={() => validateDrawing()}
              disabled={strokeHistory.length === 0}
              className="h-8.5 p-0 flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-primary text-white cursor-pointer shadow-sm hover:opacity-95"
              title="যাচাই করুন (Validate accuracy)"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>

          {/* Stroke Progress or Validation Status Pill */}
          {validationResult.message ? (
            <div
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 animate-in fade-in-50 ${
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {validationResult.status === 'warning' && (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {validationResult.status === 'needs_practice' && (
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="leading-tight text-[11px] truncate">
                {validationResult.message}
              </span>
            </div>
          ) : targetStrokeCount && currentStrokeCount < targetStrokeCount ? (
            <div className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between shadow-2xs">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
                <span>
                  স্ট্রোক {toBengaliDigits(currentStrokeCount + 1)} / {toBengaliDigits(targetStrokeCount)}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {toBengaliDigits(targetStrokeCount - currentStrokeCount)}টি বাকি
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Jump Character Selector Grid */}
      <div className="max-w-xl mx-auto space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-semibold">
          <span>দ্রুত অক্ষর নির্বাচন করুন:</span>
          <span>
            {toBengaliDigits(currentIndex + 1)} / {toBengaliDigits(currentList.length)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto p-2 rounded-2xl bg-card border border-border/70 scrollbar-thin">
          {currentList.map((item, idx) => (
            <button
              key={`${item.type}-${item.char}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`shrink-0 w-9 h-9 rounded-xl flex flex-col items-center justify-center font-japanese font-bold text-sm transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'hover:bg-secondary text-foreground'
              }`}
            >
              <span>{item.char}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
