package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/models"

	"github.com/jmoiron/sqlx"
)

type ConversationRepository struct {
	db *sqlx.DB
}

func NewConversationRepository(db *sqlx.DB) *ConversationRepository {
	return &ConversationRepository{db: db}
}

func (r *ConversationRepository) Create(ctx context.Context, conversation *models.Conversation) error {
	query := `
		INSERT INTO conversations (id, user1_id, user2_id, created_at, updated_at, last_message_at)
		VALUES ($1, $2, $3, $4, $5, $6)`
	
	_, err := r.db.ExecContext(ctx, query,
		conversation.ID,
		conversation.User1ID,
		conversation.User2ID,
		conversation.CreatedAt,
		conversation.UpdatedAt,
		conversation.LastMessageAt,
	)
	
	return err
}

func (r *ConversationRepository) GetByID(ctx context.Context, id string) (*models.Conversation, error) {
	query := `
		SELECT id, user1_id, user2_id, created_at, updated_at, last_message_at
		FROM conversations
		WHERE id = $1`
	
	var conversation models.Conversation
	err := r.db.GetContext(ctx, &conversation, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("conversation not found")
		}
		return nil, err
	}
	
	return &conversation, nil
}

func (r *ConversationRepository) GetOrCreate(ctx context.Context, user1ID, user2ID string) (*models.Conversation, error) {
	// Use the database function to get or create conversation
	query := `SELECT get_or_create_conversation($1, $2)`
	
	var conversationID string
	err := r.db.GetContext(ctx, &conversationID, query, user1ID, user2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get or create conversation: %w", err)
	}
	
	// Now fetch the conversation details
	return r.GetByID(ctx, conversationID)
}

func (r *ConversationRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*models.Conversation, error) {
	query := `
		SELECT 
			c.id, c.user1_id, c.user2_id, c.created_at, c.updated_at, c.last_message_at,
			CASE 
				WHEN c.user1_id = $1 THEN json_build_object('id', u2.id, 'name', u2.name, 'profile_image', u2.profile_image)
				ELSE json_build_object('id', u1.id, 'name', u1.name, 'profile_image', u1.profile_image)
			END as other_user,
			get_unread_count($1, c.id) as unread_count
		FROM conversations c
		JOIN users u1 ON c.user1_id = u1.id
		JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = $1 OR c.user2_id = $1
		ORDER BY c.last_message_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var conversations []*models.Conversation
	for rows.Next() {
		var c models.Conversation
		var otherUserJSON string
		
		err := rows.Scan(
			&c.ID, &c.User1ID, &c.User2ID, &c.CreatedAt, &c.UpdatedAt, &c.LastMessageAt,
			&otherUserJSON, &c.UnreadCount,
		)
		if err != nil {
			return nil, err
		}
		
		// Parse other user JSON (simplified for now, could use proper JSON unmarshaling)
		c.OtherUser = &models.User{} // Will be populated properly in the service layer
		
		conversations = append(conversations, &c)
	}
	
	return conversations, nil
}

func (r *ConversationRepository) GetWithParticipants(ctx context.Context, conversationID string) (*models.ConversationWithParticipants, error) {
	query := `
		SELECT conversation_id, user1_id, user2_id, user1_name, user1_image, 
		       user2_name, user2_image, created_at, updated_at, last_message_at
		FROM conversation_participants
		WHERE conversation_id = $1`
	
	var cp models.ConversationWithParticipants
	err := r.db.GetContext(ctx, &cp, query, conversationID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("conversation not found")
		}
		return nil, err
	}
	
	return &cp, nil
}

func (r *ConversationRepository) UpdateLastMessageAt(ctx context.Context, conversationID string) error {
	query := `
		UPDATE conversations 
		SET last_message_at = NOW(), updated_at = NOW()
		WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, conversationID)
	return err
}

func (r *ConversationRepository) GetUnreadCount(ctx context.Context, userID, conversationID string) (int, error) {
	query := `SELECT get_unread_count($1, $2)`
	
	var count int
	err := r.db.GetContext(ctx, &count, query, userID, conversationID)
	if err != nil {
		return 0, err
	}
	
	return count, nil
}