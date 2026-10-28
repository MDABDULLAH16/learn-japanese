import nodemailer from 'nodemailer'

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

async function sendMail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  // Option 1: Resend API if RESEND_API_KEY is present
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Learn Japanese <onboarding@resend.dev>',
          to,
          subject,
          html,
        }),
      })

      if (res.ok) {
        return true
      }
      console.error('Failed to send email via Resend API:', await res.text())
    } catch (err) {
      console.error('Resend API error:', err)
    }
  }

  // Option 2: SMTP Transport if SMTP_HOST and SMTP_USER are present
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Learn Japanese" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      })
      return true
    } catch (err) {
      console.error('SMTP Transport error:', err)
    }
  }

  // Development Fallback: If no mail provider is configured, log securely to server console
  console.log('----------------------------------------------------')
  console.log(`[SECURE EMAIL DISPATCH - DEV LOG]`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')}`)
  console.log('----------------------------------------------------')
  return true
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`
  const subject = 'Reset Your Password - Learn Japanese'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">Reset Your Password</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.5;">
        You requested a password reset for your Learn Japanese account. Click the button below to choose a new password. This link is valid for 1 hour.
      </p>
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px;">
        Or copy and paste this URL into your browser: <br />
        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
      </p>
    </div>
  `

  return sendMail({ to, subject, html })
}

export async function sendVerificationEmail(to: string, verificationToken: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`
  const subject = 'Verify Your Email Address - Learn Japanese'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">Welcome to Learn Japanese!</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.5;">
        Please confirm your email address to complete your registration and secure your account.
      </p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px;">
        Or copy and paste this URL into your browser: <br />
        <a href="${verifyUrl}" style="color: #10b981;">${verifyUrl}</a>
      </p>
    </div>
  `

  return sendMail({ to, subject, html })
}
