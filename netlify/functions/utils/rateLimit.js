import { getDb } from '../../../db/connection.js'
import { rateLimits } from '../../../db/schema.js'
import { eq, and, gt } from 'drizzle-orm'

// Rate limit configuration per endpoint (requests per window)
const RATE_LIMITS = {
  // Auth endpoints - lebih ketat untuk mencegah brute force
  login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per menit
  register: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 requests per menit
  verify: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per menit
  
  // Data endpoints - moderate limit
  clients: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per menit
  projects: { maxRequests: 60, windowMs: 60 * 1000 },
  maintenance: { maxRequests: 60, windowMs: 60 * 1000 },
  settings: { maxRequests: 30, windowMs: 60 * 1000 },
  
  // Test/admin endpoints - ketat
  'test-reminder': { maxRequests: 5, windowMs: 60 * 1000 },
  'setup-database': { maxRequests: 2, windowMs: 60 * 1000 },
  
  // Default untuk endpoint lain
  default: { maxRequests: 30, windowMs: 60 * 1000 },
}

/**
 * Get client identifier dari request (IP address)
 */
export function getClientIdentifier(event) {
  // Netlify menyediakan client IP di headers
  const ip = event.headers['x-nf-client-connection-ip'] 
    || event.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || event.headers['client-ip']
    || 'unknown'
  
  return ip
}

/**
 * Check rate limit untuk request
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: Date }
 */
export async function checkRateLimit(identifier, endpoint) {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default
  const { maxRequests, windowMs } = config
  
  const db = getDb()
  const windowStart = new Date(Date.now() - windowMs)
  
  try {
    // Cari existing rate limit record dalam window
    const existing = await db.select()
      .from(rateLimits)
      .where(and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.endpoint, endpoint),
        gt(rateLimits.windowStart, windowStart)
      ))
      .limit(1)
    
    if (existing.length === 0) {
      // Belum ada record, buat baru
      await db.insert(rateLimits).values({
        identifier,
        endpoint,
        requestCount: 1,
        windowStart: new Date(),
      })
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: new Date(Date.now() + windowMs),
      }
    }
    
    const record = existing[0]
    const newCount = record.requestCount + 1
    
    if (newCount > maxRequests) {
      // Rate limit exceeded
      const resetTime = new Date(new Date(record.windowStart).getTime() + windowMs)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      }
    }
    
    // Update counter
    await db.update(rateLimits)
      .set({ requestCount: newCount })
      .where(eq(rateLimits.id, record.id))
    
    return {
      allowed: true,
      remaining: maxRequests - newCount,
      resetTime: new Date(new Date(record.windowStart).getTime() + windowMs),
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Jika error, allow request tapi log error
    return { allowed: true, remaining: -1, resetTime: null }
  }
}

/**
 * Rate limit headers untuk response
 */
export function rateLimitHeaders(result, config) {
  return {
    'X-RateLimit-Limit': String(config?.maxRequests || 30),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': result.resetTime ? result.resetTime.toISOString() : '',
  }
}

/**
 * Middleware wrapper untuk rate limiting
 */
export async function withRateLimit(event, endpoint, handler) {
  const identifier = getClientIdentifier(event)
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default
  const result = await checkRateLimit(identifier, endpoint)
  
  if (!result.allowed) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        ...rateLimitHeaders(result, config),
      },
      body: JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
    }
  }
  
  // Execute handler dan tambahkan rate limit headers ke response
  const response = await handler()
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...rateLimitHeaders(result, config),
    },
  }
}

/**
 * Cleanup old rate limit records (bisa dipanggil secara berkala)
 */
export async function cleanupOldRateLimits() {
  const db = getDb()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 jam lalu
  
  try {
    await db.delete(rateLimits)
      .where(gt(cutoff, rateLimits.windowStart))
    
    return { success: true }
  } catch (error) {
    console.error('Cleanup rate limits error:', error)
    return { success: false, error }
  }
}
