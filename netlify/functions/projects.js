import { getDb } from '../../db/connection.js'
import { projects, clients } from '../../db/schema.js'
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
  return withRateLimit(event, 'projects', async () => {
    const db = getDb()

    try {
      if (event.httpMethod === 'GET') {
      const allProjects = await db.select({
        id: projects.id,
        userId: projects.userId,
        clientId: projects.clientId,
        name: projects.name,
        value: projects.value,
        projectStatus: projects.projectStatus,
        paymentStatus: projects.paymentStatus,
        acceptanceStatus: projects.acceptanceStatus,
        date: projects.date,
        createdAt: projects.createdAt,
        clientName: clients.name,
        clientWa: clients.wa,
      })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(eq(projects.userId, userId))

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(allProjects),
      }
    }

    if (event.httpMethod === 'POST') {
      const { name, clientId, value, projectStatus, paymentStatus, acceptanceStatus, date } = JSON.parse(event.body)

      if (!name || !clientId || !value || !date) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Name, client, value, and date are required' }),
        }
      }

      const [newProject] = await db.insert(projects).values({
        userId,
        name,
        clientId,
        value,
        projectStatus: projectStatus || 'draft',
        paymentStatus: paymentStatus || 'unpaid',
        acceptanceStatus: acceptanceStatus || 'accepted',
        date: new Date(date),
      }).returning()

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify(newProject),
      }
    }

    if (event.httpMethod === 'PUT') {
      const { id, name, clientId, value, projectStatus, paymentStatus, acceptanceStatus, date } = JSON.parse(event.body)

      if (!id) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID is required' }),
        }
      }

      const updateData = {}
      if (name) updateData.name = name
      if (clientId) updateData.clientId = clientId
      if (value) updateData.value = value
      if (projectStatus) updateData.projectStatus = projectStatus
      if (paymentStatus) updateData.paymentStatus = paymentStatus
      if (acceptanceStatus) updateData.acceptanceStatus = acceptanceStatus
      if (date) updateData.date = new Date(date)

      const [updated] = await db.update(projects)
        .set(updateData)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning()

      if (!updated) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Project not found' }),
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

      const [deleted] = await db.delete(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning()

      if (!deleted) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Project not found' }),
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Project deleted' }),
      }
    }

      return {
        statusCode: 405,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Method not allowed' }),
      }
    } catch (error) {
      console.error('Projects API error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Internal server error' }),
      }
    }
  })
}
