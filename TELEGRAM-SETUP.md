# Telegram Setup Guide

## Overview

Telegram reminders are now **per-user configurable**! Each user can set their own Telegram Chat ID in Profile Settings.

## How It Works

### For Users
1. Go to **Settings** page in the app
2. Find the "Telegram Chat ID" field
3. Get your Chat ID from [@userinfobot](https://t.me/userinfobot) on Telegram
4. Paste it and save
5. You'll now receive maintenance payment reminders in your Telegram!

### For Developers/Admin
- Only `TELEGRAM_BOT_TOKEN` is required as environment variable
- `TELEGRAM_CHAT_ID` in environment is now optional (fallback only)
- Each user sets their own Chat ID in their profile settings

## Getting Your Telegram Chat ID

### Step 1: Open Telegram
Search for and message: **@userinfobot**

### Step 2: Send a Message
Send any message (e.g., `/start` or "hello")

### Step 3: Copy Your Chat ID
The bot will reply with your user info. Copy the **Id** number (e.g., `123456789`)

### Step 4: Enter in Settings
1. Login to the app
2. Go to **Settings** → **Payment Information**
3. Paste your Chat ID in "Telegram Chat ID" field
4. Click **Save Settings**

## How Reminders Work

### Automatic Daily Check
- Runs daily at **9 AM UTC**
- Checks all active maintenance records
- If payment date matches today's date
- Sends reminder to user's Telegram Chat ID

### Reminder Message Format
```
🔔 Maintenance Payment Reminder

Client: [Client Name]
Project: [Project Name]
Amount: Rp [Amount]
Due Date: [Day] of this month
WhatsApp: [Client WhatsApp]

Message to send:
"Halo kak [Client], pembayaran maintenance web [Project] senilai [Amount]. 
Mohon diselesaikan. Pembayaran bisa lewat e-wallet atau rekening. Terima kasih."
```

### Manual Reminders
- You can also send manual reminders anytime
- Go to **Maintenance** page
- Click **"Send Reminder"** button
- Opens WhatsApp with pre-filled message

## Multi-User Support

✅ Each user has their own Telegram Chat ID
✅ Reminders sent to respective users
✅ Privacy maintained (users don't see each other's data)

## Environment Variables

### Required
```env
TELEGRAM_BOT_TOKEN=[your-bot-token-here]
```

### Optional (Fallback)
```env
TELEGRAM_CHAT_ID=your_fallback_chat_id
```

## Troubleshooting

### "No reminders received"
1. Check if Telegram Chat ID is saved in Settings
2. Verify the Chat ID is correct (message @userinfobot again)
3. Ensure maintenance is **Active**
4. Check if payment date matches today

### "Invalid Chat ID"
- Chat ID must be numbers only
- Don't include @ or username
- Use the numeric ID from @userinfobot

### "Bot not responding"
- Verify TELEGRAM_BOT_TOKEN is correct
- Check Netlify function logs for errors

## Testing Reminders

### Test Locally
```bash
# Set test maintenance with today's date
# Add your Chat ID in settings
# Manually trigger the function
netlify dev
```

### Test on Netlify
1. Go to Netlify Dashboard → Functions
2. Find `scheduled-reminders`
3. Click **Trigger** to manually run
4. Check your Telegram for the message

## Security Notes

- Chat IDs are stored securely in database
- Each user can only see/edit their own Chat ID
- Bot token is server-side only (never exposed to frontend)
- Messages sent only to configured users

## Benefits

✅ **Privacy**: Each user gets their own reminders
✅ **Flexibility**: Users can change Chat ID anytime
✅ **No Admin Needed**: Users set it up themselves
✅ **Scalable**: Works for unlimited users

## Example Flow

1. **User A** sets Chat ID: `111111111`
2. **User B** sets Chat ID: `222222222`
3. Maintenance payment due for **User A's** client
4. Reminder sent to `111111111` (User A's Telegram)
5. User B doesn't get the notification
6. ✅ Perfect privacy!

---

**Previous Setup (OLD)**
❌ Single TELEGRAM_CHAT_ID in environment
❌ All reminders to one admin
❌ Not scalable for multiple users

**New Setup (CURRENT)**
✅ Per-user Chat ID in profile settings
✅ Each user gets their own reminders
✅ Fully scalable and private

---

Need help? Check [README.md](./README.md) or [QUICK-START.md](./QUICK-START.md)
