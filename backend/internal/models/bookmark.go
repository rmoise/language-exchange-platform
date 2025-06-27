package models

import (
	"time"
)

// Bookmark represents a user's bookmarked post
type Bookmark struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	PostID    string    `json:"post_id" db:"post_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// BookmarkRequest represents the request to bookmark/unbookmark a post
type BookmarkRequest struct {
	PostID string `json:"post_id" validate:"required"`
}

// BookmarkResponse represents the response when toggling a bookmark
type BookmarkResponse struct {
	PostID      string `json:"post_id"`
	IsBookmarked bool   `json:"is_bookmarked"`
	Message     string `json:"message"`
}