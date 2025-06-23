package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"language-exchange/internal/models"
)

// RateLimiter stores rate limiting data
type RateLimiter struct {
	mu       sync.RWMutex
	visitors map[string]*Visitor
	cleanup  time.Duration
}

// Visitor tracks request counts for rate limiting
type Visitor struct {
	lastSeen time.Time
	requests []time.Time
	blocked  bool
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(cleanupInterval time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		cleanup:  cleanupInterval,
	}
	
	// Start cleanup goroutine
	go rl.cleanupVisitors()
	
	return rl
}

// cleanupVisitors removes old entries periodically
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(rl.cleanup)
	defer ticker.Stop()
	
	for range ticker.C {
		rl.mu.Lock()
		for ip, visitor := range rl.visitors {
			if time.Since(visitor.lastSeen) > 24*time.Hour {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// getVisitor retrieves or creates a visitor entry
func (rl *RateLimiter) getVisitor(ip string) *Visitor {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	visitor, exists := rl.visitors[ip]
	if !exists {
		visitor = &Visitor{
			lastSeen: time.Now(),
			requests: make([]time.Time, 0),
		}
		rl.visitors[ip] = visitor
	}
	
	visitor.lastSeen = time.Now()
	return visitor
}

// RateLimitMiddleware creates IP-based rate limiting middleware
func (rl *RateLimiter) RateLimitMiddleware(requests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		visitor := rl.getVisitor(ip)
		
		rl.mu.Lock()
		defer rl.mu.Unlock()
		
		// Check if visitor is blocked
		if visitor.blocked {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error: "You have been temporarily blocked due to excessive requests",
			})
			c.Abort()
			return
		}
		
		// Remove old requests outside the window
		now := time.Now()
		validRequests := make([]time.Time, 0)
		for _, reqTime := range visitor.requests {
			if now.Sub(reqTime) < window {
				validRequests = append(validRequests, reqTime)
			}
		}
		visitor.requests = validRequests
		
		// Check rate limit
		if len(visitor.requests) >= requests {
			// Block if repeatedly hitting rate limit
			if len(visitor.requests) >= requests*2 {
				visitor.blocked = true
				// Unblock after 1 hour
				go func() {
					time.Sleep(time.Hour)
					rl.mu.Lock()
					visitor.blocked = false
					rl.mu.Unlock()
				}()
			}
			
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error: fmt.Sprintf("Rate limit exceeded. Maximum %d requests per %v", requests, window),
			})
			c.Abort()
			return
		}
		
		// Add current request
		visitor.requests = append(visitor.requests, now)
		
		c.Next()
	}
}

// UserRateLimiter handles user-specific rate limiting
type UserRateLimiter struct {
	mu         sync.RWMutex
	userLimits map[string]*UserLimitData
}

// UserLimitData tracks user-specific request data
type UserLimitData struct {
	dailyRequests    int
	lastReset        time.Time
	connectRequests  map[string][]time.Time // Track requests per recipient
	totalConnections int
}

// NewUserRateLimiter creates a new user-based rate limiter
func NewUserRateLimiter() *UserRateLimiter {
	url := &UserRateLimiter{
		userLimits: make(map[string]*UserLimitData),
	}
	
	// Reset daily limits at midnight
	go url.resetDailyLimits()
	
	return url
}

// resetDailyLimits resets user limits daily
func (url *UserRateLimiter) resetDailyLimits() {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()
	
	for range ticker.C {
		url.mu.Lock()
		for _, data := range url.userLimits {
			data.dailyRequests = 0
			data.lastReset = time.Now()
		}
		url.mu.Unlock()
	}
}

// getUserLimitData retrieves or creates user limit data
func (url *UserRateLimiter) getUserLimitData(userID string) *UserLimitData {
	url.mu.Lock()
	defer url.mu.Unlock()
	
	data, exists := url.userLimits[userID]
	if !exists {
		data = &UserLimitData{
			dailyRequests:    0,
			lastReset:        time.Now(),
			connectRequests:  make(map[string][]time.Time),
			totalConnections: 0,
		}
		url.userLimits[userID] = data
	}
	
	// Reset if it's a new day
	if time.Since(data.lastReset) > 24*time.Hour {
		data.dailyRequests = 0
		data.lastReset = time.Now()
	}
	
	return data
}

// CheckConnectionLimit checks if a user can send a connection request
func (url *UserRateLimiter) CheckConnectionLimit(userID, recipientID string) error {
	data := url.getUserLimitData(userID)
	
	url.mu.Lock()
	defer url.mu.Unlock()
	
	// Check daily limit (50 requests per day)
	if data.dailyRequests >= 50 {
		return &models.AppError{
			Code:    "DAILY_LIMIT_EXCEEDED",
			Message: "You have reached your daily connection request limit (50)",
			Status:  http.StatusTooManyRequests,
		}
	}
	
	// Check requests to specific recipient
	recipientRequests := data.connectRequests[recipientID]
	if recipientRequests == nil {
		recipientRequests = make([]time.Time, 0)
		data.connectRequests[recipientID] = recipientRequests
	}
	
	// Remove old requests (older than 1 week)
	now := time.Now()
	validRequests := make([]time.Time, 0)
	recentCount := 0
	for _, reqTime := range recipientRequests {
		if now.Sub(reqTime) < 7*24*time.Hour {
			validRequests = append(validRequests, reqTime)
			if now.Sub(reqTime) < 24*time.Hour {
				recentCount++
			}
		}
	}
	data.connectRequests[recipientID] = validRequests
	
	// Check if user has cancelled and re-sent too many times to same recipient
	if len(validRequests) >= 3 {
		return &models.AppError{
			Code:    "RECIPIENT_LIMIT_EXCEEDED",
			Message: "You have sent too many requests to this user. Please try again later.",
			Status:  http.StatusTooManyRequests,
		}
	}
	
	// Check if recently cancelled (within 24 hours)
	if recentCount > 0 {
		return &models.AppError{
			Code:    "REQUEST_COOLDOWN",
			Message: "You recently sent a request to this user. Please wait 24 hours before sending another.",
			Status:  http.StatusTooManyRequests,
		}
	}
	
	return nil
}

// RecordConnectionRequest records a successful connection request
func (url *UserRateLimiter) RecordConnectionRequest(userID, recipientID string) {
	data := url.getUserLimitData(userID)
	
	url.mu.Lock()
	defer url.mu.Unlock()
	
	data.dailyRequests++
	data.totalConnections++
	
	if data.connectRequests[recipientID] == nil {
		data.connectRequests[recipientID] = make([]time.Time, 0)
	}
	data.connectRequests[recipientID] = append(data.connectRequests[recipientID], time.Now())
}

// ConnectionRateLimitMiddleware creates middleware for connection request rate limiting
func (url *UserRateLimiter) ConnectionRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("userID")
		if !exists {
			c.Next()
			return
		}
		
		// Only apply to connection request endpoints
		if c.Request.URL.Path == "/api/matches/requests" && c.Request.Method == "POST" {
			// Extract recipient ID from request body
			var req struct {
				RecipientID string `json:"recipientId"`
			}
			if err := c.ShouldBindJSON(&req); err == nil && req.RecipientID != "" {
				if err := url.CheckConnectionLimit(userID.(string), req.RecipientID); err != nil {
					if appErr, ok := err.(*models.AppError); ok {
						c.JSON(appErr.Status, models.ErrorResponse{
							Error: appErr.Message,
							Code:  appErr.Code,
						})
						c.Abort()
						return
					}
				}
			}
		}
		
		c.Next()
	}
}