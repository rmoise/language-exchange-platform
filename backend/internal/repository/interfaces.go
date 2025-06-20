package repository

import (
	"context"
	"language-exchange/internal/models"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Search(ctx context.Context, filters models.SearchFilters) ([]*models.User, error)
}

type MatchRepository interface {
	CreateRequest(ctx context.Context, req *models.MatchRequest) error
	GetRequestByID(ctx context.Context, id string) (*models.MatchRequest, error)
	GetRequestBetweenUsers(ctx context.Context, senderID, recipientID string) (*models.MatchRequest, error)
	GetRequestsByUser(ctx context.Context, userID string, incoming bool) ([]*models.MatchRequest, error)
	UpdateRequestStatus(ctx context.Context, id, status string) error
	CreateMatch(ctx context.Context, match *models.Match) error
	GetByID(ctx context.Context, id string) (*models.Match, error)
	GetMatchesByUser(ctx context.Context, userID string) ([]*models.Match, error)
	DeleteRequest(ctx context.Context, id string) error
}

type ConversationRepository interface {
	Create(ctx context.Context, conversation *models.Conversation) error
	GetByID(ctx context.Context, id string) (*models.Conversation, error)
	GetOrCreate(ctx context.Context, user1ID, user2ID string) (*models.Conversation, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*models.Conversation, error)
	GetWithParticipants(ctx context.Context, conversationID string) (*models.ConversationWithParticipants, error)
	UpdateLastMessageAt(ctx context.Context, conversationID string) error
	GetUnreadCount(ctx context.Context, userID, conversationID string) (int, error)
}

type MessageRepository interface {
	Create(ctx context.Context, message *models.Message) error
	GetByID(ctx context.Context, id string) (*models.Message, error)
	GetByConversationID(ctx context.Context, conversationID string, limit, offset int) ([]*models.Message, error)
	UpdateStatus(ctx context.Context, messageID string, status models.MessageStatus) error
	MarkAsRead(ctx context.Context, conversationID, userID string) error
	GetLastMessage(ctx context.Context, conversationID string) (*models.Message, error)
	Delete(ctx context.Context, messageID string) error
}