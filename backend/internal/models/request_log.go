package models

import (
	"time"
)

// RequestLog tracks all connection requests for abuse detection
type RequestLog struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	RecipientID string    `json:"recipient_id" db:"recipient_id"`
	Action      string    `json:"action" db:"action"` // 'sent', 'cancelled', 'accepted', 'declined'
	IPAddress   string    `json:"ip_address" db:"ip_address"`
	UserAgent   string    `json:"user_agent" db:"user_agent"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	RequestID   string    `json:"request_id" db:"request_id"` // Reference to match_request
}

// UserBlock represents a blocked user
type UserBlock struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	BlockedBy string    `json:"blocked_by" db:"blocked_by"` // 'system' or admin user ID
	Reason    string    `json:"reason" db:"reason"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// NotificationThrottle tracks notification sending to prevent spam
type NotificationThrottle struct {
	ID               string    `json:"id" db:"id"`
	UserID           string    `json:"user_id" db:"user_id"`
	NotificationType string    `json:"notification_type" db:"notification_type"`
	Count            int       `json:"count" db:"count"`
	WindowStart      time.Time `json:"window_start" db:"window_start"`
	LastSent         time.Time `json:"last_sent" db:"last_sent"`
}

// AbuseReport represents a user report of abusive behavior
type AbuseReport struct {
	ID           string    `json:"id" db:"id"`
	ReporterID   string    `json:"reporter_id" db:"reporter_id"`
	ReportedID   string    `json:"reported_id" db:"reported_id"`
	Reason       string    `json:"reason" db:"reason"`
	Description  string    `json:"description" db:"description"`
	Status       string    `json:"status" db:"status"` // 'pending', 'reviewed', 'resolved'
	ReviewedBy   *string   `json:"reviewed_by" db:"reviewed_by"`
	ReviewedAt   *time.Time `json:"reviewed_at" db:"reviewed_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}