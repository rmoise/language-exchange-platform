package websocket

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"language-exchange/internal/models"
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// User ID to client mapping for targeted messages
	userClients map[string][]*Client

	// Session ID to clients mapping for session-based communication
	sessionClients map[string][]*Client

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread safety
	mutex sync.RWMutex

	// Session service for database operations
	sessionService interface {
		GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error)
	}
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:        make(map[*Client]bool),
		userClients:    make(map[string][]*Client),
		sessionClients: make(map[string][]*Client),
		broadcast:      make(chan []byte),
		register:       make(chan *Client),
		unregister:     make(chan *Client),
	}
}

// Run starts the hub and handles client connections
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			
			// Add to user mapping
			if client.UserID != "" {
				h.userClients[client.UserID] = append(h.userClients[client.UserID], client)
			}
			
			h.mutex.Unlock()
			log.Printf("Client registered: %s (User: %s)", client.ID, client.UserID)
			
		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				
				// Remove from user mapping
				if client.UserID != "" {
					clients := h.userClients[client.UserID]
					for i, c := range clients {
						if c == client {
							h.userClients[client.UserID] = append(clients[:i], clients[i+1:]...)
							break
						}
					}
					if len(h.userClients[client.UserID]) == 0 {
						delete(h.userClients, client.UserID)
					}
				}
				
				// Remove from session mapping if client is in a session
				if client.CurrentSession != "" {
					sessionClients := h.sessionClients[client.CurrentSession]
					for i, c := range sessionClients {
						if c == client {
							h.sessionClients[client.CurrentSession] = append(sessionClients[:i], sessionClients[i+1:]...)
							break
						}
					}
					if len(h.sessionClients[client.CurrentSession]) == 0 {
						delete(h.sessionClients, client.CurrentSession)
					}
				}
			}
			h.mutex.Unlock()
			log.Printf("Client unregistered: %s (User: %s)", client.ID, client.UserID)
			
		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// BroadcastToAll sends a message to all connected clients
func (h *Hub) BroadcastToAll(message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}
	
	select {
	case h.broadcast <- data:
	default:
		log.Printf("Broadcast channel full, dropping message")
	}
}

// SendToUser sends a message to all clients of a specific user
func (h *Hub) SendToUser(userID string, message interface{}) {
	log.Printf("SendToUser called for userID: %s", userID)
	
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}
	
	h.mutex.RLock()
	clients := h.userClients[userID]
	h.mutex.RUnlock()
	
	log.Printf("Found %d clients for user %s", len(clients), userID)
	
	for _, client := range clients {
		select {
		case client.send <- data:
			log.Printf("Successfully sent message to client for user %s", userID)
		default:
			// Client send channel is full, remove it
			log.Printf("Client send channel full for user %s, unregistering", userID)
			h.unregister <- client
		}
	}
}

// SendToUsers sends a message to multiple users
func (h *Hub) SendToUsers(userIDs []string, message interface{}) {
	log.Printf("SendToUsers called with userIDs: %v", userIDs)
	for _, userID := range userIDs {
		h.SendToUser(userID, message)
	}
}

// GetConnectedUsers returns a list of currently connected user IDs
func (h *Hub) GetConnectedUsers() []string {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	var users []string
	for userID := range h.userClients {
		if userID != "" {
			users = append(users, userID)
		}
	}
	return users
}

// IsUserOnline checks if a user is currently connected
func (h *Hub) IsUserOnline(userID string) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	clients, exists := h.userClients[userID]
	return exists && len(clients) > 0
}

// GetConnectionCount returns the total number of connected clients
func (h *Hub) GetConnectionCount() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	return len(h.clients)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, implement proper origin checking
		return true
	},
}

// HandleWebSocket handles WebSocket connection requests
func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request, userID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	
	client := NewClient(h, conn, userID)
	h.register <- client
	
	// Start client goroutines
	go client.writePump()
	go client.readPump()
}

// SetSessionService sets the session service for database operations
func (h *Hub) SetSessionService(service interface {
	GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error)
}) {
	h.sessionService = service
}

// SendToSession sends a message to all clients in a specific session
func (h *Hub) SendToSession(sessionID string, message interface{}, excludeClient *Client) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling session message: %v", err)
		return
	}
	
	h.mutex.RLock()
	clients := h.sessionClients[sessionID]
	h.mutex.RUnlock()
	
	for _, client := range clients {
		if excludeClient != nil && client == excludeClient {
			continue
		}
		
		select {
		case client.send <- data:
		default:
			// Client send channel is full, remove it
			h.unregister <- client
		}
	}
}

// JoinSession adds a client to a session room
func (h *Hub) JoinSession(sessionID string, client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if h.sessionClients[sessionID] == nil {
		h.sessionClients[sessionID] = make([]*Client, 0)
	}
	
	// Check if client is already in the session
	for _, c := range h.sessionClients[sessionID] {
		if c == client {
			return // Already in session
		}
	}
	
	h.sessionClients[sessionID] = append(h.sessionClients[sessionID], client)
	log.Printf("Client %s joined session %s", client.userID, sessionID)
}

// LeaveSession removes a client from a session room
func (h *Hub) LeaveSession(sessionID string, client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	clients := h.sessionClients[sessionID]
	for i, c := range clients {
		if c == client {
			// Remove client from session
			h.sessionClients[sessionID] = append(clients[:i], clients[i+1:]...)
			
			// If no clients left in session, clean up
			if len(h.sessionClients[sessionID]) == 0 {
				delete(h.sessionClients, sessionID)
			}
			
			log.Printf("Client %s left session %s", client.userID, sessionID)
			break
		}
	}
}

// NotifySessionJoin notifies other participants that a user joined a session
func (h *Hub) NotifySessionJoin(sessionID, userID, userName string, excludeClient *Client) {
	message := map[string]interface{}{
		"type": "user_joined",
		"data": map[string]interface{}{
			"user_id":    userID,
			"user_name":  userName,
			"session_id": sessionID,
		},
	}
	
	h.SendToSession(sessionID, message, excludeClient)
}

// BroadcastSessionMessage broadcasts a message to all participants in a session
func (h *Hub) BroadcastSessionMessage(sessionID string, message interface{}) {
	h.SendToSession(sessionID, message, nil)
}

// GetSessionParticipants returns the list of participants in a session
func (h *Hub) GetSessionParticipants(sessionID string) ([]interface{}, error) {
	if h.sessionService == nil {
		return []interface{}{}, nil
	}
	
	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		return nil, err
	}
	
	// Convert to []interface{}
	result := make([]interface{}, len(participants))
	for i, p := range participants {
		result[i] = p
	}
	
	return result, nil
}

// GetSessionParticipantCount returns the number of participants in a session
func (h *Hub) GetSessionParticipantCount(sessionID string) int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	clients := h.sessionClients[sessionID]
	return len(clients)
}