package services

import (
	"context"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"time"
)

type gamificationService struct {
	gamificationRepo repository.GamificationRepository
	userRepo         repository.UserRepository
}

func NewGamificationService(
	gamificationRepo repository.GamificationRepository,
	userRepo repository.UserRepository,
) GamificationService {
	return &gamificationService{
		gamificationRepo: gamificationRepo,
		userRepo:         userRepo,
	}
}

// XP Management

func (s *gamificationService) AwardXP(ctx context.Context, userID string, amount int, actionType string, actionID *string, description string) error {
	// Create XP transaction
	transaction := &models.XPTransaction{
		UserID:      userID,
		Amount:      amount,
		ActionType:  actionType,
		ActionID:    actionID,
		Description: description,
	}
	
	if err := s.gamificationRepo.CreateXPTransaction(ctx, transaction); err != nil {
		return err
	}
	
	// Update user's XP
	if err := s.gamificationRepo.UpdateUserXP(ctx, userID, amount); err != nil {
		return err
	}
	
	// Check for new badges based on total XP
	if err := s.CheckAndAwardBadges(ctx, userID); err != nil {
		// Log error but don't fail the XP award
		fmt.Printf("Error checking badges: %v\n", err)
	}
	
	return nil
}

func (s *gamificationService) GetUserGamificationData(ctx context.Context, userID string) (*models.UserGamificationData, error) {
	// Get base gamification data
	data, err := s.gamificationRepo.GetUserGamificationData(ctx, userID)
	if err != nil {
		return nil, err
	}
	
	// Add community stats
	totalMembers, err := s.userRepo.GetTotalCount(ctx)
	if err != nil {
		// Log error but don't fail the whole request
		fmt.Printf("Error getting total user count: %v\n", err)
		totalMembers = 0
	}
	
	data.CommunityStats = &models.CommunityStats{
		TotalMembers: totalMembers,
	}
	
	return data, nil
}

// Stats Management

func (s *gamificationService) IncrementStat(ctx context.Context, userID string, statField string, increment int) error {
	return s.gamificationRepo.IncrementUserStat(ctx, userID, statField, increment)
}

func (s *gamificationService) UpdateSessionStats(ctx context.Context, userID string, minutes int, wordsLearned int) error {
	// Update minutes practiced
	if err := s.gamificationRepo.IncrementUserStat(ctx, userID, "minutes_practiced", minutes); err != nil {
		return err
	}
	
	// Update words learned
	if wordsLearned > 0 {
		if err := s.gamificationRepo.IncrementUserStat(ctx, userID, "words_learned", wordsLearned); err != nil {
			return err
		}
	}
	
	// Update sessions completed
	if err := s.gamificationRepo.IncrementUserStat(ctx, userID, "sessions_completed", 1); err != nil {
		return err
	}
	
	return nil
}

// Streak Management

func (s *gamificationService) UpdateUserStreak(ctx context.Context, userID string) error {
	return s.gamificationRepo.UpdateUserStreak(ctx, userID)
}

// Badge Management

func (s *gamificationService) CheckAndAwardBadges(ctx context.Context, userID string) error {
	// Get user's current stats and data
	userData, err := s.gamificationRepo.GetUserGamificationData(ctx, userID)
	if err != nil {
		return err
	}
	
	// Get all badges
	allBadges, err := s.gamificationRepo.GetAllBadges(ctx)
	if err != nil {
		return err
	}
	
	// Get user's earned badges
	userBadges, err := s.gamificationRepo.GetUserBadges(ctx, userID)
	if err != nil {
		return err
	}
	
	// Create a map of earned badge codes for quick lookup
	earnedBadgeCodes := make(map[string]bool)
	for _, ub := range userBadges {
		if ub.Badge != nil {
			earnedBadgeCodes[ub.Badge.Code] = true
		}
	}
	
	// Check each badge
	for _, badge := range allBadges {
		// Skip if already earned
		if earnedBadgeCodes[badge.Code] {
			continue
		}
		
		// Check if requirements are met
		shouldAward := false
		
		switch badge.RequirementType {
		case "streak":
			if userData.CurrentStreak >= badge.RequirementValue {
				shouldAward = true
			}
		case "sessions":
			if userData.Stats.SessionsCompleted >= badge.RequirementValue {
				shouldAward = true
			}
		case "connections":
			if userData.Stats.TotalConnections >= badge.RequirementValue {
				shouldAward = true
			}
		case "words":
			if userData.Stats.WordsLearned >= badge.RequirementValue {
				shouldAward = true
			}
		case "helpful_replies":
			if userData.Stats.HelpfulReplies >= badge.RequirementValue {
				shouldAward = true
			}
		case "level":
			if userData.Level >= badge.RequirementValue {
				shouldAward = true
			}
		}
		
		if shouldAward {
			// Award the badge
			if err := s.gamificationRepo.AwardBadge(ctx, userID, badge.ID); err != nil {
				return err
			}
			
			// Award bonus XP for earning the badge
			if badge.XPReward > 0 {
				desc := fmt.Sprintf("Earned badge: %s", badge.Name)
				if err := s.AwardXP(ctx, userID, badge.XPReward, models.XPActionBadgeEarned, &badge.ID, desc); err != nil {
					return err
				}
			}
		}
	}
	
	return nil
}

func (s *gamificationService) GetAllBadges(ctx context.Context) ([]*models.Badge, error) {
	return s.gamificationRepo.GetAllBadges(ctx)
}

func (s *gamificationService) GetUserBadges(ctx context.Context, userID string) ([]*models.UserBadge, error) {
	return s.gamificationRepo.GetUserBadges(ctx, userID)
}

// Daily Challenges

func (s *gamificationService) GetUserDailyChallenges(ctx context.Context, userID string) ([]*models.UserDailyChallenge, error) {
	return s.gamificationRepo.GetUserDailyChallenges(ctx, userID, time.Now())
}

func (s *gamificationService) UpdateChallengeProgress(ctx context.Context, userID string, actionType string, increment int) error {
	// Get today's challenges
	challenges, err := s.gamificationRepo.GetUserDailyChallenges(ctx, userID, time.Now())
	if err != nil {
		return err
	}
	
	// Update progress for matching challenges
	for _, challenge := range challenges {
		if challenge.Challenge != nil && challenge.Challenge.ActionType == actionType && !challenge.Completed {
			newProgress := challenge.Progress + increment
			
			// Update progress
			if err := s.gamificationRepo.UpdateChallengeProgress(ctx, userID, challenge.ChallengeID, newProgress, time.Now()); err != nil {
				return err
			}
			
			// Check if completed
			if newProgress >= challenge.Challenge.TargetValue {
				// Mark as completed
				if err := s.gamificationRepo.CompleteDailyChallenge(ctx, userID, challenge.ChallengeID, time.Now()); err != nil {
					return err
				}
				
				// Award XP
				desc := fmt.Sprintf("Completed daily challenge: %s", challenge.Challenge.Title)
				if err := s.AwardXP(ctx, userID, challenge.Challenge.XPReward, models.XPActionChallengeComplete, &challenge.ChallengeID, desc); err != nil {
					return err
				}
			}
		}
	}
	
	return nil
}

// Leaderboard

func (s *gamificationService) GetLeaderboard(ctx context.Context, leaderboardType models.LeaderboardType, limit, offset int) ([]*models.LeaderboardEntry, error) {
	return s.gamificationRepo.GetLeaderboard(ctx, leaderboardType, limit, offset)
}

func (s *gamificationService) GetUserLeaderboardPosition(ctx context.Context, userID string, leaderboardType models.LeaderboardType) (int, error) {
	return s.gamificationRepo.GetUserLeaderboardPosition(ctx, userID, leaderboardType)
}

// Action Triggers

func (s *gamificationService) OnSessionComplete(ctx context.Context, userID string, sessionMinutes int) error {
	// Award XP for completing a session
	xpAmount := models.XPRewardSessionComplete
	if err := s.AwardXP(ctx, userID, xpAmount, models.XPActionSessionComplete, nil, "Completed a language session"); err != nil {
		return err
	}
	
	// Update session stats
	if err := s.UpdateSessionStats(ctx, userID, sessionMinutes, 0); err != nil {
		return err
	}
	
	// Update daily challenges
	if err := s.UpdateChallengeProgress(ctx, userID, "session_minutes", sessionMinutes); err != nil {
		return err
	}
	
	// Update streak
	if err := s.UpdateUserStreak(ctx, userID); err != nil {
		return err
	}
	
	return nil
}

func (s *gamificationService) OnMatchRequestSent(ctx context.Context, userID string, requestID string) error {
	// Award XP
	if err := s.AwardXP(ctx, userID, models.XPRewardMatchRequest, models.XPActionMatchRequest, &requestID, "Sent a match request"); err != nil {
		return err
	}
	
	// Update challenge progress
	if err := s.UpdateChallengeProgress(ctx, userID, "match_requests_sent", 1); err != nil {
		return err
	}
	
	return nil
}

func (s *gamificationService) OnMatchRequestAccepted(ctx context.Context, userID string, matchID string) error {
	// Award XP
	if err := s.AwardXP(ctx, userID, models.XPRewardMatchAccepted, models.XPActionMatchAccepted, &matchID, "Match request accepted"); err != nil {
		return err
	}
	
	// Increment connections stat
	if err := s.IncrementStat(ctx, userID, "total_connections", 1); err != nil {
		return err
	}
	
	// Check for connection-related badges
	if err := s.CheckAndAwardBadges(ctx, userID); err != nil {
		return err
	}
	
	return nil
}

func (s *gamificationService) OnPostCreated(ctx context.Context, userID string, postID string) error {
	// Award XP
	if err := s.AwardXP(ctx, userID, models.XPRewardPostCreated, models.XPActionPostCreated, &postID, "Created a post"); err != nil {
		return err
	}
	
	// Increment posts created stat
	if err := s.IncrementStat(ctx, userID, "posts_created", 1); err != nil {
		return err
	}
	
	return nil
}

func (s *gamificationService) OnHelpfulReply(ctx context.Context, userID string, replyID string) error {
	// Award XP
	if err := s.AwardXP(ctx, userID, models.XPRewardHelpfulReply, models.XPActionHelpfulReply, &replyID, "Posted a helpful reply"); err != nil {
		return err
	}
	
	// Increment helpful replies stat
	if err := s.IncrementStat(ctx, userID, "helpful_replies", 1); err != nil {
		return err
	}
	
	// Update challenge progress
	if err := s.UpdateChallengeProgress(ctx, userID, "helpful_replies", 1); err != nil {
		return err
	}
	
	// Check for helper badges
	if err := s.CheckAndAwardBadges(ctx, userID); err != nil {
		return err
	}
	
	return nil
}

func (s *gamificationService) OnProfileComplete(ctx context.Context, userID string) error {
	// Check if profile is complete
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	
	if user.IsProfileComplete() {
		// Award one-time XP for completing profile
		// Check if this XP was already awarded by looking for existing transaction
		transactions, err := s.gamificationRepo.GetUserXPTransactions(ctx, userID, 100, 0)
		if err != nil {
			return err
		}
		
		// Check if profile complete XP was already awarded
		alreadyAwarded := false
		for _, tx := range transactions {
			if tx.ActionType == models.XPActionProfileComplete {
				alreadyAwarded = true
				break
			}
		}
		
		if !alreadyAwarded {
			if err := s.AwardXP(ctx, userID, models.XPRewardProfileComplete, models.XPActionProfileComplete, nil, "Completed profile"); err != nil {
				return err
			}
		}
	}
	
	return nil
}