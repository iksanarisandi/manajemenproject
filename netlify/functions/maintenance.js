import { getDb } from '../../db/connection.js'
import { maintenance, projects, clients } from '../../db/schema.js'
import { getUserFromHeaders, corsHeaders } from './utils/auth.js'
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

  const db = getDb()

  try {
    if (event.httpMethod === 'GET') {
      const allMaintenance = await db.select({
        id: maintenance.id,
        projectId: maintenance.projectId,
        initialCost: maintenance.initialCost,
        monthlyCost: maintenance.monthlyCost,
        paymentDate: maintenance.paymentDate,
        active: maintenance.active,
        lastReminderSent: maintenance.lastReminderSent,
        createdAt: maintenance.createdAt,
        projectName: projects.name,
        clientName: clients.name,
        clientWa: clients.wa,
      })
        .from(maintenance)
        .leftJoin(projects, eq(maintenance.projectId, projects.id))
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(eq(projects.userId, userId))

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(allMaintenance),
      }
    }

    if (event.httpMethod === 'POST') {
      const { projectId, initialCost, monthlyCost, paymentDate, active } = JSON.parse(event.body)

      if (!projectId || !initialCost || !monthlyCost || !paymentDate) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Project ID, costs, and payment date are required' }),
        }
      }

      const [project] = await db.select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
        .limit(1)

      if (!project) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Project not found' }),
        }
      }

      if (project.projectStatus !== 'completed') {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Maintenance only available for completed projects' }),
        }
      }

      const [newMaintenance] = await db.insert(maintenance).values({
        projectId,
        initialCost,
        monthlyCost,
        paymentDate,
        active: active !== undefined ? active : true,
      }).returning()

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify(newMaintenance),
      }
    }

    if (event.httpMethod === 'PUT') {
      const { id, initialCost, monthlyCost, paymentDate, active } = JSON.parse(event.body)

      if (!id) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'ID is required' }),
        }
      }

      const updateData = {}
      if (initialCost) updateData.initialCost = initialCost
      if (monthlyCost) updateData.monthlyCost = monthlyCost
      if (paymentDate) updateData.paymentDate = paymentDate
      if (active !== undefined) updateData.active = active

      const [existing] = await db.select({
        id: maintenance.id,
        userId: projects.userId,
      })
        .from(maintenance)
        .leftJoin(projects, eq(maintenance.projectId, projects.id))
        .where(eq(maintenance.id, id))
        .limit(1)

      if (!existing || existing.userId !== userId) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Maintenance record not found' }),
        }
      }

      const [updated] = await db.update(maintenance)
        .set(updateData)
        .where(eq(maintenance.id, id))
        .returning()

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

      const [existing] = await db.select({
        id: maintenance.id,
        userId: projects.userId,
      })
        .from(maintenance)
        .leftJoin(projects, eq(maintenance.projectId, projects.id))
        .where(eq(maintenance.id, id))
        .limit(1)

      if (!existing || existing.userId !== userId) {
        return {
          statusCode: 404,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Maintenance record not found' }),
        }
      }

      await db.delete(maintenance).where(eq(maintenance.id, id))

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Maintenance deleted' }),
      }
    }

    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Maintenance API error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
