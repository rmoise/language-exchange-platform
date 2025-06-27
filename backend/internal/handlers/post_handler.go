package handlers

import (
	"context"
	"net/http"
	"strconv"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	postService services.PostService
}

func NewPostHandler(postService services.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

// CreatePost creates a new post
// @Summary Create a new post
// @Tags posts
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param post body models.CreatePostInput true "Post data"
// @Success 201 {object} models.Post
// @Router /posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.postService.CreatePost(c.Request.Context(), userID, input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, post)
}

// GetPost retrieves a single post
// @Summary Get a post by ID
// @Tags posts
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {object} models.Post
// @Router /posts/{id} [get]
func (h *PostHandler) GetPost(c *gin.Context) {
	postID := c.Param("id")

	// Create context with userID if available
	ctx := c.Request.Context()
	if userID := c.GetString("userID"); userID != "" {
		ctx = context.WithValue(ctx, "userID", userID)
	}

	post, err := h.postService.GetPost(ctx, postID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, post)
}

// UpdatePost updates a post
// @Summary Update a post
// @Tags posts
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Post ID"
// @Param post body models.UpdatePostInput true "Post update data"
// @Success 200 {object} models.Post
// @Router /posts/{id} [put]
func (h *PostHandler) UpdatePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	postID := c.Param("id")

	var input models.UpdatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.postService.UpdatePost(c.Request.Context(), userID, postID, input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, post)
}

// DeletePost deletes a post
// @Summary Delete a post
// @Tags posts
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Post ID"
// @Success 204
// @Router /posts/{id} [delete]
func (h *PostHandler) DeletePost(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	postID := c.Param("id")

	err := h.postService.DeletePost(c.Request.Context(), userID, postID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// ListPosts retrieves a list of posts with pagination
// @Summary List posts
// @Tags posts
// @Produce json
// @Param cursor query int64 false "Cursor for pagination"
// @Param limit query int false "Number of posts to return (max 100)"
// @Param category query string false "Filter by category"
// @Param search query string false "Search query"
// @Param sort query string false "Sort by: created_at, reactions, comments, trending"
// @Success 200 {object} models.PostListResponse
// @Router /posts [get]
func (h *PostHandler) ListPosts(c *gin.Context) {
	// Get current user ID if authenticated
	currentUserID := c.GetString("userID")
	
	filters := models.PostFilters{
		SortBy:        "created_at",
		SortOrder:     "desc",
		Limit:         20,
		CurrentUserID: currentUserID,
	}

	// Parse query parameters
	if cursor := c.Query("cursor"); cursor != "" {
		if cursorID, err := strconv.ParseInt(cursor, 10, 64); err == nil {
			filters.CursorID = cursorID
		}
	}

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 && l <= 100 {
			filters.Limit = l
		}
	}

	if category := c.Query("category"); category != "" {
		filters.Category = category
	}

	if search := c.Query("search"); search != "" {
		filters.SearchQuery = search
	}

	if userID := c.Query("user_id"); userID != "" {
		filters.UserID = userID
	}

	if sort := c.Query("sort"); sort != "" {
		validSorts := []string{"created_at", "reactions", "comments", "trending"}
		for _, validSort := range validSorts {
			if sort == validSort {
				filters.SortBy = sort
				break
			}
		}
	}

	response, err := h.postService.ListPosts(c.Request.Context(), filters)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, response)
}

// AddComment adds a comment to a post
// @Summary Add a comment
// @Tags posts
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param comment body models.CreateCommentInput true "Comment data"
// @Success 201 {object} models.Comment
// @Router /posts/comments [post]
func (h *PostHandler) AddComment(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.CreateCommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.postService.AddComment(c.Request.Context(), userID, input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, comment)
}

// GetComments retrieves comments for a post
// @Summary Get comments for a post
// @Tags posts
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {array} models.Comment
// @Router /posts/{id}/comments [get]
func (h *PostHandler) GetComments(c *gin.Context) {
	postID := c.Param("id")

	comments, err := h.postService.GetComments(c.Request.Context(), postID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, comments)
}

// DeleteComment deletes a comment
// @Summary Delete a comment
// @Tags posts
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Comment ID"
// @Success 204
// @Router /posts/comments/{id} [delete]
func (h *PostHandler) DeleteComment(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	commentID := c.Param("id")

	err := h.postService.DeleteComment(c.Request.Context(), userID, commentID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// ToggleReaction toggles a reaction on a post
// @Summary Toggle reaction on a post
// @Tags posts
// @Accept json
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Post ID"
// @Param reaction body models.AddReactionInput true "Reaction data"
// @Success 204
// @Router /posts/{id}/reactions [post]
func (h *PostHandler) ToggleReaction(c *gin.Context) {
	
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	postID := c.Param("id")

	var input models.AddReactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}


	// Validate emoji (allow only common emojis)
	if !isValidEmoji(input.Emoji) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid emoji"})
		return
	}

	err := h.postService.ToggleReaction(c.Request.Context(), userID, postID, input.Emoji)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// ToggleCommentReaction toggles a reaction on a comment
// @Summary Toggle reaction on a comment
// @Tags posts
// @Accept json
// @Param Authorization header string true "Bearer token"
// @Param id path string true "Comment ID"
// @Param reaction body models.AddReactionInput true "Reaction data"
// @Success 204
// @Router /posts/comments/{id}/reactions [post]
func (h *PostHandler) ToggleCommentReaction(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	commentID := c.Param("id")

	var input models.AddReactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate emoji
	if !isValidEmoji(input.Emoji) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid emoji"})
		return
	}

	err := h.postService.ToggleCommentReaction(c.Request.Context(), userID, commentID, input.Emoji)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// Helper function to validate emojis
func isValidEmoji(emoji string) bool {
	// Allow common reaction emojis
	validEmojis := []string{
		"👍", "👎", "❤️", "😂", "😮", "😢", "😡", "🎉", "🚀", "👏",
		"🔥", "💯", "✨", "⭐", "💪", "🙏", "😍", "🤔", "👀", "💡",
	}
	
	for _, valid := range validEmojis {
		if emoji == valid {
			return true
		}
	}
	
	// Also allow any single emoji character
	return len([]rune(emoji)) <= 2
}

// RegisterRoutes registers all post-related routes
func (h *PostHandler) RegisterRoutes(router *gin.RouterGroup, authMiddleware gin.HandlerFunc, optionalAuthMiddleware gin.HandlerFunc) {
	posts := router.Group("/posts")
	{
		// Public routes (with optional auth for reactions)
		posts.GET("", optionalAuthMiddleware, h.ListPosts)
		posts.GET("/:id", optionalAuthMiddleware, h.GetPost)
		posts.GET("/:id/comments", h.GetComments)
		
		// Protected routes (require authentication)
		protected := posts.Group("")
		protected.Use(authMiddleware)
		{
			protected.POST("", RateLimitMiddleware("create-post", 10, 60), h.CreatePost) // 10 posts per minute
			protected.PUT("/:id", h.UpdatePost)
			protected.DELETE("/:id", h.DeletePost)
			
			// Comments
			protected.POST("/comments", RateLimitMiddleware("create-comment", 30, 60), h.AddComment) // 30 comments per minute
			protected.DELETE("/comments/:id", h.DeleteComment)
			
			// Reactions
			protected.POST("/:id/reactions", RateLimitMiddleware("reaction", 60, 60), h.ToggleReaction) // 60 reactions per minute
			protected.POST("/comments/:id/reactions", RateLimitMiddleware("reaction", 60, 60), h.ToggleCommentReaction)
		}
	}
}