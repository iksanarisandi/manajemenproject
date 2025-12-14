import { getDb } from '../../db/connection.js'
import { maintenance, projects, clients, users, ownerSettings } from '../../db/schema.js'
import { sendTelegramMessageWithButton, buildWhatsAppLink } from './utils/telegram.js'
import { eq, and } from 'drizzle-orm'

// Admin Telegram ID dan Bot Token dari environment variables
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// 23 jam dalam milliseconds untuk duplicate prevention
const DUPLICATE_PREVENTION_HOURS = 23
const DUPLICATE_PREVENTION_MS = DUPLICATE_PREVENTION_HOURS * 60 * 60 * 1000

/**
 * Cek apakah reminder sudah dikirim dalam 23 jam terakhir
 * @param {Date|string|null} lastReminderSent - Timestamp terakhir reminder dikirim
 * @param {Date} currentTime - Waktu saat ini
 * @returns {boolean} - true jika harus skip (sudah kirim dalam 23 jam), false jika boleh kirim
 */
export function shouldSkipReminder(lastReminderSent, currentTime = new Date()) {
  // Jika belum pernah kirim, jangan skip (boleh kirim)
  if (!lastReminderSent) {
    return false
  }
  
  const lastSentTime = new Date(lastReminderSent)
  const timeDifferenceMs = currentTime.getTime() - lastSentTime.getTime()
  
  // Skip jika sudah kirim dalam 23 jam terakhir
  return timeDifferenceMs < DUPLICATE_PREVENTION_MS
}

/**
 * Format nominal ke format Indonesia (Rp dengan separator ribuan)
 * @param {number|string} amount - Nominal yang akan diformat
 * @returns {string} - Nominal dalam format "Rp 1.000.000"
 */
function formatRupiah(amount) {
  const num = parseFloat(amount) || 0
  return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`
}

/**
 * Build pesan notifikasi dengan format informatif
 * @param {Object} record - Data maintenance record
 * @param {number} currentDay - Tanggal hari ini
 * @returns {string} - Pesan dalam format HTML
 */
function buildNotificationMessage(record, currentDay) {
  const formattedAmount = formatRupiah(record.monthlyCost)
  
  return `🔔 <b>Reminder Tagihan Maintenance</b>\n\n` +
    `👤 <b>Klien:</b> ${record.clientName}\n` +
    `📁 <b>Project:</b> ${record.projectName}\n` +
    `💰 <b>Nominal:</b> ${formattedAmount}\n` +
    `📅 <b>Jatuh Tempo:</b> Tanggal ${currentDay} setiap bulan\n` +
    `📱 <b>WhatsApp:</b> ${record.clientWa || 'Tidak tersedia'}\n\n` +
    `⏰ Silakan kirim reminder ke klien.`
}

/**
 * Build inline keyboard dengan tombol WhatsApp
 * @param {string} phoneNumber - Nomor WA klien
 * @param {string} clientName - Nama klien
 * @param {string} projectName - Nama project
 * @param {number} amount - Nominal tagihan
 * @returns {Array|null} - Inline keyboard array atau null jika nomor tidak valid
 */
function buildInlineKeyboard(phoneNumber, clientName, projectName, amount) {
  const waLink = buildWhatsAppLink(phoneNumber, clientName, projectName, amount)
  
  // Jika nomor WA tidak valid, return null (kirim tanpa button)
  if (!waLink) {
    return null
  }
  
  return [
    [
      {
        text: '📱 Kirim Reminder ke WA',
        url: waLink
      }
    ]
  ]
}

export async function handler(_event) {
  // Validasi environment variables
  if (!ADMIN_TELEGRAM_ID || !TELEGRAM_BOT_TOKEN) {
    console.error('Missing required environment variables: ADMIN_TELEGRAM_ID or TELEGRAM_BOT_TOKEN')
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing configuration' }),
    }
  }
  
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
    let skippedCount = 0
    
    for (const record of dueMaintenances) {
      // Cek duplicate prevention: skip jika sudah kirim dalam 23 jam terakhir
      if (shouldSkipReminder(record.lastReminderSent, today)) {
        skippedCount++
        console.log(`Skipping maintenance ID ${record.maintenanceId}: already sent within 23 hours`)
        continue
      }

      // Boleh kirim karena belum pernah kirim atau sudah lebih dari 23 jam
      // Build message dengan format informatif
      const message = buildNotificationMessage(record, currentDay)
      
      // Build inline keyboard dengan tombol WhatsApp
      const inlineKeyboard = buildInlineKeyboard(
        record.clientWa,
        record.clientName,
        record.projectName,
        record.monthlyCost
      )

      // Kirim ke Admin Telegram ID (hardcoded)
      const sent = await sendTelegramMessageWithButton(
        message,
        ADMIN_TELEGRAM_ID,
        inlineKeyboard
      )

      if (sent) {
        // Update timestamp setelah berhasil kirim (Requirements 3.3)
        await db.update(maintenance)
          .set({ lastReminderSent: today })
          .where(eq(maintenance.id, record.maintenanceId))
        sentCount++
      } else {
        // Log error untuk troubleshooting (Requirements 1.4)
        console.error(`Failed to send notification for maintenance ID: ${record.maintenanceId}`)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Reminders checked', 
        total: dueMaintenances.length,
        sent: sentCount,
        skipped: skippedCount
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
