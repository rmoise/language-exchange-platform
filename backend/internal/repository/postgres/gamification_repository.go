package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"time"

	"github.com/jmoiron/sqlx"
)

type gamificationRepository struct {
	db *sqlx.DB
}

func NewGamificationRepository(db *sqlx.DB) repository.GamificationRepository {
	return &gamificationRepository{db: db}
}

// User Stats

func (r *gamificationRepository) GetUserStats(ctx context.Context, userID string) (*models.UserStats, error) {
	var stats models.UserStats
	query := `SELECT * FROM user_stats WHERE user_id = $1`
	err := r.db.GetContext(ctx, &stats, query, userID)
	if err == sql.ErrNoRows {
		// Create stats if they don't exist
		if err := r.CreateUserStats(ctx, userID); err != nil {
			return nil, err
		}
		// Try again
		err = r.db.GetContext(ctx, &stats, query, userID)
	}
	return &stats, err
}

func (r *gamificationRepository) CreateUserStats(ctx context.Context, userID string) error {
	query := `INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *gamificationRepository) UpdateUserStats(ctx context.Context, stats *models.UserStats) error {
	query := `
		UPDATE user_stats SET
			total_connections = $2,
			sessions_completed = $3,
			words_learned = $4,
			minutes_practiced = $5,
			messages_exchanged = $6,
			helpful_replies = $7,
			posts_created = $8,
			weekly_xp = $9,
			monthly_xp = $10,
			updated_at = NOW()
		WHERE user_id = $1`
	
	_, err := r.db.ExecContext(ctx, query,
		stats.UserID,
		stats.TotalConnections,
		stats.SessionsCompleted,
		stats.WordsLearned,
		stats.MinutesPracticed,
		stats.MessagesExchanged,
		stats.HelpfulReplies,
		stats.PostsCreated,
		stats.WeeklyXP,
		stats.MonthlyXP,
	)
	return err
}

func (r *gamificationRepository) IncrementUserStat(ctx context.Context, userID, statField string, increment int) error {
	// Validate stat field to prevent SQL injection
	validFields := map[string]bool{
		"total_connections":   true,
		"sessions_completed":  true,
		"words_learned":       true,
		"minutes_practiced":   true,
		"messages_exchanged":  true,
		"helpful_replies":     true,
		"posts_created":       true,
	}
	
	if !validFields[statField] {
		return fmt.Errorf("invalid stat field: %s", statField)
	}
	
	query := fmt.Sprintf(`
		UPDATE user_stats 
		SET %s = %s + $2, updated_at = NOW()
		WHERE user_id = $1`, statField, statField)
	
	_, err := r.db.ExecContext(ctx, query, userID, increment)
	return err
}

// XP and Streaks

func (r *gamificationRepository) UpdateUserXP(ctx context.Context, userID string, xpChange int) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Update user's total XP
	query := `UPDATE users SET total_xp = total_xp + $2 WHERE id = $1`
	_, err = tx.ExecContext(ctx, query, userID, xpChange)
	if err != nil {
		return err
	}
	
	// Update weekly and monthly XP
	statsQuery := `
		UPDATE user_stats 
		SET weekly_xp = weekly_xp + $2, 
		    monthly_xp = monthly_xp + $2,
		    updated_at = NOW()
		WHERE user_id = $1`
	_, err = tx.ExecContext(ctx, statsQuery, userID, xpChange)
	if err != nil {
		return err
	}
	
	return tx.Commit()
}

func (r *gamificationRepository) UpdateUserStreak(ctx context.Context, userID string) error {
	query := `
		UPDATE users 
		SET current_streak = CASE 
			WHEN last_activity_date = CURRENT_DATE THEN current_streak
			WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
			ELSE 1
		END,
		longest_streak = GREATEST(longest_streak, CASE 
			WHEN last_activity_date = CURRENT_DATE THEN current_streak
			WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
			ELSE 1
		END),
		last_activity_date = CURRENT_DATE
		WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *gamificationRepository) GetUserRank(ctx context.Context, userID string) (int, error) {
	var rank int
	query := `
		SELECT COUNT(*) + 1 as rank
		FROM users
		WHERE total_xp > (SELECT total_xp FROM users WHERE id = $1)`
	
	err := r.db.GetContext(ctx, &rank, query, userID)
	return rank, err
}

// Badges

func (r *gamificationRepository) GetAllBadges(ctx context.Context) ([]*models.Badge, error) {
	var badges []*models.Badge
	query := `SELECT * FROM badges ORDER BY rarity, name`
	err := r.db.SelectContext(ctx, &badges, query)
	return badges, err
}

func (r *gamificationRepository) GetUserBadges(ctx context.Context, userID string) ([]*models.UserBadge, error) {
	var userBadges []*models.UserBadge
	query := `
		SELECT 
			ub.*,
			b.id as "badge.id",
			b.code as "badge.code",
			b.name as "badge.name",
			b.description as "badge.description",
			b.icon as "badge.icon",
			b.rarity as "badge.rarity",
			b.category as "badge.category",
			b.requirement_type as "badge.requirement_type",
			b.requirement_value as "badge.requirement_value",
			b.xp_reward as "badge.xp_reward"
		FROM user_badges ub
		JOIN badges b ON ub.badge_id = b.id
		WHERE ub.user_id = $1
		ORDER BY ub.earned_at DESC`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	for rows.Next() {
		var ub models.UserBadge
		var badge models.Badge
		
		err := rows.Scan(
			&ub.ID, &ub.UserID, &ub.BadgeID, &ub.EarnedAt, &ub.Progress,
			&badge.ID, &badge.Code, &badge.Name, &badge.Description,
			&badge.Icon, &badge.Rarity, &badge.Category,
			&badge.RequirementType, &badge.RequirementValue, &badge.XPReward,
		)
		if err != nil {
			return nil, err
		}
		
		ub.Badge = &badge
		userBadges = append(userBadges, &ub)
	}
	
	return userBadges, nil
}

func (r *gamificationRepository) AwardBadge(ctx context.Context, userID, badgeID string) error {
	query := `
		INSERT INTO user_badges (user_id, badge_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, badge_id) DO NOTHING`
	
	_, err := r.db.ExecContext(ctx, query, userID, badgeID)
	return err
}

func (r *gamificationRepository) UpdateBadgeProgress(ctx context.Context, userID, badgeID string, progress int) error {
	query := `
		INSERT INTO user_badges (user_id, badge_id, progress)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, badge_id) 
		DO UPDATE SET progress = $3
		WHERE user_badges.earned_at IS NULL`
	
	_, err := r.db.ExecContext(ctx, query, userID, badgeID, progress)
	return err
}

// XP Transactions

func (r *gamificationRepository) CreateXPTransaction(ctx context.Context, transaction *models.XPTransaction) error {
	query := `
		INSERT INTO xp_transactions (user_id, amount, action_type, action_id, description)
		VALUES ($1, $2, $3, $4, $5)`
	
	_, err := r.db.ExecContext(ctx, query,
		transaction.UserID,
		transaction.Amount,
		transaction.ActionType,
		transaction.ActionID,
		transaction.Description,
	)
	return err
}

func (r *gamificationRepository) GetUserXPTransactions(ctx context.Context, userID string, limit, offset int) ([]*models.XPTransaction, error) {
	var transactions []*models.XPTransaction
	query := `
		SELECT * FROM xp_transactions
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`
	
	err := r.db.SelectContext(ctx, &transactions, query, userID, limit, offset)
	return transactions, err
}

// Daily Challenges

func (r *gamificationRepository) GetActiveDailyChallenges(ctx context.Context) ([]*models.DailyChallenge, error) {
	var challenges []*models.DailyChallenge
	query := `SELECT * FROM daily_challenges WHERE is_active = true ORDER BY category, title`
	err := r.db.SelectContext(ctx, &challenges, query)
	return challenges, err
}

func (r *gamificationRepository) GetUserDailyChallenges(ctx context.Context, userID string, date time.Time) ([]*models.UserDailyChallenge, error) {
	var userChallenges []*models.UserDailyChallenge
	query := `
		SELECT 
			udc.*,
			dc.id as "challenge.id",
			dc.title as "challenge.title",
			dc.description as "challenge.description",
			dc.icon as "challenge.icon",
			dc.xp_reward as "challenge.xp_reward",
			dc.target_value as "challenge.target_value",
			dc.category as "challenge.category",
			dc.action_type as "challenge.action_type"
		FROM user_daily_challenges udc
		JOIN daily_challenges dc ON udc.challenge_id = dc.id
		WHERE udc.user_id = $1 AND udc.date = $2
		ORDER BY dc.category, dc.title`
	
	rows, err := r.db.QueryContext(ctx, query, userID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	for rows.Next() {
		var udc models.UserDailyChallenge
		var challenge models.DailyChallenge
		
		err := rows.Scan(
			&udc.ID, &udc.UserID, &udc.ChallengeID, &udc.Progress,
			&udc.Completed, &udc.CompletedAt, &udc.Date, &udc.CreatedAt,
			&challenge.ID, &challenge.Title, &challenge.Description,
			&challenge.Icon, &challenge.XPReward, &challenge.TargetValue,
			&challenge.Category, &challenge.ActionType,
		)
		if err != nil {
			return nil, err
		}
		
		udc.Challenge = &challenge
		userChallenges = append(userChallenges, &udc)
	}
	
	// If no challenges exist for today, create them
	if len(userChallenges) == 0 {
		// Get all active challenges
		activeChallenges, err := r.GetActiveDailyChallenges(ctx)
		if err != nil {
			return nil, err
		}
		
		// Create user challenge entries for today
		for _, challenge := range activeChallenges {
			udc := &models.UserDailyChallenge{
				UserID:      userID,
				ChallengeID: challenge.ID,
				Date:        date,
				Challenge:   challenge,
			}
			if err := r.CreateUserDailyChallenge(ctx, udc); err != nil {
				return nil, err
			}
			userChallenges = append(userChallenges, udc)
		}
	}
	
	return userChallenges, nil
}

func (r *gamificationRepository) CreateUserDailyChallenge(ctx context.Context, challenge *models.UserDailyChallenge) error {
	query := `
		INSERT INTO user_daily_challenges (user_id, challenge_id, date)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, challenge_id, date) DO NOTHING`
	
	_, err := r.db.ExecContext(ctx, query, challenge.UserID, challenge.ChallengeID, challenge.Date)
	return err
}

func (r *gamificationRepository) UpdateChallengeProgress(ctx context.Context, userID, challengeID string, progress int, date time.Time) error {
	query := `
		UPDATE user_daily_challenges
		SET progress = $4
		WHERE user_id = $1 AND challenge_id = $2 AND date = $3 AND completed = false`
	
	_, err := r.db.ExecContext(ctx, query, userID, challengeID, date, progress)
	return err
}

func (r *gamificationRepository) CompleteDailyChallenge(ctx context.Context, userID, challengeID string, date time.Time) error {
	query := `
		UPDATE user_daily_challenges
		SET completed = true, completed_at = NOW()
		WHERE user_id = $1 AND challenge_id = $2 AND date = $3`
	
	_, err := r.db.ExecContext(ctx, query, userID, challengeID, date)
	return err
}

// Leaderboard

func (r *gamificationRepository) GetLeaderboard(ctx context.Context, leaderboardType models.LeaderboardType, limit, offset int) ([]*models.LeaderboardEntry, error) {
	var entries []*models.LeaderboardEntry
	var query string
	
	switch leaderboardType {
	case models.LeaderboardWeekly:
		query = `
			SELECT 
				u.id as user_id,
				u.name,
				u.username,
				u.profile_image,
				us.weekly_xp as total_xp,
				u.current_streak,
				ROW_NUMBER() OVER (ORDER BY us.weekly_xp DESC) as rank
			FROM users u
			JOIN user_stats us ON u.id = us.user_id
			WHERE us.weekly_xp > 0
			ORDER BY us.weekly_xp DESC
			LIMIT $1 OFFSET $2`
	case models.LeaderboardMonthly:
		query = `
			SELECT 
				u.id as user_id,
				u.name,
				u.username,
				u.profile_image,
				us.monthly_xp as total_xp,
				u.current_streak,
				ROW_NUMBER() OVER (ORDER BY us.monthly_xp DESC) as rank
			FROM users u
			JOIN user_stats us ON u.id = us.user_id
			WHERE us.monthly_xp > 0
			ORDER BY us.monthly_xp DESC
			LIMIT $1 OFFSET $2`
	default: // AllTime
		query = `
			SELECT 
				u.id as user_id,
				u.name,
				u.username,
				u.profile_image,
				u.total_xp,
				u.current_streak,
				ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank
			FROM users u
			WHERE u.total_xp > 0
			ORDER BY u.total_xp DESC
			LIMIT $1 OFFSET $2`
	}
	
	err := r.db.SelectContext(ctx, &entries, query, limit, offset)
	if err != nil {
		return nil, err
	}
	
	// Calculate level for each entry
	for _, entry := range entries {
		entry.Level = models.GetLevelFromXP(entry.TotalXP)
	}
	
	return entries, nil
}

func (r *gamificationRepository) GetUserLeaderboardPosition(ctx context.Context, userID string, leaderboardType models.LeaderboardType) (int, error) {
	var position int
	var query string
	
	switch leaderboardType {
	case models.LeaderboardWeekly:
		query = `
			SELECT COUNT(*) + 1 as position
			FROM user_stats
			WHERE weekly_xp > (SELECT weekly_xp FROM user_stats WHERE user_id = $1)`
	case models.LeaderboardMonthly:
		query = `
			SELECT COUNT(*) + 1 as position
			FROM user_stats
			WHERE monthly_xp > (SELECT monthly_xp FROM user_stats WHERE user_id = $1)`
	default: // AllTime
		query = `
			SELECT COUNT(*) + 1 as position
			FROM users
			WHERE total_xp > (SELECT total_xp FROM users WHERE id = $1)`
	}
	
	err := r.db.GetContext(ctx, &position, query, userID)
	return position, err
}

// Complete Gamification Data

func (r *gamificationRepository) GetUserGamificationData(ctx context.Context, userID string) (*models.UserGamificationData, error) {
	// Get user with gamification fields
	var user models.User
	var gamFields models.UserGamificationFields
	
	userQuery := `SELECT id, email, password_hash, name, username, google_id, profile_image, 
		cover_photo, photos, birthday, city, country, timezone, latitude, longitude, bio, 
		interests, native_languages, target_languages, max_distance, enable_location_matching, 
		preferred_meeting_types, onboarding_step, created_at, updated_at
		FROM users WHERE id = $1`
	err := r.db.GetContext(ctx, &user, userQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	// Get gamification fields
	gamQuery := `SELECT total_xp, current_streak, longest_streak, last_activity_date FROM users WHERE id = $1`
	err = r.db.GetContext(ctx, &gamFields, gamQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get gamification fields: %w", err)
	}
	
	// Get stats (this will create them if they don't exist)
	stats, err := r.GetUserStats(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user stats: %w", err)
	}
	
	// Get badges
	badges, err := r.GetUserBadges(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user badges: %w", err)
	}
	
	// Get daily challenges
	challenges, err := r.GetUserDailyChallenges(ctx, userID, time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to get daily challenges: %w", err)
	}
	
	// Get rank
	rank, err := r.GetUserRank(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user rank: %w", err)
	}
	
	// Calculate level and XP to next level
	level := models.GetLevelFromXP(gamFields.TotalXP)
	xpToNextLevel := models.CalculateXPToNextLevel(gamFields.TotalXP)
	
	return &models.UserGamificationData{
		User:            &user,
		TotalXP:         gamFields.TotalXP,
		CurrentStreak:   gamFields.CurrentStreak,
		LongestStreak:   gamFields.LongestStreak,
		Level:           level,
		XPToNextLevel:   xpToNextLevel,
		Rank:            rank,
		Stats:           stats,
		Badges:          badges,
		DailyChallenges: challenges,
	}, nil
}