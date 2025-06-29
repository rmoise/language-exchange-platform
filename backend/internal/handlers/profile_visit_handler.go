package handlers

import (
	"net/http"
	"strconv"
	"time"

	"language-exchange/internal/models"
	"language-exchange/internal/services"

	"github.com/gin-gonic/gin"
)

type ProfileVisitHandler struct {
	profileVisitService services.ProfileVisitService
}

func NewProfileVisitHandler(profileVisitService services.ProfileVisitService) *ProfileVisitHandler {
	return &ProfileVisitHandler{
		profileVisitService: profileVisitService,
	}
}

// RecordProfileVisit records when a user visits another user's profile
// POST /api/profile-visits
func (h *ProfileVisitHandler) RecordProfileVisit(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var request struct {
		ViewedUserID string `json:"viewedUserId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.profileVisitService.RecordVisit(c.Request.Context(), userID, request.ViewedUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record profile visit"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile visit recorded"})
}

// GetProfileVisits gets visitors to the authenticated user's profile
// GET /api/profile-visits
func (h *ProfileVisitHandler) GetProfileVisits(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse query parameters
	filters := models.ProfileVisitsFilters{}
	
	if timeWindow := c.Query("timeWindow"); timeWindow != "" {
		filters.TimeWindow = &timeWindow
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filters.Limit = limit
		}
	}

	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			filters.Page = page
		}
	}

	if sinceStr := c.Query("since"); sinceStr != "" {
		if since, err := time.Parse(time.RFC3339, sinceStr); err == nil {
			filters.SinceDate = &since
		}
	}

	response, err := h.profileVisitService.GetProfileVisits(c.Request.Context(), userID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile visits"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetRecentVisitorCount gets the count of recent visitors
// GET /api/profile-visits/count
func (h *ProfileVisitHandler) GetRecentVisitorCount(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	timeWindow := c.DefaultQuery("timeWindow", "week")

	count, err := h.profileVisitService.GetRecentVisitorCount(c.Request.Context(), userID, timeWindow)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get visitor count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count":      count,
		"timeWindow": timeWindow,
	})
}