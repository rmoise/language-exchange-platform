package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"language-exchange/internal/models"
	"language-exchange/internal/services"
)

type BookmarkHandler struct {
	bookmarkService *services.BookmarkService
}

func NewBookmarkHandler(bookmarkService *services.BookmarkService) *BookmarkHandler {
	return &BookmarkHandler{
		bookmarkService: bookmarkService,
	}
}

// ToggleBookmark handles POST/DELETE /bookmarks
func (h *BookmarkHandler) ToggleBookmark(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.BookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	response, err := h.bookmarkService.ToggleBookmark(c.Request.Context(), userID, req.PostID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle bookmark: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": response.Message,
	})
}

// GetUserBookmarks handles GET /bookmarks
func (h *BookmarkHandler) GetUserBookmarks(c *gin.Context) {
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

	posts, totalCount, err := h.bookmarkService.GetUserBookmarks(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get bookmarks: " + err.Error()})
		return
	}

	// Calculate pagination info
	hasMore := offset+len(posts) < totalCount
	nextOffset := offset + len(posts)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"posts":       posts,
			"total_count": totalCount,
			"has_more":    hasMore,
			"next_offset": nextOffset,
			"limit":       limit,
		},
		"message": "Bookmarks retrieved successfully",
	})
}

// CheckBookmarkStatus handles GET /bookmarks/status/:postId
func (h *BookmarkHandler) CheckBookmarkStatus(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	postID := c.Param("postId")
	if postID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Post ID is required"})
		return
	}

	isBookmarked, err := h.bookmarkService.IsBookmarked(c.Request.Context(), userID, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check bookmark status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"post_id":       postID,
			"is_bookmarked": isBookmarked,
		},
		"message": "Bookmark status retrieved successfully",
	})
}