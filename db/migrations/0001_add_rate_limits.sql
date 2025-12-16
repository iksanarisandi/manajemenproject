-- Migration: Add rate_limits table for API abuse prevention
CREATE TABLE IF NOT EXISTS "rate_limits" (
  "id" serial PRIMARY KEY NOT NULL,
  "identifier" varchar(255) NOT NULL,
  "endpoint" varchar(100) NOT NULL,
  "request_count" integer DEFAULT 1 NOT NULL,
  "window_start" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Index untuk query cepat berdasarkan identifier dan endpoint
CREATE INDEX IF NOT EXISTS "rate_limits_identifier_endpoint_idx" ON "rate_limits" ("identifier", "endpoint");

-- Index untuk cleanup old records
CREATE INDEX IF NOT EXISTS "rate_limits_window_start_idx" ON "rate_limits" ("window_start");
