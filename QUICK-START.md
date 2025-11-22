# Quick Start Guide

## Prerequisites Checklist
- ✅ Node.js 18+ installed
- ✅ Netlify account created
- ✅ Telegram account (for reminders)

## 5-Minute Setup

### 1. Install & Initialize
```bash
npm install
npm install -g netlify-cli
netlify login
netlify init
```

### 2. Enable Neon Database
1. Visit https://app.netlify.com
2. Select your site → **Integrations**
3. Enable **Neon** integration
4. Wait for `DATABASE_URL` to be added

### 3. Get Telegram Chat ID
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your Chat ID

### 4. Set Environment Variables
**In Netlify Dashboard** (Site settings → Environment variables):
```
JWT_SECRET = [Generate random string from randomkeygen.com]
TELEGRAM_BOT_TOKEN = 8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o
TELEGRAM_CHAT_ID = [Your Chat ID from step 3]
```

**In Local `.env` file**:
```bash
# Copy the DATABASE_URL from Netlify environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=same-as-netlify
TELEGRAM_BOT_TOKEN=8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o
TELEGRAM_CHAT_ID=your_chat_id
```

### 5. Run Migrations
```bash
npm run db:generate
npm run db:migrate
```

### 6. Test Locally
```bash
netlify dev
```
Open http://localhost:8888

### 7. Deploy
```bash
netlify deploy --prod
```

## Done! 🎉

Visit your Netlify URL and start using the app.

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `netlify dev` | Run local development server |
| `npm run build` | Build for production |
| `netlify deploy --prod` | Deploy to production |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open database studio |

## App Features

1. **Register/Login** → Create your account
2. **Add Clients** → Store client info with WhatsApp
3. **Create Projects** → Track project status & payments
4. **Setup Maintenance** → Auto-reminders via Telegram
5. **Configure Settings** → Add payment details

## WhatsApp Message Template

When you click "Send Reminder", the message sent is:
```
Halo kak [Client Name], pembayaran maintenance web [Project Name] 
senilai [Amount]. Mohon diselesaikan. Pembayaran bisa lewat 
e-wallet atau rekening. Terima kasih.
```

## Telegram Reminders

Automatic reminders are sent daily at 9 AM UTC if:
- Maintenance is active
- Today matches the payment date
- No reminder sent in the last 24 hours

## Need Help?

- Full guide: [README.md](./README.md)
- Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check Netlify function logs for errors
- Verify environment variables are set correctly

## Project Structure

```
manajemenProject/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── pages/            # Page components
│   └── context/          # Auth context
├── netlify/functions/     # API endpoints
├── db/                    # Database schema
└── scripts/              # Utility scripts
```

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon Postgres
- **ORM**: Drizzle
- **Auth**: JWT + bcrypt
- **Notifications**: Telegram Bot

## URLs

- **Production**: https://[your-site].netlify.app
- **Netlify Dashboard**: https://app.netlify.com
- **Local Dev**: http://localhost:8888

---

**Tip**: Bookmark this guide for quick reference!
