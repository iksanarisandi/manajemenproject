import { getDb } from '../../db/connection.js'
import { users } from '../../db/schema.js'
import { hashPassword, generateToken, corsHeaders } from './utils/auth.js'
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
}
