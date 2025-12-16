import { neon } from '@neondatabase/serverless'
import { corsHeaders } from './utils/auth.js'

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
    const sql = neon(databaseUrl)

    // Create enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE project_status AS ENUM ('draft', 'in-progress', 'revision', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('unpaid', 'down-payment', 'paid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    await sql`
      DO $$ BEGIN
        CREATE TYPE acceptance_status AS ENUM ('accepted', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        wa VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(15, 2) NOT NULL,
        project_status project_status NOT NULL DEFAULT 'draft',
        payment_status payment_status NOT NULL DEFAULT 'unpaid',
        acceptance_status acceptance_status NOT NULL DEFAULT 'accepted',
        date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create maintenance table
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        initial_cost DECIMAL(15, 2) NOT NULL,
        monthly_cost DECIMAL(15, 2) NOT NULL,
        payment_date INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        last_reminder_sent TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create owner_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS owner_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        bank_account VARCHAR(255),
        ewallet TEXT,
        telegram_chat_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create rate_limits table untuk API abuse prevention
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        endpoint VARCHAR(100) NOT NULL,
        request_count INTEGER DEFAULT 1 NOT NULL,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `

    // Create indexes for rate_limits
    await sql`
      CREATE INDEX IF NOT EXISTS rate_limits_identifier_endpoint_idx 
      ON rate_limits (identifier, endpoint)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx 
      ON rate_limits (window_start)
    `

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: true,
        message: 'Database tables created successfully!',
      }),
    }
  } catch (error) {
    console.error('Database setup error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Failed to setup database',
        details: error.message,
      }),
    }
  }
}
