package handlers

import (
	"net/http"
	"strconv"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type ConversationHandler struct {
	conversationService services.ConversationService
}

func NewConversationHandler(conversationService services.ConversationService) *ConversationHandler {
	return &ConversationHandler{
		conversationService: conversationService,
	}
}

// GetConversations godoc
// @Summary Get user's conversations
// @Description Get a list of conversations for the authenticated user
// @Tags conversations
// @Accept json
// @Produce json
// @Param limit query int false "Limit number of results" default(20)
// @Param offset query int false "Offset for pagination" default(0)
// @Success 200 {object} models.ConversationListResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations [get]
func (h *ConversationHandler) GetConversations(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 0 {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Invalid limit parameter")
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Invalid offset parameter")
		return
	}

	// Get conversations
	conversations, err := h.conversationService.GetConversationsByUser(c.Request.Context(), userID.(string), limit, offset)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to get conversations")
		return
	}

	// Convert to slice of values for response
	conversationValues := make([]models.Conversation, len(conversations))
	for i, conv := range conversations {
		conversationValues[i] = *conv
	}

	response := models.ConversationListResponse{
		Conversations: conversationValues,
		Total:         len(conversationValues),
		Page:          offset/limit + 1,
		Limit:         limit,
	}

	errors.SendSuccess(c, response)
}

// GetConversation godoc
// @Summary Get a specific conversation
// @Description Get details of a specific conversation
// @Tags conversations
// @Accept json
// @Produce json
// @Param id path string true "Conversation ID"
// @Success 200 {object} models.Conversation
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations/{id} [get]
func (h *ConversationHandler) GetConversation(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	conversationID := c.Param("id")
	if conversationID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Conversation ID is required")
		return
	}

	// Get conversation
	conversation, err := h.conversationService.GetConversationByID(c.Request.Context(), conversationID, userID.(string))
	if err != nil {
		if err.Error() == "conversation not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Conversation not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this conversation" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to get conversation")
		return
	}

	errors.SendSuccess(c, conversation)
}

// CreateConversation godoc
// @Summary Create or get a conversation with another user
// @Description Create a new conversation or get existing one with another user
// @Tags conversations
// @Accept json
// @Produce json
// @Param request body models.CreateConversationRequest true "Other user ID"
// @Success 201 {object} models.Conversation
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations [post]
func (h *ConversationHandler) CreateConversation(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	var request models.CreateConversationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Validate request
	if request.OtherUserID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Other user ID is required")
		return
	}

	if request.OtherUserID == userID.(string) {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Cannot create conversation with yourself")
		return
	}

	// Create or get conversation
	conversation, err := h.conversationService.GetOrCreateConversation(c.Request.Context(), userID.(string), request.OtherUserID)
	if err != nil {
		if err.Error() == "user1 not found" || err.Error() == "user2 not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "User not found")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to create conversation")
		return
	}

	errors.SendCreated(c, conversation)
}

// StartConversationFromMatch godoc
// @Summary Start a conversation from a match
// @Description Create or get a conversation between matched users
// @Tags conversations
// @Accept json
// @Produce json
// @Param matchId path string true "Match ID"
// @Success 201 {object} models.Conversation
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /matches/{matchId}/conversation [post]
func (h *ConversationHandler) StartConversationFromMatch(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	matchID := c.Param("matchId")
	if matchID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Match ID is required")
		return
	}

	// Start conversation from match
	conversation, err := h.conversationService.StartConversationFromMatch(c.Request.Context(), matchID, userID.(string))
	if err != nil {
		if err.Error() == "match not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Match not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this match" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to start conversation")
		return
	}

	errors.SendCreated(c, conversation)
}