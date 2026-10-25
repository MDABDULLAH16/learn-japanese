'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { requestPasswordReset } from '@/lib/auth-actions'
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    setResetToken(null)

    try {
      const res = await requestPasswordReset(email)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccessMessage(res.message || 'Password reset link generated.')
        if (res.token) {
          setResetToken(res.token)
        }
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl border-border/60 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Forgot Password?</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your account email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-muted-foreground mb-2">Direct password reset link:</p>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="inline-block w-full py-2 px-3 text-center text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Click to Reset Your Password Now &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {!resetToken && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-1.5" htmlFor="email">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>Email Address</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 pt-4 text-center">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
