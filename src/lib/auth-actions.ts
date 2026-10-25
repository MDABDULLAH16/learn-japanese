'use server'

import { signIn, signOut, auth } from '@/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthError } from 'next-auth'

const SUPER_ADMIN_EMAILS = ['abdullahwebdev15@gmail.com', 'abdullahwebdev15@gamil.com']

export async function register(formData: FormData) {
  const rawEmail = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!rawEmail || !password || !name) {
    return { error: 'Please provide all required fields.' }
  }

  const email = rawEmail.toLowerCase().trim()

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: 'An account with this email already exists.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    // Check if registering email belongs to super admin
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email)

    await (prisma.user as any).create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Failed to create account. Please try again.' }
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
 * Request Password Reset Token
 */
export async function requestPasswordReset(email: string) {
  if (!email) {
    return { error: 'Please provide an email address.' }
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Return success message to avoid email enumeration
      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been generated.',
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

    // Return reset link for direct UI access
    return {
      success: true,
      token: resetToken,
      message: 'Reset link generated successfully.',
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return { error: 'Could not process password reset request.' }
  }
}

/**
 * Confirm and Reset Password with Token
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { error: 'Token and new password are required.' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
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

  if (!newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long.' }
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
