package websocket

import (
	"encoding/json"
	"log"
	"sync"

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

	// Mutex for thread-safe operations
	mutex sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		userClients: make(map[string]*Client),
	}
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