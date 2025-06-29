package models

import (
	"time"
)

// AIUsageLog tracks AI feature usage for quota management
type AIUsageLog struct {
	ID        string    `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    string    `json:"user_id" gorm:"type:uuid;not null"`
	Type      string    `json:"type" gorm:"default:'improvement'"`
	CreatedAt time.Time `json:"created_at" gorm:"default:now()"`
	User      *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// AIUsageStats represents usage statistics for a user
type AIUsageStats struct {
	Used      int64  `json:"used"`
	Limit     int64  `json:"limit"`
	Remaining int64  `json:"remaining"`
	IsPro     bool   `json:"is_pro"`
	PlanType  string `json:"plan_type"`
}

// ImproveMessageRequest represents a request to improve a message
type ImproveMessageRequest struct {
	Text string `json:"text" binding:"required"`
}

// ImproveMessageResponse represents the improvement response
type ImproveMessageResponse struct {
	Original      string        `json:"original"`
	Improved      string        `json:"improved,omitempty"`
	Remaining     int64         `json:"remaining,omitempty"`
	IsPro         bool          `json:"is_pro"`
	NeedsUpgrade  bool          `json:"needs_upgrade,omitempty"`
	Preview       string        `json:"preview,omitempty"`
	Message       string        `json:"message,omitempty"`
	Used          int64         `json:"used,omitempty"`
	Limit         int64         `json:"limit,omitempty"`
}