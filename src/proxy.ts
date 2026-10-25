import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  // If already logged in and visiting auth pages (login/register), redirect to home
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl))
  }

  // Public Routes: Home, Alphabet section, Alphabet speech, and Auth pages
  const isPublicRoute = pathname === '/' || pathname.startsWith('/alphabet') || isAuthPage

  // Protected Routes: All other features (Kanji, Vocabulary, Quizzes, Reading, Admin, etc.)
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    // Save attempted URL to redirect back after successful login
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  return null
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|icon-.*\\.png|sw\\.js|.*\\.svg).*)',
  ],
}
