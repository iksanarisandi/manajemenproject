import { sendTelegramMessage } from './utils/telegram.js'
import { corsHeaders } from './utils/auth.js'
import { withRateLimit } from './utils/rateLimit.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  // Apply rate limiting - ketat untuk test endpoint
  return withRateLimit(event, 'test-reminder', async () => {
    try {
      // Parse request body
    let chatId = null
    if (event.body) {
      const body = JSON.parse(event.body)
      chatId = body.chatId
    }

    // If no chatId provided, return instructions
    if (!chatId) {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          message: 'Test Telegram Reminder',
          instructions: 'Send POST request with body: { "chatId": "your_telegram_chat_id" }',
          example: { chatId: '123456789' }
        }),
      }
    }

    // Send test message
    const testMessage = `🧪 <b>Test Reminder from Project Management App</b>\n\n` +
      `This is a test message to verify your Telegram integration is working!\n\n` +
      `✅ If you see this, your setup is correct!\n\n` +
      `Timestamp: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`

    const sent = await sendTelegramMessage(testMessage, chatId)

    if (sent) {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: true,
          message: 'Test message sent successfully!',
          chatId: chatId,
          timestamp: new Date().toISOString()
        }),
      }
    } else {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'Failed to send message to Telegram',
          chatId: chatId
        }),
      }
    }
    } catch (error) {
      console.error('Test reminder error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({
          error: 'Internal server error',
          details: error.message
        }),
      }
    }
  })
}
