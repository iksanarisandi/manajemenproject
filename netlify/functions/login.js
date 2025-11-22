import { getDb } from '../../db/connection.js'
import { users } from '../../db/schema.js'
import { comparePassword, generateToken, corsHeaders } from './utils/auth.js'
import { eq } from 'drizzle-orm'

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

  try {
    const { email, password } = JSON.parse(event.body)

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email and password are required' }),
      }
    }

    const db = getDb()

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user || !comparePassword(password, user.passwordHash)) {
      return {
        statusCode: 401,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid email or password' }),
      }
    }

    const token = generateToken(user.id)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      }),
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
