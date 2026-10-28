'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { verifyEmail } from '@/lib/auth-actions'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => (token ? 'loading' : 'error'))
  const [message, setMessage] = useState(() => (token ? '' : 'Invalid or missing verification token.'))

  useEffect(() => {
    if (!token) return

    verifyEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus('success')
          setMessage(res.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(res.error || 'Failed to verify email.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An unexpected error occurred while verifying your email.')
      })
  }, [token])

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60">
      <CardHeader className="text-center space-y-2">
        <Link href="/" className="inline-block hover:opacity-90 transition mx-auto mb-2">
          <img
            src="/learn-japnese.svg"
            alt="Learn Japanese Logo"
            className="w-14 h-14 rounded-full shadow-md object-contain mx-auto"
          />
        </Link>
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>Securing your Learn Japanese account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your email token, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">Verified!</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Verification Failed</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-muted/20">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
