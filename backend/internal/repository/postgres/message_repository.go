package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/models"

	"github.com/jmoiron/sqlx"
)

type MessageRepository struct {
	db *sqlx.DB
}

func NewMessageRepository(db *sqlx.DB) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, message *models.Message) error {
	query := `
		INSERT INTO messages (id, conversation_id, sender_id, content, message_type, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	
	_, err := r.db.ExecContext(ctx, query,
		message.ID,
		message.ConversationID,
		message.SenderID,
		message.Content,
		message.MessageType,
		message.Status,
		message.CreatedAt,
		message.UpdatedAt,
	)
	
	return err
}

func (r *MessageRepository) GetByID(ctx context.Context, id string) (*models.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.content, m.message_type, 
		       m.status, m.created_at, m.updated_at,
		       u.name as sender_name, u.profile_image as sender_image
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.id = $1`
	
	var message models.Message
	var senderName string
	var senderImage *string
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&message.ID,
		&message.ConversationID,
		&message.SenderID,
		&message.Content,
		&message.MessageType,
		&message.Status,
		&message.CreatedAt,
		&message.UpdatedAt,
		&senderName,
		&senderImage,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("message not found")
		}
		return nil, err
	}
	
	// Set sender information
	message.Sender = &models.User{
		ID:           message.SenderID,
		Name:         senderName,
		ProfileImage: senderImage,
	}
	
	return &message, nil
}

func (r *MessageRepository) GetByConversationID(ctx context.Context, conversationID string, limit, offset int) ([]*models.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.content, m.message_type, 
		       m.status, m.created_at, m.updated_at,
		       u.name as sender_name, u.profile_image as sender_image
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at ASC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.QueryContext(ctx, query, conversationID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var messages []*models.Message
	for rows.Next() {
		var message models.Message
		var senderName string
		var senderImage *string
		
		err := rows.Scan(
			&message.ID,
			&message.ConversationID,
			&message.SenderID,
			&message.Content,
			&message.MessageType,
			&message.Status,
			&message.CreatedAt,
			&message.UpdatedAt,
			&senderName,
			&senderImage,
		)
		if err != nil {
			return nil, err
		}
		
		// Set sender information
		message.Sender = &models.User{
			ID:           message.SenderID,
			Name:         senderName,
			ProfileImage: senderImage,
		}
		
		messages = append(messages, &message)
	}
	
	return messages, nil
}

func (r *MessageRepository) UpdateStatus(ctx context.Context, messageID string, status models.MessageStatus) error {
	query := `
		UPDATE messages 
		SET status = $1, updated_at = NOW()
		WHERE id = $2`
	
	result, err := r.db.ExecContext(ctx, query, status, messageID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("message not found")
	}
	
	return nil
}

func (r *MessageRepository) MarkAsRead(ctx context.Context, conversationID, userID string) error {
	query := `
		UPDATE messages 
		SET status = 'read', updated_at = NOW()
		WHERE conversation_id = $1 
		AND sender_id != $2 
		AND status != 'read'`
	
	_, err := r.db.ExecContext(ctx, query, conversationID, userID)
	return err
}

func (r *MessageRepository) GetLastMessage(ctx context.Context, conversationID string) (*models.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.content, m.message_type, 
		       m.status, m.created_at, m.updated_at,
		       u.name as sender_name, u.profile_image as sender_image
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at ASC
		LIMIT 1`
	
	var message models.Message
	var senderName string
	var senderImage *string
	
	err := r.db.QueryRowContext(ctx, query, conversationID).Scan(
		&message.ID,
		&message.ConversationID,
		&message.SenderID,
		&message.Content,
		&message.MessageType,
		&message.Status,
		&message.CreatedAt,
		&message.UpdatedAt,
		&senderName,
		&senderImage,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No messages in conversation yet
		}
		return nil, err
	}
	
	// Set sender information
	message.Sender = &models.User{
		ID:           message.SenderID,
		Name:         senderName,
		ProfileImage: senderImage,
	}
	
	return &message, nil
}

func (r *MessageRepository) Delete(ctx context.Context, messageID string) error {
	query := `DELETE FROM messages WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, messageID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("message not found")
	}
	
	return nil
}