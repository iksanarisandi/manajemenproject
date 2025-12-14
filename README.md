# Project Management Web App

A full-stack project management application built with React, Netlify Functions, and Neon Postgres. Features client management, project tracking, maintenance scheduling, and automated Telegram reminders.

## Features

- **Authentication**: Secure email/password login with JWT tokens
- **Client Management**: Store client information with WhatsApp integration
- **Project Management**: Track projects with multiple status fields (project, payment, acceptance)
- **Maintenance Scheduling**: Automatic reminders via Telegram for monthly maintenance payments
- **Mobile-First Design**: Responsive UI with bottom navigation and smooth animations
- **WhatsApp Integration**: Direct messaging to clients with pre-filled templates

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, Axios
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon Postgres with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Notifications**: Telegram Bot API

## Prerequisites

- Node.js 18+ and npm
- Netlify CLI (`npm install -g netlify-cli`)
- Netlify account
- Telegram account (for reminders)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Neon Database via Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Create a new site or select an existing one
3. Go to **Integrations** tab
4. Search for "Neon" and click **Enable**
5. Follow the prompts to create a Neon database
6. Once enabled, Netlify will automatically inject `DATABASE_URL` environment variable

### 3. Get Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions to create your bot
3. Copy the bot token provided
4. Search for [@userinfobot](https://t.me/userinfobot) on Telegram
5. Send any message to get your Chat ID

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in the values:

```env
DATABASE_URL=your_neon_database_url_from_netlify
JWT_SECRET=your_random_secret_key_here
TELEGRAM_BOT_TOKEN=[YOUR_BOT_TOKEN_HERE]
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

**Important**: Get `DATABASE_URL` from Netlify environment variables after enabling Neon integration.

### 5. Generate and Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

### 6. Add Environment Variables to Netlify

Add the same environment variables to your Netlify site:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:
   - `DATABASE_URL` (should already be there from Neon integration)
   - `JWT_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

## Development

Start the development server with Netlify Dev (includes Functions):

```bash
netlify dev
```

This will start:
- Frontend dev server on `http://localhost:8888`
- Netlify Functions on `http://localhost:8888/.netlify/functions`

## Building for Production

```bash
npm run build
```

## Deployment

### Deploy with Netlify CLI

1. **Link your site** (first time only):

```bash
netlify link
```

2. **Deploy to production**:

```bash
netlify deploy --prod
```

Or use automatic deployment:

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Connect to Netlify (follow prompts)
netlify init
```

After setup, every push to your main branch will automatically deploy.

## Setting Up Scheduled Reminders

To enable daily automatic Telegram reminders:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Functions**
3. Add a scheduled function:
   - Function: `scheduled-reminders`
   - Schedule: `0 9 * * *` (runs at 9 AM UTC daily)
   - Or use Netlify's UI to set up the schedule

Alternatively, add this to your `netlify.toml`:

```toml
[functions."scheduled-reminders"]
  schedule = "0 9 * * *"
```

## Database Management

View and manage your database:

```bash
npm run db:studio
```

This opens Drizzle Studio at `https://local.drizzle.studio`

## API Endpoints

### Authentication
- `POST /.netlify/functions/register` - Register new user
- `POST /.netlify/functions/login` - Login user
- `GET /.netlify/functions/verify` - Verify JWT token

### Clients
- `GET /.netlify/functions/clients` - Get all clients
- `POST /.netlify/functions/clients` - Create client
- `PUT /.netlify/functions/clients` - Update client
- `DELETE /.netlify/functions/clients` - Delete client

### Projects
- `GET /.netlify/functions/projects` - Get all projects
- `POST /.netlify/functions/projects` - Create project
- `PUT /.netlify/functions/projects` - Update project
- `DELETE /.netlify/functions/projects` - Delete project

### Maintenance
- `GET /.netlify/functions/maintenance` - Get all maintenance records
- `POST /.netlify/functions/maintenance` - Create maintenance
- `PUT /.netlify/functions/maintenance` - Update maintenance
- `DELETE /.netlify/functions/maintenance` - Delete maintenance

### Settings
- `GET /.netlify/functions/settings` - Get owner settings
- `PUT /.netlify/functions/settings` - Update owner settings

### Scheduled
- `/.netlify/functions/scheduled-reminders` - Daily reminder check (automated)

## Project Structure

```
manajemenProject/
├── db/
│   ├── schema.js              # Drizzle ORM schema
│   ├── connection.js          # Database connection
│   └── migrations/            # Generated migrations
├── netlify/
│   └── functions/             # Serverless functions
│       ├── utils/             # Shared utilities
│       ├── register.js
│       ├── login.js
│       ├── verify.js
│       ├── clients.js
│       ├── projects.js
│       ├── maintenance.js
│       ├── settings.js
│       └── scheduled-reminders.js
├── src/
│   ├── components/            # React components
│   ├── context/               # React context
│   ├── pages/                 # Page components
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scripts/
│   └── migrate.js            # Migration script
├── index.html
├── package.json
├── netlify.toml              # Netlify configuration
├── vite.config.js
├── tailwind.config.js
└── drizzle.config.js

```

## Usage

### 1. Register/Login
- Create an account or login with existing credentials
- JWT token is stored in localStorage

### 2. Add Clients
- Navigate to **Clients** tab
- Click **+ Add Client**
- Fill in name and WhatsApp number (format: 628123456789)
- Click WhatsApp button to send messages directly

### 3. Create Projects
- Navigate to **Projects** tab
- Click **+ Add Project**
- Select client, enter project details
- Set project status, payment status, and acceptance status

### 4. Setup Maintenance
- Complete a project first (status = "completed")
- Navigate to **Maintenance** tab
- Click **+ Add Maintenance**
- Select completed project and set costs
- Choose payment date (day of month)

### 5. Send Reminders
- **Manual**: Click "Send Reminder" button on maintenance card
- **Automatic**: Telegram bot sends reminders on payment due dates

### 6. Configure Payment Info
- Navigate to **Settings** tab
- Add bank account and e-wallet information
- This info helps clients know where to pay

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly set in `.env` and Netlify environment variables
- Verify Neon database is accessible
- Check if migrations have been run

### Netlify Functions Not Working
- Run `netlify dev` instead of `vite` for local development
- Check function logs in Netlify dashboard
- Ensure all environment variables are set

### Telegram Reminders Not Sending
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
- Test by manually triggering the scheduled function
- Check function logs in Netlify dashboard

## Security Notes

- Never commit `.env` file to version control
- Use strong JWT secrets (32+ random characters)
- Keep your Telegram bot token private
- Database credentials are auto-managed by Netlify

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
