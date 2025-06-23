package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

// AbusePreventionService handles abuse detection and prevention
type AbusePreventionService interface {
	LogRequest(ctx context.Context, reqLog *models.RequestLog) error
	CheckUserBlocked(ctx context.Context, userID string) error
	BlockUser(ctx context.Context, userID, reason string, duration time.Duration) error
	ShouldThrottleNotification(ctx context.Context, userID, notificationType string) (bool, error)
	RecordNotificationSent(ctx context.Context, userID, notificationType string) error
	AnalyzeUserBehavior(ctx context.Context, userID string) (*BehaviorAnalysis, error)
	ReportAbuse(ctx context.Context, report *models.AbuseReport) error
}

// BehaviorAnalysis contains analysis results for a user's behavior
type BehaviorAnalysis struct {
	SuspiciousPatterns []string
	RiskScore         int // 0-100
	RecentActions     int
	UniqueRecipients  int
	CancelRate        float64
}

type abusePreventionService struct {
	db         *sql.DB
	logRepo    repository.RequestLogRepository
	blockRepo  repository.UserBlockRepository
	throttleRepo repository.NotificationThrottleRepository
}

// NewAbusePreventionService creates a new abuse prevention service
func NewAbusePreventionService(
	db *sql.DB,
	logRepo repository.RequestLogRepository,
	blockRepo repository.UserBlockRepository,
	throttleRepo repository.NotificationThrottleRepository,
) AbusePreventionService {
	return &abusePreventionService{
		db:           db,
		logRepo:      logRepo,
		blockRepo:    blockRepo,
		throttleRepo: throttleRepo,
	}
}

// LogRequest logs a connection request action
func (s *abusePreventionService) LogRequest(ctx context.Context, reqLog *models.RequestLog) error {
	// Set timestamp
	reqLog.CreatedAt = time.Now()
	
	// Save to database
	if err := s.logRepo.Create(ctx, reqLog); err != nil {
		return fmt.Errorf("failed to log request: %w", err)
	}
	
	// Analyze behavior in background
	go func() {
		analysis, err := s.AnalyzeUserBehavior(context.Background(), reqLog.UserID)
		if err != nil {
			log.Printf("Failed to analyze user behavior: %v", err)
			return
		}
		
		// Auto-block if risk score is too high
		if analysis.RiskScore >= 80 {
			duration := 24 * time.Hour
			if analysis.RiskScore >= 90 {
				duration = 7 * 24 * time.Hour // 1 week for severe cases
			}
			
			if err := s.BlockUser(context.Background(), reqLog.UserID, "Automated: Suspicious behavior detected", duration); err != nil {
				log.Printf("Failed to auto-block user: %v", err)
			}
		}
	}()
	
	return nil
}

// CheckUserBlocked checks if a user is currently blocked
func (s *abusePreventionService) CheckUserBlocked(ctx context.Context, userID string) error {
	block, err := s.blockRepo.GetActiveBlock(ctx, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil // Not blocked
		}
		return fmt.Errorf("failed to check user block: %w", err)
	}
	
	if block != nil && block.ExpiresAt.After(time.Now()) {
		return &models.AppError{
			Code:    "USER_BLOCKED",
			Message: fmt.Sprintf("Your account is temporarily blocked: %s", block.Reason),
			Status:  403,
		}
	}
	
	return nil
}

// BlockUser blocks a user for a specified duration
func (s *abusePreventionService) BlockUser(ctx context.Context, userID, reason string, duration time.Duration) error {
	block := &models.UserBlock{
		UserID:    userID,
		BlockedBy: "system",
		Reason:    reason,
		ExpiresAt: time.Now().Add(duration),
		CreatedAt: time.Now(),
	}
	
	return s.blockRepo.Create(ctx, block)
}

// ShouldThrottleNotification checks if a notification should be throttled
func (s *abusePreventionService) ShouldThrottleNotification(ctx context.Context, userID, notificationType string) (bool, error) {
	throttle, err := s.throttleRepo.Get(ctx, userID, notificationType)
	if err != nil && err != sql.ErrNoRows {
		return false, fmt.Errorf("failed to check throttle: %w", err)
	}
	
	// No throttle record exists
	if throttle == nil {
		return false, nil
	}
	
	// Check if window has expired (1 hour window)
	if time.Since(throttle.WindowStart) > time.Hour {
		// Reset window
		throttle.Count = 0
		throttle.WindowStart = time.Now()
		if err := s.throttleRepo.Update(ctx, throttle); err != nil {
			return false, err
		}
		return false, nil
	}
	
	// Check limits based on notification type
	var limit int
	switch notificationType {
	case "connection_request":
		limit = 10 // Max 10 connection request notifications per hour
	case "request_accepted":
		limit = 20 // Max 20 acceptance notifications per hour
	default:
		limit = 30 // Default limit
	}
	
	return throttle.Count >= limit, nil
}

// RecordNotificationSent records that a notification was sent
func (s *abusePreventionService) RecordNotificationSent(ctx context.Context, userID, notificationType string) error {
	throttle, err := s.throttleRepo.Get(ctx, userID, notificationType)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to get throttle: %w", err)
	}
	
	if throttle == nil {
		// Create new throttle record
		throttle = &models.NotificationThrottle{
			UserID:           userID,
			NotificationType: notificationType,
			Count:            1,
			WindowStart:      time.Now(),
			LastSent:         time.Now(),
		}
		return s.throttleRepo.Create(ctx, throttle)
	}
	
	// Update existing record
	throttle.Count++
	throttle.LastSent = time.Now()
	return s.throttleRepo.Update(ctx, throttle)
}

// AnalyzeUserBehavior analyzes a user's request patterns for suspicious behavior
func (s *abusePreventionService) AnalyzeUserBehavior(ctx context.Context, userID string) (*BehaviorAnalysis, error) {
	// Get user's recent logs (last 24 hours)
	logs, err := s.logRepo.GetUserLogs(ctx, userID, 24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to get user logs: %w", err)
	}
	
	analysis := &BehaviorAnalysis{
		SuspiciousPatterns: []string{},
		RiskScore:         0,
		RecentActions:     len(logs),
	}
	
	// Count unique recipients
	recipients := make(map[string]bool)
	cancelCount := 0
	sentCount := 0
	
	// Track rapid actions (actions within 1 minute of each other)
	rapidActions := 0
	var lastActionTime time.Time
	
	for i, log := range logs {
		recipients[log.RecipientID] = true
		
		if log.Action == "cancelled" {
			cancelCount++
		} else if log.Action == "sent" {
			sentCount++
		}
		
		// Check for rapid actions
		if i > 0 && log.CreatedAt.Sub(lastActionTime) < time.Minute {
			rapidActions++
		}
		lastActionTime = log.CreatedAt
	}
	
	analysis.UniqueRecipients = len(recipients)
	if sentCount > 0 {
		analysis.CancelRate = float64(cancelCount) / float64(sentCount)
	}
	
	// Detect suspicious patterns
	// Pattern 1: Too many actions in 24 hours
	if analysis.RecentActions > 100 {
		analysis.SuspiciousPatterns = append(analysis.SuspiciousPatterns, "excessive_activity")
		analysis.RiskScore += 30
	}
	
	// Pattern 2: High cancel rate
	if analysis.CancelRate > 0.5 && sentCount > 5 {
		analysis.SuspiciousPatterns = append(analysis.SuspiciousPatterns, "high_cancel_rate")
		analysis.RiskScore += 25
	}
	
	// Pattern 3: Rapid fire actions
	if rapidActions > 10 {
		analysis.SuspiciousPatterns = append(analysis.SuspiciousPatterns, "rapid_actions")
		analysis.RiskScore += 35
	}
	
	// Pattern 4: Targeting too many unique users
	if analysis.UniqueRecipients > 30 {
		analysis.SuspiciousPatterns = append(analysis.SuspiciousPatterns, "mass_targeting")
		analysis.RiskScore += 20
	}
	
	// Pattern 5: Check for connect-cancel-connect pattern with same user
	recipientActions := make(map[string][]string)
	for _, log := range logs {
		recipientActions[log.RecipientID] = append(recipientActions[log.RecipientID], log.Action)
	}
	
	for _, actions := range recipientActions {
		if len(actions) >= 3 {
			// Check for alternating pattern
			alternating := true
			for i := 1; i < len(actions); i++ {
				if actions[i] == actions[i-1] {
					alternating = false
					break
				}
			}
			if alternating {
				analysis.SuspiciousPatterns = append(analysis.SuspiciousPatterns, "harassment_pattern")
				analysis.RiskScore += 40
				break
			}
		}
	}
	
	// Cap risk score at 100
	if analysis.RiskScore > 100 {
		analysis.RiskScore = 100
	}
	
	return analysis, nil
}

// ReportAbuse handles abuse reports from users
func (s *abusePreventionService) ReportAbuse(ctx context.Context, report *models.AbuseReport) error {
	report.CreatedAt = time.Now()
	report.Status = "pending"
	
	// Save report
	if err := s.db.QueryRowContext(ctx, `
		INSERT INTO abuse_reports (reporter_id, reported_id, reason, description, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`,
		report.ReporterID, report.ReportedID, report.Reason, report.Description, report.Status, report.CreatedAt,
	).Scan(&report.ID); err != nil {
		return fmt.Errorf("failed to create abuse report: %w", err)
	}
	
	// Check if user has multiple reports
	var reportCount int
	if err := s.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM abuse_reports 
		WHERE reported_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
		report.ReportedID,
	).Scan(&reportCount); err != nil {
		return fmt.Errorf("failed to count reports: %w", err)
	}
	
	// Auto-block if too many reports
	if reportCount >= 5 {
		if err := s.BlockUser(ctx, report.ReportedID, "Multiple abuse reports", 7*24*time.Hour); err != nil {
			log.Printf("Failed to auto-block reported user: %v", err)
		}
	}
	
	return nil
}