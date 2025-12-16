import { getDb } from '../../db/connection.js'
import { clients } from '../../db/schema.js'
import { getUserFromHeaders, corsHeaders } from './utils/auth.js'
import { withRateLimit } from './utils/rateLimit.js'
import { eq, and } from 'drizzle-orm'

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

  // Apply rate limiting
  return withRateLimit(event, 'clients', async () => {
    const db = getDb()

    try {
      if (event.httpMethod === 'GET') {
      const allClients = await db.select()
        .from(clients)
        .where(eq(clients.userId, userId))

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(allClients),
      }
    }

    if (event.httpMethod === 'POST') {
      const { name, wa } = JSON.parse(event.body)

      if (!name || !wa) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Name and WhatsApp number are required' }),
        }
      }

      const [newClient] = await db.insert(clients).values({
        userId,
        name,
        wa,
      }).returning()

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify(newClient),
      }
    }

    if (event.httpMethod === 'PUT') {
      const { id, name, wa } = JSON.parse(event.body)

      if (!id || !name || !wa) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID, name, and WhatsApp number are required' }),
        }
      }

      const [updated] = await db.update(clients)
        .set({ name, wa })
        .where(and(eq(clients.id, id), eq(clients.userId, userId)))
        .returning()

      if (!updated) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Client not found' }),
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(updated),
      }
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body)

      if (!id) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID is required' }),
        }
      }

      const [deleted] = await db.delete(clients)
        .where(and(eq(clients.id, id), eq(clients.userId, userId)))
        .returning()

      if (!deleted) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Client not found' }),
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Client deleted' }),
      }
    }

      return {
        statusCode: 405,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Method not allowed' }),
      }
    } catch (error) {
      console.error('Clients API error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Internal server error' }),
      }
    }
  })
}
