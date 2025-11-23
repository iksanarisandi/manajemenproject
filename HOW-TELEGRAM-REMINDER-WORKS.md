# 🤖 Cara Kerja Telegram Bot Reminder

## 📋 Overview

Sistem ini mengirim reminder **otomatis** ke Telegram Anda setiap hari untuk memberitahu maintenance yang jatuh tempo hari ini.

---

## ⚙️ Cara Kerja Sistem:

### 1. **Scheduled Function (Otomatis)**

File: `netlify/functions/scheduled-reminders.js`

**Jadwal:**
- Berjalan **setiap hari** jam **9 AM UTC** (4 PM WIB)
- Netlify otomatis trigger function ini
- Tidak perlu manual trigger

**Konfigurasi:**
```toml
# netlify.toml
[functions."scheduled-reminders"]
  schedule = "0 9 * * *"
```

Format: `menit jam hari bulan hari-minggu`
- `0 9 * * *` = Setiap hari jam 9 pagi UTC

---

### 2. **Proses yang Berjalan:**

#### Step 1: Cek Tanggal Hari Ini
```javascript
const today = new Date()
const currentDay = today.getDate() // e.g., 23
```

#### Step 2: Query Database
Cari semua maintenance yang:
- ✅ Status `active = true`
- ✅ `payment_date` sama dengan hari ini
- ✅ Belum kirim reminder hari ini (last_reminder_sent > 24 jam yang lalu)

```javascript
const dueMaintenances = await db.select({
  maintenanceId: maintenance.id,
  projectName: projects.name,
  clientName: clients.name,
  clientWa: clients.wa,
  monthlyCost: maintenance.monthlyCost,
  paymentDate: maintenance.paymentDate,
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
```

#### Step 3: Loop Setiap Maintenance
Untuk setiap maintenance yang ditemukan:

```javascript
for (const record of dueMaintenances) {
  // 1. Cek apakah user punya Chat ID
  if (!record.telegramChatId) {
    console.log('No Chat ID configured')
    continue // Skip
  }

  // 2. Cek apakah sudah kirim reminder < 24 jam
  const lastSent = record.lastReminderSent
  const shouldSend = !lastSent || (today - new Date(lastSent)) > 23 * 60 * 60 * 1000

  // 3. Kalau belum, kirim reminder
  if (shouldSend) {
    await sendTelegramMessage(message, record.telegramChatId)
    
    // 4. Update timestamp
    await db.update(maintenance)
      .set({ lastReminderSent: today })
      .where(eq(maintenance.id, record.maintenanceId))
  }
}
```

#### Step 4: Kirim ke Telegram
```javascript
// File: netlify/functions/utils/telegram.js
export async function sendTelegramMessage(message, chatId) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })
}
```

---

## 📱 Format Pesan yang Dikirim:

```
🔔 Maintenance Payment Reminder

Client: Budi Santoso
Project: Company Website
Amount: Rp 500.000
Due Date: 23 of this month
WhatsApp: 628123456789

Message to send:
"Halo kak Budi Santoso, pembayaran maintenance web 
Company Website senilai Rp 500.000. Mohon diselesaikan. 
Pembayaran bisa lewat e-wallet atau rekening. Terima kasih."
```

**Isi pesan:**
- 🔔 Emoji dan header
- 📋 Detail client & project
- 💰 Nominal yang harus dibayar
- 📅 Tanggal jatuh tempo
- 📱 WhatsApp client
- 📝 Template pesan untuk copy-paste

---

## 🎯 Setup Telegram Bot:

### Step 1: Sudah Ada Bot Token ✅
Bot token sudah dikonfigurasi:
```
TELEGRAM_BOT_TOKEN=8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o
```

### Step 2: Dapatkan Chat ID Anda

**Cara 1: Pakai @userinfobot**
1. Buka Telegram
2. Search: `@userinfobot`
3. Kirim pesan apa saja
4. Bot akan reply dengan info Anda
5. Copy angka di bagian **Id** (contoh: `123456789`)

**Cara 2: Pakai @RawDataBot**
1. Search: `@RawDataBot`
2. Kirim `/start`
3. Copy angka di `"id": 123456789`

### Step 3: Masukkan ke Settings
1. Login ke app: https://manajemenproject.netlify.app
2. Go to **Settings**
3. Isi field **"Telegram Chat ID"**
4. Paste Chat ID Anda
5. Click **"Save Settings"**

✅ **DONE!** Sekarang Anda akan terima reminder otomatis!

---

## 🔄 Timeline Example:

### Scenario:
- Hari ini: **23 November**
- Maintenance untuk "Client A - Website" dengan `payment_date = 23`
- User sudah set Telegram Chat ID

### Yang Terjadi:

**08:59 UTC (15:59 WIB)**
- Belum ada apa-apa

**09:00 UTC (16:00 WIB)** ⏰
- Netlify trigger scheduled function
- Function berjalan otomatis
- Cek database: "Ada maintenance jatuh tempo hari ini?"
- Ditemukan: 1 maintenance (Client A)
- Cek: "Sudah kirim reminder hari ini?"
- Belum → **Kirim ke Telegram!**

**09:00:05 UTC (16:00:05 WIB)** 📱
- Telegram Anda berbunyi
- Pesan masuk dari bot
- Isi: Reminder maintenance Client A

**09:00:10 UTC (16:00:10 WIB)** ✅
- Database di-update: `last_reminder_sent = 2024-11-23 09:00:10`
- Selesai!

**Besok (24 November)**
- Function jalan lagi jam 9 AM UTC
- Cek: "Ada maintenance jatuh tempo tanggal 24?"
- Tidak ada → Tidak kirim apa-apa

**23 Desember (bulan depan)**
- Function jalan lagi
- Cek: "Ada maintenance jatuh tempo tanggal 23?"
- Ada! Client A lagi (recurring)
- Cek: "Sudah kirim hari ini?"
- Belum → **Kirim lagi!** 🔄

---

## 📊 Multi-User System:

### User A (Chat ID: 111111111)
- Punya 2 maintenance:
  - Project X → payment_date = 5
  - Project Y → payment_date = 15

### User B (Chat ID: 222222222)
- Punya 1 maintenance:
  - Project Z → payment_date = 5

### Tanggal 5 (jam 9 AM UTC):
- Function jalan
- Ditemukan 2 maintenance (Project X & Z)
- Kirim ke Chat ID **111111111** → Reminder Project X
- Kirim ke Chat ID **222222222** → Reminder Project Z
- ✅ Setiap user terima reminder mereka sendiri!

### Tanggal 15:
- Function jalan
- Ditemukan 1 maintenance (Project Y)
- Kirim ke Chat ID **111111111** → Reminder Project Y
- User B tidak dapat apa-apa ✅

---

## 🔍 Cara Mengecek Apakah Berjalan:

### Method 1: Lihat Netlify Logs

```bash
# Di terminal
netlify logs:function scheduled-reminders
```

Atau via dashboard:
https://app.netlify.com/projects/manajemenproject/logs/functions

**Look for:**
```
INFO Reminders checked
INFO Total: 2, Sent: 2
```

### Method 2: Lihat Database

Check kolom `last_reminder_sent` di tabel `maintenance`:
- Jika ada timestamp hari ini → Reminder sudah terkirim ✅

### Method 3: Cek Telegram

- Apakah Anda dapat pesan dari bot? ✅
- Jika belum, tunggu sampai jam 9 AM UTC (4 PM WIB)

---

## 🧪 Test Manual (Tanpa Tunggu Jam 9 AM):

### Via Netlify Dashboard:
1. Go to: https://app.netlify.com/projects/manajemenproject/functions
2. Find: `scheduled-reminders`
3. Click: **"Trigger"** button
4. Function akan jalan langsung!
5. Check Telegram Anda

### Via API Call:
```javascript
// Di browser console atau Postman
fetch('https://manajemenproject.netlify.app/.netlify/functions/scheduled-reminders', {
  method: 'POST'
})
.then(r => r.json())
.then(d => console.log(d))
```

**Expected Output:**
```json
{
  "message": "Reminders checked",
  "total": 2,
  "sent": 1
}
```

---

## ⚠️ Troubleshooting:

### Problem: "Tidak dapat reminder"

**Check 1: Chat ID sudah diisi?**
- Login → Settings
- Cek field "Telegram Chat ID"
- Harus ada angka (e.g., `123456789`)

**Check 2: Maintenance aktif?**
- Go to Maintenance page
- Status harus **"Active"** (hijau)
- Kalau "Inactive" (abu-abu) → Tidak akan kirim

**Check 3: Payment date cocok?**
- Hari ini tanggal berapa?
- Payment date maintenance = tanggal berapa?
- Harus sama baru kirim

**Check 4: Sudah 24 jam sejak reminder terakhir?**
- Check database: `last_reminder_sent`
- Kalau baru kirim < 24 jam → Tunggu besok

**Check 5: Function berjalan?**
- Check logs di Netlify
- Seharusnya ada log setiap hari jam 9 AM UTC

---

## 🎯 Best Practices:

### 1. Set Payment Date Strategis
- Hindari tanggal 29, 30, 31 (tidak semua bulan punya)
- Gunakan tanggal 1-28 untuk konsistensi
- Contoh: tanggal 5 atau 10 setiap bulan

### 2. Test Dulu
- Set payment date = hari ini
- Trigger manual via Netlify dashboard
- Pastikan dapat pesan di Telegram
- Baru set tanggal sebenarnya

### 3. Save Chat ID
- Simpan Chat ID di tempat aman
- Kalau ganti HP/Telegram, Chat ID bisa berubah
- Perlu update di Settings lagi

### 4. Keep Maintenance Active
- Kalau mau stop reminder → Click "Deactivate"
- Kalau mau mulai lagi → Click "Activate"

---

## 📝 Summary Flow:

```
1. Setiap hari jam 9 AM UTC (4 PM WIB)
   ↓
2. Netlify trigger scheduled function
   ↓
3. Function cek database:
   - Maintenance aktif?
   - Payment date = hari ini?
   - Belum kirim reminder hari ini?
   ↓
4. Kalau Yes semua:
   - Ambil Telegram Chat ID user
   - Kirim pesan ke Telegram
   - Update last_reminder_sent
   ↓
5. Done! User terima notifikasi di Telegram 🎉
```

---

## 🎊 Kesimpulan:

**Telegram Bot Reminder:**
- ✅ Berjalan **otomatis** setiap hari
- ✅ **Tidak perlu** manual trigger
- ✅ **Multi-user** support (setiap user terima reminder sendiri)
- ✅ **Recurring** (bulan depan otomatis kirim lagi)
- ✅ **Smart** (tidak kirim duplicate di hari yang sama)

**Yang Perlu Anda Lakukan:**
1. Isi Telegram Chat ID di Settings ✅
2. Setup maintenance dengan payment date ✅
3. Keep maintenance Active ✅
4. **DONE!** Duduk santai, bot yang kerja! 🤖

---

**Bot Token:** `8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o` ✅
**Schedule:** Every day at 9 AM UTC (4 PM WIB) ✅
**Status:** Active & Running ✅

**Happy Automating!** 🚀
