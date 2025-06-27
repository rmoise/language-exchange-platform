package websocket

import "time"

// Event types for WebSocket messages
const (
	// Post events
	EventPostCreated   = "post_created"
	EventPostUpdated   = "post_updated"
	EventPostDeleted   = "post_deleted"
	EventPostReaction  = "post_reaction"
	EventPostBookmark  = "post_bookmark"

	// Comment events
	EventCommentCreated = "comment_created"
	EventCommentUpdated = "comment_updated"
	EventCommentDeleted = "comment_deleted"

	// User events
	EventUserOnline  = "user_online"
	EventUserOffline = "user_offline"

	// System events
	EventSystemMessage = "system_message"
	EventError         = "error"
)

// WebSocketMessage represents a generic WebSocket message
type WebSocketMessage struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// PostEvent represents post-related events
type PostEvent struct {
	Type   string `json:"type"`
	PostID string `json:"post_id"`
	UserID string `json:"user_id"`
	Data   interface{} `json:"data,omitempty"`
}

// CommentEvent represents comment-related events
type CommentEvent struct {
	Type      string `json:"type"`
	PostID    string `json:"post_id"`
	CommentID string `json:"comment_id"`
	UserID    string `json:"user_id"`
	Data      interface{} `json:"data,omitempty"`
}

// ReactionEvent represents reaction events
type ReactionEvent struct {
	Type      string `json:"type"`
	PostID    string `json:"post_id,omitempty"`
	CommentID string `json:"comment_id,omitempty"`
	UserID    string `json:"user_id"`
	Emoji     string `json:"emoji"`
	Action    string `json:"action"` // "add" or "remove"
}

// BookmarkEvent represents bookmark events
type BookmarkEvent struct {
	Type         string `json:"type"`
	PostID       string `json:"post_id"`
	UserID       string `json:"user_id"`
	IsBookmarked bool   `json:"is_bookmarked"`
}

// UserStatusEvent represents user online/offline events
type UserStatusEvent struct {
	Type   string `json:"type"`
	UserID string `json:"user_id"`
	Status string `json:"status"` // "online" or "offline"
}

// SystemEvent represents system messages
type SystemEvent struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Level   string `json:"level"` // "info", "warning", "error"
}

// ErrorEvent represents error messages
type ErrorEvent struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// NewWebSocketMessage creates a new WebSocket message
func NewWebSocketMessage(eventType string, data interface{}) *WebSocketMessage {
	return &WebSocketMessage{
		Type:      eventType,
		Data:      data,
		Timestamp: time.Now(),
	}
}

// NewPostEvent creates a new post event
func NewPostEvent(eventType, postID, userID string, data interface{}) *WebSocketMessage {
	event := &PostEvent{
		Type:   eventType,
		PostID: postID,
		UserID: userID,
		Data:   data,
	}
	return NewWebSocketMessage(eventType, event)
}

// NewCommentEvent creates a new comment event
func NewCommentEvent(eventType, postID, commentID, userID string, data interface{}) *WebSocketMessage {
	event := &CommentEvent{
		Type:      eventType,
		PostID:    postID,
		CommentID: commentID,
		UserID:    userID,
		Data:      data,
	}
	return NewWebSocketMessage(eventType, event)
}

// NewReactionEvent creates a new reaction event
func NewReactionEvent(userID, emoji, action string, postID, commentID *string) *WebSocketMessage {
	event := &ReactionEvent{
		Type:   EventPostReaction,
		UserID: userID,
		Emoji:  emoji,
		Action: action,
	}
	
	if postID != nil {
		event.PostID = *postID
	}
	if commentID != nil {
		event.CommentID = *commentID
	}
	
	return NewWebSocketMessage(EventPostReaction, event)
}

// NewBookmarkEvent creates a new bookmark event
func NewBookmarkEvent(postID, userID string, isBookmarked bool) *WebSocketMessage {
	event := &BookmarkEvent{
		Type:         EventPostBookmark,
		PostID:       postID,
		UserID:       userID,
		IsBookmarked: isBookmarked,
	}
	return NewWebSocketMessage(EventPostBookmark, event)
}

// NewUserStatusEvent creates a new user status event
func NewUserStatusEvent(userID, status string) *WebSocketMessage {
	eventType := EventUserOnline
	if status == "offline" {
		eventType = EventUserOffline
	}
	
	event := &UserStatusEvent{
		Type:   eventType,
		UserID: userID,
		Status: status,
	}
	return NewWebSocketMessage(eventType, event)
}

// NewSystemEvent creates a new system event
func NewSystemEvent(message, level string) *WebSocketMessage {
	event := &SystemEvent{
		Type:    EventSystemMessage,
		Message: message,
		Level:   level,
	}
	return NewWebSocketMessage(EventSystemMessage, event)
}

// NewErrorEvent creates a new error event
func NewErrorEvent(message, code string) *WebSocketMessage {
	event := &ErrorEvent{
		Type:    EventError,
		Message: message,
		Code:    code,
	}
	return NewWebSocketMessage(EventError, event)
}