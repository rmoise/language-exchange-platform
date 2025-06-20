package services

import (
	"context"
	"language-exchange/internal/models"
)

type AuthService interface {
	Register(ctx context.Context, input models.RegisterInput) (*models.User, string, error)
	Login(ctx context.Context, email, password string) (*models.User, string, error)
	ValidateToken(token string) (*models.User, error)
	GetGoogleAuthURL(state string) string
	GoogleAuth(ctx context.Context, code string) (*models.User, string, error)
}

type UserService interface {
	GetProfile(ctx context.Context, userID string) (*models.User, error)
	UpdateLanguages(ctx context.Context, userID string, languages models.UpdateLanguagesInput) error
	UpdateProfile(ctx context.Context, userID string, input models.UpdateProfileInput) error
	UpdatePreferences(ctx context.Context, userID string, input models.UpdatePreferencesInput) error
	UpdateOnboardingStep(ctx context.Context, userID string, step int) error
	SearchPartners(ctx context.Context, userID string, filters models.SearchFilters) ([]*models.User, error)
}

type MatchService interface {
	SendRequest(ctx context.Context, senderID, recipientID string) error
	HandleRequest(ctx context.Context, requestID, userID string, accept bool) error
	GetIncomingRequests(ctx context.Context, userID string) ([]*models.MatchRequest, error)
	GetOutgoingRequests(ctx context.Context, userID string) ([]*models.MatchRequest, error)
	GetMatches(ctx context.Context, userID string) ([]*models.Match, error)
}

type ConversationService interface {
	GetOrCreateConversation(ctx context.Context, user1ID, user2ID string) (*models.Conversation, error)
	GetConversationsByUser(ctx context.Context, userID string, limit, offset int) ([]*models.Conversation, error)
	GetConversationByID(ctx context.Context, conversationID, userID string) (*models.Conversation, error)
	StartConversationFromMatch(ctx context.Context, matchID, userID string) (*models.Conversation, error)
}

type MessageService interface {
	SendMessage(ctx context.Context, conversationID, senderID string, request models.SendMessageRequest) (*models.Message, error)
	GetMessages(ctx context.Context, conversationID, userID string, limit, offset int) ([]*models.Message, error)
	MarkAsRead(ctx context.Context, conversationID, userID string) error
	UpdateMessageStatus(ctx context.Context, messageID, userID string, status models.MessageStatus) error
	DeleteMessage(ctx context.Context, messageID, userID string) error
}