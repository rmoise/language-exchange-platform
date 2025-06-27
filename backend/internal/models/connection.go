package models

import "time"

// UserConnection represents a following relationship between users
type UserConnection struct {
	ID          string    `json:"id" db:"id"`
	FollowerID  string    `json:"follower_id" db:"follower_id"`
	FollowingID string    `json:"following_id" db:"following_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`

	// Joined fields
	Follower  *User `json:"follower,omitempty"`
	Following *User `json:"following,omitempty"`
}

// FollowUserInput represents the input for following a user
type FollowUserInput struct {
	UserID string `json:"user_id" validate:"required,uuid"`
}

// ConnectionsResponse represents the response for user connections
type ConnectionsResponse struct {
	Connections []*UserConnection `json:"connections"`
	TotalCount  int               `json:"total_count"`
	HasMore     bool              `json:"has_more"`
	NextOffset  int               `json:"next_offset,omitempty"`
}

// ConnectionStatus represents the connection status between two users
type ConnectionStatus struct {
	IsFollowing bool `json:"is_following"`
	IsFollower  bool `json:"is_follower"`
}