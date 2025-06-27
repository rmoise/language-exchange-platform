package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
	"language-exchange/internal/models"
)

type BookmarkRepository struct {
	db *sqlx.DB
}

func NewBookmarkRepository(db *sqlx.DB) *BookmarkRepository {
	return &BookmarkRepository{db: db}
}

// ToggleBookmark adds or removes a bookmark for a user and post
func (r *BookmarkRepository) ToggleBookmark(ctx context.Context, userID, postID string) (bool, error) {
	// Check if bookmark already exists
	var existingID string
	err := r.db.GetContext(ctx, &existingID,
		"SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2",
		userID, postID)

	if err == sql.ErrNoRows {
		// Bookmark doesn't exist, create it
		_, err = r.db.ExecContext(ctx,
			"INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)",
			userID, postID)
		if err != nil {
			return false, fmt.Errorf("failed to create bookmark: %w", err)
		}
		return true, nil // Now bookmarked
	} else if err != nil {
		return false, fmt.Errorf("failed to check existing bookmark: %w", err)
	}

	// Bookmark exists, remove it
	_, err = r.db.ExecContext(ctx,
		"DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2",
		userID, postID)
	if err != nil {
		return false, fmt.Errorf("failed to remove bookmark: %w", err)
	}
	return false, nil // No longer bookmarked
}

// IsBookmarked checks if a user has bookmarked a specific post
func (r *BookmarkRepository) IsBookmarked(ctx context.Context, userID, postID string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM bookmarks WHERE user_id = $1 AND post_id = $2",
		userID, postID)
	if err != nil {
		return false, fmt.Errorf("failed to check bookmark status: %w", err)
	}
	return count > 0, nil
}

// GetUserBookmarks retrieves all posts bookmarked by a user with pagination
func (r *BookmarkRepository) GetUserBookmarks(ctx context.Context, userID string, limit, offset int) ([]models.Post, error) {
	query := `
		SELECT p.id, p.title, p.content, p.category, p.category_emoji, p.asking_for,
			   p.user_id, p.comment_count, p.reaction_count, p.bookmark_count, p.cursor_id,
			   p.created_at, p.updated_at,
			   u.id as author_id, u.name as author_name, u.profile_image as author_profile_image
		FROM posts p
		INNER JOIN bookmarks b ON p.id = b.post_id
		INNER JOIN users u ON p.user_id = u.id
		WHERE b.user_id = $1
		ORDER BY b.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryxContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user bookmarks: %w", err)
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		var author models.User
		var askingFor sql.NullString

		err := rows.Scan(
			&post.ID, &post.Title, &post.Content, &post.Category, &post.CategoryEmoji, &askingFor,
			&post.UserID, &post.CommentCount, &post.ReactionCount, &post.BookmarkCount, &post.CursorID,
			&post.CreatedAt, &post.UpdatedAt,
			&author.ID, &author.Name, &author.ProfileImage,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan bookmark: %w", err)
		}

		// Handle nullable fields
		if askingFor.Valid {
			post.AskingFor = askingFor.String
		}

		// Set user info
		post.User = &author

		posts = append(posts, post)
	}

	return posts, nil
}

// GetUserBookmarkCount returns the total number of bookmarks for a user
func (r *BookmarkRepository) GetUserBookmarkCount(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM bookmarks WHERE user_id = $1", userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get bookmark count: %w", err)
	}
	return count, nil
}

// GetPostBookmarkStatus returns bookmark info for posts (used when fetching posts)
func (r *BookmarkRepository) GetPostBookmarkStatus(ctx context.Context, userID string, postIDs []string) (map[string]bool, error) {
	if len(postIDs) == 0 {
		return make(map[string]bool), nil
	}

	query := `SELECT post_id FROM bookmarks WHERE user_id = $1 AND post_id = ANY($2)`
	rows, err := r.db.QueryContext(ctx, query, userID, postIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get bookmark status: %w", err)
	}
	defer rows.Close()

	bookmarked := make(map[string]bool)
	for _, postID := range postIDs {
		bookmarked[postID] = false
	}

	for rows.Next() {
		var postID string
		if err := rows.Scan(&postID); err != nil {
			return nil, fmt.Errorf("failed to scan bookmark status: %w", err)
		}
		bookmarked[postID] = true
	}

	return bookmarked, nil
}