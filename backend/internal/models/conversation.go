package models

import (
	"time"
)

// Conversation represents a chat between two users
type Conversation struct {
	ID             string    `json:"id" db:"id"`
	User1ID        string    `json:"user1_id" db:"user1_id"`
	User2ID        string    `json:"user2_id" db:"user2_id"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	LastMessageAt  time.Time `json:"last_message_at" db:"last_message_at"`
	
	// Extended fields for API responses
	OtherUser     *User        `json:"other_user,omitempty"`
	LastMessage   interface{}  `json:"last_message,omitempty"` // Will be populated with Message struct
	UnreadCount   int          `json:"unread_count,omitempty"`
}

// ConversationWithParticipants includes participant information
type ConversationWithParticipants struct {
	ConversationID string    `json:"conversation_id" db:"conversation_id"`
	User1ID        string    `json:"user1_id" db:"user1_id"`
	User2ID        string    `json:"user2_id" db:"user2_id"`
	User1Name      string    `json:"user1_name" db:"user1_name"`
	User1Image     *string   `json:"user1_image" db:"user1_image"`
	User2Name      string    `json:"user2_name" db:"user2_name"`
	User2Image     *string   `json:"user2_image" db:"user2_image"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	LastMessageAt  time.Time `json:"last_message_at" db:"last_message_at"`
}

// GetOtherUserID returns the ID of the other participant in the conversation
func (c *Conversation) GetOtherUserID(currentUserID string) string {
	if c.User1ID == currentUserID {
		return c.User2ID
	}
	return c.User1ID
}

// IsParticipant checks if a user is a participant in the conversation
func (c *Conversation) IsParticipant(userID string) bool {
	return c.User1ID == userID || c.User2ID == userID
}

// GetOtherUser returns user information for the other participant
func (cp *ConversationWithParticipants) GetOtherUser(currentUserID string) User {
	if cp.User1ID == currentUserID {
		return User{
			ID:           cp.User2ID,
			Name:         cp.User2Name,
			ProfileImage: cp.User2Image,
		}
	}
	return User{
		ID:           cp.User1ID,
		Name:         cp.User1Name,
		ProfileImage: cp.User1Image,
	}
}

// CreateConversationRequest represents the request to create a new conversation
type CreateConversationRequest struct {
	OtherUserID string `json:"other_user_id" validate:"required,uuid"`
}

// ConversationListResponse represents the response for listing conversations
type ConversationListResponse struct {
	Conversations []Conversation `json:"conversations"`
	Total         int            `json:"total"`
	Page          int            `json:"page"`
	Limit         int            `json:"limit"`
}