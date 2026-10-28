'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { register, loginWithGoogle } from '@/lib/auth-actions'
import { User, Mail, KeyRound, Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await register(formData)
      if (res.error) {
        setError(res.error)
      } else {
        router.push('/login?registered=true')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch {
      setError('Failed to initiate Google sign in.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl border-border/60 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center flex flex-col items-center">
          <Link href="/" className="inline-block hover:opacity-90 transition">
            <img
              src="/learn-japnese.svg"
              alt="Learn Japanese Logo"
              className="w-14 h-14 rounded-full shadow-md object-contain mx-auto mb-1"
            />
          </Link>
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Start mastering Japanese characters, vocabulary, and grammar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-accent/60 text-foreground font-medium transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center justify-center text-xs uppercase">
            <span className="w-full border-t border-border" />
            <span className="bg-card px-2 text-muted-foreground whitespace-nowrap">
              Or register with email
            </span>
            <span className="w-full border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5" htmlFor="name">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Full Name</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Abdullah"
                required
                className="w-full px-3.5 py-2.5 border rounded-xl bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5" htmlFor="email">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 border rounded-xl bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5" htmlFor="password">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <span>Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
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
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
