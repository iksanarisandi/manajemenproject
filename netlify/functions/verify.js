import { getDb } from '../../db/connection.js'
import { users } from '../../db/schema.js'
import { getUserFromHeaders, corsHeaders } from './utils/auth.js'
import { withRateLimit } from './utils/rateLimit.js'
import { eq } from 'drizzle-orm'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  // Apply rate limiting
  return withRateLimit(event, 'verify', async () => {
    try {
      const userId = getUserFromHeaders(event.headers)

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Unauthorized' }),
      }
    }

    const db = getDb()
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'User not found' }),
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
      }),
    }
    } catch (error) {
      console.error('Verify error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Internal server error' }),
      }
    }
  })
}
