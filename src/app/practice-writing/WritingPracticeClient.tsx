'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Volume2,
  RotateCcw,
  Undo2,
  Eye,
  EyeOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PenTool,
} from 'lucide-react'

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

export function WritingPracticeClient() {
  const [scriptType, setScriptType] = useState<'hiragana' | 'katakana'>('hiragana')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showGuide, setShowGuide] = useState(true)
  const [brushColor, setBrushColor] = useState('#2563eb')
  const [brushSize, setBrushSize] = useState(14)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentList = KANA_LIST.filter((k) => k.type === scriptType)
  const activeChar = currentList[currentIndex] || currentList[0]

  // Clear canvas whenever active character or script changes
  useEffect(() => {
    clearCanvas()
  }, [currentIndex, scriptType])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Save state for undo
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setStrokeHistory((prev) => [...prev, currentImageData])

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setStrokeHistory([])
  }

  const undoLastStroke = () => {
    const canvas = canvasRef.current
    if (!canvas || strokeHistory.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const previousState = strokeHistory[strokeHistory.length - 1]
    ctx.putImageData(previousState, 0, 0)
    setStrokeHistory((prev) => prev.slice(0, prev.length - 1))
  }

  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ja-JP'
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    } catch {
      // Ignore
    }
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `japanese-${activeChar.char}-${activeChar.romaji}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide border border-indigo-500/20">
          <PenTool className="w-3.5 h-3.5" />
          <span>Interactive Canvas Pad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Handwriting Practice Canvas
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Master the curves and stroke balance of Hiragana & Katakana. Draw directly with touch or
          mouse using calligraphy grid guides!
        </p>

        {/* Script Selector Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => {
              setScriptType('hiragana')
              setCurrentIndex(0)
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              scriptType === 'hiragana'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-accent'
            }`}
          >
            ひらがな (Hiragana)
          </button>
          <button
            onClick={() => {
              setScriptType('katakana')
              setCurrentIndex(0)
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              scriptType === 'katakana'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-accent'
            }`}
          >
            カタカナ (Katakana)
          </button>
        </div>
      </header>

      {/* Main Canvas & Drawing Controls Container */}
      <div className="max-w-md mx-auto p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-6">
        {/* Top Navigator: Prev, Current Character Info, Next */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => (i > 0 ? i - 1 : currentList.length - 1))}
            className="p-2.5 rounded-xl border border-border hover:bg-accent transition cursor-pointer"
            title="Previous Character"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="text-center">
            <span className="text-2xl font-black text-foreground font-serif tracking-tight">
              {activeChar.char}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
              <span>{activeChar.romaji}</span>
              <button
                onClick={() => playAudio(activeChar.char)}
                className="hover:scale-110 transition cursor-pointer text-muted-foreground hover:text-primary"
                title="Hear pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5 inline" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {currentIndex + 1} of {currentList.length}
            </span>
          </div>

          <button
            onClick={() => setCurrentIndex((i) => (i < currentList.length - 1 ? i + 1 : 0))}
            className="p-2.5 rounded-xl border border-border hover:bg-accent transition cursor-pointer"
            title="Next Character"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Canvas Display with Watermark & Quadrant Grid */}
        <div className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-border/80 bg-background/60 overflow-hidden shadow-inner flex items-center justify-center select-none touch-none">
          {/* Quadrant Calligraphy Grid lines (horizontal & vertical center lines) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-border/50 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r border-dashed border-border/50 pointer-events-none" />

          {/* Ghost Guide Character (Watermark) */}
          {showGuide && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[200px] sm:text-[230px] font-black text-foreground/15 dark:text-foreground/10 font-serif leading-none tracking-tight">
                {activeChar.char}
              </span>
            </div>
          )}

          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="relative z-10 w-full h-full cursor-crosshair"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {['#2563eb', '#dc2626', '#16a34a', '#d97706', '#1e293b'].map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                    brushColor === color
                      ? 'border-foreground scale-110 shadow-sm'
                      : 'border-transparent'
                  }`}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>

            {/* Guide Toggle */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                showGuide
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {showGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showGuide ? 'Guide On' : 'Guide Off'}</span>
            </button>
          </div>

          {/* Action Buttons: Undo, Clear, Save */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={undoLastStroke}
              disabled={strokeHistory.length === 0}
              className="py-2.5 px-3 rounded-xl border border-input text-xs font-semibold hover:bg-accent disabled:opacity-40 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
            <button
              onClick={clearCanvas}
              className="py-2.5 px-3 rounded-xl border border-input text-xs font-semibold hover:bg-accent text-rose-600 dark:text-rose-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={downloadDrawing}
              className="py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
