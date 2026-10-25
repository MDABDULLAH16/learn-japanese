export const instant = false

import Link from 'next/link'
import {
  BookA,
  Sparkles,
  ArrowRight,
  Languages,
  PenTool,
  Trophy,
  Mic,
  GraduationCap,
  PlayCircle,
  Volume2,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Compass,
  Layers,
  Heart,
  Star,
  Sparkle,
} from 'lucide-react'
import { InteractiveHeroExplorer } from '@/components/home/InteractiveHeroExplorer'
import { KanaMiniQuiz } from '@/components/home/KanaMiniQuiz'
import { FloatingJapaneseLetters } from '@/components/home/FloatingJapaneseLetters'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH FLYING JAPANESE LETTERS */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-border/40 bg-gradient-to-b from-background via-card/30 to-background">
        {/* Dynamic Flying & Drifting Japanese Letters */}
        <FloatingJapaneseLetters />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-12 relative z-10">
          {/* Main Hero Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold tracking-wide border border-primary/20 shadow-sm animate-in fade-in duration-500">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>🌸 100% Free Hiragana & Katakana · JLPT N5 to N1 Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              Master Japanese from Zero to Fluency —{' '}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-rose-500 bg-clip-text text-transparent">
                Confidently.
              </span>
            </h1>

            <div className="inline-block px-3 py-1 rounded-md bg-muted/60 text-xs sm:text-sm font-medium text-muted-foreground font-serif">
              千里の道も一歩から · A journey of a thousand miles begins with a single step
            </div>

            <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed">
              The modern, all-in-one Japanese learning suite. Learn the 46 Kana characters for free
              with crystal-clear audio, memorize 2,000+ Kanji with stroke order, and conquer 10,000+
              JLPT vocabulary words with smart spaced repetition.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/alphabet"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition text-sm sm:text-base"
              >
                <BookA className="w-5 h-5" />
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-input bg-card/80 hover:bg-accent hover:border-primary/40 font-semibold transition text-sm sm:text-base shadow-sm backdrop-blur"
              >
                <span>Study Dashboard</span>
                <Compass className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>

            {/* Interactive hint */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground/80 bg-muted/40 px-3 py-1 rounded-full border border-border/40">
                <Sparkle className="w-3 h-3 text-amber-500" />
                <span>
                  Hover or tap any floating character above to discover its meaning & audio!
                </span>
              </span>
            </div>

            {/* Micro Trust Points */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Hiragana & Katakana
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Native Audio Pronunciation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Spaced Repetition (SRS)
              </span>
            </div>
          </div>

          {/* Interactive Character Explorer right on the Homepage */}
          <div className="max-w-4xl mx-auto">
            <InteractiveHeroExplorer />
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="border-b border-border/50 bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-card/50 border border-border/40">
              <div className="text-3xl sm:text-4xl font-black text-primary">46+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Kana with Native Audio
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/40">
              <div className="text-3xl sm:text-4xl font-black text-indigo-500">2,136+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Jōyō Kanji Covered
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/40">
              <div className="text-3xl sm:text-4xl font-black text-emerald-500">10,000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                JLPT Vocabulary Words
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card/50 border border-border/40">
              <div className="text-3xl sm:text-4xl font-black text-amber-500">N5 → N1</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                Complete JLPT Levels
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE MINI-QUIZ & PRACTICE WIDGET */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>Try It Yourself</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Can You Recognize These Characters?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Take a test right now in your browser. No sign-up required to test your memory!
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <KanaMiniQuiz />
        </div>
      </section>

      {/* 4. THE 6 PILLARS / CURRICULUM OVERVIEW */}
      <section id="curriculum" className="py-16 md:py-24 border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide border border-primary/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Comprehensive Curriculum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything You Need to Master Japanese
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A structured roadmap crafted for beginners up to advanced JLPT N1 test-takers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Alphabet */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  あ
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  100% Free
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Hiragana & Katakana</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Learn the 46 foundation characters of Japanese with interactive grids, stroke order
                hints, dakuten, combination sounds, and real native pronunciation.
              </p>
              <Link
                href="/alphabet"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Explore Alphabet Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Speech Practice */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  100% Free
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Speech & Pronunciation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Train your speaking muscle. Speak Japanese characters and words directly into your
                microphone and get instant accuracy feedback using voice recognition.
              </p>
              <Link
                href="/alphabet-speech"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline pt-2"
              >
                <span>Launch Speech Trainer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Kanji Library */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  漢
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  JLPT N5–N1
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Kanji Mastery & Radicals</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Over 2,000 Jōyō Kanji organized by JLPT level. Includes Kunyomi, Onyomi, stroke
                order diagrams, common compounds, and interactive 3D flashcards.
              </p>
              <Link
                href="/kanji"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
              >
                <span>Browse Kanji Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Vocabulary Library */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Languages className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  10,000+ Words
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Vocabulary & Spaced Repetition</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Curated vocabulary lists with audio pronunciation, Bengali and English definitions,
                and a personal Recap Whitelist that schedules smart revision drills.
              </p>
              <Link
                href="/vocabulary"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
              >
                <span>Explore Vocabulary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Reading Practice */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  Aloud Practice
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Graded Reading Practice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transition from isolated characters to reading authentic Japanese phrases and
                sentences. Toggle furigana on and off as your confidence grows.
              </p>
              <Link
                href="/reading"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2"
              >
                <span>Practice Reading Aloud</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. Smart Testing & Streaks */}
            <div className="p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  XP & Streaks
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Quizzes & Habit Streaks</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build a daily Japanese learning habit. Earn XP, maintain your consecutive day
                streak, and challenge yourself with randomized multiple-choice tests.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline pt-2"
              >
                <span>Take a Daily Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 100% FREE COMMUNITY TOOLS */}
      <section className="py-16 md:py-20 border-t border-border/50 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-wide border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Community Toolkit</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Powerful Free Tools for Every Learner
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              No account required. Practice your handwriting, learn anime phrases, type in kana, or
              print reference charts.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Handwriting Practice */}
            <Link href="/practice-writing" className="block group">
              <div className="h-full p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Handwriting Canvas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Draw Hiragana & Katakana with calligraphy quadrant guides and ghost watermarks on
                  touch or mouse.
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-2">
                  <span>Start Drawing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* 2. Essential Phrases */}
            <Link href="/phrases" className="block group">
              <div className="h-full p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Essential Phrases
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anime quotes, dining out, greetings, and travel emergency expressions with native
                  audio & Bengali notes.
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 pt-2">
                  <span>Explore Phrases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* 3. Romaji Converter */}
            <Link href="/converter" className="block group">
              <div className="h-full p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookA className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Romaji to Kana
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time converter. Type English letters like &quot;arigatou&quot; and watch it
                  turn into Hiragana and Katakana.
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 pt-2">
                  <span>Launch Converter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* 4. Printable Cheat Sheets */}
            <Link href="/cheat-sheets" className="block group">
              <div className="h-full p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Printable Charts
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-res Hiragana, Katakana, and JLPT N5 Kanji charts formatted for 1-click
                  printing or saving to PDF.
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                  <span>Download / Print</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. JLPT ROADMAP */}
      <section className="py-16 md:py-20 border-t border-border/50 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide border border-indigo-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Japanese Language Proficiency Test</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The JLPT Roadmap</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Clear milestones designed to take you from total beginner to complete professional
            fluency.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {/* N5 */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-center relative">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              Beginner
            </span>
            <div className="text-3xl font-black text-foreground">JLPT N5</div>
            <div className="text-xs text-muted-foreground">~100 Kanji · 800 Vocab</div>
            <p className="text-xs text-muted-foreground pt-2">
              Understand basic Japanese phrases, greetings, and simple daily conversations.
            </p>
          </div>

          {/* N4 */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-center relative">
            <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">
              Elementary
            </span>
            <div className="text-3xl font-black text-foreground">JLPT N4</div>
            <div className="text-xs text-muted-foreground">~300 Kanji · 1,500 Vocab</div>
            <p className="text-xs text-muted-foreground pt-2">
              Follow everyday conversations spoken slowly and read short passages on familiar
              topics.
            </p>
          </div>

          {/* N3 */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-center relative">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
              Intermediate
            </span>
            <div className="text-3xl font-black text-foreground">JLPT N3</div>
            <div className="text-xs text-muted-foreground">~650 Kanji · 3,750 Vocab</div>
            <p className="text-xs text-muted-foreground pt-2">
              The bridge to fluency. Read newspaper headlines and converse naturally in daily life.
            </p>
          </div>

          {/* N2 */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-center relative">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
              Pre-Advanced
            </span>
            <div className="text-3xl font-black text-foreground">JLPT N2</div>
            <div className="text-xs text-muted-foreground">~1,000 Kanji · 6,000 Vocab</div>
            <p className="text-xs text-muted-foreground pt-2">
              Required for employment and universities in Japan. Comprehend complex articles and
              business Japanese.
            </p>
          </div>

          {/* N1 */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-center relative">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Mastery
            </span>
            <div className="text-3xl font-black text-foreground">JLPT N1</div>
            <div className="text-xs text-muted-foreground">~2,000+ Kanji · 10,000+ Vocab</div>
            <p className="text-xs text-muted-foreground pt-2">
              Native-level reading, nuanced expressions, academic papers, and advanced literature.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER WITH FLOATING CHARACTERS */}
      <section className="relative overflow-hidden py-16 md:py-20 border-t border-border/50 bg-gradient-to-b from-card/40 via-primary/5 to-background">
        <FloatingJapaneseLetters />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Start Your Japanese Adventure Today
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Join thousands of learners mastering Japanese step by step. No credit card, no paywalls
            for foundational kana — start right now!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/alphabet"
              className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm sm:text-base hover:bg-primary/90 transition shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95"
            >
              Start Free with Hiragana
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl border border-input bg-card hover:bg-accent font-semibold text-sm sm:text-base transition shadow-sm"
            >
              Sign In to Save Progress
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-border/60 py-10 bg-background text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <BookA className="w-5 h-5 text-primary" />
            <span>Learn Japanese (日本語)</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/alphabet" className="hover:text-foreground transition">
              Alphabet
            </Link>
            <Link href="/kanji" className="hover:text-foreground transition">
              Kanji
            </Link>
            <Link href="/vocabulary" className="hover:text-foreground transition">
              Vocabulary
            </Link>
            <Link href="/quiz" className="hover:text-foreground transition">
              Quiz
            </Link>
            <Link href="/reading" className="hover:text-foreground transition">
              Reading
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition">
              Dashboard
            </Link>
          </div>

          <div className="text-xs text-muted-foreground text-center sm:text-right">
            © 2026 Learn Japanese. Crafted for passionate learners.
          </div>
        </div>
      </footer>
    </div>
  )
}
