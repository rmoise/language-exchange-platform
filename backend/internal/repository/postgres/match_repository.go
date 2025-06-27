package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/database"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"

	"github.com/lib/pq"
)

type matchRepository struct {
	db *database.DB
}

func NewMatchRepository(db *database.DB) repository.MatchRepository {
	return &matchRepository{db: db}
}

func (r *matchRepository) CreateRequest(ctx context.Context, req *models.MatchRequest) error {
	query := `
		INSERT INTO match_requests (sender_id, recipient_id, status)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		req.SenderID,
		req.RecipientID,
		req.Status,
	).Scan(&req.ID, &req.CreatedAt, &req.UpdatedAt)

	return err
}

func (r *matchRepository) GetRequestByID(ctx context.Context, id string) (*models.MatchRequest, error) {
	query := `
		SELECT mr.id, mr.sender_id, mr.recipient_id, mr.status, mr.created_at, mr.updated_at,
			   s.id, s.email, s.name, s.native_languages, s.target_languages, s.created_at,
			   rec.id, rec.email, rec.name, rec.native_languages, rec.target_languages, rec.created_at
		FROM match_requests mr
		JOIN users s ON mr.sender_id = s.id
		JOIN users rec ON mr.recipient_id = rec.id
		WHERE mr.id = $1`

	request := &models.MatchRequest{}
	sender := &models.User{}
	recipient := &models.User{}

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&request.ID,
		&request.SenderID,
		&request.RecipientID,
		&request.Status,
		&request.CreatedAt,
		&request.UpdatedAt,
		&sender.ID,
		&sender.Email,
		&sender.Name,
		(*pq.StringArray)(&sender.NativeLanguages),
		(*pq.StringArray)(&sender.TargetLanguages),
		&sender.CreatedAt,
		&recipient.ID,
		&recipient.Email,
		&recipient.Name,
		(*pq.StringArray)(&recipient.NativeLanguages),
		(*pq.StringArray)(&recipient.TargetLanguages),
		&recipient.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("match request not found")
	}

	if err != nil {
		return nil, err
	}

	request.Sender = sender
	request.Recipient = recipient

	return request, nil
}

func (r *matchRepository) GetRequestBetweenUsers(ctx context.Context, senderID, recipientID string) (*models.MatchRequest, error) {
	query := `
		SELECT id, sender_id, recipient_id, status, created_at, updated_at
		FROM match_requests
		WHERE sender_id = $1 AND recipient_id = $2 AND status = 'pending'`

	request := &models.MatchRequest{}
	err := r.db.QueryRowContext(ctx, query, senderID, recipientID).Scan(
		&request.ID,
		&request.SenderID,
		&request.RecipientID,
		&request.Status,
		&request.CreatedAt,
		&request.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("match request not found")
	}

	return request, err
}

func (r *matchRepository) GetRequestsByUser(ctx context.Context, userID string, incoming bool) ([]*models.MatchRequest, error) {
	var query string
	if incoming {
		// Incoming requests (user is recipient)
		query = `
			SELECT mr.id, mr.sender_id, mr.recipient_id, mr.status, mr.created_at, mr.updated_at,
				   s.id, s.email, s.name, s.native_languages, s.target_languages, s.created_at
			FROM match_requests mr
			JOIN users s ON mr.sender_id = s.id
			WHERE mr.recipient_id = $1 AND mr.status = 'pending'
			ORDER BY mr.created_at DESC`
	} else {
		// Outgoing requests (user is sender)
		query = `
			SELECT mr.id, mr.sender_id, mr.recipient_id, mr.status, mr.created_at, mr.updated_at,
				   rec.id, rec.email, rec.name, rec.native_languages, rec.target_languages, rec.created_at
			FROM match_requests mr
			JOIN users rec ON mr.recipient_id = rec.id
			WHERE mr.sender_id = $1
			ORDER BY mr.created_at DESC`
	}

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := make([]*models.MatchRequest, 0)
	for rows.Next() {
		request := &models.MatchRequest{}
		user := &models.User{}

		err := rows.Scan(
			&request.ID,
			&request.SenderID,
			&request.RecipientID,
			&request.Status,
			&request.CreatedAt,
			&request.UpdatedAt,
			&user.ID,
			&user.Email,
			&user.Name,
			(*pq.StringArray)(&user.NativeLanguages),
			(*pq.StringArray)(&user.TargetLanguages),
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if incoming {
			request.Sender = user
		} else {
			request.Recipient = user
		}

		requests = append(requests, request)
	}

	return requests, rows.Err()
}

func (r *matchRepository) UpdateRequestStatus(ctx context.Context, id, status string) error {
	query := `
		UPDATE match_requests
		SET status = $2, updated_at = NOW()
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id, status)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("match request not found")
	}

	return nil
}

func (r *matchRepository) CreateMatch(ctx context.Context, match *models.Match) error {
	query := `
		INSERT INTO matches (user1_id, user2_id)
		VALUES ($1, $2)
		RETURNING id, created_at`

	err := r.db.QueryRowContext(ctx, query,
		match.User1ID,
		match.User2ID,
	).Scan(&match.ID, &match.CreatedAt)

	return err
}

func (r *matchRepository) GetByID(ctx context.Context, id string) (*models.Match, error) {
	query := `
		SELECT m.id, m.user1_id, m.user2_id, m.created_at,
			   u1.id, u1.email, u1.name, u1.native_languages, u1.target_languages, u1.created_at,
			   u2.id, u2.email, u2.name, u2.native_languages, u2.target_languages, u2.created_at
		FROM matches m
		JOIN users u1 ON m.user1_id = u1.id
		JOIN users u2 ON m.user2_id = u2.id
		WHERE m.id = $1`

	match := &models.Match{}
	user1 := &models.User{}
	user2 := &models.User{}

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&match.ID,
		&match.User1ID,
		&match.User2ID,
		&match.CreatedAt,
		&user1.ID,
		&user1.Email,
		&user1.Name,
		(*pq.StringArray)(&user1.NativeLanguages),
		(*pq.StringArray)(&user1.TargetLanguages),
		&user1.CreatedAt,
		&user2.ID,
		&user2.Email,
		&user2.Name,
		(*pq.StringArray)(&user2.NativeLanguages),
		(*pq.StringArray)(&user2.TargetLanguages),
		&user2.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("match not found")
	}

	if err != nil {
		return nil, err
	}

	match.User1 = user1
	match.User2 = user2

	return match, nil
}

func (r *matchRepository) GetMatchesByUser(ctx context.Context, userID string) ([]*models.Match, error) {
	query := `
		SELECT m.id, m.user1_id, m.user2_id, m.created_at,
			   u1.id, u1.email, u1.name, u1.native_languages, u1.target_languages, u1.created_at,
			   u2.id, u2.email, u2.name, u2.native_languages, u2.target_languages, u2.created_at
		FROM matches m
		JOIN users u1 ON m.user1_id = u1.id
		JOIN users u2 ON m.user2_id = u2.id
		WHERE m.user1_id = $1 OR m.user2_id = $1
		ORDER BY m.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	matches := make([]*models.Match, 0)
	for rows.Next() {
		match := &models.Match{}
		user1 := &models.User{}
		user2 := &models.User{}

		err := rows.Scan(
			&match.ID,
			&match.User1ID,
			&match.User2ID,
			&match.CreatedAt,
			&user1.ID,
			&user1.Email,
			&user1.Name,
			(*pq.StringArray)(&user1.NativeLanguages),
			(*pq.StringArray)(&user1.TargetLanguages),
			&user1.CreatedAt,
			&user2.ID,
			&user2.Email,
			&user2.Name,
			(*pq.StringArray)(&user2.NativeLanguages),
			(*pq.StringArray)(&user2.TargetLanguages),
			&user2.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		match.User1 = user1
		match.User2 = user2
		matches = append(matches, match)
	}

	return matches, rows.Err()
}

func (r *matchRepository) DeleteRequest(ctx context.Context, id string) error {
	query := `DELETE FROM match_requests WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("match request not found")
	}

	return nil
}