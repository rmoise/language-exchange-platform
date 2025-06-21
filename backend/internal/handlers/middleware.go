package handlers

import (
	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		log.Printf("Auth middleware - Path: %s, Authorization header: '%s'", c.Request.URL.Path, authHeader)
		
		if authHeader == "" {
			log.Printf("Auth middleware - No Authorization header found")
			errors.HandleError(c, models.ErrInvalidToken)
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			errors.HandleError(c, models.ErrInvalidToken)
			c.Abort()
			return
		}

		token := parts[1]
		log.Printf("Auth middleware - Validating token for path: %s", c.Request.URL.Path)
		user, err := authService.ValidateToken(token)
		if err != nil {
			log.Printf("Auth middleware - Token validation failed for path %s: %v", c.Request.URL.Path, err)
			errors.HandleError(c, err)
			c.Abort()
			return
		}
		log.Printf("Auth middleware - Token validation successful for path %s, user: %s", c.Request.URL.Path, user.ID)

		// Set user in context
		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// WebSocketAuthMiddleware is a special auth middleware for WebSocket connections
// that can read tokens from query parameters
func WebSocketAuthMiddleware(authService services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("WebSocket Auth middleware - Path: %s", c.Request.URL.Path)
		
		var token string
		
		// Try to get token from Authorization header first
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			log.Printf("WebSocket Auth middleware - Authorization header: '%s'", authHeader)
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
			}
		}
		
		// If no token in header, try query parameter
		if token == "" {
			token = c.Query("token")
			if token != "" {
				log.Printf("WebSocket Auth middleware - Token from query param")
			}
		}
		
		if token == "" {
			log.Printf("WebSocket Auth middleware - No token found")
			errors.HandleError(c, models.ErrInvalidToken)
			c.Abort()
			return
		}

		log.Printf("WebSocket Auth middleware - Validating token for path: %s", c.Request.URL.Path)
		user, err := authService.ValidateToken(token)
		if err != nil {
			log.Printf("WebSocket Auth middleware - Token validation failed for path %s: %v", c.Request.URL.Path, err)
			errors.HandleError(c, err)
			c.Abort()
			return
		}
		log.Printf("WebSocket Auth middleware - Token validation successful for path %s, user: %s", c.Request.URL.Path, user.ID)

		// Set user in context
		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Next()
	}
}

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		errors.SendError(c, 500, "INTERNAL_SERVER_ERROR", "Internal server error")
	})
}