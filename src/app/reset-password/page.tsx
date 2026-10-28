'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { resetPasswordWithToken } from '@/lib/auth-actions'
import { KeyRound, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenFromUrl = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenFromUrl)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!token.trim()) {
      setError('Missing reset token. Please request a new reset link.')
      return
    }

    setIsLoading(true)

    try {
      const res = await resetPasswordWithToken(token.trim(), newPassword)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(res.message || 'Password reset successfully!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center flex flex-col items-center">
        <Link href="/" className="inline-block hover:opacity-90 transition">
          <img
            src="/learn-japnese.svg"
            alt="Learn Japanese Logo"
            className="w-14 h-14 rounded-full shadow-md object-contain mx-auto mb-1"
          />
        </Link>
        <CardTitle className="text-2xl font-extrabold tracking-tight">Set New Password</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your new password below to secure your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="font-semibold">{success}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login page...</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <span>Click here if not redirected</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!tokenFromUrl && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5" htmlFor="token">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <span>Reset Token</span>
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token here"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                className="text-sm font-semibold flex items-center gap-1.5"
                htmlFor="newPassword"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span>New Password</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                className="w-full px-3.5 py-2.5 border rounded-xl bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-semibold flex items-center gap-1.5"
                htmlFor="confirmPassword"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span>Confirm New Password</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                minLength={6}
                required
                className="w-full px-3.5 py-2.5 border rounded-xl bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 pt-4 text-center">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-muted/20">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
