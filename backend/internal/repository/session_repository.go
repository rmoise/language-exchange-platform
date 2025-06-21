package repository

import (
	"context"
	"language-exchange/internal/models"
)

type SessionRepository interface {
	// Session management
	CreateSession(ctx context.Context, session *models.LanguageSession) error
	GetSessionByID(ctx context.Context, sessionID string) (*models.LanguageSession, error)
	GetSessionsByUser(ctx context.Context, userID string) ([]*models.LanguageSession, error)
	GetActiveSessions(ctx context.Context, limit int) ([]*models.LanguageSession, error)
	UpdateSessionStatus(ctx context.Context, sessionID string, status string) error
	EndSession(ctx context.Context, sessionID string) error
	
	// Participant management
	AddParticipant(ctx context.Context, participant *models.SessionParticipant) error
	RemoveParticipant(ctx context.Context, sessionID, userID string) error
	GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error)
	GetActiveParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error)
	IsUserInSession(ctx context.Context, sessionID, userID string) (bool, error)
	UpdateParticipantStatus(ctx context.Context, sessionID, userID string, isActive bool) error
	
	// Canvas operations
	SaveCanvasOperation(ctx context.Context, operation *models.CanvasOperation) error
	GetCanvasOperations(ctx context.Context, sessionID string, fromSequence int64) ([]*models.CanvasOperation, error)
	GetLatestCanvasOperations(ctx context.Context, sessionID string, limit int) ([]*models.CanvasOperation, error)
	ClearCanvasOperations(ctx context.Context, sessionID string) error
	
	// Session messages
	SaveMessage(ctx context.Context, message *models.SessionMessage) error
	GetMessages(ctx context.Context, sessionID string, limit int, offset int) ([]*models.SessionMessage, error)
	GetLatestMessages(ctx context.Context, sessionID string, limit int) ([]*models.SessionMessage, error)
}