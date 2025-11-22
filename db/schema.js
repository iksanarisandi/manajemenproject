import { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core'

export const projectStatusEnum = pgEnum('project_status', ['draft', 'in-progress', 'revision', 'completed'])
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'down-payment', 'paid'])
export const acceptanceStatusEnum = pgEnum('acceptance_status', ['accepted', 'cancelled'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  wa: varchar('wa', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  value: decimal('value', { precision: 15, scale: 2 }).notNull(),
  projectStatus: projectStatusEnum('project_status').notNull().default('draft'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  acceptanceStatus: acceptanceStatusEnum('acceptance_status').notNull().default('accepted'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const maintenance = pgTable('maintenance', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  initialCost: decimal('initial_cost', { precision: 15, scale: 2 }).notNull(),
  monthlyCost: decimal('monthly_cost', { precision: 15, scale: 2 }).notNull(),
  paymentDate: integer('payment_date').notNull(),
  active: boolean('active').notNull().default(true),
  lastReminderSent: timestamp('last_reminder_sent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const ownerSettings = pgTable('owner_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  bankAccount: varchar('bank_account', { length: 255 }),
  ewallet: text('ewallet'),
  telegramChatId: varchar('telegram_chat_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
