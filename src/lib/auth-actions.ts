'use server'

import { signIn, signOut, auth } from '@/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'

const SUPER_ADMIN_EMAILS = [
  (process.env.SUPER_ADMIN_EMAIL || 'abdullahwebdev15@gmail.com').toLowerCase().trim(),
]

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
})

export async function register(formData: FormData) {
  const rawEmail = (formData.get('email') as string) || ''
  const rawPassword = (formData.get('password') as string) || ''
  const rawName = (formData.get('name') as string) || ''

  const validation = registerSchema.safeParse({
    name: rawName,
    email: rawEmail,
    password: rawPassword,
  })

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || 'Invalid registration details.'
    return { error: firstError }
  }

  const { name, email, password } = validation.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'An account with this email already exists.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    await (prisma.user as any).create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
        verificationToken,
        emailVerified: null,
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return {
      success: true,
      message: 'Account created! Please check your email to verify your address.',
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Failed to create account. Please try again.' }
  }
}

export async function verifyEmail(token: string) {
  if (!token) {
    return { error: 'Verification token is required.' }
  }

  try {
    const user = await (prisma.user as any).findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return { error: 'Invalid or expired verification token.' }
    }

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    })

    return { success: true, message: 'Email successfully verified! You can now sign in.' }
  } catch (error) {
    console.error('Email verification error:', error)
    return { error: 'Failed to verify email.' }
  }
}

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid email or password.'
        default:
          return 'Something went wrong during sign in.'
      }
    }
    throw error
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/' })
}

export async function handleSignOut() {
  await signOut({ redirectTo: '/' })
}

/**
 * Request Password Reset Token (Dispatches secure reset email)
 */
export async function requestPasswordReset(email: string) {
  if (!email) {
    return { error: 'Please provide an email address.' }
  }

  const normalizedEmail = email.toLowerCase().trim()
  const emailValidation = z.string().email().safeParse(normalizedEmail)
  if (!emailValidation.success) {
    return { error: 'Please enter a valid email address.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Return generic success message to prevent user enumeration
      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been dispatched.',
      }
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60) // 1 hour validity

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send reset email via email service (Never return resetToken in API response!)
    await sendPasswordResetEmail(normalizedEmail, resetToken)

    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been dispatched to your email.',
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return { error: 'Could not process password reset request.' }
  }
}

const resetPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Confirm and Reset Password with Token
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { error: 'Token and new password are required.' }
  }

  const passwordValidation = resetPasswordSchema.safeParse(newPassword)
  if (!passwordValidation.success) {
    return { error: passwordValidation.error.issues[0]?.message || 'Password does not meet complexity requirements.' }
  }

  try {
    const user = await (prisma.user as any).findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return { error: 'Invalid or expired reset token. Please request a new one.' }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { success: true, message: 'Password has been reset successfully! You can now log in.' }
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return { error: 'Failed to reset password.' }
  }
}

/**
 * Change Password for Logged-In User
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'You must be logged in to change your password.' }
  }

  const passwordValidation = resetPasswordSchema.safeParse(newPassword)
  if (!passwordValidation.success) {
    return { error: passwordValidation.error.issues[0]?.message || 'Password must be at least 8 characters with a letter and a number.' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return { error: 'User not found.' }
    }

    // If user previously logged in only with Google, they might not have a password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return { error: 'Incorrect current password.' }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return { success: true, message: 'Password updated successfully!' }
  } catch (error) {
    console.error('Change password error:', error)
    return { error: 'Failed to change password.' }
  }
}

/**
 * Record a Daily Visitor for the analytics chart
 */
export async function recordVisit(path: string = '/') {
  try {
    const session = await auth()
    const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

    await (prisma as any).siteVisit.create({
      data: {
        date: today,
        path,
        userId: session?.user?.id || null,
      },
    })
  } catch (err) {
    // Non-blocking error logging
    console.error('Failed to log site visit:', err)
  }
}
