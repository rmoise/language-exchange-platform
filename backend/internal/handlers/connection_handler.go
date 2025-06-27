package handlers

import (
	"net/http"
	"strconv"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type ConnectionHandler struct {
	connectionService services.ConnectionService
}

func NewConnectionHandler(connectionService services.ConnectionService) *ConnectionHandler {
	return &ConnectionHandler{
		connectionService: connectionService,
	}
}

// ToggleFollow handles POST /connections/toggle
func (h *ConnectionHandler) ToggleFollow(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.FollowUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	isNowFollowing, err := h.connectionService.ToggleFollow(c.Request.Context(), userID, input.UserID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	message := "Unfollowed successfully"
	if isNowFollowing {
		message = "Followed successfully"
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"is_following": isNowFollowing,
			"target_user_id": input.UserID,
		},
		"message": message,
	})
}

// GetFollowing handles GET /connections/following
func (h *ConnectionHandler) GetFollowing(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	response, err := h.connectionService.GetFollowing(c.Request.Context(), userID, limit, offset)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": "Following list retrieved successfully",
	})
}

// GetFollowers handles GET /connections/followers
func (h *ConnectionHandler) GetFollowers(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	response, err := h.connectionService.GetFollowers(c.Request.Context(), userID, limit, offset)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": "Followers list retrieved successfully",
	})
}

// GetConnectionStatus handles GET /connections/status/:userId
func (h *ConnectionHandler) GetConnectionStatus(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	status, err := h.connectionService.GetConnectionStatus(c.Request.Context(), userID, targetUserID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    status,
		"message": "Connection status retrieved successfully",
	})
}

// GetUserFollowing handles GET /connections/users/:userId/following
func (h *ConnectionHandler) GetUserFollowing(c *gin.Context) {
	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	response, err := h.connectionService.GetFollowing(c.Request.Context(), targetUserID, limit, offset)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": "User following list retrieved successfully",
	})
}

// GetUserFollowers handles GET /connections/users/:userId/followers
func (h *ConnectionHandler) GetUserFollowers(c *gin.Context) {
	targetUserID := c.Param("userId")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	response, err := h.connectionService.GetFollowers(c.Request.Context(), targetUserID, limit, offset)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": "User followers list retrieved successfully",
	})
}