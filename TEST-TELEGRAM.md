# 🧪 Test Telegram Notification

## ✅ Function Test Sudah Deploy!

Saya sudah membuat function khusus untuk test Telegram notification.

---

## 🎯 Cara Test (Simple):

### Step 1: Dapatkan Chat ID Anda

**Cara tercepat:**
1. Buka Telegram
2. Search: `@userinfobot`
3. Kirim pesan apa saja
4. Copy angka **Id** (contoh: `123456789`)

---

### Step 2: Test via Browser

Buka browser dan paste URL ini (ganti `YOUR_CHAT_ID` dengan Chat ID Anda):

```
https://manajemenproject.netlify.app/.netlify/functions/test-reminder
```

POST dengan body:
```json
{
  "chatId": "YOUR_CHAT_ID"
}
```

---

### Step 3: Test via Postman

**URL:**
```
https://manajemenproject.netlify.app/.netlify/functions/test-reminder
```

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "chatId": "123456789"
}
```

Ganti `123456789` dengan Chat ID Anda.

Click **Send** → Check Telegram Anda!

---

### Step 4: Test via Node.js (Command Line)

```bash
node -e "fetch('https://manajemenproject.netlify.app/.netlify/functions/test-reminder', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({chatId: 'YOUR_CHAT_ID'})}).then(r => r.json()).then(console.log)"
```

Ganti `YOUR_CHAT_ID` dengan Chat ID Anda.

---

### Step 5: Test via PowerShell (Windows)

```powershell
$body = @{
    chatId = "YOUR_CHAT_ID"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://manajemenproject.netlify.app/.netlify/functions/test-reminder" -Method POST -Body $body -ContentType "application/json"
```

---

## 📱 Yang Akan Terjadi:

Jika berhasil, Anda akan terima pesan di Telegram:

```
🧪 Test Reminder from Project Management App

This is a test message to verify your Telegram integration is working!

✅ If you see this, your setup is correct!

Timestamp: 23/11/2024, 16:00:00
```

---

## ✅ Expected Response:

```json
{
  "success": true,
  "message": "Test message sent successfully!",
  "chatId": "123456789",
  "timestamp": "2024-11-23T09:00:00.000Z"
}
```

---

## ❌ Jika Gagal:

### Error: "Failed to send message"

**Kemungkinan:**
1. Chat ID salah
2. Bot token tidak valid
3. Anda belum start bot

**Solusi:**
1. Cek Chat ID lagi di @userinfobot
2. Pastikan Chat ID angka saja (tanpa @)
3. Search bot di Telegram: `@your_bot_name`
4. Klik `/start` untuk activate

---

## 🤖 Bot Configuration:

**Bot Token:** `8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o`

**Untuk cek bot aktif:**
1. Buka Telegram
2. Search: `@Bot_username` (dari token)
3. Jika muncul, bot aktif ✅

---

## 🧪 Test Scheduled Function:

Setelah test-reminder berhasil, Anda bisa test scheduled function:

### Via Netlify Dashboard:
1. Go to: https://app.netlify.com/projects/manajemenproject/functions
2. Find: `scheduled-reminders`
3. Click: **"Trigger"**
4. Check hasil di logs

---

## 📊 Debugging:

### Check Bot Status:
```
https://api.telegram.org/bot8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o/getMe
```

Buka URL di browser, harus return info bot.

### Check Updates:
```
https://api.telegram.org/bot8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o/getUpdates
```

Ini akan show pesan terakhir ke bot (including Chat ID).

---

## 🎯 Quick Test Commands:

### Test 1: Check Function Available
```bash
node -e "fetch('https://manajemenproject.netlify.app/.netlify/functions/test-reminder').then(r => r.json()).then(console.log)"
```

Should return:
```json
{
  "message": "Test Telegram Reminder",
  "instructions": "Send POST request with body...",
  ...
}
```

### Test 2: Send Test Message
```bash
node -e "fetch('https://manajemenproject.netlify.app/.netlify/functions/test-reminder', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({chatId: 'YOUR_CHAT_ID'})}).then(r => r.json()).then(console.log)"
```

Should send message to your Telegram!

---

## 💡 Tips:

1. **Start dengan test-reminder dulu** (lebih simple)
2. **Pastikan dapat pesan** di Telegram
3. **Baru test scheduled-reminders** (lebih kompleks)
4. **Save Chat ID** di Settings setelah test berhasil

---

## 🎊 Success Indicators:

✅ Test function return `success: true`
✅ Telegram berbunyi
✅ Pesan test muncul di Telegram
✅ Chat ID valid

**Setelah semua ✅ → Scheduled reminder akan work!**

---

**Ready to test?** Dapatkan Chat ID Anda dan jalankan test! 🚀
