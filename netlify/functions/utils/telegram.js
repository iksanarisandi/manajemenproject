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

/**
 * Mengirim pesan Telegram dengan inline keyboard
 * @param {string} message - Pesan dalam format HTML
 * @param {string} chatId - Telegram Chat ID tujuan
 * @param {Array} inlineKeyboard - Array of button rows
 * @returns {Promise<boolean>} - Success status
 */
export async function sendTelegramMessageWithButton(message, chatId, inlineKeyboard) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  
  if (!token || !chatId) {
    console.error('Telegram configuration missing')
    return false
  }

  try {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard
      }
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return data.ok
  } catch (error) {
    console.error('Error sending Telegram message with button:', error)
    return false
  }
}

/**
 * Normalize phone number to international format (628xxx)
 * @param {string} phoneNumber - Phone number in various formats
 * @returns {string} - Normalized phone number without + prefix
 */
function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return ''
  
  let normalized = phoneNumber.toString().replace(/\s+/g, '').replace(/-/g, '')
  
  // Remove + prefix if exists
  if (normalized.startsWith('+')) {
    normalized = normalized.substring(1)
  }
  
  // Convert 08xx to 628xx
  if (normalized.startsWith('08')) {
    normalized = '62' + normalized.substring(1)
  }
  
  // Handle case where number starts with just 8 (assume Indonesian)
  if (normalized.startsWith('8') && normalized.length >= 10 && normalized.length <= 13) {
    normalized = '62' + normalized
  }
  
  return normalized
}

/**
 * Membuat WhatsApp deep link dengan pesan template
 * @param {string} phoneNumber - Nomor WA klien (format: 08xx, 628xx, +628xx)
 * @param {string} clientName - Nama klien
 * @param {string} projectName - Nama project
 * @param {number} amount - Nominal tagihan
 * @returns {string} - WhatsApp URL atau empty string jika nomor tidak valid
 */
export function buildWhatsAppLink(phoneNumber, clientName, projectName, amount) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber)
  
  // Validate phone number (should be at least 10 digits after normalization)
  if (!normalizedPhone || normalizedPhone.length < 10) {
    return ''
  }
  
  // Format amount to Indonesian Rupiah
  const formattedAmount = new Intl.NumberFormat('id-ID').format(amount)
  
  // Build message template
  const message = `Halo kak ${clientName}, ini reminder pembayaran maintenance web ${projectName} senilai Rp ${formattedAmount}. Mohon diselesaikan ya. Pembayaran bisa lewat e-wallet atau rekening. Terima kasih 🙏`
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
}
