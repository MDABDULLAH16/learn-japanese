'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markItemLearned, markAllLearned } from '@/lib/actions'
import { ArrowLeft, CheckCircle2, Volume2, Lightbulb, CheckCheck, ChevronDown, ChevronUp, Settings2, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { HIRAGANA_DATA, KATAKANA_DATA, Character, AlphabetCategory } from '@/lib/alphabetData'
import confetti from 'canvas-confetti'

export function AlphabetClient({ userId, completedIds }: { userId: string, completedIds: string[] }) {
  const [activeScript, setActiveScript] = useState<'hiragana' | 'katakana'>('hiragana')
  const [activeCategory, setActiveCategory] = useState<'basic' | 'dakuten' | 'yoon'>('basic')
  const [selectedChar, setSelectedChar] = useState<Character | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const [voiceType, setVoiceType] = useState<'female' | 'male'>('female')
  const [speechRate, setSpeechRate] = useState<number>(1)
  const [volume, setVolume] = useState<number>(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'))
      setVoices(availableVoices)
    }
    
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const scriptData = activeScript === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA
  const categoryData: AlphabetCategory = scriptData[activeCategory]

  const getSelectedVoice = (gender: 'female' | 'male') => {
    if (voices.length === 0) return null;
    
    if (selectedVoiceName) {
      const explicitVoice = voices.find(v => v.name === selectedVoiceName)
      if (explicitVoice) return explicitVoice
    }
    
    if (gender === 'male') {
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('ichiro') || 
        v.name.toLowerCase().includes('otoya') ||
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('keita') 
      )
      return maleVoice || voices[0]
    } else {
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('ayumi') || 
        v.name.toLowerCase().includes('haruka') || 
        v.name.toLowerCase().includes('kyoko') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('nanami')
      )
      return femaleVoice || voices[0]
    }
  }

  const playPronunciation = (char: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(char)
    utterance.lang = 'ja-JP'
    utterance.rate = speechRate
    utterance.volume = volume

    const selectedVoice = getSelectedVoice(voiceType)
    if (selectedVoice) {
      utterance.voice = selectedVoice
      if (!selectedVoiceName && voiceType === 'male' && !selectedVoice.name.toLowerCase().match(/(ichiro|otoya|male|keita)/)) {
        utterance.pitch = 0.5
      } else if (!selectedVoiceName && voiceType === 'female') {
        utterance.pitch = 1.2
      } else {
        utterance.pitch = 1
      }
    } else {
      utterance.pitch = voiceType === 'male' ? 0.5 : 1.2
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleCharClick = (charData: Character) => {
    if (!charData.char) return
    setSelectedChar(charData)
    setShowHint(false)
    playPronunciation(charData.char)
  }

  const handleClose = () => {
    setSelectedChar(null)
    setIsMobilePlayerExpanded(false)
    setShowVoiceSettings(false)
  }

  const markLearned = () => {
    if (!selectedChar) return
    const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}` 
    
    startTransition(async () => {
      await markItemLearned(userId, itemId, activeScript)
      
      const currentIndex = categoryData.items.findIndex(i => i.char === selectedChar.char)
      let nextIndex = currentIndex + 1
      while(nextIndex < categoryData.items.length && !categoryData.items[nextIndex].char) {
        nextIndex++;
      }
      
      if (nextIndex < categoryData.items.length) {
        const nextChar = categoryData.items[nextIndex]
        setSelectedChar(nextChar)
        setShowHint(false)
        playPronunciation(nextChar.char)
      } else {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        handleClose()
      }
    })
  }

  const handleMarkAll = () => {
    const idsToMark = categoryData.items
      .filter(i => i.char !== '')
      .map(i => `${activeScript}-${i.romaji}-${i.char}`)
    
    startTransition(async () => {
      await markAllLearned(userId, idsToMark, activeScript)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } })
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-12 pb-24 md:pb-12 px-4 sm:px-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Button onClick={handleMarkAll} disabled={isPending} variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950">
          <CheckCheck className="mr-2 h-4 w-4" /> Mark All in {categoryData.title} as Learned
        </Button>
      </div>
      
      {/* Script Selection */}
      <div className="flex gap-4 border-b pb-4">
        <Button 
          variant={activeScript === 'hiragana' ? 'default' : 'secondary'} 
          onClick={() => { setActiveScript('hiragana'); handleClose(); }}
          className="text-lg"
        >
          Hiragana (ひらがな)
        </Button>
        <Button 
          variant={activeScript === 'katakana' ? 'default' : 'secondary'} 
          onClick={() => { setActiveScript('katakana'); handleClose(); }}
          className="text-lg"
        >
          Katakana (カタカナ)
        </Button>
      </div>

      {/* Category Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'basic' ? 'default' : 'outline'} onClick={() => { setActiveCategory('basic'); handleClose(); }}>Basic</Button>
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'dakuten' ? 'default' : 'outline'} onClick={() => { setActiveCategory('dakuten'); handleClose(); }}>Dakuten ( ゛゜)</Button>
        <Button size="sm" className="whitespace-nowrap flex-shrink-0" variant={activeCategory === 'yoon' ? 'default' : 'outline'} onClick={() => { setActiveCategory('yoon'); handleClose(); }}>Yoon (ゃゅょ)</Button>
      </div>

      {/* Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative items-start">
        
        {/* Alphabet Grid (Constrained max-width to avoid huge buttons on large screens) */}
        <div className="flex-1 w-full max-w-[700px] mx-auto md:mx-0">
          <div className={`grid gap-3 lg:gap-4 ${activeCategory === 'yoon' ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5' : 'grid-cols-5'}`}>
            {categoryData.items.map((item, idx) => {
              if (!item.char) return <div key={idx} className="aspect-square"></div>
              
              const itemId = `${activeScript}-${item.romaji}-${item.char}`
              const isLearned = completedIds.includes(itemId)
              const isSelected = selectedChar?.char === item.char

              return (
                <button
                  key={idx}
                  onClick={() => handleCharClick(item)}
                  className={`
                    aspect-square rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-medium transition-all
                    hover:scale-105 active:scale-95 border-2 shadow-sm relative overflow-hidden
                    ${isSelected ? 'border-primary ring-4 ring-primary/30 bg-primary/10 z-10 scale-110 shadow-lg' : 'border-border bg-card hover:border-primary/50'}
                    ${isLearned && !isSelected ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/50 text-green-700 dark:text-green-400' : ''}
                    ${activeCategory === 'yoon' ? 'aspect-auto py-5 text-3xl' : ''}
                  `}
                >
                  <span className="relative z-10">{item.char}</span>
                  {isLearned && <CheckCircle2 className={`absolute top-2 right-2 text-green-500/80 ${activeCategory === 'yoon' ? 'w-4 h-4' : 'w-5 h-5'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* DESKTOP PANEL - MINIMALISTIC */}
        {selectedChar && (
          <div className="hidden md:block w-[320px] lg:w-[340px] sticky top-8 shrink-0">
            <div className="bg-card border-2 border-primary/20 shadow-xl shadow-primary/5 rounded-3xl p-6 relative">
              <Button variant="ghost" size="icon" className="absolute right-3 top-3 hover:bg-muted rounded-full" onClick={handleClose}>
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              <div className="text-center pt-2 pb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Now Learning</span>
                <div className="text-[100px] font-black text-primary leading-none mb-2 drop-shadow-sm">
                  {selectedChar.char}
                </div>
                <div className="text-3xl font-light text-muted-foreground lowercase">
                  {selectedChar.romaji}
                </div>
              </div>
              
              {/* Controls Row */}
              <div className="flex items-center justify-center gap-4 py-4 border-y border-border/50 mb-4">
                <Button 
                  variant={showHint ? "secondary" : "ghost"} 
                  size="icon" 
                  className={`w-12 h-12 rounded-full transition-colors ${showHint ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' : 'text-muted-foreground hover:bg-muted'}`}
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-6 h-6" />
                </Button>

                <Button 
                  variant="default" 
                  size="icon" 
                  className="w-16 h-16 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                  onClick={() => playPronunciation(selectedChar.char)}
                >
                  <Volume2 className="w-7 h-7 ml-1" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setShowVoiceSettings(true)}
                >
                  <Settings2 className="w-6 h-6" />
                </Button>
              </div>

              {/* Hint Area */}
              {showHint && (
                <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 p-3 text-sm font-medium text-center rounded-xl animate-in fade-in zoom-in-95">
                  {selectedChar.hint || "No visual hint available. Try breaking it down!"}
                </div>
              )}

              {/* Mark Button */}
              {(() => {
                const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}`
                const isLearned = completedIds.includes(itemId)
                
                return (
                  <Button 
                    variant={isLearned ? "secondary" : "default"}
                    size="lg"
                    className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 ${isLearned ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50' : ''}`}
                    onClick={markLearned}
                    disabled={isPending || isLearned}
                  >
                    {isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</>
                    ) : isLearned ? (
                      <><CheckCircle2 className="mr-2 h-5 w-5 text-green-600 dark:text-green-500" /> Learned!</>
                    ) : (
                      'Mark as Learned'
                    )}
                  </Button>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE PLAYER */}
      <div className="md:hidden">
        {selectedChar && (
          <>
            {/* FULL SCREEN PLAYER */}
            {isMobilePlayerExpanded && (
              <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-bottom-full duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b flex-none">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobilePlayerExpanded(false)}>
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now Learning</span>
                  <Button variant="ghost" size="icon" onClick={() => setShowVoiceSettings(true)}>
                    <Settings2 className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col px-6 pt-6 pb-0 overflow-hidden relative">
                  
                  {/* Big Character + Inline Controls */}
                  <div className="flex-none flex flex-col items-center justify-center pt-2 pb-2">
                    <div className="text-[120px] font-black text-primary drop-shadow-sm leading-none mb-6">
                      {selectedChar.char}
                    </div>
                    
                    {/* Inline Actions Row (Hint, Romaji, Play) */}
                    <div className="flex items-center justify-center gap-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`w-12 h-12 rounded-full transition-colors ${showHint ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' : 'text-muted-foreground hover:bg-muted'}`}
                        onClick={() => setShowHint(!showHint)}
                      >
                        <Lightbulb className="w-6 h-6" />
                      </Button>

                      <div className="text-5xl font-light text-muted-foreground lowercase min-w-[4rem] text-center">
                        {selectedChar.romaji}
                      </div>

                      <Button 
                        variant="default" 
                        size="icon" 
                        className="w-12 h-12 rounded-full shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
                        onClick={() => playPronunciation(selectedChar.char)}
                      >
                        <Volume2 className="w-6 h-6 ml-0.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Hint Text Area */}
                  {showHint && (
                    <div className="flex-none flex items-start justify-center pt-2 pb-2">
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center animate-in fade-in slide-in-from-bottom-2 font-medium px-4">
                        {selectedChar.hint || "No visual hint available. Try breaking it down!"}
                      </p>
                    </div>
                  )}

                  {/* Vertical Grid (Scrollable area) */}
                  <div className="flex-1 flex flex-col w-full mt-4 -mx-2 px-2 overflow-hidden">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-1 flex-none">Up Next</div>
                    <div className={`grid gap-2 overflow-y-auto scrollbar-hide pb-4 flex-1 content-start ${activeCategory === 'yoon' ? 'grid-cols-3' : 'grid-cols-5'}`}>
                      {categoryData.items.map((item, idx) => {
                        if (!item.char) return <div key={idx} className="aspect-square"></div>
                        
                        const itemId = `${activeScript}-${item.romaji}-${item.char}`
                        const isLearned = completedIds.includes(itemId)
                        const isSelected = selectedChar?.char === item.char

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedChar(item)
                              setShowHint(false)
                              playPronunciation(item.char)
                            }}
                            className={`
                              relative aspect-square rounded-xl flex items-center justify-center text-2xl font-medium transition-all
                              ${isSelected ? 'bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary/30 z-10' : 'bg-card border shadow-sm hover:border-primary'}
                              ${isLearned && !isSelected ? 'opacity-70 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20' : ''}
                            `}
                          >
                            <span className="relative z-10">{item.char}</span>
                            {isLearned && !isSelected && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-green-500" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Mark as Learned (Bottom Fixed) */}
                  <div className="flex-none pt-4 pb-6 mt-2">
                    {(() => {
                      const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}`
                      const isLearned = completedIds.includes(itemId)
                      
                      return (
                        <Button 
                          variant={isLearned ? "secondary" : "default"}
                          size="lg"
                          className={`w-full h-16 text-xl font-bold rounded-2xl transition-all duration-300 ${isLearned ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                          onClick={markLearned}
                          disabled={isPending || isLearned}
                        >
                          {isPending ? (
                             <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Saving...</>
                          ) : isLearned ? (
                            <><CheckCircle2 className="mr-3 h-7 w-7 text-green-600 dark:text-green-500" /> Learned!</>
                          ) : (
                            'Mark as Learned'
                          )}
                        </Button>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* COMPACT MINI-BAR */}
            {!isMobilePlayerExpanded && (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.15)] pb-safe animate-in slide-in-from-bottom-full duration-300">
                <div className="p-2 px-4 flex items-center gap-2">
                  
                  {/* Clickable Area to Expand */}
                  <div className="flex-1 flex items-center gap-3 py-2 cursor-pointer" onClick={() => setIsMobilePlayerExpanded(true)}>
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl relative overflow-hidden group">
                      <span className="text-3xl font-black text-primary leading-none group-active:scale-95 transition-transform">{selectedChar.char}</span>
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                        <ChevronUp className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground uppercase tracking-wider">{selectedChar.romaji}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center mt-0.5">
                        Expand <ChevronUp className="w-3 h-3 ml-0.5 opacity-70" />
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full w-12 h-12 bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); playPronunciation(selectedChar.char); }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                    
                    {(() => {
                      const itemId = `${activeScript}-${selectedChar.romaji}-${selectedChar.char}`
                      const isLearned = completedIds.includes(itemId)
                      
                      return (
                        <Button 
                          variant={isLearned ? "secondary" : "default"}
                          size="sm"
                          className={`rounded-full h-12 px-5 font-bold transition-all text-sm flex-shrink-0 ${isLearned ? 'bg-green-100 text-green-700' : ''}`}
                          onClick={(e) => { e.stopPropagation(); markLearned(); }}
                          disabled={isPending || isLearned}
                        >
                          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                           isLearned ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : 
                           'Mark'}
                        </Button>
                      )
                    })()}
                    
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full ml-1 flex-shrink-0 text-muted-foreground hover:bg-muted" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* GLOBAL VOICE SETTINGS MODAL (Used by both Desktop and Mobile) */}
      {showVoiceSettings && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center md:items-center justify-center items-end animate-in fade-in" onClick={() => setShowVoiceSettings(false)}>
          <div 
            className="bg-card w-full max-w-md md:rounded-3xl rounded-t-3xl border shadow-2xl p-6 pb-8 md:pb-6 animate-in md:zoom-in-95 slide-in-from-bottom-full md:slide-in-from-bottom-0 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Settings2 className="w-5 h-5"/> Voice Settings</h3>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted hover:bg-muted/80" onClick={() => setShowVoiceSettings(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Voice Type</label>
                <div className="flex gap-2">
                  <Button size="lg" variant={voiceType === 'female' ? 'default' : 'outline'} className="flex-1" onClick={() => { setVoiceType('female'); setSelectedVoiceName(''); }}>Female</Button>
                  <Button size="lg" variant={voiceType === 'male' ? 'default' : 'outline'} className="flex-1" onClick={() => { setVoiceType('male'); setSelectedVoiceName(''); }}>Male</Button>
                </div>
              </div>

              {voices.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Device Voices</label>
                  <select 
                    className="w-full text-sm border rounded-xl p-4 bg-background text-foreground"
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                  >
                    <option value="">Auto-select (Based on Type)</option>
                    {voices.map(v => (
                      <option key={v.name} value={v.name}>{v.name} {v.localService ? '(Local)' : '(Online)'}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Speed</label>
                <div className="flex gap-2">
                  <Button size="lg" variant={speechRate === 0.5 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(0.5)}>Slow</Button>
                  <Button size="lg" variant={speechRate === 1 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(1)}>Normal</Button>
                  <Button size="lg" variant={speechRate === 1.5 ? 'default' : 'outline'} className="flex-1" onClick={() => setSpeechRate(1.5)}>Fast</Button>
                </div>
              </div>

              <div className="space-y-3 pb-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volume</label>
                  <span className="text-sm font-bold text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
