package repository

import (
	"context"
	"time"

	"language-exchange/internal/models"
)

// RequestLogRepository handles request log persistence
type RequestLogRepository interface {
	Create(ctx context.Context, log *models.RequestLog) error
	GetUserLogs(ctx context.Context, userID string, duration time.Duration) ([]*models.RequestLog, error)
	GetRecipientLogs(ctx context.Context, recipientID string, duration time.Duration) ([]*models.RequestLog, error)
	CountUserActions(ctx context.Context, userID string, action string, duration time.Duration) (int, error)
}

// UserBlockRepository handles user blocks
type UserBlockRepository interface {
	Create(ctx context.Context, block *models.UserBlock) error
	GetActiveBlock(ctx context.Context, userID string) (*models.UserBlock, error)
	Update(ctx context.Context, block *models.UserBlock) error
	Delete(ctx context.Context, blockID string) error
	ListActiveBlocks(ctx context.Context) ([]*models.UserBlock, error)
}

// NotificationThrottleRepository handles notification throttling
type NotificationThrottleRepository interface {
	Create(ctx context.Context, throttle *models.NotificationThrottle) error
	Get(ctx context.Context, userID, notificationType string) (*models.NotificationThrottle, error)
	Update(ctx context.Context, throttle *models.NotificationThrottle) error
	CleanupOldWindows(ctx context.Context, windowAge time.Duration) error
}

// AbuseReportRepository handles abuse reports
type AbuseReportRepository interface {
	Create(ctx context.Context, report *models.AbuseReport) error
	GetByID(ctx context.Context, reportID string) (*models.AbuseReport, error)
	GetUserReports(ctx context.Context, userID string) ([]*models.AbuseReport, error)
	GetPendingReports(ctx context.Context) ([]*models.AbuseReport, error)
	UpdateStatus(ctx context.Context, reportID, status string, reviewerID *string) error
}