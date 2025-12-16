import { getDb } from '../../db/connection.js'
import { users } from '../../db/schema.js'
import { hashPassword, generateToken, corsHeaders } from './utils/auth.js'
import { withRateLimit } from './utils/rateLimit.js'
import { eq } from 'drizzle-orm'

// Cloudflare Turnstile Secret Key
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstile(token, ip) {
  // Skip verification jika secret key tidak dikonfigurasi (development)
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification')
    return true
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // Apply rate limiting
  return withRateLimit(event, 'register', async () => {
    try {
      const { email, password, turnstileToken } = JSON.parse(event.body)

      // Get client IP
      const clientIp = event.headers['x-nf-client-connection-ip'] 
        || event.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || 'unknown'

      // Verify Turnstile CAPTCHA (wajib jika secret key dikonfigurasi)
      if (TURNSTILE_SECRET_KEY) {
        if (!turnstileToken) {
          return {
            statusCode: 400,
            headers: corsHeaders(),
            body: JSON.stringify({ error: 'CAPTCHA verification required' }),
          }
        }

        const isValidCaptcha = await verifyTurnstile(turnstileToken, clientIp)
        if (!isValidCaptcha) {
          return {
            statusCode: 400,
            headers: corsHeaders(),
            body: JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }),
          }
        }
      }

      if (!email || !password) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Email and password are required' }),
        }
      }

      if (password.length < 6) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Password must be at least 6 characters' }),
        }
      }

    const db = getDb()

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email already exists' }),
      }
    }

    const passwordHash = hashPassword(password)
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
    }).returning()

    const token = generateToken(newUser.id)

    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      }),
    }
    } catch (error) {
      console.error('Register error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Internal server error' }),
      }
    }
  })
}
