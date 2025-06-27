package models

import (
	"time"
)

// Post represents a community post
type Post struct {
	ID            string    `json:"id" db:"id"`
	UserID        string    `json:"user_id" db:"user_id"`
	Title         string    `json:"title" db:"title"`
	Content       string    `json:"content" db:"content"`
	Category      string    `json:"category" db:"category"`
	CategoryEmoji string    `json:"category_emoji" db:"category_emoji"`
	AskingFor     string    `json:"asking_for" db:"asking_for"`
	CommentCount  int       `json:"comment_count" db:"comment_count"`
	ReactionCount int       `json:"reaction_count" db:"reaction_count"`
	BookmarkCount int       `json:"bookmark_count" db:"bookmark_count"`
	CursorID      int64     `json:"cursor_id" db:"cursor_id"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	User      *User           `json:"user,omitempty"`
	Reactions []ReactionGroup `json:"reactions,omitempty"`
	Comments  []Comment       `json:"comments,omitempty"`
	Stats     *PostStats      `json:"stats,omitempty"`
}

// ReactionGroup represents grouped reactions by emoji
type ReactionGroup struct {
	Emoji      string   `json:"emoji"`
	Count      int      `json:"count"`
	HasReacted bool     `json:"has_reacted"`
	Users      []string `json:"users"`
}

// Comment represents a reply to a post or another comment
type Comment struct {
	ID              string    `json:"id" db:"id"`
	PostID          string    `json:"post_id" db:"post_id"`
	UserID          string    `json:"user_id" db:"user_id"`
	ParentCommentID *string   `json:"parent_comment_id" db:"parent_comment_id"`
	Content         string    `json:"content" db:"content"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	User      *User      `json:"user,omitempty"`
	Reactions []Reaction `json:"reactions,omitempty"`
	Children  []Comment  `json:"children,omitempty"`
}

// Reaction represents a reaction emoji on a post or comment
type Reaction struct {
	ID        string    `json:"id" db:"id"`
	PostID    *string   `json:"post_id,omitempty" db:"post_id"`
	CommentID *string   `json:"comment_id,omitempty" db:"comment_id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Emoji     string    `json:"emoji" db:"emoji"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// Joined fields
	User *User `json:"user,omitempty"`
}

// PostStats represents aggregated statistics for a post
type PostStats struct {
	CommentCount  int `json:"comment_count"`
	ReactionCount int `json:"reaction_count"`
}

// CreatePostInput represents the input for creating a new post
type CreatePostInput struct {
	Title         string `json:"title" validate:"required,min=1,max=255"`
	Content       string `json:"content" validate:"required"`
	Category      string `json:"category" validate:"required"`
	CategoryEmoji string `json:"category_emoji"`
	AskingFor     string `json:"asking_for"`
}

// UpdatePostInput represents the input for updating a post
type UpdatePostInput struct {
	Title         *string `json:"title" validate:"omitempty,min=5,max=255"`
	Content       *string `json:"content" validate:"omitempty"`
	Category      *string `json:"category"`
	CategoryEmoji *string `json:"category_emoji"`
	AskingFor     *string `json:"asking_for"`
}

// CreateCommentInput represents the input for creating a new comment
type CreateCommentInput struct {
	PostID          string  `json:"post_id" validate:"required,uuid"`
	Content         string  `json:"content" validate:"required,min=1"`
	ParentCommentID *string `json:"parent_comment_id" validate:"omitempty,uuid"`
}

// AddReactionInput represents the input for adding a reaction
type AddReactionInput struct {
	Emoji string `json:"emoji" validate:"required,min=1,max=10"`
}

// PostFilters represents filters for querying posts
type PostFilters struct {
	UserID       string
	Category     string
	SearchQuery  string
	Limit        int
	// Cursor-based pagination
	CursorID     int64  // For efficient pagination
	// Legacy offset pagination (avoid for large datasets)
	Offset       int
	SortBy       string // "created_at", "reactions", "comments", "trending"
	SortOrder    string // "asc", "desc"
	// Current user ID for checking reaction status
	CurrentUserID string
}

// PostListResponse represents paginated post response
type PostListResponse struct {
	Posts      []*Post `json:"posts"`
	NextCursor int64   `json:"next_cursor,omitempty"`
	HasMore    bool    `json:"has_more"`
	Total      int     `json:"total,omitempty"` // Only for small datasets
}

// Validate validates the CreatePostInput
func (i *CreatePostInput) Validate() error {
	if i.Title == "" {
		return &ValidationError{Field: "title", Message: "Title is required"}
	}
	if len(i.Title) < 1 || len(i.Title) > 255 {
		return &ValidationError{Field: "title", Message: "Title must be between 1 and 255 characters"}
	}
	if i.Content == "" {
		return &ValidationError{Field: "content", Message: "Content is required"}
	}
	if i.Category == "" {
		return &ValidationError{Field: "category", Message: "Category is required"}
	}
	return nil
}

// Validate validates the CreateCommentInput
func (i *CreateCommentInput) Validate() error {
	if i.PostID == "" {
		return &ValidationError{Field: "post_id", Message: "Post ID is required"}
	}
	if i.Content == "" {
		return &ValidationError{Field: "content", Message: "Content is required"}
	}
	return nil
}