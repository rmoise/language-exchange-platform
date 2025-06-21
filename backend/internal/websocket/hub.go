package websocket

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"language-exchange/internal/models"
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// User to client mapping for direct messaging
	userClients map[string]*Client

	// Session to clients mapping for session-specific messaging
	sessionClients map[string]map[*Client]bool

	// Session service for database operations (optional)
	sessionService interface{}

	// Mutex for thread-safe operations
	mutex sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:        make(map[*Client]bool),
		broadcast:      make(chan []byte),
		register:       make(chan *Client),
		unregister:     make(chan *Client),
		userClients:    make(map[string]*Client),
		sessionClients: make(map[string]map[*Client]bool),
	}
}

// SetSessionService sets the session service for database operations
func (h *Hub) SetSessionService(service interface{}) {
	h.sessionService = service
}

// Run starts the hub and handles client registration/unregistration and message broadcasting
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

// registerClient registers a new client with the hub
func (h *Hub) registerClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	h.clients[client] = true
	h.userClients[client.UserID] = client

	log.Printf("User %s connected. Total clients: %d", client.UserID, len(h.clients))

	// Notify other users that this user is online
	h.notifyUserStatus(client.UserID, true)
}

// unregisterClient unregisters a client from the hub
func (h *Hub) unregisterClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		delete(h.userClients, client.UserID)
		
		// Remove client from all sessions
		for sessionID, sessionRoom := range h.sessionClients {
			if _, exists := sessionRoom[client]; exists {
				delete(sessionRoom, client)
				if len(sessionRoom) == 0 {
					delete(h.sessionClients, sessionID)
				}
				log.Printf("User %s removed from session %s", client.UserID, sessionID)
			}
		}
		
		close(client.send)

		log.Printf("User %s disconnected. Total clients: %d", client.UserID, len(h.clients))

		// Notify other users that this user is offline
		h.notifyUserStatus(client.UserID, false)
	}
}

// broadcastMessage broadcasts a message to all connected clients
func (h *Hub) broadcastMessage(message []byte) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for client := range h.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(h.clients, client)
			delete(h.userClients, client.UserID)
		}
	}
}

// SendToUser sends a message to a specific user
func (h *Hub) SendToUser(userID string, message interface{}) error {
	h.mutex.RLock()
	client, exists := h.userClients[userID]
	h.mutex.RUnlock()

	if !exists {
		// User is not connected
		return nil
	}

	// Convert message to JSON
	messageBytes, err := json.Marshal(models.WebSocketMessage{
		Type: models.WSMessageTypeNewMessage,
		Data: message,
	})
	if err != nil {
		return err
	}

	select {
	case client.send <- messageBytes:
	default:
		// Client's send channel is full, close it
		h.mutex.Lock()
		close(client.send)
		delete(h.clients, client)
		delete(h.userClients, client.UserID)
		h.mutex.Unlock()
	}

	return nil
}

// SendToConversation sends a message to all participants in a conversation
func (h *Hub) SendToConversation(conversationID string, senderID string, message interface{}, participantIDs []string) {
	for _, userID := range participantIDs {
		if userID != senderID { // Don't send to sender
			h.SendToUser(userID, message)
		}
	}
}

// notifyUserStatus notifies other users about a user's online/offline status
func (h *Hub) notifyUserStatus(userID string, isOnline bool) {
	statusMessage := models.OnlineStatus{
		UserID:   userID,
		IsOnline: isOnline,
	}

	messageBytes, err := json.Marshal(models.WebSocketMessage{
		Type: models.WSMessageTypeUserOnline,
		Data: statusMessage,
	})
	if err != nil {
		log.Printf("Error marshaling user status message: %v", err)
		return
	}

	// Broadcast to all connected clients
	go func() {
		h.broadcast <- messageBytes
	}()
}

// NotifyTyping notifies about typing status in a conversation
func (h *Hub) NotifyTyping(conversationID, userID string, isTyping bool, participantIDs []string) {
	typingMessage := models.TypingIndicator{
		ConversationID: conversationID,
		UserID:         userID,
		IsTyping:       isTyping,
	}

	wsMessage := models.WebSocketMessage{
		Type: models.WSMessageTypeTyping,
		Data: typingMessage,
	}

	if !isTyping {
		wsMessage.Type = models.WSMessageTypeStopTyping
	}

	messageBytes, err := json.Marshal(wsMessage)
	if err != nil {
		log.Printf("Error marshaling typing message: %v", err)
		return
	}

	// Send to other participants in the conversation
	for _, participantID := range participantIDs {
		if participantID != userID { // Don't send to the typer
			h.mutex.RLock()
			if client, exists := h.userClients[participantID]; exists {
				select {
				case client.send <- messageBytes:
				default:
					// Client's send channel is full
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// NotifyMessageRead notifies about message read status
func (h *Hub) NotifyMessageRead(conversationID, userID string, participantIDs []string) {
	readMessage := models.WebSocketMessage{
		Type: models.WSMessageTypeMessageRead,
		Data: map[string]string{
			"conversation_id": conversationID,
			"user_id":         userID,
		},
	}

	messageBytes, err := json.Marshal(readMessage)
	if err != nil {
		log.Printf("Error marshaling read message: %v", err)
		return
	}

	// Send to other participants in the conversation
	for _, participantID := range participantIDs {
		if participantID != userID { // Don't send to the reader
			h.mutex.RLock()
			if client, exists := h.userClients[participantID]; exists {
				select {
				case client.send <- messageBytes:
				default:
					// Client's send channel is full
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// GetConnectedUsers returns a list of currently connected user IDs
func (h *Hub) GetConnectedUsers() []string {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	userIDs := make([]string, 0, len(h.userClients))
	for userID := range h.userClients {
		userIDs = append(userIDs, userID)
	}

	return userIDs
}

// IsUserOnline checks if a user is currently connected
func (h *Hub) IsUserOnline(userID string) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	_, exists := h.userClients[userID]
	return exists
}

// JoinSession adds a client to a session room
func (h *Hub) JoinSession(sessionID string, client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if h.sessionClients[sessionID] == nil {
		h.sessionClients[sessionID] = make(map[*Client]bool)
	}
	h.sessionClients[sessionID][client] = true

	log.Printf("User %s joined session %s. Session participants: %d", client.UserID, sessionID, len(h.sessionClients[sessionID]))
}

// LeaveSession removes a client from a session room
func (h *Hub) LeaveSession(sessionID string, client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if sessionRoom, exists := h.sessionClients[sessionID]; exists {
		delete(sessionRoom, client)
		if len(sessionRoom) == 0 {
			delete(h.sessionClients, sessionID)
		}
		log.Printf("User %s left session %s. Session participants: %d", client.UserID, sessionID, len(sessionRoom))
	}
}

// SendToSession broadcasts a message to all participants in a session
func (h *Hub) SendToSession(sessionID string, message interface{}, excludeClient *Client) error {
	log.Printf("SendToSession called for session %s", sessionID)
	
	h.mutex.RLock()
	sessionRoom := h.sessionClients[sessionID]
	participantCount := 0
	if sessionRoom != nil {
		participantCount = len(sessionRoom)
	}
	h.mutex.RUnlock()

	log.Printf("Session %s has %d participants", sessionID, participantCount)

	if sessionRoom == nil {
		log.Printf("No session room found for session %s", sessionID)
		return nil // No one in the session
	}

	// Convert message to JSON
	messageBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message for session %s: %v", sessionID, err)
		return err
	}
	
	log.Printf("Message marshaled successfully, size: %d bytes", len(messageBytes))

	var failedClients []*Client
	sentCount := 0

	h.mutex.RLock()
	for client := range sessionRoom {
		if client == excludeClient {
			log.Printf("Skipping excluded client %s", client.UserID)
			continue // Don't send to the sender
		}

		// Check if client is still registered before sending
		if _, exists := h.clients[client]; !exists {
			log.Printf("Client %s not in registered clients, marking for removal", client.UserID)
			failedClients = append(failedClients, client)
			continue
		}

		log.Printf("Attempting to send message to client %s", client.UserID)
		select {
		case client.send <- messageBytes:
			log.Printf("Message sent successfully to client %s", client.UserID)
			sentCount++
		default:
			log.Printf("Client %s send channel is full or closed, marking for removal", client.UserID)
			// Client's send channel is full or closed, mark for removal
			failedClients = append(failedClients, client)
		}
	}
	h.mutex.RUnlock()

	log.Printf("SendToSession completed: sent to %d clients, %d failed", sentCount, len(failedClients))

	// Clean up failed clients
	if len(failedClients) > 0 {
		log.Printf("Cleaning up %d failed clients", len(failedClients))
		h.mutex.Lock()
		for _, client := range failedClients {
			if sessionRoom, exists := h.sessionClients[sessionID]; exists {
				delete(sessionRoom, client)
				if len(sessionRoom) == 0 {
					delete(h.sessionClients, sessionID)
				}
			}
		}
		h.mutex.Unlock()
	}

	return nil
}

// NotifySessionJoin notifies session participants when a user joins
func (h *Hub) NotifySessionJoin(sessionID, userID, userName string, client *Client) {
	notification := models.WebSocketMessage{
		Type: models.WSMessageTypeUserJoined,
		Data: models.SessionNotification{
			SessionID: sessionID,
			UserID:    userID,
			Type:      "user_joined",
			Data: map[string]interface{}{
				"user": map[string]interface{}{
					"id":   userID,
					"name": userName,
				},
			},
		},
	}

	h.SendToSession(sessionID, notification, client)
}

// NotifySessionLeave notifies session participants when a user leaves
func (h *Hub) NotifySessionLeave(sessionID, userID, userName string) {
	notification := models.WebSocketMessage{
		Type: models.WSMessageTypeUserLeft,
		Data: models.SessionNotification{
			SessionID: sessionID,
			UserID:    userID,
			Type:      "user_left",
			Data: map[string]interface{}{
				"user": map[string]interface{}{
					"id":   userID,
					"name": userName,
				},
			},
		},
	}

	h.SendToSession(sessionID, notification, nil)
}

// BroadcastCanvasOperation broadcasts canvas operations to session participants
func (h *Hub) BroadcastCanvasOperation(sessionID string, operation models.CanvasOperationMessage, senderClient *Client) {
	message := models.WebSocketMessage{
		Type: models.WSMessageTypeCanvasOperation,
		Data: operation,
	}

	h.SendToSession(sessionID, message, senderClient)
}

// BroadcastSessionMessage broadcasts chat messages to session participants
func (h *Hub) BroadcastSessionMessage(sessionID string, sessionMessage interface{}, senderClient *Client) {
	log.Printf("BroadcastSessionMessage called for session %s", sessionID)
	
	message := models.WebSocketMessage{
		Type: models.WSMessageTypeSessionMessage,
		Data: sessionMessage,
	}

	log.Printf("Calling SendToSession for session %s with %d participants", sessionID, h.GetSessionParticipantCount(sessionID))
	h.SendToSession(sessionID, message, nil) // Send to all participants including sender
	log.Printf("SendToSession completed for session %s", sessionID)
}

// SaveAndBroadcastSessionMessage saves a session message to database and broadcasts it
func (h *Hub) SaveAndBroadcastSessionMessage(sessionID string, userID string, content string) {
	ctx := context.Background()
	
	// Try to save to database if session service is available
	if h.sessionService != nil {
		// Type assert to session service interface
		if sessionService, ok := h.sessionService.(interface {
			SendMessage(ctx context.Context, sessionID string, userID string, input models.SendMessageInput) (*models.SessionMessage, error)
		}); ok {
			
			input := models.SendMessageInput{
				Content:     content,
				MessageType: "text",
			}
			
			savedMessage, err := sessionService.SendMessage(ctx, sessionID, userID, input)
			if err != nil {
				log.Printf("Failed to save session message to database: %v", err)
				// Fall back to broadcasting without database
			} else {
				log.Printf("Session message saved to database: %s", savedMessage.ID)
				
				// Broadcast the saved message
				messageData := map[string]interface{}{
					"id":           savedMessage.ID,
					"session_id":   savedMessage.SessionID,
					"user_id":      savedMessage.UserID,
					"content":      savedMessage.Content,
					"message_type": savedMessage.MessageType,
					"created_at":   savedMessage.CreatedAt,
				}
				
				h.BroadcastSessionMessage(sessionID, messageData, nil)
				return
			}
		}
	}
	
	// Fallback: broadcast without saving to database
	messageData := map[string]interface{}{
		"session_id":   sessionID,
		"user_id":      userID,
		"content":      content,
		"message_type": "text",
		"created_at":   time.Now().Format(time.RFC3339),
	}
	
	log.Printf("Broadcasting session message for session %s, user %s: %s", sessionID, userID, content)
	log.Printf("Session participants count: %d", h.GetSessionParticipantCount(sessionID))
	h.BroadcastSessionMessage(sessionID, messageData, nil)
	log.Printf("WebSocket broadcast completed for session %s", sessionID)
}

// BroadcastCursorPosition broadcasts cursor position to session participants
func (h *Hub) BroadcastCursorPosition(sessionID string, position models.CursorPosition, senderClient *Client) {
	message := models.WebSocketMessage{
		Type: models.WSMessageTypeCursorPosition,
		Data: position,
	}

	h.SendToSession(sessionID, message, senderClient)
}

// GetSessionParticipants returns the user IDs of participants in a session
func (h *Hub) GetSessionParticipants(sessionID string) []string {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	sessionRoom := h.sessionClients[sessionID]
	if sessionRoom == nil {
		return []string{}
	}

	userIDs := make([]string, 0, len(sessionRoom))
	for client := range sessionRoom {
		userIDs = append(userIDs, client.UserID)
	}

	return userIDs
}

// GetSessionParticipantCount returns the number of participants in a session
func (h *Hub) GetSessionParticipantCount(sessionID string) int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	if sessionRoom, exists := h.sessionClients[sessionID]; exists {
		return len(sessionRoom)
	}
	return 0
}