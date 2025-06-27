package postgres

import (
	"context"

	"github.com/jmoiron/sqlx"
	"language-exchange/internal/models"
)

type ConnectionRepository struct {
	db *sqlx.DB
}

func NewConnectionRepository(db *sqlx.DB) *ConnectionRepository {
	return &ConnectionRepository{db: db}
}

func (r *ConnectionRepository) Follow(ctx context.Context, followerID, followingID string) error {
	query := `
		INSERT INTO user_connections (follower_id, following_id)
		VALUES ($1, $2)
		ON CONFLICT (follower_id, following_id) DO NOTHING`
	
	_, err := r.db.ExecContext(ctx, query, followerID, followingID)
	return err
}

func (r *ConnectionRepository) Unfollow(ctx context.Context, followerID, followingID string) error {
	query := `
		DELETE FROM user_connections 
		WHERE follower_id = $1 AND following_id = $2`
	
	_, err := r.db.ExecContext(ctx, query, followerID, followingID)
	return err
}

func (r *ConnectionRepository) IsFollowing(ctx context.Context, followerID, followingID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM user_connections 
			WHERE follower_id = $1 AND following_id = $2
		)`
	
	var exists bool
	err := r.db.QueryRowContext(ctx, query, followerID, followingID).Scan(&exists)
	return exists, err
}

func (r *ConnectionRepository) GetFollowing(ctx context.Context, userID string, limit, offset int) ([]*models.UserConnection, error) {
	query := `
		SELECT 
			uc.id,
			uc.follower_id,
			uc.following_id,
			uc.created_at,
			u.id,
			u.name,
			u.email,
			u.profile_image,
			COALESCE(u.native_languages, '{}'),
			COALESCE(u.target_languages, '{}')
		FROM user_connections uc
		JOIN users u ON uc.following_id = u.id
		WHERE uc.follower_id = $1
		ORDER BY uc.created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var connections []*models.UserConnection
	for rows.Next() {
		conn := &models.UserConnection{
			Following: &models.User{},
		}
		
		err := rows.Scan(
			&conn.ID,
			&conn.FollowerID,
			&conn.FollowingID,
			&conn.CreatedAt,
			&conn.Following.ID,
			&conn.Following.Name,
			&conn.Following.Email,
			&conn.Following.ProfileImage,
			&conn.Following.NativeLanguages,
			&conn.Following.TargetLanguages,
		)
		if err != nil {
			return nil, err
		}
		
		connections = append(connections, conn)
	}

	return connections, rows.Err()
}

func (r *ConnectionRepository) GetFollowers(ctx context.Context, userID string, limit, offset int) ([]*models.UserConnection, error) {
	query := `
		SELECT 
			uc.id,
			uc.follower_id,
			uc.following_id,
			uc.created_at,
			u.id,
			u.name,
			u.email,
			u.profile_image,
			COALESCE(u.native_languages, '{}'),
			COALESCE(u.target_languages, '{}')
		FROM user_connections uc
		JOIN users u ON uc.follower_id = u.id
		WHERE uc.following_id = $1
		ORDER BY uc.created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var connections []*models.UserConnection
	for rows.Next() {
		conn := &models.UserConnection{
			Follower: &models.User{},
		}
		
		err := rows.Scan(
			&conn.ID,
			&conn.FollowerID,
			&conn.FollowingID,
			&conn.CreatedAt,
			&conn.Follower.ID,
			&conn.Follower.Name,
			&conn.Follower.Email,
			&conn.Follower.ProfileImage,
			&conn.Follower.NativeLanguages,
			&conn.Follower.TargetLanguages,
		)
		if err != nil {
			return nil, err
		}
		
		connections = append(connections, conn)
	}

	return connections, rows.Err()
}

func (r *ConnectionRepository) GetConnectionStatus(ctx context.Context, userID, targetUserID string) (*models.ConnectionStatus, error) {
	query := `
		SELECT 
			EXISTS(SELECT 1 FROM user_connections WHERE follower_id = $1 AND following_id = $2) as is_following,
			EXISTS(SELECT 1 FROM user_connections WHERE follower_id = $2 AND following_id = $1) as is_follower`
	
	status := &models.ConnectionStatus{}
	err := r.db.QueryRowContext(ctx, query, userID, targetUserID).Scan(
		&status.IsFollowing,
		&status.IsFollower,
	)
	
	return status, err
}

func (r *ConnectionRepository) GetConnectionCounts(ctx context.Context, userID string) (following int, followers int, err error) {
	query := `
		SELECT 
			COALESCE(following_count, 0),
			COALESCE(followers_count, 0)
		FROM users 
		WHERE id = $1`
	
	err = r.db.QueryRowContext(ctx, query, userID).Scan(&following, &followers)
	return following, followers, err
}