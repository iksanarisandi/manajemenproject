import { getDb } from '../../db/connection.js'
import { ownerSettings } from '../../db/schema.js'
import { getUserFromHeaders, corsHeaders } from './utils/auth.js'
import { eq } from 'drizzle-orm'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  const userId = getUserFromHeaders(event.headers)
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  const db = getDb()

  try {
    if (event.httpMethod === 'GET') {
      const [settings] = await db.select()
        .from(ownerSettings)
        .where(eq(ownerSettings.userId, userId))
        .limit(1)

      if (!settings) {
        const [newSettings] = await db.insert(ownerSettings)
          .values({ userId, bankAccount: '', ewallet: '', telegramChatId: '' })
          .returning()

        return {
          statusCode: 200,
          headers: corsHeaders(),
          body: JSON.stringify(newSettings),
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(settings),
      }
    }

    if (event.httpMethod === 'PUT') {
      const { bankAccount, ewallet, telegramChatId } = JSON.parse(event.body)

      const [existing] = await db.select()
        .from(ownerSettings)
        .where(eq(ownerSettings.userId, userId))
        .limit(1)

      let result

      if (existing) {
        [result] = await db.update(ownerSettings)
          .set({ bankAccount, ewallet, telegramChatId })
          .where(eq(ownerSettings.userId, userId))
          .returning()
      } else {
        [result] = await db.insert(ownerSettings)
          .values({ userId, bankAccount, ewallet, telegramChatId })
          .returning()
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(result),
      }
    }

    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Settings API error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
