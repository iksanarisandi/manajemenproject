# Quick Deployment Guide

## Step-by-Step Deployment to Netlify

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 3. Login to Netlify

```bash
netlify login
```

This will open a browser window to authenticate.

### 4. Create a New Netlify Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Enter site name (or leave blank for random name)
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

### 5. Enable Neon Database Integration

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Integrations** tab
4. Search for **Neon**
5. Click **Enable** and follow setup
6. Wait for the integration to complete
7. Note: `DATABASE_URL` is automatically added to environment variables

### 6. Get Your Telegram Chat ID

1. Open Telegram and search for [@userinfobot](https://t.me/userinfobot)
2. Send `/start` or any message
3. Copy your Chat ID (will be a number like `123456789`)

### 7. Add Environment Variables

Go to your Netlify site → **Site settings** → **Environment variables**

Add these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | *(Already set by Neon integration)* |
| `JWT_SECRET` | Generate a random string (use https://randomkeygen.com/) |
| `TELEGRAM_BOT_TOKEN` | `[YOUR_BOT_TOKEN_HERE]` |
| `TELEGRAM_CHAT_ID` | Your chat ID from step 6 |

### 8. Setup Local Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add the same values from Netlify.

**Important**: Get `DATABASE_URL` from:
1. Netlify Dashboard → Site settings → Environment variables
2. Copy the `DATABASE_URL` value

### 9. Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations to Neon database
npm run db:migrate
```

### 10. Test Locally

```bash
netlify dev
```

Open http://localhost:8888 and test:
- Register a new account
- Add a client
- Create a project
- Setup maintenance

### 11. Deploy to Production

```bash
netlify deploy --prod
```

Or push to Git for automatic deployment:

```bash
git add .
git commit -m "Initial deployment"
git push
```

### 12. Verify Scheduled Function

1. Go to Netlify Dashboard → **Functions**
2. Find `scheduled-reminders`
3. Verify schedule is set: `0 9 * * *` (9 AM UTC daily)
4. Test by clicking **Trigger** button

### 13. Start Using Your App

1. Visit your Netlify site URL (e.g., `https://your-site.netlify.app`)
2. Register an account
3. Start managing your projects!

## Updating Your App

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push
```

Or manually:

```bash
netlify deploy --prod
```

## Troubleshooting

### "DATABASE_URL is not defined"
- Make sure Neon integration is enabled in Netlify
- Check environment variables in Site settings
- Restart your local dev server after adding .env

### "Failed to connect to database"
- Verify DATABASE_URL is correct
- Check if Neon database is active
- Ensure you've run migrations

### "Telegram reminders not working"
- Verify TELEGRAM_BOT_TOKEN is correct
- Check TELEGRAM_CHAT_ID is a number (not a username)
- Check function logs in Netlify dashboard

### Build fails on Netlify
- Check build logs in Netlify dashboard
- Verify all dependencies are in package.json
- Ensure environment variables are set

## Getting Help

- Check the main [README.md](./README.md) for detailed information
- View Netlify function logs for debugging
- Check Neon database logs for database issues

## Next Steps

- Customize the UI colors in `tailwind.config.js`
- Add more features to suit your needs
- Set up custom domain in Netlify
- Enable form notifications
- Add analytics
