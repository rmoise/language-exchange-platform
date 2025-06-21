package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"language-exchange/internal/models"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin for development
		// In production, you should check the origin properly
		return true
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// The hub that manages this client.
	hub *Hub

	// User ID associated with this client
	UserID string

	// Current session ID (if user is in a session)
	CurrentSession string
}

// NewClient creates a new WebSocket client
func NewClient(hub *Hub, conn *websocket.Conn, userID string) *Client {
	return &Client{
		conn:   conn,
		send:   make(chan []byte, 256),
		hub:    hub,
		UserID: userID,
	}
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket error: %v", err)
			}
			break
		}

		// Handle incoming WebSocket messages
		c.handleMessage(messageBytes)
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage processes incoming WebSocket messages from the client
func (c *Client) handleMessage(messageBytes []byte) {
	var wsMessage models.WebSocketMessage
	err := json.Unmarshal(messageBytes, &wsMessage)
	if err != nil {
		log.Printf("Error unmarshaling WebSocket message: %v", err)
		return
	}

	switch wsMessage.Type {
	case models.WSMessageTypeTyping:
		c.handleTypingMessage(wsMessage.Data)
	case models.WSMessageTypeStopTyping:
		c.handleStopTypingMessage(wsMessage.Data)
	case models.WSMessageTypeSessionJoin:
		c.handleSessionJoin(wsMessage.Data)
	case models.WSMessageTypeSessionLeave:
		c.handleSessionLeave(wsMessage.Data)
	case models.WSMessageTypeCanvasOperation:
		c.handleCanvasOperation(wsMessage.Data)
	case models.WSMessageTypeSessionMessage:
		c.handleSessionMessage(wsMessage.Data)
	case models.WSMessageTypeCursorPosition:
		c.handleCursorPosition(wsMessage.Data)
	default:
		log.Printf("Unknown WebSocket message type: %s", wsMessage.Type)
	}
}

// handleTypingMessage handles typing indicator messages
func (c *Client) handleTypingMessage(data interface{}) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling typing data: %v", err)
		return
	}

	var typingIndicator models.TypingIndicator
	err = json.Unmarshal(dataBytes, &typingIndicator)
	if err != nil {
		log.Printf("Error unmarshaling typing indicator: %v", err)
		return
	}

	// Validate that the user is authorized to send typing indicators for this conversation
	// This would typically involve checking if the user is a participant in the conversation
	// For now, we'll assume the client is authorized

	// Set the user ID from the client
	typingIndicator.UserID = c.UserID
	typingIndicator.IsTyping = true

	// Notify other participants in the conversation
	// Note: In a real implementation, you would fetch the participant IDs from the database
	// For now, we'll broadcast to all connected users
	participantIDs := c.hub.GetConnectedUsers()
	c.hub.NotifyTyping(typingIndicator.ConversationID, c.UserID, true, participantIDs)
}

// handleStopTypingMessage handles stop typing indicator messages
func (c *Client) handleStopTypingMessage(data interface{}) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling stop typing data: %v", err)
		return
	}

	var typingIndicator models.TypingIndicator
	err = json.Unmarshal(dataBytes, &typingIndicator)
	if err != nil {
		log.Printf("Error unmarshaling stop typing indicator: %v", err)
		return
	}

	// Set the user ID from the client
	typingIndicator.UserID = c.UserID
	typingIndicator.IsTyping = false

	// Notify other participants in the conversation
	participantIDs := c.hub.GetConnectedUsers()
	c.hub.NotifyTyping(typingIndicator.ConversationID, c.UserID, false, participantIDs)
}

// handleSessionJoin handles session join messages
func (c *Client) handleSessionJoin(data interface{}) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling session join data: %v", err)
		return
	}

	var notification models.SessionNotification
	err = json.Unmarshal(dataBytes, &notification)
	if err != nil {
		log.Printf("Error unmarshaling session notification: %v", err)
		return
	}

	// Join the session room
	c.CurrentSession = notification.SessionID
	c.hub.JoinSession(notification.SessionID, c)

	// Notify other participants
	c.hub.NotifySessionJoin(notification.SessionID, c.UserID, "", c)
}

// handleSessionLeave handles session leave messages
func (c *Client) handleSessionLeave(data interface{}) {
	if c.CurrentSession == "" {
		return
	}

	// Leave the session room
	c.hub.LeaveSession(c.CurrentSession, c)
	c.hub.NotifySessionLeave(c.CurrentSession, c.UserID, "")
	c.CurrentSession = ""
}

// handleCanvasOperation handles canvas operation messages
func (c *Client) handleCanvasOperation(data interface{}) {
	if c.CurrentSession == "" {
		log.Printf("Canvas operation received but user not in session")
		return
	}

	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling canvas operation data: %v", err)
		return
	}

	var operation models.CanvasOperationMessage
	err = json.Unmarshal(dataBytes, &operation)
	if err != nil {
		log.Printf("Error unmarshaling canvas operation: %v", err)
		return
	}

	// Set the user ID and session ID
	operation.UserID = c.UserID
	operation.SessionID = c.CurrentSession

	// Broadcast to other session participants
	c.hub.BroadcastCanvasOperation(c.CurrentSession, operation, c)
}

// handleSessionMessage handles session chat messages
func (c *Client) handleSessionMessage(data interface{}) {
	if c.CurrentSession == "" {
		log.Printf("Session message received but user not in session")
		return
	}

	// Extract message content from data
	messageData := data.(map[string]interface{})
	content, ok := messageData["content"].(string)
	if !ok {
		log.Printf("Invalid message content format")
		return
	}

	log.Printf("WebSocket message received from user %s in session %s: %s", c.UserID, c.CurrentSession, content)
	
	// Save and broadcast the message via hub
	c.hub.SaveAndBroadcastSessionMessage(c.CurrentSession, c.UserID, content)
	
	log.Printf("WebSocket message processing completed for user %s", c.UserID)
}

// handleCursorPosition handles cursor position messages
func (c *Client) handleCursorPosition(data interface{}) {
	if c.CurrentSession == "" {
		return
	}

	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling cursor position data: %v", err)
		return
	}

	var position models.CursorPosition
	err = json.Unmarshal(dataBytes, &position)
	if err != nil {
		log.Printf("Error unmarshaling cursor position: %v", err)
		return
	}

	// Set the user ID and session ID
	position.UserID = c.UserID
	position.SessionID = c.CurrentSession

	// Broadcast to other session participants
	c.hub.BroadcastCursorPosition(c.CurrentSession, position, c)
}

// Start starts the client's read and write pumps
func (c *Client) Start() {
	// Register the client with the hub
	c.hub.register <- c

	// Start the write and read pumps
	go c.writePump()
	go c.readPump()
}