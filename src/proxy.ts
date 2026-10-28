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

  // Strict Public Routes based on requirement:
  // Without login, users can ONLY read alphabet (/alphabet, /alphabet-speech) and practice handwriting (/practice-writing), plus auth pages and home page.
  // All other routes (/search, /phrases, /kanji, /vocabulary, /quiz, /dashboard, /reading, /admin, etc.) require login!
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/alphabet') ||
    pathname.startsWith('/practice-writing') ||
    pathname.startsWith('/verify-email') ||
    isAuthPage

  // Protected Routes: Require login
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    // Save attempted URL to redirect back after successful login
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // Admin Route Protection: Only ADMIN or SUPER_ADMIN
  if (pathname.startsWith('/admin')) {
    const userRole = req.auth?.user?.role
    const userEmail = req.auth?.user?.email?.toLowerCase().trim()
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'abdullahwebdev15@gmail.com').toLowerCase().trim()
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userEmail === superAdminEmail

    if (!isAdmin) {
      return Response.redirect(new URL('/', req.nextUrl))
    }
  }

  return null
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|icon-.*\\.png|sw\\.js|.*\\.svg).*)',
  ],
}
