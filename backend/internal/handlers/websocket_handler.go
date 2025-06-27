package handlers

import (
	"context"
	"log"
	"net/http"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/internal/websocket"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub            *websocket.Hub
	sessionService services.SessionService
}

func NewWebSocketHandler(hub *websocket.Hub, sessionService services.SessionService) *WebSocketHandler {
	return &WebSocketHandler{
		hub:            hub,
		sessionService: sessionService,
	}
}

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin for development
		// In production, you should implement proper origin checking
		return true
	},
}

// HandleWebSocket upgrades HTTP connections to WebSocket
// @Summary Upgrade to WebSocket connection
// @Description Upgrade HTTP connection to WebSocket for real-time messaging
// @Tags websocket
// @Accept json
// @Produce json
// @Success 101 {string} string "Switching Protocols"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /ws [get]
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		errors.SendError(c, http.StatusInternalServerError, "WEBSOCKET_UPGRADE_FAILED", "Failed to upgrade to WebSocket")
		return
	}

	// Create a new client
	client := websocket.NewClient(h.hub, conn, userID.(string))

	// Start the client (this will register it with the hub and start read/write pumps)
	client.Start()

	log.Printf("WebSocket connection established for user: %s", userID.(string))
}

// GetOnlineUsers returns a list of currently online users
// @Summary Get online users
// @Description Get a list of currently connected users
// @Tags websocket
// @Accept json
// @Produce json
// @Success 200 {object} map[string][]string
// @Failure 401 {object} ErrorResponse
// @Router /ws/online [get]
func (h *WebSocketHandler) GetOnlineUsers(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// Get connected users from the hub
	onlineUsers := h.hub.GetConnectedUsers()

	response := map[string]interface{}{
		"online_users": onlineUsers,
		"count":        len(onlineUsers),
	}

	errors.SendSuccess(c, response)
}

// CheckUserOnline checks if a specific user is online
// @Summary Check if user is online
// @Description Check if a specific user is currently connected
// @Tags websocket
// @Accept json
// @Produce json
// @Param userId path string true "User ID to check"
// @Success 200 {object} map[string]bool
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /ws/online/{userId} [get]
func (h *WebSocketHandler) CheckUserOnline(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	userID := c.Param("userId")
	if userID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "User ID is required")
		return
	}

	isOnline := h.hub.IsUserOnline(userID)

	response := map[string]interface{}{
		"user_id":   userID,
		"is_online": isOnline,
	}

	errors.SendSuccess(c, response)
}

// HandleSessionWebSocket upgrades HTTP connections to WebSocket for session-specific communication
// @Summary Upgrade to WebSocket connection for sessions
// @Description Upgrade HTTP connection to WebSocket for real-time session communication
// @Tags websocket
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 101 {string} string "Switching Protocols"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /ws/sessions/{sessionId} [get]
func (h *WebSocketHandler) HandleSessionWebSocket(c *gin.Context) {
	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	// TODO: Verify user is a participant in the session
	// This would require injecting the session service into the WebSocket handler
	// For now, we'll assume the user is authorized

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		errors.SendError(c, http.StatusInternalServerError, "WEBSOCKET_UPGRADE_FAILED", "Failed to upgrade to WebSocket")
		return
	}

	// Create a new client
	client := websocket.NewClient(h.hub, conn, userID.(string))

	// Set the current session for the client
	client.CurrentSession = sessionID

	// Join the session room
	h.hub.JoinSession(sessionID, client)

	// Start the client (this will register it with the hub and start read/write pumps)
	client.Start()

	// Notify other participants that user joined
	h.hub.NotifySessionJoin(sessionID, userID.(string), "", client)

	log.Printf("WebSocket session connection established for user: %s in session: %s", userID.(string), sessionID)
}

// SaveAndBroadcastSessionMessage saves a session message and broadcasts it via WebSocket
func (h *WebSocketHandler) SaveAndBroadcastSessionMessage(sessionID, userID, content string) error {
	ctx := context.Background()
	
	// Save message to database
	input := models.SendMessageInput{
		Content:     content,
		MessageType: "text",
	}
	
	savedMessage, err := h.sessionService.SendMessage(ctx, sessionID, userID, input)
	if err != nil {
		log.Printf("Failed to save session message: %v", err)
		return err
	}
	
	log.Printf("Session message saved to database: %s", savedMessage.ID)
	
	// Broadcast via WebSocket
	messageData := map[string]interface{}{
		"id":           savedMessage.ID,
		"session_id":   savedMessage.SessionID,
		"user_id":      savedMessage.UserID,
		"content":      savedMessage.Content,
		"message_type": savedMessage.MessageType,
		"created_at":   savedMessage.CreatedAt,
	}
	
	h.hub.BroadcastSessionMessage(sessionID, messageData)
	return nil
}

// GetSessionParticipants returns the participants of a session
// @Summary Get session participants
// @Description Get a list of users currently in a session
// @Tags websocket
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /ws/sessions/{sessionId}/participants [get]
func (h *WebSocketHandler) GetSessionParticipants(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	participants, err := h.hub.GetSessionParticipants(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get session participants"})
		return
	}
	count := h.hub.GetSessionParticipantCount(sessionID)

	response := map[string]interface{}{
		"session_id":   sessionID,
		"participants": participants,
		"count":        count,
	}

	errors.SendSuccess(c, response)
}