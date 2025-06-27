package postgres

import (
	"context"
	"database/sql"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"

	"github.com/jmoiron/sqlx"
)

type reactionRepository struct {
	db *sqlx.DB
}

func NewReactionRepository(db *sqlx.DB) repository.ReactionRepository {
	return &reactionRepository{db: db}
}

func (r *reactionRepository) Create(ctx context.Context, reaction *models.Reaction) error {
	var query string
	var args []interface{}

	if reaction.PostID != nil {
		// Post reaction
		query = `
			INSERT INTO post_reactions (post_id, user_id, emoji)
			VALUES ($1, $2, $3)
			ON CONFLICT (post_id, user_id, emoji) DO NOTHING
			RETURNING id, created_at`
		args = []interface{}{*reaction.PostID, reaction.UserID, reaction.Emoji}
	} else if reaction.CommentID != nil {
		// Comment reaction
		query = `
			INSERT INTO comment_reactions (comment_id, user_id, emoji)
			VALUES ($1, $2, $3)
			ON CONFLICT (comment_id, user_id, emoji) DO NOTHING
			RETURNING id, created_at`
		args = []interface{}{*reaction.CommentID, reaction.UserID, reaction.Emoji}
	} else {
		return models.ErrInvalidReaction
	}

	err := r.db.QueryRowContext(ctx, query, args...).Scan(&reaction.ID, &reaction.CreatedAt)
	if err == sql.ErrNoRows {
		// Reaction already exists (due to ON CONFLICT)
		return models.ErrDuplicateReaction
	}
	return err
}

func (r *reactionRepository) Delete(ctx context.Context, id string) error {
	// Try deleting from both tables
	query := `
		WITH deleted_post AS (
			DELETE FROM post_reactions WHERE id = $1 RETURNING 1
		), deleted_comment AS (
			DELETE FROM comment_reactions WHERE id = $1 RETURNING 1
		)
		SELECT COUNT(*) FROM (
			SELECT 1 FROM deleted_post
			UNION ALL
			SELECT 1 FROM deleted_comment
		) AS deletions`

	var count int
	err := r.db.QueryRowContext(ctx, query, id).Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		return models.ErrReactionNotFound
	}

	return nil
}

func (r *reactionRepository) DeleteByUserAndTarget(ctx context.Context, userID string, postID, commentID *string, emoji string) error {
	var result sql.Result
	var err error

	if postID != nil {
		query := `DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3`
		result, err = r.db.ExecContext(ctx, query, *postID, userID, emoji)
	} else if commentID != nil {
		query := `DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND emoji = $3`
		result, err = r.db.ExecContext(ctx, query, *commentID, userID, emoji)
	} else {
		return models.ErrInvalidReaction
	}

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return models.ErrReactionNotFound
	}

	return nil
}

func (r *reactionRepository) GetByPost(ctx context.Context, postID string) ([]*models.Reaction, error) {
	var reactions []*models.Reaction
	query := `
		SELECT pr.id, pr.post_id, pr.user_id, pr.emoji, pr.created_at,
		       u.id as "user.id", u.name as "user.name", u.profile_image as "user.profile_image"
		FROM post_reactions pr
		JOIN users u ON pr.user_id = u.id
		WHERE pr.post_id = $1
		ORDER BY pr.created_at DESC`

	err := r.db.SelectContext(ctx, &reactions, query, postID)
	return reactions, err
}

func (r *reactionRepository) GetByComment(ctx context.Context, commentID string) ([]*models.Reaction, error) {
	var reactions []*models.Reaction
	query := `
		SELECT cr.id, cr.comment_id, cr.user_id, cr.emoji, cr.created_at,
		       u.id as "user.id", u.name as "user.name", u.profile_image as "user.profile_image"
		FROM comment_reactions cr
		JOIN users u ON cr.user_id = u.id
		WHERE cr.comment_id = $1
		ORDER BY cr.created_at DESC`

	err := r.db.SelectContext(ctx, &reactions, query, commentID)
	return reactions, err
}

func (r *reactionRepository) GetByUserAndPost(ctx context.Context, userID, postID string) ([]*models.Reaction, error) {
	var reactions []*models.Reaction
	query := `
		SELECT id, post_id, user_id, emoji, created_at
		FROM post_reactions
		WHERE user_id = $1 AND post_id = $2`

	err := r.db.SelectContext(ctx, &reactions, query, userID, postID)
	return reactions, err
}

func (r *reactionRepository) GetByUserAndComment(ctx context.Context, userID, commentID string) ([]*models.Reaction, error) {
	var reactions []*models.Reaction
	query := `
		SELECT id, comment_id, user_id, emoji, created_at
		FROM comment_reactions
		WHERE user_id = $1 AND comment_id = $2`

	err := r.db.SelectContext(ctx, &reactions, query, userID, commentID)
	return reactions, err
}