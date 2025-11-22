import { getDb } from '../../db/connection.js'
import { maintenance, projects, clients, users, ownerSettings } from '../../db/schema.js'
import { sendTelegramMessage } from './utils/telegram.js'
import { eq, and } from 'drizzle-orm'

export async function handler(event) {
  try {
    const db = getDb()
    
    const today = new Date()
    const currentDay = today.getDate()

    const dueMaintenances = await db.select({
      maintenanceId: maintenance.id,
      projectName: projects.name,
      clientName: clients.name,
      clientWa: clients.wa,
      monthlyCost: maintenance.monthlyCost,
      paymentDate: maintenance.paymentDate,
      lastReminderSent: maintenance.lastReminderSent,
      userId: projects.userId,
      telegramChatId: ownerSettings.telegramChatId,
    })
      .from(maintenance)
      .leftJoin(projects, eq(maintenance.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(users, eq(projects.userId, users.id))
      .leftJoin(ownerSettings, eq(users.id, ownerSettings.userId))
      .where(and(
        eq(maintenance.active, true),
        eq(maintenance.paymentDate, currentDay)
      ))

    let sentCount = 0
    for (const record of dueMaintenances) {
      if (!record.telegramChatId) {
        console.log(`No Telegram Chat ID configured for user ${record.userId}`)
        continue
      }

      const lastSent = record.lastReminderSent
      const shouldSend = !lastSent || (today - new Date(lastSent)) > 23 * 60 * 60 * 1000

      if (shouldSend) {
        const message = `🔔 <b>Maintenance Payment Reminder</b>\n\n` +
          `Client: ${record.clientName}\n` +
          `Project: ${record.projectName}\n` +
          `Amount: Rp ${parseFloat(record.monthlyCost).toLocaleString('id-ID')}\n` +
          `Due Date: ${currentDay} of this month\n` +
          `WhatsApp: ${record.clientWa}\n\n` +
          `Message to send:\n"Halo kak ${record.clientName}, pembayaran maintenance web ${record.projectName} senilai ${parseFloat(record.monthlyCost).toLocaleString('id-ID')}. Mohon diselesaikan. Pembayaran bisa lewat e-wallet atau rekening. Terima kasih."`

        const sent = await sendTelegramMessage(message, record.telegramChatId)

        if (sent) {
          await db.update(maintenance)
            .set({ lastReminderSent: today })
            .where(eq(maintenance.id, record.maintenanceId))
          sentCount++
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Reminders checked', 
        total: dueMaintenances.length,
        sent: sentCount
      }),
    }
  } catch (error) {
    console.error('Scheduled reminder error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
