package repository

import (
	"context"
	"language-exchange/internal/models"
	"time"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Search(ctx context.Context, filters models.SearchFilters) ([]*models.User, error)
	GetTotalCount(ctx context.Context) (int, error)
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

type PostRepository interface {
	Create(ctx context.Context, post *models.Post) error
	GetByID(ctx context.Context, id string) (*models.Post, error)
	GetByIDWithDetails(ctx context.Context, id, currentUserID string) (*models.Post, error)
	Update(ctx context.Context, post *models.Post) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, filters models.PostFilters) ([]*models.Post, error)
	GetUserPosts(ctx context.Context, userID string, limit, offset int) ([]*models.Post, error)
}

type CommentRepository interface {
	Create(ctx context.Context, comment *models.Comment) error
	GetByID(ctx context.Context, id string) (*models.Comment, error)
	GetByPostID(ctx context.Context, postID string) ([]*models.Comment, error)
	Update(ctx context.Context, comment *models.Comment) error
	Delete(ctx context.Context, id string) error
}

type ReactionRepository interface {
	Create(ctx context.Context, reaction *models.Reaction) error
	Delete(ctx context.Context, id string) error
	DeleteByUserAndTarget(ctx context.Context, userID string, postID, commentID *string, emoji string) error
	GetByPost(ctx context.Context, postID string) ([]*models.Reaction, error)
	GetByComment(ctx context.Context, commentID string) ([]*models.Reaction, error)
	GetByUserAndPost(ctx context.Context, userID, postID string) ([]*models.Reaction, error)
	GetByUserAndComment(ctx context.Context, userID, commentID string) ([]*models.Reaction, error)
}

type BookmarkRepository interface {
	ToggleBookmark(ctx context.Context, userID, postID string) (bool, error)
	IsBookmarked(ctx context.Context, userID, postID string) (bool, error)
	GetUserBookmarks(ctx context.Context, userID string, limit, offset int) ([]models.Post, error)
	GetUserBookmarkCount(ctx context.Context, userID string) (int, error)
	GetPostBookmarkStatus(ctx context.Context, userID string, postIDs []string) (map[string]bool, error)
}

type ConnectionRepository interface {
	Follow(ctx context.Context, followerID, followingID string) error
	Unfollow(ctx context.Context, followerID, followingID string) error
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
	GetFollowing(ctx context.Context, userID string, limit, offset int) ([]*models.UserConnection, error)
	GetFollowers(ctx context.Context, userID string, limit, offset int) ([]*models.UserConnection, error)
	GetConnectionStatus(ctx context.Context, userID, targetUserID string) (*models.ConnectionStatus, error)
	GetConnectionCounts(ctx context.Context, userID string) (following int, followers int, err error)
}

type ProfileVisitRepository interface {
	CreateVisit(ctx context.Context, visit *models.ProfileVisit) error
	GetVisitsByUser(ctx context.Context, filters models.ProfileVisitsFilters) (*models.ProfileVisitsResponse, error)
	GetRecentVisitCount(ctx context.Context, userID string, timeWindow string) (int, error)
	HasVisitedRecently(ctx context.Context, visitorID, viewedID string) (bool, error)
}

type GamificationRepository interface {
	// User Stats
	GetUserStats(ctx context.Context, userID string) (*models.UserStats, error)
	CreateUserStats(ctx context.Context, userID string) error
	UpdateUserStats(ctx context.Context, stats *models.UserStats) error
	IncrementUserStat(ctx context.Context, userID, statField string, increment int) error
	
	// XP and Streaks
	UpdateUserXP(ctx context.Context, userID string, xpChange int) error
	UpdateUserStreak(ctx context.Context, userID string) error
	GetUserRank(ctx context.Context, userID string) (int, error)
	
	// Badges
	GetAllBadges(ctx context.Context) ([]*models.Badge, error)
	GetUserBadges(ctx context.Context, userID string) ([]*models.UserBadge, error)
	AwardBadge(ctx context.Context, userID, badgeID string) error
	UpdateBadgeProgress(ctx context.Context, userID, badgeID string, progress int) error
	
	// XP Transactions
	CreateXPTransaction(ctx context.Context, transaction *models.XPTransaction) error
	GetUserXPTransactions(ctx context.Context, userID string, limit, offset int) ([]*models.XPTransaction, error)
	
	// Daily Challenges
	GetActiveDailyChallenges(ctx context.Context) ([]*models.DailyChallenge, error)
	GetUserDailyChallenges(ctx context.Context, userID string, date time.Time) ([]*models.UserDailyChallenge, error)
	CreateUserDailyChallenge(ctx context.Context, challenge *models.UserDailyChallenge) error
	UpdateChallengeProgress(ctx context.Context, userID, challengeID string, progress int, date time.Time) error
	CompleteDailyChallenge(ctx context.Context, userID, challengeID string, date time.Time) error
	
	// Leaderboard
	GetLeaderboard(ctx context.Context, leaderboardType models.LeaderboardType, limit, offset int) ([]*models.LeaderboardEntry, error)
	GetUserLeaderboardPosition(ctx context.Context, userID string, leaderboardType models.LeaderboardType) (int, error)
	
	// Complete Gamification Data
	GetUserGamificationData(ctx context.Context, userID string) (*models.UserGamificationData, error)
}