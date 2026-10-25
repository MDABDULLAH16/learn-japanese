'use client'

import { useState } from 'react'
import { Printer, Download, Sparkles, BookA, FileText, Check } from 'lucide-react'
import { HIRAGANA_DATA, KATAKANA_DATA } from '@/lib/alphabetData'

export function CheatSheetsClient() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana' | 'kanji'>('hiragana')

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      {/* Header (hidden in print) */}
      <header className="text-center space-y-4 max-w-2xl mx-auto print:hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide border border-emerald-500/20">
          <FileText className="w-3.5 h-3.5" />
          <span>Printable PDF Resources</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Printable Japanese Cheat Sheets
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          High-resolution study sheets ready for download or printing. Hang them on your wall or
          keep them beside your study desk!
        </p>

        {/* Tab Buttons & Print Action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setActiveTab('hiragana')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'hiragana'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hiragana Chart
            </button>
            <button
              onClick={() => setActiveTab('katakana')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'katakana'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Katakana Chart
            </button>
            <button
              onClick={() => setActiveTab('kanji')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'kanji'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JLPT N5 Kanji Cheat Sheet
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-md hover:bg-primary/90 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </header>

      {/* Printable Sheet Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl print:border-none print:shadow-none print:p-0">
        {/* Printable Sheet Header */}
        <div className="border-b border-border pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {activeTab === 'hiragana'
                ? '日本語 ひらがな一覧表 (Hiragana Chart)'
                : activeTab === 'katakana'
                  ? '日本語 カタカナ一覧表 (Katakana Chart)'
                  : 'JLPT N5 必須漢字表 (JLPT N5 Core Kanji Chart)'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Learn Japanese Study Resource · Free to Print & Share
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            learn-japanese.org
          </span>
        </div>

        {/* 1. Hiragana Matrix Grid */}
        {activeTab === 'hiragana' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-2">
              46 Basic Gojūon (五十音)
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
              {HIRAGANA_DATA.basic.items.map((item) => (
                <div
                  key={item.char}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-center flex flex-col items-center justify-center space-y-1 hover:border-primary transition"
                >
                  <span className="text-2xl sm:text-3xl font-black text-foreground font-serif">
                    {item.char}
                  </span>
                  <span className="text-[11px] font-bold text-primary uppercase">
                    {item.romaji}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Katakana Matrix Grid */}
        {activeTab === 'katakana' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 border-b border-border/40 pb-2">
              46 Basic Katakana (カタカナ)
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
              {KATAKANA_DATA.basic.items.map((item) => (
                <div
                  key={item.char}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-center flex flex-col items-center justify-center space-y-1 hover:border-rose-500 transition"
                >
                  <span className="text-2xl sm:text-3xl font-black text-foreground font-serif">
                    {item.char}
                  </span>
                  <span className="text-[11px] font-bold text-rose-500 uppercase">
                    {item.romaji}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. JLPT N5 Kanji Cheat Sheet */}
        {activeTab === 'kanji' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-500 border-b border-border/40 pb-2">
              Most Frequently Used JLPT N5 Kanji
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { char: '一', on: 'イチ', kun: 'ひと', m: 'One' },
                { char: '二', on: 'ニ', kun: 'ふた', m: 'Two' },
                { char: '三', on: 'サン', kun: 'み', m: 'Three' },
                { char: '四', on: 'シ', kun: 'よん', m: 'Four' },
                { char: '五', on: 'ゴ', kun: 'いつ', m: 'Five' },
                { char: '六', on: 'ロク', kun: 'む', m: 'Six' },
                { char: '七', on: 'ナナ', kun: 'なな', m: 'Seven' },
                { char: '八', on: 'ハチ', kun: 'や', m: 'Eight' },
                { char: '九', on: 'キュウ', kun: 'ここの', m: 'Nine' },
                { char: '十', on: 'ジュウ', kun: 'とお', m: 'Ten' },
                { char: '百', on: 'ヒャク', kun: 'もも', m: 'Hundred' },
                { char: '千', on: 'セン', kun: 'ち', m: 'Thousand' },
                { char: '万', on: 'マン', kun: 'よろず', m: 'Ten Thousand' },
                { char: '円', on: 'エン', kun: 'まる', m: 'Yen / Circle' },
                { char: '日', on: 'ニチ', kun: 'ひ', m: 'Sun / Day' },
                { char: '月', on: 'ゲツ', kun: 'つき', m: 'Moon / Month' },
                { char: '火', on: 'カ', kun: 'ひ', m: 'Fire' },
                { char: '水', on: 'スイ', kun: 'みず', m: 'Water' },
                { char: '木', on: 'モク', kun: 'き', m: 'Tree / Wood' },
                { char: '金', on: 'キン', kun: 'かね', m: 'Gold / Money' },
                { char: '土', on: 'ド', kun: 'つち', m: 'Earth / Soil' },
                { char: '山', on: 'サン', kun: 'やま', m: 'Mountain' },
                { char: '川', on: 'セン', kun: 'かわ', m: 'River' },
                { char: '田', on: 'デン', kun: 'た', m: 'Rice Field' },
                { char: '人', on: 'ジン', kun: 'ひと', m: 'Person' },
                { char: '子', on: 'シ', kun: 'こ', m: 'Child' },
                { char: '女', on: 'ジョ', kun: 'おんな', m: 'Woman' },
                { char: '男', on: 'ダン', kun: 'おとこ', m: 'Man' },
                { char: '目', on: 'モク', kun: 'め', m: 'Eye' },
                { char: '口', on: 'コウ', kun: 'くち', m: 'Mouth' },
                { char: '耳', on: 'ジ', kun: 'みみ', m: 'Ear' },
                { char: '手', on: 'シュ', kun: 'て', m: 'Hand' },
                { char: '足', on: 'ソク', kun: 'あし', m: 'Foot / Leg' },
                { char: '力', on: 'リョク', kun: 'ちから', m: 'Power' },
                { char: '父', on: 'フ', kun: 'ちち', m: 'Father' },
                { char: '母', on: 'ボ', kun: 'はは', m: 'Mother' },
              ].map((k) => (
                <div
                  key={k.char}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-center flex flex-col justify-between space-y-1 hover:border-indigo-500 transition"
                >
                  <span className="text-3xl font-black text-foreground font-serif">{k.char}</span>
                  <div className="text-xs font-bold text-foreground">{k.m}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {k.on} · {k.kun}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Printable Footer */}
        <div className="mt-8 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
          Good luck with your Japanese journey! 🌸 がんばってください！
        </div>
      </div>
    </div>
  )
}
