package handlers

import (
	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GamificationHandler struct {
	gamificationService services.GamificationService
}

func NewGamificationHandler(gamificationService services.GamificationService) *GamificationHandler {
	return &GamificationHandler{
		gamificationService: gamificationService,
	}
}

// GetUserGamificationData returns complete gamification data for a user
func (h *GamificationHandler) GetUserGamificationData(c *gin.Context) {
	userID := c.GetString("userID")
	
	data, err := h.gamificationService.GetUserGamificationData(c.Request.Context(), userID)
	if err != nil {
		// Log the actual error for debugging
		c.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get gamification data", "details": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, data)
}

// GetBadges returns all available badges
func (h *GamificationHandler) GetBadges(c *gin.Context) {
	badges, err := h.gamificationService.GetAllBadges(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get badges"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"badges": badges})
}

// GetUserBadges returns badges earned by a user
func (h *GamificationHandler) GetUserBadges(c *gin.Context) {
	userID := c.GetString("userID")
	
	badges, err := h.gamificationService.GetUserBadges(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user badges"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"badges": badges})
}

// GetDailyChallenges returns daily challenges for a user
func (h *GamificationHandler) GetDailyChallenges(c *gin.Context) {
	userID := c.GetString("userID")
	
	challenges, err := h.gamificationService.GetUserDailyChallenges(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily challenges"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"challenges": challenges})
}

// GetLeaderboard returns the leaderboard
func (h *GamificationHandler) GetLeaderboard(c *gin.Context) {
	// Get leaderboard type from query parameter
	leaderboardType := models.LeaderboardType(c.DefaultQuery("type", string(models.LeaderboardAllTime)))
	
	// Validate leaderboard type
	validTypes := map[models.LeaderboardType]bool{
		models.LeaderboardWeekly:  true,
		models.LeaderboardMonthly: true,
		models.LeaderboardAllTime: true,
	}
	
	if !validTypes[leaderboardType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid leaderboard type"})
		return
	}
	
	// Get pagination parameters
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	
	// Validate pagination
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	
	// Get leaderboard data
	entries, err := h.gamificationService.GetLeaderboard(c.Request.Context(), leaderboardType, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leaderboard"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"entries": entries,
		"type":    leaderboardType,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetUserLeaderboardPosition returns user's position on various leaderboards
func (h *GamificationHandler) GetUserLeaderboardPosition(c *gin.Context) {
	userID := c.GetString("userID")
	
	// Get positions for all leaderboard types
	positions := make(map[string]int)
	
	weeklyPos, err := h.gamificationService.GetUserLeaderboardPosition(c.Request.Context(), userID, models.LeaderboardWeekly)
	if err == nil {
		positions["weekly"] = weeklyPos
	}
	
	monthlyPos, err := h.gamificationService.GetUserLeaderboardPosition(c.Request.Context(), userID, models.LeaderboardMonthly)
	if err == nil {
		positions["monthly"] = monthlyPos
	}
	
	allTimePos, err := h.gamificationService.GetUserLeaderboardPosition(c.Request.Context(), userID, models.LeaderboardAllTime)
	if err == nil {
		positions["allTime"] = allTimePos
	}
	
	c.JSON(http.StatusOK, gin.H{"positions": positions})
}

// RegisterRoutes registers all gamification routes
func (h *GamificationHandler) RegisterRoutes(r *gin.RouterGroup) {
	gamification := r.Group("/gamification")
	{
		// User-specific data
		gamification.GET("/me", h.GetUserGamificationData)
		gamification.GET("/me/badges", h.GetUserBadges)
		gamification.GET("/me/challenges", h.GetDailyChallenges)
		gamification.GET("/me/position", h.GetUserLeaderboardPosition)
		
		// General data
		gamification.GET("/badges", h.GetBadges)
		gamification.GET("/leaderboard", h.GetLeaderboard)
	}
}