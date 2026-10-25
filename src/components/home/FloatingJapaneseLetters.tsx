'use client'

import React, { useEffect, useState, useRef } from 'react'

interface FloatingChar {
  id: number
  char: string
  romaji: string
  meaning: string
  x: number // percentage 0 - 100
  y: number // percentage 0 - 100
  size: number // px
  speedX: number
  speedY: number
  opacity: number
  rotation: number
  rotationSpeed: number
  color: string
}

const JAPANESE_CHARACTERS = [
  { char: 'あ', romaji: 'a', meaning: 'Sound "a"' },
  { char: 'い', romaji: 'i', meaning: 'Sound "i"' },
  { char: 'う', romaji: 'u', meaning: 'Sound "u"' },
  { char: 'え', romaji: 'e', meaning: 'Sound "e"' },
  { char: 'お', romaji: 'o', meaning: 'Sound "o"' },
  { char: 'か', romaji: 'ka', meaning: 'Sound "ka"' },
  { char: 'さ', romaji: 'sa', meaning: 'Sound "sa"' },
  { char: '桜', romaji: 'sakura', meaning: 'Cherry Blossom' },
  { char: '夢', romaji: 'yume', meaning: 'Dream' },
  { char: '愛', romaji: 'ai', meaning: 'Love' },
  { char: '光', romaji: 'hikari', meaning: 'Light' },
  { char: '風', romaji: 'kaze', meaning: 'Wind' },
  { char: '心', romaji: 'kokoro', meaning: 'Heart / Mind' },
  { char: '和', romaji: 'wa', meaning: 'Harmony / Peace' },
  { char: '星', romaji: 'hoshi', meaning: 'Star' },
  { char: '空', romaji: 'sora', meaning: 'Sky' },
  { char: '道', romaji: 'michi', meaning: 'Way / Path' },
  { char: '旅', romaji: 'tabi', meaning: 'Journey' },
  { char: '花', romaji: 'hana', meaning: 'Flower' },
  { char: '日', romaji: 'hi', meaning: 'Sun / Day' },
  { char: '月', romaji: 'tsuki', meaning: 'Moon' },
  { char: '絆', romaji: 'kizuna', meaning: 'Bonds' },
  { char: '力', romaji: 'chikara', meaning: 'Power' },
  { char: '希望', romaji: 'kibō', meaning: 'Hope' },
]

export function FloatingJapaneseLetters() {
  const [chars, setChars] = useState<FloatingChar[]>([])
  const [hoveredChar, setHoveredChar] = useState<FloatingChar | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize particles on client
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const count = isMobile ? 12 : 24

    const colors = [
      'rgba(147, 51, 234, 0.45)', // purple
      'rgba(236, 72, 153, 0.45)', // pink/rose
      'rgba(59, 130, 246, 0.45)', // blue
      'rgba(16, 185, 129, 0.45)', // emerald
      'rgba(245, 158, 11, 0.45)', // amber
    ]

    const initialChars: FloatingChar[] = []

    for (let i = 0; i < count; i++) {
      const charMeta = JAPANESE_CHARACTERS[i % JAPANESE_CHARACTERS.length]
      initialChars.push({
        id: i,
        char: charMeta.char,
        romaji: charMeta.romaji,
        meaning: charMeta.meaning,
        x: Math.random() * 96 + 2,
        y: Math.random() * 92 + 4,
        size: Math.floor(Math.random() * (isMobile ? 18 : 28)) + (isMobile ? 18 : 22),
        speedX: (Math.random() - 0.48) * (isMobile ? 0.04 : 0.07),
        speedY: -(Math.random() * 0.05 + 0.03), // float upwards gently
        opacity: Math.random() * 0.4 + 0.25,
        rotation: (Math.random() - 0.5) * 30,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    setChars(initialChars)

    let animationFrameId: number

    const updateParticles = () => {
      setChars((prev) =>
        prev.map((c) => {
          let newX = c.x + c.speedX
          let newY = c.y + c.speedY
          let newRot = c.rotation + c.rotationSpeed

          // Wrap around horizontally
          if (newX < -5) newX = 105
          if (newX > 105) newX = -5

          // Wrap around vertically: when reaching top, reappear at bottom
          if (newY < -8) {
            newY = 105
            newX = Math.random() * 96 + 2
          }

          return {
            ...c,
            x: newX,
            y: newY,
            rotation: newRot,
          }
        })
      )
      animationFrameId = requestAnimationFrame(updateParticles)
    }

    animationFrameId = requestAnimationFrame(updateParticles)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Audio pronunciation on click
  const speakChar = (charText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(charText)
      u.lang = 'ja-JP'
      u.rate = 0.85
      window.speechSynthesis.speak(u)
    } catch {
      // Ignore
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {chars.map((item) => {
        const isHovered = hoveredChar?.id === item.id

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredChar(item)}
            onMouseLeave={() => setHoveredChar(null)}
            onClick={() => speakChar(item.char)}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${
                isHovered ? 1.4 : 1
              })`,
              opacity: isHovered ? 1 : item.opacity,
              color: isHovered ? 'var(--primary)' : undefined,
              textShadow: isHovered
                ? '0 0 20px currentColor, 0 0 40px currentColor'
                : '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
            }}
            className="absolute font-serif font-black tracking-widest cursor-pointer pointer-events-auto transition-colors duration-200 group text-foreground/40 dark:text-foreground/35 hover:text-primary dark:hover:text-primary hover:z-20"
            title={`${item.char} (${item.romaji}) - ${item.meaning} - Click to listen`}
          >
            <span className="relative inline-block select-none">{item.char}</span>

            {/* Micro Tooltip on hover */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-popover/95 text-popover-foreground border border-border shadow-xl text-[11px] font-sans font-bold whitespace-nowrap pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-primary">{item.romaji}</span>
                <span className="text-muted-foreground ml-1.5 font-normal">· {item.meaning}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
