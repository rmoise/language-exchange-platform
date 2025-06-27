package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type postRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) repository.PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(ctx context.Context, post *models.Post) error {
	query := `
		INSERT INTO posts (user_id, title, content, category, category_emoji, asking_for)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, cursor_id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		post.UserID,
		post.Title,
		post.Content,
		post.Category,
		post.CategoryEmoji,
		post.AskingFor,
	).Scan(&post.ID, &post.CursorID, &post.CreatedAt, &post.UpdatedAt)

	return err
}

func (r *postRepository) GetByID(ctx context.Context, id string) (*models.Post, error) {
	post := &models.Post{}
	query := `
		SELECT id, user_id, title, content, category, category_emoji, asking_for,
		       comment_count, reaction_count, cursor_id, created_at, updated_at
		FROM posts
		WHERE id = $1`

	err := r.db.GetContext(ctx, post, query, id)
	if err == sql.ErrNoRows {
		return nil, models.ErrPostNotFound
	}
	return post, err
}

func (r *postRepository) GetByIDWithDetails(ctx context.Context, id, currentUserID string) (*models.Post, error) {
	// Get post with user info
	post := &models.Post{}
	query := `
		SELECT 
			p.id, p.user_id, p.title, p.content, p.category, p.category_emoji, p.asking_for,
			p.comment_count, p.reaction_count, p.cursor_id, p.created_at, p.updated_at,
			u.id as "user.id", u.name as "user.name", u.email as "user.email",
			u.profile_image as "user.profile_image", u.city as "user.city", 
			u.country as "user.country", u.native_languages as "user.native_languages",
			u.target_languages as "user.target_languages"
		FROM posts p
		JOIN users u ON p.user_id = u.id
		WHERE p.id = $1`

	err := r.db.GetContext(ctx, post, query, id)
	if err == sql.ErrNoRows {
		return nil, models.ErrPostNotFound
	}
	if err != nil {
		return nil, err
	}

	// Get reactions grouped by emoji with user info (top 3 users per emoji)
	reactionsQuery := `
		WITH reaction_groups AS (
			SELECT 
				pr.emoji,
				COUNT(*) as count,
				(ARRAY_AGG(
					u.name 
					ORDER BY pr.created_at
				))[1:3] as user_names,
				bool_or(pr.user_id = $2) as has_reacted
			FROM post_reactions pr
			JOIN users u ON pr.user_id = u.id
			WHERE pr.post_id = $1
			GROUP BY pr.emoji
		)
		SELECT emoji, count, user_names, has_reacted
		FROM reaction_groups
		ORDER BY count DESC`

	var reactions []struct {
		Emoji      string         `db:"emoji"`
		Count      int            `db:"count"`
		UserNames  pq.StringArray `db:"user_names"`
		HasReacted bool           `db:"has_reacted"`
	}

	err = r.db.SelectContext(ctx, &reactions, reactionsQuery, id, currentUserID)
	if err != nil {
		return nil, err
	}

	// Convert to ReactionGroup
	post.Reactions = make([]models.ReactionGroup, len(reactions))
	for i, r := range reactions {
		post.Reactions[i] = models.ReactionGroup{
			Emoji:      r.Emoji,
			Count:      r.Count,
			HasReacted: r.HasReacted,
			Users:      r.UserNames,
		}
	}

	return post, nil
}

func (r *postRepository) Update(ctx context.Context, post *models.Post) error {
	query := `
		UPDATE posts
		SET title = $2, content = $3, category = $4, category_emoji = $5, 
		    asking_for = $6, updated_at = NOW()
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		post.ID,
		post.Title,
		post.Content,
		post.Category,
		post.CategoryEmoji,
		post.AskingFor,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return models.ErrPostNotFound
	}

	return nil
}

func (r *postRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM posts WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return models.ErrPostNotFound
	}

	return nil
}

func (r *postRepository) List(ctx context.Context, filters models.PostFilters) ([]*models.Post, error) {
	posts := make([]*models.Post, 0)
	args := []interface{}{}
	argCount := 0

	// Base query - simplified without user join for now
	query := `
		SELECT 
			p.id, p.user_id, p.title, p.content, p.category, p.category_emoji, p.asking_for,
			p.comment_count, p.reaction_count, p.cursor_id, p.created_at, p.updated_at
		FROM posts p
		WHERE 1=1`

	// Add filters
	if filters.UserID != "" {
		argCount++
		query += fmt.Sprintf(" AND p.user_id = $%d", argCount)
		args = append(args, filters.UserID)
	}

	if filters.Category != "" {
		argCount++
		query += fmt.Sprintf(" AND p.category = $%d", argCount)
		args = append(args, filters.Category)
	}

	if filters.SearchQuery != "" {
		argCount++
		query += fmt.Sprintf(" AND to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', $%d)", argCount)
		args = append(args, filters.SearchQuery)
	}

	// Cursor-based pagination (more efficient for large datasets)
	if filters.CursorID > 0 {
		argCount++
		query += fmt.Sprintf(" AND p.cursor_id < $%d", argCount)
		args = append(args, filters.CursorID)
	}

	// Sorting
	switch filters.SortBy {
	case "reactions":
		query += " ORDER BY p.reaction_count DESC, p.cursor_id DESC"
	case "comments":
		query += " ORDER BY p.comment_count DESC, p.cursor_id DESC"
	case "trending":
		// Use the trending score calculation
		query = strings.Replace(query, "WHERE 1=1", 
			"WHERE p.created_at > NOW() - INTERVAL '7 days'", 1)
		query += " ORDER BY (p.comment_count * 2 + p.reaction_count - " +
			"EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) DESC"
	case "created_at":
		query += " ORDER BY p.created_at DESC, p.cursor_id DESC"
	default:
		query += " ORDER BY p.cursor_id DESC"
	}

	// Limit
	limit := filters.Limit
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	argCount++
	query += fmt.Sprintf(" LIMIT $%d", argCount)
	args = append(args, limit)

	err := r.db.SelectContext(ctx, &posts, query, args...)
	if err != nil {
		return nil, err
	}

	// For each post, get user data and reactions (batch queries for efficiency)
	if len(posts) > 0 {
		// Get unique user IDs
		userIDs := make(map[string]bool)
		for _, p := range posts {
			userIDs[p.UserID] = true
		}
		
		// Convert to slice
		userIDSlice := make([]string, 0, len(userIDs))
		for id := range userIDs {
			userIDSlice = append(userIDSlice, id)
		}
		
		// Fetch users
		userQuery := `
			SELECT id, name, email, profile_image, city, country, native_languages, target_languages
			FROM users
			WHERE id = ANY($1)
		`
		
		var users []models.User
		err = r.db.SelectContext(ctx, &users, userQuery, pq.Array(userIDSlice))
		if err != nil {
			return nil, err
		}
		
		// Create user map
		userMap := make(map[string]*models.User)
		for i := range users {
			userMap[users[i].ID] = &users[i]
		}
		
		// Assign users to posts
		for _, post := range posts {
			if user, ok := userMap[post.UserID]; ok {
				post.User = user
			}
		}

		postIDs := make([]string, len(posts))
		for i, p := range posts {
			postIDs[i] = p.ID
		}

		// Get reactions for all posts in one query
		var reactionQuery string
		var queryArgs []interface{}
		
		if filters.CurrentUserID != "" {
			// Include has_reacted check when user is authenticated
			reactionQuery = `
				WITH reaction_summary AS (
					SELECT 
						pr.post_id,
						pr.emoji,
						COUNT(*) as count,
						ARRAY_AGG(
							u.name 
							ORDER BY pr.created_at
						) as user_names,
						BOOL_OR(CASE WHEN pr.user_id = $2 THEN true ELSE false END) as has_reacted
					FROM post_reactions pr
					JOIN users u ON pr.user_id = u.id
					WHERE pr.post_id = ANY($1)
					GROUP BY pr.post_id, pr.emoji
				)
				SELECT post_id, emoji, count, user_names, has_reacted
				FROM reaction_summary
				ORDER BY post_id, count DESC`
			queryArgs = []interface{}{pq.Array(postIDs), filters.CurrentUserID}
		} else {
			// Simpler query for unauthenticated requests
			reactionQuery = `
				WITH reaction_summary AS (
					SELECT 
						pr.post_id,
						pr.emoji,
						COUNT(*) as count,
						ARRAY_AGG(
							u.name 
							ORDER BY pr.created_at
						) as user_names,
						false as has_reacted
					FROM post_reactions pr
					JOIN users u ON pr.user_id = u.id
					WHERE pr.post_id = ANY($1)
					GROUP BY pr.post_id, pr.emoji
				)
				SELECT post_id, emoji, count, user_names, has_reacted
				FROM reaction_summary
				ORDER BY post_id, count DESC`
			queryArgs = []interface{}{pq.Array(postIDs)}
		}

		var reactions []struct {
			PostID     string         `db:"post_id"`
			Emoji      string         `db:"emoji"`
			Count      int            `db:"count"`
			UserNames  pq.StringArray `db:"user_names"`
			HasReacted bool           `db:"has_reacted"`
		}

		err = r.db.SelectContext(ctx, &reactions, reactionQuery, queryArgs...)
		if err != nil {
			return nil, err
		}

		// Map reactions to posts
		reactionMap := make(map[string][]models.ReactionGroup)
		for _, r := range reactions {
			if _, ok := reactionMap[r.PostID]; !ok {
				reactionMap[r.PostID] = []models.ReactionGroup{}
			}
			reactionMap[r.PostID] = append(reactionMap[r.PostID], models.ReactionGroup{
				Emoji:      r.Emoji,
				Count:      r.Count,
				HasReacted: r.HasReacted,
				Users:      r.UserNames,
			})
		}

		// Assign reactions to posts
		for _, post := range posts {
			if reactions, ok := reactionMap[post.ID]; ok {
				post.Reactions = reactions
			} else {
				post.Reactions = []models.ReactionGroup{}
			}
		}
	}

	return posts, nil
}

func (r *postRepository) GetUserPosts(ctx context.Context, userID string, limit, offset int) ([]*models.Post, error) {
	filters := models.PostFilters{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	}
	return r.List(ctx, filters)
}