package models

import (
	"encoding/json"
	"time"
)

// LanguageSession represents a collaborative language learning session
type LanguageSession struct {
	ID              string    `json:"id" db:"id"`
	Name            string    `json:"name" db:"name"`
	Description     *string   `json:"description" db:"description"`
	CreatedBy       string    `json:"created_by" db:"created_by"`
	Status          string    `json:"status" db:"status"`
	MaxParticipants int       `json:"max_participants" db:"max_participants"`
	SessionType     string    `json:"session_type" db:"session_type"`
	TargetLanguage  *string   `json:"target_language" db:"target_language"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	EndedAt         *time.Time `json:"ended_at" db:"ended_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
	
	// Joined fields
	Creator      *User                 `json:"creator,omitempty"`
	Participants []SessionParticipant  `json:"participants,omitempty"`
	ParticipantCount int               `json:"participant_count,omitempty"`
}

// SessionParticipant represents a user participating in a session
type SessionParticipant struct {
	ID        string     `json:"id" db:"id"`
	SessionID string     `json:"session_id" db:"session_id"`
	UserID    string     `json:"user_id" db:"user_id"`
	JoinedAt  time.Time  `json:"joined_at" db:"joined_at"`
	LeftAt    *time.Time `json:"left_at" db:"left_at"`
	Role      string     `json:"role" db:"role"`
	IsActive  bool       `json:"is_active" db:"is_active"`
	
	// Joined fields
	User *User `json:"user,omitempty"`
}

// CanvasOperation represents a whiteboard operation
type CanvasOperation struct {
	ID             string          `json:"id" db:"id"`
	SessionID      string          `json:"session_id" db:"session_id"`
	UserID         string          `json:"user_id" db:"user_id"`
	OperationType  string          `json:"operation_type" db:"operation_type"`
	OperationData  json.RawMessage `json:"operation_data" db:"operation_data"`
	SequenceNumber int64           `json:"sequence_number" db:"sequence_number"`
	Timestamp      time.Time       `json:"timestamp" db:"timestamp"`
	
	// Joined fields
	User *User `json:"user,omitempty"`
}

// SessionMessage represents a chat message in a session
type SessionMessage struct {
	ID          string    `json:"id" db:"id"`
	SessionID   string    `json:"session_id" db:"session_id"`
	UserID      string    `json:"user_id" db:"user_id"`
	Content     string    `json:"content" db:"message_text"`
	MessageType string    `json:"message_type" db:"message_type"`
	CreatedAt   time.Time `json:"created_at" db:"timestamp"`
	
	// Joined fields
	User *User `json:"user,omitempty"`
}

// Canvas operation data structures
type TextOperation struct {
	Type      string    `json:"type"`
	X         float64   `json:"x"`
	Y         float64   `json:"y"`
	Text      string    `json:"text"`
	Style     TextStyle `json:"style"`
	ID        string    `json:"id"` // Unique identifier for this text element
}

type TextStyle struct {
	FontSize   int    `json:"fontSize"`
	FontFamily string `json:"fontFamily"`
	Color      string `json:"color"`
	Bold       bool   `json:"bold"`
	Italic     bool   `json:"italic"`
	Underline  bool   `json:"underline"`
}

type DrawOperation struct {
	Type  string      `json:"type"`
	Path  []Point     `json:"path"`
	Style DrawStyle   `json:"style"`
	ID    string      `json:"id"`
}

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type DrawStyle struct {
	Color     string  `json:"color"`
	Width     float64 `json:"width"`
	Tool      string  `json:"tool"` // pen, highlighter, eraser
	Opacity   float64 `json:"opacity"`
}

type EraseOperation struct {
	Type string `json:"type"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Size float64 `json:"size"`
}

type ClearOperation struct {
	Type string `json:"type"`
}

type DeleteOperation struct {
	Type      string `json:"type"`
	ElementID string `json:"elementId"` // ID of element to delete
}

// Input/Output models
type CreateSessionInput struct {
	Name            string  `json:"name" binding:"required,min=1,max=255"`
	Description     *string `json:"description"`
	MaxParticipants int     `json:"max_participants" binding:"min=1,max=10"`
	SessionType     string  `json:"session_type" binding:"required,oneof=practice lesson conversation"`
	TargetLanguage  *string `json:"target_language"`
}

type JoinSessionInput struct {
	SessionID string `json:"session_id" binding:"required"`
}

type SendMessageInput struct {
	Content     string `json:"content" binding:"required,max=1000"`
	MessageType string `json:"message_type" binding:"oneof=text system file voice"`
}

type CanvasOperationInput struct {
	OperationType string          `json:"operation_type" binding:"required,oneof=text draw erase clear move delete"`
	OperationData json.RawMessage `json:"operation_data" binding:"required"`
}

// Session status constants
const (
	SessionStatusActive = "active"
	SessionStatusEnded  = "ended"
)

// Session types
const (
	SessionTypePractice     = "practice"
	SessionTypeLesson       = "lesson"
	SessionTypeConversation = "conversation"
)

// Participant roles
const (
	RoleCreator     = "creator"
	RoleParticipant = "participant"
	RoleObserver    = "observer"
)

// Operation types
const (
	OperationTypeText   = "text"
	OperationTypeDraw   = "draw"
	OperationTypeErase  = "erase"
	OperationTypeClear  = "clear"
	OperationTypeMove   = "move"
	OperationTypeDelete = "delete"
)

// Session message types
const (
	SessionMessageTypeText   = "text"
	SessionMessageTypeSystem = "system"
	SessionMessageTypeFile   = "file"
	SessionMessageTypeVoice  = "voice"
)

// Request and Response models

// CreateSessionRequest represents the request to create a new session
type CreateSessionRequest struct {
	Name            string  `json:"name" validate:"required,min=1,max=100"`
	Description     string  `json:"description" validate:"max=500"`
	SessionType     string  `json:"session_type" validate:"required,oneof=practice lesson conversation"`
	TargetLanguage  string  `json:"target_language" validate:"max=10"`
	MaxParticipants int     `json:"max_participants" validate:"min=2,max=50"`
}

// SendSessionMessageRequest represents the request to send a session message
type SendSessionMessageRequest struct {
	Content     string `json:"content" validate:"required,min=1,max=1000"`
	MessageType string `json:"message_type" validate:"oneof=text system"`
}


// GetCurrentTimestamp returns the current timestamp as a string
func GetCurrentTimestamp() string {
	return time.Now().UTC().Format(time.RFC3339)
}