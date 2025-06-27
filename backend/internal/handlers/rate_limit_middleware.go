package handlers

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Simple in-memory rate limiter (replace with Redis in production)
type rateLimiter struct {
	mu      sync.Mutex
	limits  map[string]*userLimit
	window  time.Duration
	maxReqs int
}

type userLimit struct {
	count      int
	windowStart time.Time
}

var limiters = make(map[string]*rateLimiter)
var limitersMu sync.Mutex

// RateLimitMiddleware creates a rate limiting middleware
func RateLimitMiddleware(key string, maxRequests int, windowSeconds int) gin.HandlerFunc {
	limitersMu.Lock()
	if _, exists := limiters[key]; !exists {
		limiters[key] = &rateLimiter{
			limits:  make(map[string]*userLimit),
			window:  time.Duration(windowSeconds) * time.Second,
			maxReqs: maxRequests,
		}
	}
	limiter := limiters[key]
	limitersMu.Unlock()

	return func(c *gin.Context) {
		userID := c.GetString("userID")
		if userID == "" {
			// For unauthenticated requests, use IP
			userID = c.ClientIP()
		}

		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		now := time.Now()
		userKey := fmt.Sprintf("%s:%s", key, userID)

		// Check if user has a limit entry
		limit, exists := limiter.limits[userKey]
		if !exists || now.Sub(limit.windowStart) > limiter.window {
			// Create new window
			limiter.limits[userKey] = &userLimit{
				count:      1,
				windowStart: now,
			}
			c.Next()
			return
		}

		// Check if within limit
		if limit.count >= limiter.maxReqs {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"retry_after": limiter.window - now.Sub(limit.windowStart),
			})
			c.Abort()
			return
		}

		// Increment counter
		limit.count++
		c.Next()
	}
}

// Clean up old entries periodically (run in a goroutine)
func CleanupRateLimits() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		limitersMu.Lock()
		for _, limiter := range limiters {
			limiter.mu.Lock()
			now := time.Now()
			for key, limit := range limiter.limits {
				if now.Sub(limit.windowStart) > limiter.window*2 {
					delete(limiter.limits, key)
				}
			}
			limiter.mu.Unlock()
		}
		limitersMu.Unlock()
	}
}