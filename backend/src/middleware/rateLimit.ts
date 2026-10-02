import { Request, Response, NextFunction } from "express"

interface RateLimitEntry {
    count: number
    resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10

function getRateLimitKey(req: Request): string {
    return req.ip ?? req.socket.remoteAddress ?? "unknown"
}

export function rateLimit(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
    return (req: Request, res: Response, next: NextFunction) => {
        const key = getRateLimitKey(req)
        const now = Date.now()

        let entry = store.get(key)

        // Expire old window
        if (!entry || now > entry.resetAt) {
            entry = { count: 0, resetAt: now + windowMs }
            store.set(key, entry)
        }

        entry.count++

        // Store headers for client feedback
        res.set("X-RateLimit-Limit", String(maxRequests))
        res.set("X-RateLimit-Remaining", String(Math.max(0, maxRequests - entry.count)))
        res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)))

        if (entry.count > maxRequests) {
            return res.status(429).json({ error: "Liian monta pyyntöä. Yritä myöhemmin uudelleen." })
        }

        next()
    }
}

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) {
            store.delete(key)
        }
    }
}, WINDOW_MS * 2)
