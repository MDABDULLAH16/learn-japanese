import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const SUPER_ADMIN_EMAILS = ['abdullahwebdev15@gmail.com', 'abdullahwebdev15@gamil.com']

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const normalizedEmail = (credentials.email as string).toLowerCase().trim()

        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        let userRole = user.role || 'USER'
        const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(normalizedEmail)
        if (isSuperAdminEmail && userRole !== 'SUPER_ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'SUPER_ADMIN' },
          })
          userRole = 'SUPER_ADMIN'
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: userRole,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const normalizedEmail = user.email.toLowerCase().trim()
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(normalizedEmail)
      const initialRole = isSuperAdmin ? 'SUPER_ADMIN' : 'USER'

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: user.name || normalizedEmail.split('@')[0],
              image: user.image || null,
              role: initialRole,
              lastLoginAt: new Date(),
            },
          })
          user.id = newUser.id
          user.role = newUser.role
        } else {
          const shouldUpgradeToSuperAdmin = isSuperAdmin && existingUser.role !== 'SUPER_ADMIN'
          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLoginAt: new Date(),
              ...(shouldUpgradeToSuperAdmin ? { role: 'SUPER_ADMIN' } : {}),
              ...(user.image && !existingUser.image ? { image: user.image } : {}),
            },
          })
          user.id = updatedUser.id
          user.role = updatedUser.role
        }
        return true
      } catch (error) {
        console.error('Error during sign in callback:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = user.role || 'USER'
        if (user.image) {
          token.picture = user.image
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = (token.role as string) || 'USER'
        if (token.picture) {
          session.user.image = token.picture as string
        }
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
})
