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
	GetUserByID(ctx context.Context, userID string) (*models.User, error)
	UpdateLanguages(ctx context.Context, userID string, languages models.UpdateLanguagesInput) error
	UpdateProfile(ctx context.Context, userID string, input models.UpdateProfileInput) error
	UpdateProfileImage(ctx context.Context, userID string, imageURL string) error
	UpdateCoverPhoto(ctx context.Context, userID string, imageURL string) error
	AddPhoto(ctx context.Context, userID string, photoURL string) error
	UpdatePreferences(ctx context.Context, userID string, input models.UpdatePreferencesInput) error
	UpdateOnboardingStep(ctx context.Context, userID string, step int) error
	SearchPartners(ctx context.Context, userID string, filters models.SearchFilters) ([]*models.User, error)
}

type UserServiceInterface interface {
	GetUserByID(ctx context.Context, userID string) (*models.User, error)
	UpdateProfileImage(ctx context.Context, userID string, imageURL string) error
	UpdateCoverPhoto(ctx context.Context, userID string, imageURL string) error
	AddPhoto(ctx context.Context, userID string, photoURL string) error
}

type MatchService interface {
	SendRequest(ctx context.Context, senderID, recipientID string) (*models.MatchRequest, error)
	HandleRequest(ctx context.Context, requestID, userID string, accept bool) error
	CancelRequest(ctx context.Context, requestID, userID string) error
	GetRequest(ctx context.Context, requestID string) (*models.MatchRequest, error)
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

type SessionService interface {
	// Session management
	CreateSession(ctx context.Context, userID string, input models.CreateSessionRequest) (*models.LanguageSession, error)
	GetSession(ctx context.Context, sessionID string) (*models.LanguageSession, error)
	GetUserSessions(ctx context.Context, userID string) ([]*models.LanguageSession, error)
	GetActiveSessions(ctx context.Context, limit int) ([]*models.LanguageSession, error)
	EndSession(ctx context.Context, sessionID, userID string) error
	
	// Participant management
	JoinSession(ctx context.Context, sessionID, userID string) (*models.SessionParticipant, error)
	LeaveSession(ctx context.Context, sessionID, userID string) error
	GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error)
	IsUserInSession(ctx context.Context, sessionID, userID string) (bool, error)
	
	// Canvas operations
	SaveCanvasOperation(ctx context.Context, operation *models.CanvasOperation) error
	GetCanvasOperations(ctx context.Context, sessionID string, limit, offset int) ([]*models.CanvasOperation, error)
	ClearCanvas(ctx context.Context, sessionID, userID string) error
	
	// Session messages
	SendMessage(ctx context.Context, sessionID, userID string, input models.SendMessageInput) (*models.SessionMessage, error)
	SaveMessage(ctx context.Context, message *models.SessionMessage) (*models.SessionMessage, error)
	GetSessionMessages(ctx context.Context, sessionID string, limit, offset int) ([]*models.SessionMessage, error)
}

type TranslationService interface {
	Translate(ctx context.Context, request models.TranslateRequest) (*models.TranslateResponse, error)
	GetSupportedLanguages(ctx context.Context) (*models.LanguagesResponse, error)
	IsLanguageSupported(languageCode string) bool
}

type ProfileVisitService interface {
	RecordVisit(ctx context.Context, visitorID, viewedID string) error
	GetProfileVisits(ctx context.Context, userID string, filters models.ProfileVisitsFilters) (*models.ProfileVisitsResponse, error)
	GetRecentVisitorCount(ctx context.Context, userID string, timeWindow string) (int, error)
}

type GamificationService interface {
	// XP Management
	AwardXP(ctx context.Context, userID string, amount int, actionType string, actionID *string, description string) error
	GetUserGamificationData(ctx context.Context, userID string) (*models.UserGamificationData, error)
	
	// Stats Management
	IncrementStat(ctx context.Context, userID string, statField string, increment int) error
	UpdateSessionStats(ctx context.Context, userID string, minutes int, wordsLearned int) error
	
	// Streak Management
	UpdateUserStreak(ctx context.Context, userID string) error
	
	// Badge Management
	CheckAndAwardBadges(ctx context.Context, userID string) error
	GetAllBadges(ctx context.Context) ([]*models.Badge, error)
	GetUserBadges(ctx context.Context, userID string) ([]*models.UserBadge, error)
	
	// Daily Challenges
	GetUserDailyChallenges(ctx context.Context, userID string) ([]*models.UserDailyChallenge, error)
	UpdateChallengeProgress(ctx context.Context, userID string, actionType string, increment int) error
	
	// Leaderboard
	GetLeaderboard(ctx context.Context, leaderboardType models.LeaderboardType, limit, offset int) ([]*models.LeaderboardEntry, error)
	GetUserLeaderboardPosition(ctx context.Context, userID string, leaderboardType models.LeaderboardType) (int, error)
	
	// Triggered by various actions
	OnSessionComplete(ctx context.Context, userID string, sessionMinutes int) error
	OnMatchRequestSent(ctx context.Context, userID string, requestID string) error
	OnMatchRequestAccepted(ctx context.Context, userID string, matchID string) error
	OnPostCreated(ctx context.Context, userID string, postID string) error
	OnHelpfulReply(ctx context.Context, userID string, replyID string) error
	OnProfileComplete(ctx context.Context, userID string) error
}