'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, Download } from 'lucide-react'

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[SW] Registered successfully:', registration.scope)

            // Auto-check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log('[SW] New version available.')
                  }
                }
              }
            }
          })
          .catch((err) => {
            console.warn('[SW] Registration failed:', err)
          })
      }

      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }
    }

    // 2. Online / Offline status monitoring
    setIsOffline(!navigator.onLine)

    const handleOffline = () => {
      setIsOffline(true)
      setShowReconnected(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3500)
      return () => clearTimeout(timer)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    // 3. PWA Install Prompt Listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false)
      setInstallPrompt(null)
    }
  }

  return (
    <>
      {/* Offline Status Pill Notification */}
      {isOffline && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-800/95 text-white border border-amber-500/40 shadow-xl shadow-black/30 backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>⚡ অফলাইন মোড সক্রিয় — লেসন ও কুইজ পড়তে থাকুন!</span>
        </div>
      )}

      {/* Online Reconnection Notification */}
      {showReconnected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 shadow-xl shadow-black/30 backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ইন্টারনেট পুনরায় সংযুক্ত হয়েছে</span>
        </div>
      )}

      {/* Optional PWA Install Prompt for Mobile & Desktop */}
      {showInstallBanner && !isOffline && (
        <aside
          aria-label="Install App banner"
          className="fixed bottom-4 right-4 z-40 max-w-xs p-3 rounded-2xl bg-card/95 backdrop-blur-md border border-primary/20 shadow-xl shadow-black/20 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black">
              🇯🇵
            </div>
            <div>
              <p className="font-bold text-foreground">অফলাইনে পড়তে চান?</p>
              <p className="text-[11px] text-muted-foreground">অ্যাপটি ফোনে ইনস্টল করে নিন</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1 hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>ইনস্টল</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="px-2 py-1 text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
