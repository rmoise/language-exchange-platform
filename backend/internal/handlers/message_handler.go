package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/internal/websocket"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	messageService      services.MessageService
	conversationService services.ConversationService
	wsHub              *websocket.Hub
}

func NewMessageHandler(messageService services.MessageService, conversationService services.ConversationService, wsHub *websocket.Hub) *MessageHandler {
	return &MessageHandler{
		messageService:      messageService,
		conversationService: conversationService,
		wsHub:              wsHub,
	}
}

// GetMessages godoc
// @Summary Get messages in a conversation
// @Description Get a list of messages in a specific conversation
// @Tags messages
// @Accept json
// @Produce json
// @Param conversationId path string true "Conversation ID"
// @Param limit query int false "Limit number of results" default(50)
// @Param offset query int false "Offset for pagination" default(0)
// @Success 200 {object} models.MessageListResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations/{conversationId}/messages [get]
func (h *MessageHandler) GetMessages(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	conversationID := c.Param("conversationId")
	if conversationID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Conversation ID is required")
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "50")
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

	// Get messages
	messages, err := h.messageService.GetMessages(c.Request.Context(), conversationID, userID.(string), limit, offset)
	if err != nil {
		if err.Error() == "conversation not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Conversation not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this conversation" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to get messages")
		return
	}

	// Convert to slice of values for response
	messageValues := make([]models.Message, len(messages))
	for i, msg := range messages {
		messageValues[i] = *msg
	}

	response := models.MessageListResponse{
		Messages: messageValues,
		Total:    len(messageValues),
		Page:     offset/limit + 1,
		Limit:    limit,
	}

	errors.SendSuccess(c, response)
}

// SendMessage godoc
// @Summary Send a message in a conversation
// @Description Send a new message in a specific conversation
// @Tags messages
// @Accept json
// @Produce json
// @Param conversationId path string true "Conversation ID"
// @Param request body models.SendMessageRequest true "Message content"
// @Success 201 {object} models.Message
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations/{conversationId}/messages [post]
func (h *MessageHandler) SendMessage(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	conversationID := c.Param("conversationId")
	if conversationID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Conversation ID is required")
		return
	}

	var request models.SendMessageRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Send message
	message, err := h.messageService.SendMessage(c.Request.Context(), conversationID, userID.(string), request)
	if err != nil {
		if err.Error() == "conversation not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Conversation not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this conversation" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		if err.Error() == "message content cannot be empty" || err.Error() == "message content too long (max 1000 characters)" {
			errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", err.Error())
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to send message")
		return
	}

	// Broadcast message via WebSocket to conversation participants
	if h.wsHub != nil {
		fmt.Printf("DEBUG: wsHub is not nil, attempting to broadcast message\n")
		
		// Get conversation to find all participants
		conversation, err := h.conversationService.GetConversationByID(c.Request.Context(), conversationID, userID.(string))
		if err != nil {
			fmt.Printf("DEBUG: Error getting conversation for broadcast: %v\n", err)
		} else if conversation == nil {
			fmt.Printf("DEBUG: Conversation is nil\n")
		} else {
			fmt.Printf("DEBUG: Got conversation, participants: User1ID=%s, User2ID=%s\n", conversation.User1ID, conversation.User2ID)
			
			messageData := map[string]interface{}{
				"id":              message.ID,
				"conversation_id": message.ConversationID,
				"sender_id":       message.SenderID,
				"content":         message.Content,
				"message_type":    message.MessageType,
				"status":          message.Status,
				"created_at":      message.CreatedAt,
				"sender":          message.Sender,
			}
			
			wsMessage := map[string]interface{}{
				"type": "new_message",
				"data": messageData,
			}
			
			// Send to all participants
			participantIDs := []string{conversation.User1ID, conversation.User2ID}
			fmt.Printf("DEBUG: Broadcasting to participants: %v\n", participantIDs)
			h.wsHub.SendToUsers(participantIDs, wsMessage)
			fmt.Printf("DEBUG: Broadcast complete\n")
		}
	} else {
		fmt.Printf("DEBUG: wsHub is nil, cannot broadcast message\n")
	}

	errors.SendCreated(c, message)
}

// MarkAsRead godoc
// @Summary Mark messages as read
// @Description Mark all messages in a conversation as read for the authenticated user
// @Tags messages
// @Accept json
// @Produce json
// @Param conversationId path string true "Conversation ID"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /conversations/{conversationId}/messages/read [put]
func (h *MessageHandler) MarkAsRead(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	conversationID := c.Param("conversationId")
	if conversationID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Conversation ID is required")
		return
	}

	// Mark messages as read
	err := h.messageService.MarkAsRead(c.Request.Context(), conversationID, userID.(string))
	if err != nil {
		if err.Error() == "conversation not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Conversation not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this conversation" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to mark messages as read")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Messages marked as read"})
}

// UpdateMessageStatus godoc
// @Summary Update message status
// @Description Update the status of a specific message (delivered/read)
// @Tags messages
// @Accept json
// @Produce json
// @Param messageId path string true "Message ID"
// @Param request body models.UpdateMessageStatusRequest true "New status"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /messages/{messageId}/status [put]
func (h *MessageHandler) UpdateMessageStatus(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	messageID := c.Param("messageId")
	if messageID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Message ID is required")
		return
	}

	var request models.UpdateMessageStatusRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Update message status
	err := h.messageService.UpdateMessageStatus(c.Request.Context(), messageID, userID.(string), request.Status)
	if err != nil {
		if err.Error() == "message not found" || err.Error() == "conversation not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Message or conversation not found")
			return
		}
		if err.Error() == "access denied: user is not a participant in this conversation" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Access denied")
			return
		}
		if err.Error() == "cannot update status of your own message" {
			errors.SendError(c, http.StatusBadRequest, "INVALID_OPERATION", "Cannot update status of your own message")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to update message status")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message status updated"})
}

// DeleteMessage godoc
// @Summary Delete a message
// @Description Delete a specific message (unsend functionality)
// @Tags messages
// @Accept json
// @Produce json
// @Param messageId path string true "Message ID"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /messages/{messageId} [delete]
func (h *MessageHandler) DeleteMessage(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	messageID := c.Param("messageId")
	if messageID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Message ID is required")
		return
	}

	// Delete message
	err := h.messageService.DeleteMessage(c.Request.Context(), messageID, userID.(string))
	if err != nil {
		if err.Error() == "message not found" {
			errors.SendError(c, http.StatusNotFound, "NOT_FOUND", "Message not found")
			return
		}
		if err.Error() == "access denied: can only delete your own messages" {
			errors.SendError(c, http.StatusForbidden, "ACCESS_DENIED", "Can only delete your own messages")
			return
		}
		if err.Error() == "message too old to delete" {
			errors.SendError(c, http.StatusBadRequest, "MESSAGE_TOO_OLD", "Message is too old to delete")
			return
		}
		errors.SendError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Failed to delete message")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
}