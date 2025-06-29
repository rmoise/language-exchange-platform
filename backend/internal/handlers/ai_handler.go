package handlers

import (
	"net/http"
	"strings"
	"time"

	"language-exchange/internal/models"
	"language-exchange/pkg/errors"
	
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type AIHandler struct {
	db *sqlx.DB
}

func NewAIHandler(db *sqlx.DB) *AIHandler {
	return &AIHandler{db: db}
}

const FREE_MONTHLY_LIMIT = 50

// ImproveMessage handles AI-powered message improvement
func (h *AIHandler) ImproveMessage(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Parse request
	var req models.ImproveMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Check user
	var user models.User
	err := h.db.Get(&user, "SELECT * FROM users WHERE id = $1", userID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to get user")
		return
	}

	// Count usage for non-pro users
	var count int
	if user.PlanType != "pro" {
		// Get start of current month
		now := time.Now()
		startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		
		// Count this month's usage
		err = h.db.Get(&count, 
			"SELECT COUNT(*) FROM ai_usage_logs WHERE user_id = $1 AND created_at >= $2",
			userID, startOfMonth)
		if err != nil {
			errors.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to count usage")
			return
		}

		// Check if limit exceeded
		if count >= FREE_MONTHLY_LIMIT {
			// Return upgrade prompt
			c.JSON(http.StatusTooManyRequests, models.ImproveMessageResponse{
				NeedsUpgrade: true,
				Original:     req.Text,
				Preview:      h.generatePreview(req.Text),
				Message:      "You've used all 50 free improvements this month! Upgrade to Pro for unlimited improvements.",
				Used:         int64(count),
				Limit:        FREE_MONTHLY_LIMIT,
			})
			return
		}
	}

	// Log usage
	_, err = h.db.Exec(
		"INSERT INTO ai_usage_logs (user_id, type, created_at) VALUES ($1, $2, $3)",
		userID, "improvement", time.Now())
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to log usage")
		return
	}

	// Generate improvement
	improved := h.getMockImprovement(req.Text)

	// Return response
	response := models.ImproveMessageResponse{
		Original: req.Text,
		Improved: improved,
		IsPro:    user.PlanType == "pro",
	}

	// Add usage info for free users
	if user.PlanType != "pro" {
		response.Remaining = int64(FREE_MONTHLY_LIMIT - count - 1)
		response.Used = int64(count + 1)
		response.Limit = int64(FREE_MONTHLY_LIMIT)
	}

	errors.SendSuccess(c, response)
}

// GetUsageStats returns the user's AI usage statistics
func (h *AIHandler) GetUsageStats(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Get user
	var user models.User
	err := h.db.Get(&user, "SELECT * FROM users WHERE id = $1", userID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to get user")
		return
	}

	stats := models.AIUsageStats{
		IsPro:    user.PlanType == "pro",
		PlanType: user.PlanType,
	}

	// Count usage for non-pro users
	if user.PlanType != "pro" {
		now := time.Now()
		startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		
		var count int64
		err = h.db.Get(&count,
			"SELECT COUNT(*) FROM ai_usage_logs WHERE user_id = $1 AND created_at >= $2",
			userID, startOfMonth)
		if err != nil {
			// Log error but continue with zero count
			count = 0
		}

		stats.Used = count
		stats.Limit = FREE_MONTHLY_LIMIT
		stats.Remaining = FREE_MONTHLY_LIMIT - count
		if stats.Remaining < 0 {
			stats.Remaining = 0
		}
		// stats.LastResetDate = startOfMonth.Format("2006-01-02")
		
		// Calculate next reset date (first day of next month)
		// nextMonth := startOfMonth.AddDate(0, 1, 0)
		// stats.NextResetDate = nextMonth.Format("2006-01-02")
	}

	errors.SendSuccess(c, stats)
}

// generatePreview generates a preview of the improved message
func (h *AIHandler) generatePreview(text string) string {
	// Take first 50 chars and add "..."
	preview := text
	if len(preview) > 50 {
		// Find last space before 50 chars
		lastSpace := strings.LastIndex(preview[:50], " ")
		if lastSpace > 0 {
			preview = preview[:lastSpace]
		} else {
			preview = preview[:50]
		}
		preview += "..."
	}
	
	// Simple improvements for preview
	preview = strings.ReplaceAll(preview, "u", "you")
	preview = strings.ReplaceAll(preview, "ur", "your")
	
	return preview
}

// getMockImprovement returns a mock improved version of the text
func (h *AIHandler) getMockImprovement(text string) string {
	// This is a mock implementation
	// In production, this would call an actual AI service
	
	// Simple text replacements for demo
	improved := text
	
	// Common abbreviations
	improved = strings.ReplaceAll(improved, " u ", " you ")
	improved = strings.ReplaceAll(improved, " ur ", " your ")
	improved = strings.ReplaceAll(improved, " r ", " are ")
	improved = strings.ReplaceAll(improved, " thx ", " thanks ")
	improved = strings.ReplaceAll(improved, " pls ", " please ")
	
	// Capitalization
	if len(improved) > 0 {
		improved = strings.ToUpper(improved[:1]) + improved[1:]
	}
	
	// Add punctuation if missing
	if len(improved) > 0 {
		lastChar := improved[len(improved)-1]
		if lastChar != '.' && lastChar != '!' && lastChar != '?' {
			improved += "."
		}
	}
	
	return improved
}