package models

import (
	"time"
)

// MessageType represents the type of message
type MessageType string

const (
	MessageTypeText  MessageType = "text"
	MessageTypeImage MessageType = "image"
	MessageTypeFile  MessageType = "file"
)

// MessageStatus represents the delivery status of a message
type MessageStatus string

const (
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead      MessageStatus = "read"
)

// Message represents an individual message in a conversation
type Message struct {
	ID             string        `json:"id" db:"id"`
	ConversationID string        `json:"conversation_id" db:"conversation_id"`
	SenderID       string        `json:"sender_id" db:"sender_id"`
	Content        string        `json:"content" db:"content"`
	MessageType    MessageType   `json:"message_type" db:"message_type"`
	Status         MessageStatus `json:"status" db:"status"`
	CreatedAt      time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at" db:"updated_at"`
	
	// Extended fields for API responses
	Sender *User `json:"sender,omitempty"`
}

// SendMessageRequest represents the request to send a new message
type SendMessageRequest struct {
	Content     string      `json:"content" validate:"required,min=1,max=1000"`
	MessageType MessageType `json:"message_type"`
}

// UpdateMessageStatusRequest represents the request to update message status
type UpdateMessageStatusRequest struct {
	Status MessageStatus `json:"status" validate:"required"`
}

// MessageListResponse represents the response for listing messages
type MessageListResponse struct {
	Messages []Message `json:"messages"`
	Total    int       `json:"total"`
	Page     int       `json:"page"`
	Limit    int       `json:"limit"`
}

// IsValidMessageType checks if the message type is valid
func IsValidMessageType(messageType MessageType) bool {
	switch messageType {
	case MessageTypeText, MessageTypeImage, MessageTypeFile:
		return true
	default:
		return false
	}
}

// IsValidMessageStatus checks if the message status is valid
func IsValidMessageStatus(status MessageStatus) bool {
	switch status {
	case MessageStatusSent, MessageStatusDelivered, MessageStatusRead:
		return true
	default:
		return false
	}
}

// CanUpdateStatus checks if a status transition is valid
func (m *Message) CanUpdateStatus(newStatus MessageStatus) bool {
	switch m.Status {
	case MessageStatusSent:
		return newStatus == MessageStatusDelivered || newStatus == MessageStatusRead
	case MessageStatusDelivered:
		return newStatus == MessageStatusRead
	case MessageStatusRead:
		return false // Cannot change from read
	default:
		return false
	}
}

// IsOwnMessage checks if the message belongs to the given user
func (m *Message) IsOwnMessage(userID string) bool {
	return m.SenderID == userID
}

// WebSocketMessage represents a message sent over WebSocket
type WebSocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// WebSocketMessageTypes
const (
	WSMessageTypeNewMessage      = "new_message"
	WSMessageTypeMessageRead     = "message_read"
	WSMessageTypeTyping          = "typing"
	WSMessageTypeStopTyping      = "stop_typing"
	WSMessageTypeUserOnline      = "user_online"
	WSMessageTypeUserOffline     = "user_offline"
	// Session-specific message types
	WSMessageTypeSessionJoin     = "session_join"
	WSMessageTypeSessionLeave    = "session_leave"
	WSMessageTypeSessionMessage  = "session_message"
	WSMessageTypeCanvasOperation = "canvas_operation"
	WSMessageTypeCursorPosition  = "cursor_position"
	WSMessageTypeUserJoined      = "user_joined"
	WSMessageTypeUserLeft        = "user_left"
)

// TypingIndicator represents typing status
type TypingIndicator struct {
	ConversationID string `json:"conversation_id"`
	UserID         string `json:"user_id"`
	IsTyping       bool   `json:"is_typing"`
}

// OnlineStatus represents user online status
type OnlineStatus struct {
	UserID   string `json:"user_id"`
	IsOnline bool   `json:"is_online"`
}

// SessionNotification represents session-related notifications
type SessionNotification struct {
	SessionID string      `json:"session_id"`
	UserID    string      `json:"user_id"`
	Type      string      `json:"type"`
	Data      interface{} `json:"data,omitempty"`
}

// CanvasOperationMessage represents canvas operations for sessions
type CanvasOperationMessage struct {
	SessionID     string                 `json:"session_id"`
	UserID        string                 `json:"user_id"`
	OperationType string                 `json:"operation_type"`
	Data          map[string]interface{} `json:"data"`
}

// CursorPosition represents user cursor position in a session
type CursorPosition struct {
	SessionID string  `json:"session_id"`
	UserID    string  `json:"user_id"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
}