export async function sendTelegramMessage(message, chatId = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID
  
  if (!token || !targetChatId) {
    console.error('Telegram configuration missing')
    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return false
  }
}
