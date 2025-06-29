package models

import (
	"time"
)

// UserStats represents detailed user statistics for gamification
type UserStats struct {
	UserID             string    `json:"userId" db:"user_id"`
	TotalConnections   int       `json:"totalConnections" db:"total_connections"`
	SessionsCompleted  int       `json:"sessionsCompleted" db:"sessions_completed"`
	WordsLearned       int       `json:"wordsLearned" db:"words_learned"`
	MinutesPracticed   int       `json:"minutesPracticed" db:"minutes_practiced"`
	MessagesExchanged  int       `json:"messagesExchanged" db:"messages_exchanged"`
	HelpfulReplies     int       `json:"helpfulReplies" db:"helpful_replies"`
	PostsCreated       int       `json:"postsCreated" db:"posts_created"`
	WeeklyXP           int       `json:"weeklyXP" db:"weekly_xp"`
	MonthlyXP          int       `json:"monthlyXP" db:"monthly_xp"`
	WeeklyXPUpdatedAt  time.Time `json:"weeklyXPUpdatedAt" db:"weekly_xp_updated_at"`
	MonthlyXPUpdatedAt time.Time `json:"monthlyXPUpdatedAt" db:"monthly_xp_updated_at"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time `json:"updatedAt" db:"updated_at"`
}

// Badge represents a badge definition
type Badge struct {
	ID               string    `json:"id" db:"id"`
	Code             string    `json:"code" db:"code"`
	Name             string    `json:"name" db:"name"`
	Description      string    `json:"description" db:"description"`
	Icon             string    `json:"icon" db:"icon"`
	Rarity           string    `json:"rarity" db:"rarity"`
	Category         string    `json:"category" db:"category"`
	RequirementType  string    `json:"requirementType" db:"requirement_type"`
	RequirementValue int       `json:"requirementValue" db:"requirement_value"`
	XPReward         int       `json:"xpReward" db:"xp_reward"`
	CreatedAt        time.Time `json:"createdAt" db:"created_at"`
}

// UserBadge represents a badge earned by a user
type UserBadge struct {
	ID       string    `json:"id" db:"id"`
	UserID   string    `json:"userId" db:"user_id"`
	BadgeID  string    `json:"badgeId" db:"badge_id"`
	Badge    *Badge    `json:"badge,omitempty"`
	EarnedAt time.Time `json:"earnedAt" db:"earned_at"`
	Progress int       `json:"progress" db:"progress"`
}

// XPTransaction represents an XP gain/loss event
type XPTransaction struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	Amount      int       `json:"amount" db:"amount"`
	ActionType  string    `json:"actionType" db:"action_type"`
	ActionID    *string   `json:"actionId,omitempty" db:"action_id"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// DailyChallenge represents a daily challenge definition
type DailyChallenge struct {
	ID          string    `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Icon        string    `json:"icon" db:"icon"`
	XPReward    int       `json:"xpReward" db:"xp_reward"`
	TargetValue int       `json:"targetValue" db:"target_value"`
	Category    string    `json:"category" db:"category"`
	ActionType  string    `json:"actionType" db:"action_type"`
	IsActive    bool      `json:"isActive" db:"is_active"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// UserDailyChallenge represents a user's progress on a daily challenge
type UserDailyChallenge struct {
	ID           string          `json:"id" db:"id"`
	UserID       string          `json:"userId" db:"user_id"`
	ChallengeID  string          `json:"challengeId" db:"challenge_id"`
	Challenge    *DailyChallenge `json:"challenge,omitempty"`
	Progress     int             `json:"progress" db:"progress"`
	Completed    bool            `json:"completed" db:"completed"`
	CompletedAt  *time.Time      `json:"completedAt,omitempty" db:"completed_at"`
	Date         time.Time       `json:"date" db:"date"`
	CreatedAt    time.Time       `json:"createdAt" db:"created_at"`
}

// UserGamificationData represents all gamification data for a user
type UserGamificationData struct {
	User               *User                 `json:"user"`
	TotalXP            int                   `json:"totalXP"`
	CurrentStreak      int                   `json:"currentStreak"`
	LongestStreak      int                   `json:"longestStreak"`
	Level              int                   `json:"level"`
	XPToNextLevel      int                   `json:"xpToNextLevel"`
	Rank               int                   `json:"rank"`
	Stats              *UserStats            `json:"stats"`
	Badges             []*UserBadge          `json:"badges"`
	DailyChallenges    []*UserDailyChallenge `json:"dailyChallenges"`
	RecentTransactions []*XPTransaction      `json:"recentTransactions,omitempty"`
	CommunityStats     *CommunityStats       `json:"communityStats,omitempty"`
}

// CommunityStats represents overall community statistics
type CommunityStats struct {
	TotalMembers int `json:"totalMembers"`
}

// XP action types
const (
	XPActionSessionComplete    = "session_complete"
	XPActionMatchRequest       = "match_request"
	XPActionMatchAccepted      = "match_accepted"
	XPActionPostCreated        = "post_created"
	XPActionHelpfulReply       = "helpful_reply"
	XPActionDailyLogin         = "daily_login"
	XPActionProfileComplete    = "profile_complete"
	XPActionBadgeEarned        = "badge_earned"
	XPActionChallengeComplete  = "challenge_complete"
	XPActionStreakBonus        = "streak_bonus"
)

// XP reward amounts
const (
	XPRewardSessionComplete   = 50
	XPRewardMatchRequest      = 10
	XPRewardMatchAccepted     = 20
	XPRewardPostCreated       = 15
	XPRewardHelpfulReply      = 25
	XPRewardDailyLogin        = 5
	XPRewardProfileComplete   = 100
	XPRewardStreakBonus       = 10 // per day of streak
)

// UserLevel represents a level definition
type UserLevel struct {
	Level      int      `json:"level"`
	Title      string   `json:"title"`
	MinXP      int      `json:"minXP"`
	MaxXP      int      `json:"maxXP"`
	Perks      []string `json:"perks"`
	BadgeColor string   `json:"badgeColor"`
}

// Level definitions
var UserLevels = []UserLevel{
	{Level: 1, Title: "Beginner", MinXP: 0, MaxXP: 100, Perks: []string{"Basic chat features"}, BadgeColor: "#94a3b8"},
	{Level: 2, Title: "Explorer", MinXP: 100, MaxXP: 250, Perks: []string{"Profile customization"}, BadgeColor: "#64748b"},
	{Level: 3, Title: "Learner", MinXP: 250, MaxXP: 500, Perks: []string{"Priority matching"}, BadgeColor: "#475569"},
	{Level: 4, Title: "Practitioner", MinXP: 500, MaxXP: 1000, Perks: []string{"Group sessions"}, BadgeColor: "#10b981"},
	{Level: 5, Title: "Conversationalist", MinXP: 1000, MaxXP: 2000, Perks: []string{"Advanced tools"}, BadgeColor: "#059669"},
	{Level: 6, Title: "Fluent Speaker", MinXP: 2000, MaxXP: 3500, Perks: []string{"Mentor status"}, BadgeColor: "#3b82f6"},
	{Level: 7, Title: "Language Expert", MinXP: 3500, MaxXP: 5000, Perks: []string{"Expert badge"}, BadgeColor: "#2563eb"},
	{Level: 8, Title: "Polyglot", MinXP: 5000, MaxXP: 7500, Perks: []string{"VIP features"}, BadgeColor: "#7c3aed"},
	{Level: 9, Title: "Master", MinXP: 7500, MaxXP: 10000, Perks: []string{"Master badge"}, BadgeColor: "#6d28d9"},
	{Level: 10, Title: "Legend", MinXP: 10000, MaxXP: 999999, Perks: []string{"Legendary status"}, BadgeColor: "#f59e0b"},
}

// GetLevelFromXP returns the level based on total XP
func GetLevelFromXP(xp int) int {
	for _, level := range UserLevels {
		if xp >= level.MinXP && xp < level.MaxXP {
			return level.Level
		}
	}
	return 10 // Max level
}

// GetLevelInfo returns detailed level information based on XP
func GetLevelInfo(xp int) *UserLevel {
	for _, level := range UserLevels {
		if xp >= level.MinXP && xp < level.MaxXP {
			return &level
		}
	}
	return &UserLevels[len(UserLevels)-1] // Return max level
}

// CalculateXPToNextLevel calculates XP needed for next level
func CalculateXPToNextLevel(xp int) int {
	levelInfo := GetLevelInfo(xp)
	if levelInfo.Level == 10 {
		return 0 // Max level reached
	}
	return levelInfo.MaxXP - xp
}

// Extended User model fields for gamification
type UserGamificationFields struct {
	TotalXP          int        `json:"totalXP" db:"total_xp"`
	CurrentStreak    int        `json:"currentStreak" db:"current_streak"`
	LongestStreak    int        `json:"longestStreak" db:"longest_streak"`
	LastActivityDate *time.Time `json:"lastActivityDate,omitempty" db:"last_activity_date"`
}

// LeaderboardEntry represents a user's position on the leaderboard
type LeaderboardEntry struct {
	UserID         string         `json:"userId" db:"user_id"`
	Name           string         `json:"name" db:"name"`
	Username       *string        `json:"username,omitempty" db:"username"`
	ProfileImage   *string        `json:"profileImage,omitempty" db:"profile_image"`
	TotalXP        int            `json:"totalXP" db:"total_xp"`
	Level          int            `json:"level"`
	Rank           int            `json:"rank"`
	CurrentStreak  int            `json:"currentStreak" db:"current_streak"`
	Change         int            `json:"change"` // Position change from last period
	Stats          *LeaderboardStats `json:"stats,omitempty"`
}

// LeaderboardStats represents additional stats for leaderboard entries
type LeaderboardStats struct {
	Streak         int `json:"streak,omitempty"`
	Sessions       int `json:"sessions,omitempty"`
	WordsLearned   int `json:"wordsLearned,omitempty"`
}

// LeaderboardType represents different leaderboard periods
type LeaderboardType string

const (
	LeaderboardWeekly  LeaderboardType = "weekly"
	LeaderboardMonthly LeaderboardType = "monthly"
	LeaderboardAllTime LeaderboardType = "all_time"
)

// CreateXPTransactionInput represents input for creating an XP transaction
type CreateXPTransactionInput struct {
	UserID      string  `json:"userId" validate:"required"`
	Amount      int     `json:"amount" validate:"required"`
	ActionType  string  `json:"actionType" validate:"required"`
	ActionID    *string `json:"actionId,omitempty"`
	Description string  `json:"description"`
}

// UpdateDailyChallengeProgressInput represents input for updating challenge progress
type UpdateDailyChallengeProgressInput struct {
	UserID      string `json:"userId" validate:"required"`
	ActionType  string `json:"actionType" validate:"required"`
	Increment   int    `json:"increment" validate:"required,min=1"`
}