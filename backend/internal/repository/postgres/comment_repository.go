package postgres

import (
	"context"
	"database/sql"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"

	"github.com/jmoiron/sqlx"
)

type commentRepository struct {
	db *sqlx.DB
}

func NewCommentRepository(db *sqlx.DB) repository.CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) Create(ctx context.Context, comment *models.Comment) error {
	query := `
		INSERT INTO comments (post_id, user_id, parent_comment_id, content)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		comment.PostID,
		comment.UserID,
		comment.ParentCommentID,
		comment.Content,
	).Scan(&comment.ID, &comment.CreatedAt, &comment.UpdatedAt)

	return err
}

func (r *commentRepository) GetByID(ctx context.Context, id string) (*models.Comment, error) {
	comment := &models.Comment{}
	query := `
		SELECT id, post_id, user_id, parent_comment_id, content, created_at, updated_at
		FROM comments
		WHERE id = $1`

	err := r.db.GetContext(ctx, comment, query, id)
	if err == sql.ErrNoRows {
		return nil, models.ErrCommentNotFound
	}
	return comment, err
}

func (r *commentRepository) GetByPostID(ctx context.Context, postID string) ([]*models.Comment, error) {
	var comments []*models.Comment
	
	// Get all comments with user info in one query
	query := `
		SELECT 
			c.id, c.post_id, c.user_id, c.parent_comment_id, c.content, 
			c.created_at, c.updated_at,
			u.id as "user.id", u.name as "user.name", u.email as "user.email",
			u.profile_image as "user.profile_image"
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.post_id = $1
		ORDER BY c.created_at ASC`

	err := r.db.SelectContext(ctx, &comments, query, postID)
	if err != nil {
		return nil, err
	}

	// Get reactions for all comments in batch
	if len(comments) > 0 {
		commentIDs := make([]string, len(comments))
		for i, c := range comments {
			commentIDs[i] = c.ID
		}

		// Get reactions grouped by comment
		reactionQuery := `
			SELECT 
				cr.comment_id,
				cr.emoji,
				COUNT(*) as count,
				ARRAY_AGG(u.name ORDER BY cr.created_at LIMIT 3) as user_names
			FROM comment_reactions cr
			JOIN users u ON cr.user_id = u.id
			WHERE cr.comment_id = ANY($1::uuid[])
			GROUP BY cr.comment_id, cr.emoji
			ORDER BY cr.comment_id, count DESC`

		rows, err := r.db.QueryContext(ctx, reactionQuery, commentIDs)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		// Map reactions to comments
		reactionMap := make(map[string][]models.Reaction)
		for rows.Next() {
			var commentID, emoji string
			var count int
			var userNames []string
			
			if err := rows.Scan(&commentID, &emoji, &count, &userNames); err != nil {
				return nil, err
			}

			// Note: This is simplified - in production you'd want ReactionGroup
			reaction := models.Reaction{
				CommentID: &commentID,
				Emoji:     emoji,
			}
			reactionMap[commentID] = append(reactionMap[commentID], reaction)
		}

		// Assign reactions to comments
		for _, comment := range comments {
			if reactions, ok := reactionMap[comment.ID]; ok {
				comment.Reactions = reactions
			}
		}
	}

	return comments, nil
}

func (r *commentRepository) Update(ctx context.Context, comment *models.Comment) error {
	query := `
		UPDATE comments
		SET content = $2, updated_at = NOW()
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, comment.ID, comment.Content)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return models.ErrCommentNotFound
	}

	return nil
}

func (r *commentRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM comments WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return models.ErrCommentNotFound
	}

	return nil
}