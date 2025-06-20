package handlers

import (
	"log"
	"net/http"

	"language-exchange/internal/websocket"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub *websocket.Hub
}

func NewWebSocketHandler(hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
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