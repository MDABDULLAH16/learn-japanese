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

  // Public Routes:
  // - Home (/)
  // - Alphabet (/alphabet, /alphabet-speech)
  // - Essential Phrases (/phrases)
  // - Romaji to Kana Converter (/converter)
  // - Handwriting Practice Canvas (/practice-writing)
  // - Printable Cheat Sheets (/cheat-sheets)
  // - Freemium Previews (/kanji, /vocabulary, /quiz)
  // - Auth Pages (/login, /register, etc.)
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/alphabet') ||
    pathname.startsWith('/phrases') ||
    pathname.startsWith('/converter') ||
    pathname.startsWith('/practice-writing') ||
    pathname.startsWith('/cheat-sheets') ||
    pathname.startsWith('/kanji') ||
    pathname.startsWith('/vocabulary') ||
    pathname.startsWith('/quiz') ||
    isAuthPage

  // Protected Routes: Admin, Study Dashboard, Reading practice, Vocab Quiz, Kanji Practice, etc.
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
