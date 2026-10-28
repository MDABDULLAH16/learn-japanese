'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Moon,
  Sun,
  BookOpen,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Languages,
  Award,
  ChevronDown,
  BookA,
  Mic,
  PenTool,
  GraduationCap,
  PlayCircle,
  Lock,
  Heart,
  Keyboard,
  FileText,
  Search,
} from 'lucide-react'
import { SearchModal } from '@/components/search/SearchModal'
import { Button } from '@/components/ui/button'
import { handleSignOut, recordVisit } from '@/lib/auth-actions'
import type { Session } from 'next-auth'

const SUPER_ADMIN_EMAILS = ['abdullahwebdev15@gmail.com', 'abdullahwebdev15@gamil.com']

interface LearnSection {
  title: string
  description: string
  href: string
  icon: any
  badge?: string
  isPublic?: boolean
}

const LEARN_SECTIONS: LearnSection[] = [
  {
    title: 'Alphabet Grid',
    description: 'Hiragana & Katakana with audio',
    href: '/alphabet',
    icon: BookA,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Speech Practice',
    description: 'Practice pronunciation with mic',
    href: '/alphabet-speech',
    icon: Mic,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Handwriting Canvas',
    description: 'Draw Kana with stroke guide',
    href: '/practice-writing',
    icon: PenTool,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Essential Phrases',
    description: 'Anime, travel & daily Japanese',
    href: '/phrases',
    icon: Heart,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Romaji Converter',
    description: 'Instant Romaji to Kana typist',
    href: '/converter',
    icon: Keyboard,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Printable Cheat Sheets',
    description: 'Printable PDF charts for wall/study',
    href: '/cheat-sheets',
    icon: FileText,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Kanji Library',
    description: 'JLPT N5–N1 stroke orders & radicals',
    href: '/kanji',
    icon: Languages,
    badge: 'Preview',
    isPublic: true,
  },
  {
    title: 'Kanji Flashcards',
    description: '3D flashcards for meanings & readings',
    href: '/kanji-practice',
    icon: PenTool,
  },
  {
    title: 'Vocabulary Library',
    description: '10,000+ words with audio & recap',
    href: '/vocabulary',
    icon: BookOpen,
    badge: 'Preview',
    isPublic: true,
  },
  {
    title: 'Vocabulary Quiz',
    description: 'Spaced repetition multiple choice drills',
    href: '/vocabulary-quiz',
    icon: Award,
  },
  {
    title: 'Reading Practice',
    description: 'Read Japanese words aloud with AI check',
    href: '/reading',
    icon: GraduationCap,
  },
  {
    title: 'Comprehensive Quiz',
    description: 'Test your kana and words for XP',
    href: '/quiz',
    icon: PlayCircle,
    badge: 'Free',
    isPublic: true,
  },
  {
    title: 'Smart Search',
    description: 'Find words & Kanji with Romaji/Bangla',
    href: '/search',
    icon: Search,
    badge: 'New',
    isPublic: true,
  },
]

export function HeaderClient({ session }: { session: Session | null }) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [learnDropdownOpen, setLearnDropdownOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Listen for Ctrl+K / Cmd+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen((prev) => !prev)
      }
    }
    const handleOpenModal = () => setSearchModalOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open_search_modal', handleOpenModal)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open_search_modal', handleOpenModal)
    }
  }, [])

  // Record site visit once per day/session
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const storageKey = `lj_visit_${today}`
      if (!sessionStorage.getItem(storageKey)) {
        recordVisit(pathname)
        sessionStorage.setItem(storageKey, '1')
      }
    } catch {
      // Ignore sessionStorage errors in restricted modes
    }
  }, [pathname])

  // Close dropdown on outside click or route change
  useEffect(() => {
    setLearnDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLearnDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const user = session?.user
  const userEmail = user?.email?.toLowerCase().trim() || ''
  const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || isSuperAdminEmail
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin

  const onSignOut = async () => {
    try {
      await handleSignOut()
    } catch {
      // Ignore
    }
    window.location.href = '/'
  }

  const isAlphabetActive = pathname.startsWith('/alphabet')
  const isDashboardActive = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const isLearnActive =
    LEARN_SECTIONS.some((sec) => pathname.startsWith(sec.href)) && !isAlphabetActive

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6 md:px-8 transition-colors">
      <div className="flex h-16 items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl text-foreground hover:opacity-90 transition shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              日
            </div>
            <div className="flex flex-col">
              <span className="tracking-tight leading-tight font-black">Learn Japanese</span>
              <span className="text-[10px] text-muted-foreground font-medium leading-none">
                日本語を学ぼう
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Alphabet, Learn [dropdown], Dashboard) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* 1. Alphabet */}
            <Link
              href="/alphabet"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isAlphabetActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              <BookA className="w-4 h-4" />
              <span>Alphabet</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            </Link>

            {/* 2. Learn (Dropdown Menu with all sections) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLearnDropdownOpen(!learnDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isLearnActive || learnDropdownOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                }`}
                aria-expanded={learnDropdownOpen}
              >
                <BookOpen className="w-4 h-4" />
                <span>Learn</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    learnDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Flyout Dropdown Menu */}
              {learnDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[540px] p-3 rounded-3xl bg-card/95 border border-border/80 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50 max-h-[80vh] overflow-y-auto">
                  <div className="px-3 py-2 border-b border-border/60 mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      All Learning Modules & Tools
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Structured JLPT Platform
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {LEARN_SECTIONS.map((sec) => {
                      const Icon = sec.icon
                      const isActive = pathname.startsWith(sec.href)
                      return (
                        <Link
                          key={sec.href}
                          href={sec.href}
                          onClick={() => setLearnDropdownOpen(false)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl transition ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'hover:bg-accent/80 text-foreground'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-muted text-foreground shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold leading-tight truncate">
                                {sec.title}
                              </span>
                              {sec.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                  {sec.badge}
                                </span>
                              )}
                              {!user && !sec.isPublic && (
                                <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                              {sec.description}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isDashboardActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Quick Search, Login / User info, Dark Mode toggle, Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Search Button (Desktop) */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer shadow-2xs group"
            title="Search Vocabulary & Kanji (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition" />
            <span className="hidden lg:inline text-xs">Search vocab & kanji...</span>
            <span className="inline lg:hidden text-xs">Search</span>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Quick Search Icon (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchModalOpen(true)}
            className="sm:hidden rounded-xl shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 text-primary" />
          </Button>

          {/* Unauthenticated: Login Button */}
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition shadow-sm active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          ) : (
            /* Authenticated: User name + Sign Out */
            <div className="flex items-center gap-2 pl-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold leading-tight text-foreground truncate max-w-[120px]">
                  {user.name || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {isSuperAdmin ? 'Super Admin' : user.role?.toLowerCase() || 'Learner'}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                className="rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer h-9 w-9"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Dark Mode Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl shrink-0 h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/80 py-4 px-3 space-y-3 bg-background/98 backdrop-blur max-h-[85vh] overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-1">
            <Link
              href="/alphabet"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent"
            >
              <div className="flex items-center gap-2.5">
                <BookA className="w-4 h-4 text-primary" />
                <span>Alphabet (Hiragana & Katakana)</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Free
              </span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Learn Subsections */}
          <div className="pt-2 border-t border-border/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 block mb-1">
              Learn Modules & Tools
            </span>
            <div className="grid grid-cols-1 gap-1">
              {LEARN_SECTIONS.map((sec) => {
                const Icon = sec.icon
                return (
                  <Link
                    key={sec.href}
                    href={sec.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-accent/80 text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span>{sec.title}</span>
                    </div>
                    {sec.badge ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        {sec.badge}
                      </span>
                    ) : (
                      !user && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          <span>Login</span>
                        </span>
                      )
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User / Login Bottom Area */}
          <div className="pt-3 border-t border-border/60">
            {user ? (
              <div className="flex items-center justify-between px-2 py-1">
                <div>
                  <div className="text-sm font-bold text-foreground">{user.name || user.email}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {isSuperAdmin ? 'Super Admin' : user.role?.toLowerCase() || 'Learner'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Global Spotlight Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  )
}
