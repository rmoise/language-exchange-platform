package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"language-exchange/internal/database"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type sessionRepository struct {
	db *database.DB
}

func NewSessionRepository(db *database.DB) repository.SessionRepository {
	return &sessionRepository{db: db}
}

// Session management
func (r *sessionRepository) CreateSession(ctx context.Context, session *models.LanguageSession) error {
	query := `
		INSERT INTO language_sessions (id, name, description, created_by, invited_user_id, max_participants, session_type, target_language)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at`
	
	err := r.db.QueryRowContext(ctx, query,
		session.ID, session.Name, session.Description, session.CreatedBy, session.InvitedUserID,
		session.MaxParticipants, session.SessionType, session.TargetLanguage,
	).Scan(&session.CreatedAt, &session.UpdatedAt)
	
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	
	// Add creator as participant
	participant := &models.SessionParticipant{
		SessionID: session.ID,
		UserID:    session.CreatedBy,
		Role:      models.RoleCreator,
		IsActive:  true,
	}
	
	return r.AddParticipant(ctx, participant)
}

func (r *sessionRepository) GetSessionByID(ctx context.Context, sessionID string) (*models.LanguageSession, error) {
	query := `
		SELECT s.id, s.name, s.description, s.created_by, s.invited_user_id, s.status, s.max_participants,
			   s.session_type, s.target_language, s.created_at, s.ended_at, s.updated_at,
			   u.name as creator_name, u.email as creator_email,
			   iu.name as invited_user_name, iu.email as invited_user_email,
			   COUNT(DISTINCT sp.id) as participant_count
		FROM language_sessions s
		LEFT JOIN users u ON s.created_by = u.id
		LEFT JOIN users iu ON s.invited_user_id = iu.id
		LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.is_active = true
		WHERE s.id = $1
		GROUP BY s.id, u.name, u.email, iu.name, iu.email`
	
	session := &models.LanguageSession{}
	var creatorName, creatorEmail, invitedUserName, invitedUserEmail sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, sessionID).Scan(
		&session.ID, &session.Name, &session.Description, &session.CreatedBy, &session.InvitedUserID,
		&session.Status, &session.MaxParticipants, &session.SessionType,
		&session.TargetLanguage, &session.CreatedAt, &session.EndedAt, &session.UpdatedAt,
		&creatorName, &creatorEmail, &invitedUserName, &invitedUserEmail, &session.ParticipantCount,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, models.ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	// Set creator info if available
	if creatorName.Valid {
		session.Creator = &models.User{
			ID:    session.CreatedBy,
			Name:  creatorName.String,
			Email: creatorEmail.String,
		}
	}
	
	// Set invited user info if available
	if invitedUserName.Valid && session.InvitedUserID != nil {
		session.InvitedUser = &models.User{
			ID:    *session.InvitedUserID,
			Name:  invitedUserName.String,
			Email: invitedUserEmail.String,
		}
	}
	
	return session, nil
}

func (r *sessionRepository) GetSessionsByUser(ctx context.Context, userID string) ([]*models.LanguageSession, error) {
	query := `
		SELECT DISTINCT s.id, s.name, s.description, s.created_by, s.status, s.max_participants,
			   s.session_type, s.target_language, s.created_at, s.ended_at, s.updated_at,
			   u.name as creator_name,
			   COUNT(DISTINCT sp.id) as participant_count
		FROM language_sessions s
		LEFT JOIN users u ON s.created_by = u.id
		LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.is_active = true
		WHERE s.created_by = $1 OR s.id IN (
			SELECT session_id FROM session_participants WHERE user_id = $1
		)
		GROUP BY s.id, u.name
		ORDER BY s.updated_at DESC`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}
	defer rows.Close()
	
	var sessions []*models.LanguageSession
	for rows.Next() {
		session := &models.LanguageSession{}
		var creatorName sql.NullString
		
		err := rows.Scan(
			&session.ID, &session.Name, &session.Description, &session.CreatedBy,
			&session.Status, &session.MaxParticipants, &session.SessionType,
			&session.TargetLanguage, &session.CreatedAt, &session.EndedAt, &session.UpdatedAt,
			&creatorName, &session.ParticipantCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		
		if creatorName.Valid {
			session.Creator = &models.User{
				ID:   session.CreatedBy,
				Name: creatorName.String,
			}
		}
		
		sessions = append(sessions, session)
	}
	
	return sessions, rows.Err()
}

func (r *sessionRepository) GetActiveSessions(ctx context.Context, limit int) ([]*models.LanguageSession, error) {
	query := `
		SELECT s.id, s.name, s.description, s.created_by, s.status, s.max_participants,
			   s.session_type, s.target_language, s.created_at, s.ended_at, s.updated_at,
			   u.name as creator_name,
			   COUNT(DISTINCT sp.id) as participant_count
		FROM language_sessions s
		LEFT JOIN users u ON s.created_by = u.id
		LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.is_active = true
		WHERE s.status = $1
		GROUP BY s.id, u.name
		ORDER BY s.created_at DESC
		LIMIT $2`
	
	rows, err := r.db.QueryContext(ctx, query, models.SessionStatusActive, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get active sessions: %w", err)
	}
	defer rows.Close()
	
	var sessions []*models.LanguageSession
	for rows.Next() {
		session := &models.LanguageSession{}
		var creatorName sql.NullString
		
		err := rows.Scan(
			&session.ID, &session.Name, &session.Description, &session.CreatedBy,
			&session.Status, &session.MaxParticipants, &session.SessionType,
			&session.TargetLanguage, &session.CreatedAt, &session.EndedAt, &session.UpdatedAt,
			&creatorName, &session.ParticipantCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		
		if creatorName.Valid {
			session.Creator = &models.User{
				ID:   session.CreatedBy,
				Name: creatorName.String,
			}
		}
		
		sessions = append(sessions, session)
	}
	
	return sessions, rows.Err()
}

func (r *sessionRepository) UpdateSessionStatus(ctx context.Context, sessionID string, status string) error {
	query := `UPDATE language_sessions SET status = $1, updated_at = NOW() WHERE id = $2`
	
	result, err := r.db.ExecContext(ctx, query, status, sessionID)
	if err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return models.ErrSessionNotFound
	}
	
	return nil
}

func (r *sessionRepository) EndSession(ctx context.Context, sessionID string) error {
	query := `
		UPDATE language_sessions 
		SET status = $1, ended_at = NOW(), updated_at = NOW() 
		WHERE id = $2`
	
	result, err := r.db.ExecContext(ctx, query, models.SessionStatusEnded, sessionID)
	if err != nil {
		return fmt.Errorf("failed to end session: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return models.ErrSessionNotFound
	}
	
	// Mark all participants as inactive
	_, err = r.db.ExecContext(ctx,
		`UPDATE session_participants SET is_active = false, left_at = NOW() WHERE session_id = $1`,
		sessionID)
	if err != nil {
		return fmt.Errorf("failed to update participants: %w", err)
	}
	
	return nil
}

// Participant management
func (r *sessionRepository) AddParticipant(ctx context.Context, participant *models.SessionParticipant) error {
	query := `
		INSERT INTO session_participants (session_id, user_id, role, is_active)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (session_id, user_id) 
		DO UPDATE SET is_active = true, joined_at = NOW()
		RETURNING id, joined_at`
	
	err := r.db.QueryRowContext(ctx, query,
		participant.SessionID, participant.UserID, participant.Role, participant.IsActive,
	).Scan(&participant.ID, &participant.JoinedAt)
	
	if err != nil {
		return fmt.Errorf("failed to add participant: %w", err)
	}
	
	return nil
}

func (r *sessionRepository) RemoveParticipant(ctx context.Context, sessionID, userID string) error {
	query := `
		UPDATE session_participants 
		SET is_active = false, left_at = NOW() 
		WHERE session_id = $1 AND user_id = $2`
	
	result, err := r.db.ExecContext(ctx, query, sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove participant: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return models.ErrParticipantNotFound
	}
	
	return nil
}

func (r *sessionRepository) GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error) {
	query := `
		SELECT sp.id, sp.session_id, sp.user_id, sp.joined_at, sp.left_at, sp.role, sp.is_active,
			   u.name, u.email
		FROM session_participants sp
		LEFT JOIN users u ON sp.user_id = u.id
		WHERE sp.session_id = $1
		ORDER BY sp.joined_at ASC`
	
	rows, err := r.db.QueryContext(ctx, query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session participants: %w", err)
	}
	defer rows.Close()
	
	var participants []*models.SessionParticipant
	for rows.Next() {
		participant := &models.SessionParticipant{}
		var userName, userEmail sql.NullString
		
		err := rows.Scan(
			&participant.ID, &participant.SessionID, &participant.UserID,
			&participant.JoinedAt, &participant.LeftAt, &participant.Role, &participant.IsActive,
			&userName, &userEmail,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan participant: %w", err)
		}
		
		if userName.Valid {
			participant.User = &models.User{
				ID:    participant.UserID,
				Name:  userName.String,
				Email: userEmail.String,
			}
		}
		
		participants = append(participants, participant)
	}
	
	return participants, rows.Err()
}

func (r *sessionRepository) GetActiveParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error) {
	query := `
		SELECT sp.id, sp.session_id, sp.user_id, sp.joined_at, sp.left_at, sp.role, sp.is_active,
			   u.name, u.email
		FROM session_participants sp
		LEFT JOIN users u ON sp.user_id = u.id
		WHERE sp.session_id = $1 AND sp.is_active = true
		ORDER BY sp.joined_at ASC`
	
	rows, err := r.db.QueryContext(ctx, query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active participants: %w", err)
	}
	defer rows.Close()
	
	var participants []*models.SessionParticipant
	for rows.Next() {
		participant := &models.SessionParticipant{}
		var userName, userEmail sql.NullString
		
		err := rows.Scan(
			&participant.ID, &participant.SessionID, &participant.UserID,
			&participant.JoinedAt, &participant.LeftAt, &participant.Role, &participant.IsActive,
			&userName, &userEmail,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan participant: %w", err)
		}
		
		if userName.Valid {
			participant.User = &models.User{
				ID:    participant.UserID,
				Name:  userName.String,
				Email: userEmail.String,
			}
		}
		
		participants = append(participants, participant)
	}
	
	return participants, rows.Err()
}

func (r *sessionRepository) IsUserInSession(ctx context.Context, sessionID, userID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM session_participants 
			WHERE session_id = $1 AND user_id = $2 AND is_active = true
		)`
	
	var exists bool
	err := r.db.QueryRowContext(ctx, query, sessionID, userID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check user in session: %w", err)
	}
	
	return exists, nil
}

func (r *sessionRepository) UpdateParticipantStatus(ctx context.Context, sessionID, userID string, isActive bool) error {
	query := `
		UPDATE session_participants 
		SET is_active = $1, left_at = CASE WHEN $1 THEN NULL ELSE NOW() END
		WHERE session_id = $2 AND user_id = $3`
	
	result, err := r.db.ExecContext(ctx, query, isActive, sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to update participant status: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return models.ErrParticipantNotFound
	}
	
	return nil
}

// Canvas operations
func (r *sessionRepository) SaveCanvasOperation(ctx context.Context, operation *models.CanvasOperation) error {
	query := `
		INSERT INTO canvas_operations (id, session_id, user_id, operation_type, operation_data)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING sequence_number, timestamp`
	
	err := r.db.QueryRowContext(ctx, query,
		operation.ID, operation.SessionID, operation.UserID,
		operation.OperationType, operation.OperationData,
	).Scan(&operation.SequenceNumber, &operation.Timestamp)
	
	if err != nil {
		return fmt.Errorf("failed to save canvas operation: %w", err)
	}
	
	return nil
}

func (r *sessionRepository) GetCanvasOperations(ctx context.Context, sessionID string, fromSequence int64) ([]*models.CanvasOperation, error) {
	query := `
		SELECT co.id, co.session_id, co.user_id, co.operation_type, co.operation_data,
			   co.sequence_number, co.timestamp, u.name
		FROM canvas_operations co
		LEFT JOIN users u ON co.user_id = u.id
		WHERE co.session_id = $1 AND co.sequence_number > $2
		ORDER BY co.sequence_number ASC`
	
	rows, err := r.db.QueryContext(ctx, query, sessionID, fromSequence)
	if err != nil {
		return nil, fmt.Errorf("failed to get canvas operations: %w", err)
	}
	defer rows.Close()
	
	var operations []*models.CanvasOperation
	for rows.Next() {
		operation := &models.CanvasOperation{}
		var userName sql.NullString
		
		err := rows.Scan(
			&operation.ID, &operation.SessionID, &operation.UserID,
			&operation.OperationType, &operation.OperationData,
			&operation.SequenceNumber, &operation.Timestamp, &userName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan canvas operation: %w", err)
		}
		
		if userName.Valid {
			operation.User = &models.User{
				ID:   operation.UserID,
				Name: userName.String,
			}
		}
		
		operations = append(operations, operation)
	}
	
	return operations, rows.Err()
}

func (r *sessionRepository) GetLatestCanvasOperations(ctx context.Context, sessionID string, limit int) ([]*models.CanvasOperation, error) {
	query := `
		SELECT co.id, co.session_id, co.user_id, co.operation_type, co.operation_data,
			   co.sequence_number, co.timestamp, u.name
		FROM canvas_operations co
		LEFT JOIN users u ON co.user_id = u.id
		WHERE co.session_id = $1
		ORDER BY co.sequence_number DESC
		LIMIT $2`
	
	rows, err := r.db.QueryContext(ctx, query, sessionID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get latest canvas operations: %w", err)
	}
	defer rows.Close()
	
	var operations []*models.CanvasOperation
	for rows.Next() {
		operation := &models.CanvasOperation{}
		var userName sql.NullString
		
		err := rows.Scan(
			&operation.ID, &operation.SessionID, &operation.UserID,
			&operation.OperationType, &operation.OperationData,
			&operation.SequenceNumber, &operation.Timestamp, &userName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan canvas operation: %w", err)
		}
		
		if userName.Valid {
			operation.User = &models.User{
				ID:   operation.UserID,
				Name: userName.String,
			}
		}
		
		operations = append(operations, operation)
	}
	
	// Reverse the slice to get chronological order (oldest first)
	for i, j := 0, len(operations)-1; i < j; i, j = i+1, j-1 {
		operations[i], operations[j] = operations[j], operations[i]
	}
	
	return operations, rows.Err()
}

func (r *sessionRepository) ClearCanvasOperations(ctx context.Context, sessionID string) error {
	query := `DELETE FROM canvas_operations WHERE session_id = $1`
	
	_, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to clear canvas operations: %w", err)
	}
	
	return nil
}

// Session messages
func (r *sessionRepository) SaveMessage(ctx context.Context, message *models.SessionMessage) error {
	query := `
		INSERT INTO session_messages (id, session_id, user_id, message_text, message_type)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING timestamp`
	
	err := r.db.QueryRowContext(ctx, query,
		message.ID, message.SessionID, message.UserID,
		message.Content, message.MessageType,
	).Scan(&message.CreatedAt)
	
	if err != nil {
		return fmt.Errorf("failed to save message: %w", err)
	}
	
	return nil
}

func (r *sessionRepository) GetMessages(ctx context.Context, sessionID string, limit int, offset int) ([]*models.SessionMessage, error) {
	query := `
		SELECT sm.id, sm.session_id, sm.user_id, sm.message_text, sm.message_type, sm.timestamp,
			   u.name
		FROM session_messages sm
		LEFT JOIN users u ON sm.user_id = u.id
		WHERE sm.session_id = $1
		ORDER BY sm.timestamp DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.QueryContext(ctx, query, sessionID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}
	defer rows.Close()
	
	var messages []*models.SessionMessage
	for rows.Next() {
		message := &models.SessionMessage{}
		var userName sql.NullString
		
		err := rows.Scan(
			&message.ID, &message.SessionID, &message.UserID,
			&message.Content, &message.MessageType, &message.CreatedAt,
			&userName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}
		
		if userName.Valid {
			message.User = &models.User{
				ID:   message.UserID,
				Name: userName.String,
			}
		}
		
		messages = append(messages, message)
	}
	
	// Reverse to get chronological order (oldest first)
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	
	return messages, rows.Err()
}

func (r *sessionRepository) GetLatestMessages(ctx context.Context, sessionID string, limit int) ([]*models.SessionMessage, error) {
	return r.GetMessages(ctx, sessionID, limit, 0)
}