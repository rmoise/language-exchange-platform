package services

import (
	"context"
	"fmt"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"

	"github.com/google/uuid"
)


type sessionService struct {
	sessionRepo repository.SessionRepository
	userRepo    repository.UserRepository
	matchRepo   repository.MatchRepository
}

func NewSessionService(sessionRepo repository.SessionRepository, userRepo repository.UserRepository, matchRepo repository.MatchRepository) SessionService {
	return &sessionService{
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
		matchRepo:   matchRepo,
	}
}

// Session management
func (s *sessionService) CreateSession(ctx context.Context, userID string, input models.CreateSessionRequest) (*models.LanguageSession, error) {
	// Verify user exists
	_, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify user: %w", err)
	}
	
	// Verify invited user exists
	_, err = s.userRepo.GetByID(ctx, input.InvitedUserID)
	if err != nil {
		return nil, models.NewAppError("INVITED_USER_NOT_FOUND", "Invited user not found", 404)
	}
	
	// Verify that creator and invited user are matched
	matches, err := s.matchRepo.GetMatchesByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to verify match relationship: %w", err)
	}
	
	isMatched := false
	for _, match := range matches {
		if (match.User1.ID == userID && match.User2.ID == input.InvitedUserID) ||
		   (match.User2.ID == userID && match.User1.ID == input.InvitedUserID) {
			isMatched = true
			break
		}
	}
	
	if !isMatched {
		return nil, models.NewAppError("NOT_MATCHED", "You can only invite users you are matched with", 403)
	}
	
	var description *string
	if input.Description != "" {
		description = &input.Description
	}
	
	var targetLanguage *string
	if input.TargetLanguage != "" {
		targetLanguage = &input.TargetLanguage
	}
	
	session := &models.LanguageSession{
		ID:              uuid.New().String(),
		Name:            input.Name,
		Description:     description,
		CreatedBy:       userID,
		InvitedUserID:   &input.InvitedUserID,
		Status:          models.SessionStatusActive,
		MaxParticipants: input.MaxParticipants,
		SessionType:     input.SessionType,
		TargetLanguage:  targetLanguage,
	}
	
	err = s.sessionRepo.CreateSession(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}
	
	return session, nil
}

func (s *sessionService) GetSession(ctx context.Context, sessionID string) (*models.LanguageSession, error) {
	session, err := s.sessionRepo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	// Get participants
	participants, err := s.sessionRepo.GetActiveParticipants(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get participants: %w", err)
	}
	
	if participants != nil {
		session.Participants = make([]models.SessionParticipant, len(participants))
		for i, p := range participants {
			session.Participants[i] = *p
		}
	}
	return session, nil
}

func (s *sessionService) GetUserSessions(ctx context.Context, userID string) ([]*models.LanguageSession, error) {
	sessions, err := s.sessionRepo.GetSessionsByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}
	
	return sessions, nil
}

func (s *sessionService) GetActiveSessions(ctx context.Context, limit int) ([]*models.LanguageSession, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	
	sessions, err := s.sessionRepo.GetActiveSessions(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get active sessions: %w", err)
	}
	
	return sessions, nil
}

func (s *sessionService) EndSession(ctx context.Context, sessionID, userID string) error {
	// Get session to verify user is creator
	session, err := s.sessionRepo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}
	
	// Only creator can end the session
	if session.CreatedBy != userID {
		return models.NewAppError("UNAUTHORIZED", "Only session creator can end the session", 403)
	}
	
	// Check if session is already ended
	if session.Status == models.SessionStatusEnded {
		return models.ErrSessionEnded
	}
	
	err = s.sessionRepo.EndSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to end session: %w", err)
	}
	
	return nil
}

// Participant management
func (s *sessionService) JoinSession(ctx context.Context, sessionID, userID string) (*models.SessionParticipant, error) {
	// Get session details
	session, err := s.sessionRepo.GetSessionByID(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	// Check if session is active
	if session.Status != models.SessionStatusActive {
		return nil, models.ErrSessionEnded
	}
	
	// Verify user is allowed to join (creator or invited user only)
	isAuthorized := session.CreatedBy == userID
	if !isAuthorized && session.InvitedUserID != nil {
		isAuthorized = *session.InvitedUserID == userID
	}
	
	if !isAuthorized {
		return nil, models.NewAppError("NOT_INVITED", "You are not invited to this session", 403)
	}
	
	// Check if user is already in session
	isInSession, err := s.sessionRepo.IsUserInSession(ctx, sessionID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check user session status: %w", err)
	}
	
	if isInSession {
		// Return existing participant
		participants, err := s.sessionRepo.GetActiveParticipants(ctx, sessionID)
		if err != nil {
			return nil, fmt.Errorf("failed to get participants: %w", err)
		}
		for _, p := range participants {
			if p.UserID == userID {
				return p, nil
			}
		}
	}
	
	// Check if session is full
	if session.ParticipantCount >= session.MaxParticipants {
		return nil, models.ErrSessionFull
	}
	
	// Determine role based on whether user is creator
	role := models.RoleParticipant
	if session.CreatedBy == userID {
		role = models.RoleCreator
	}
	
	// Add participant
	participant := &models.SessionParticipant{
		SessionID: sessionID,
		UserID:    userID,
		Role:      role,
		IsActive:  true,
	}
	
	err = s.sessionRepo.AddParticipant(ctx, participant)
	if err != nil {
		return nil, fmt.Errorf("failed to add participant: %w", err)
	}
	
	return participant, nil
}

func (s *sessionService) LeaveSession(ctx context.Context, sessionID, userID string) error {
	// Check if user is in session
	isInSession, err := s.sessionRepo.IsUserInSession(ctx, sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to check user session status: %w", err)
	}
	
	if !isInSession {
		return models.ErrParticipantNotFound
	}
	
	err = s.sessionRepo.RemoveParticipant(ctx, sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove participant: %w", err)
	}
	
	return nil
}

func (s *sessionService) GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SessionParticipant, error) {
	participants, err := s.sessionRepo.GetActiveParticipants(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get session participants: %w", err)
	}
	
	return participants, nil
}

func (s *sessionService) IsUserInSession(ctx context.Context, sessionID, userID string) (bool, error) {
	return s.sessionRepo.IsUserInSession(ctx, sessionID, userID)
}

// Canvas operations
func (s *sessionService) SaveCanvasOperation(ctx context.Context, operation *models.CanvasOperation) error {
	if operation.ID == "" {
		operation.ID = uuid.New().String()
	}
	
	err := s.sessionRepo.SaveCanvasOperation(ctx, operation)
	if err != nil {
		return fmt.Errorf("failed to save canvas operation: %w", err)
	}
	
	return nil
}

func (s *sessionService) GetCanvasOperations(ctx context.Context, sessionID string, limit, offset int) ([]*models.CanvasOperation, error) {
	operations, err := s.sessionRepo.GetCanvasOperations(ctx, sessionID, int64(offset))
	if err != nil {
		return nil, fmt.Errorf("failed to get canvas operations: %w", err)
	}
	
	// Apply limit manually if repository doesn't support pagination
	if limit > 0 && len(operations) > limit {
		operations = operations[:limit]
	}
	
	return operations, nil
}

func (s *sessionService) ClearCanvas(ctx context.Context, sessionID, userID string) error {
	// Verify user is in session
	isInSession, err := s.sessionRepo.IsUserInSession(ctx, sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to check user session status: %w", err)
	}
	
	if !isInSession {
		return models.NewAppError("UNAUTHORIZED", "User not in session", 403)
	}
	
	// Save a clear operation before clearing
	clearOp := &models.CanvasOperation{
		ID:            uuid.New().String(),
		SessionID:     sessionID,
		UserID:        userID,
		OperationType: models.OperationTypeClear,
		OperationData: []byte(`{"type":"clear"}`),
	}
	
	err = s.SaveCanvasOperation(ctx, clearOp)
	if err != nil {
		return fmt.Errorf("failed to save clear operation: %w", err)
	}
	
	return nil
}

// Session messages
func (s *sessionService) SendMessage(ctx context.Context, sessionID, userID string, input models.SendMessageInput) (*models.SessionMessage, error) {
	// Verify user is in session
	isInSession, err := s.sessionRepo.IsUserInSession(ctx, sessionID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check user session status: %w", err)
	}
	
	if !isInSession {
		return nil, models.NewAppError("UNAUTHORIZED", "User not in session", 403)
	}
	
	messageType := input.MessageType
	if messageType == "" {
		messageType = models.SessionMessageTypeText
	}
	
	message := &models.SessionMessage{
		ID:          uuid.New().String(),
		SessionID:   sessionID,
		UserID:      userID,
		Content:     input.Content,
		MessageType: messageType,
	}
	
	err = s.sessionRepo.SaveMessage(ctx, message)
	if err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}
	
	return message, nil
}

func (s *sessionService) GetSessionMessages(ctx context.Context, sessionID string, limit, offset int) ([]*models.SessionMessage, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	
	if offset < 0 {
		offset = 0
	}
	
	messages, err := s.sessionRepo.GetMessages(ctx, sessionID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}
	
	return messages, nil
}

func (s *sessionService) SaveMessage(ctx context.Context, message *models.SessionMessage) (*models.SessionMessage, error) {
	if message.ID == "" {
		message.ID = uuid.New().String()
	}
	
	err := s.sessionRepo.SaveMessage(ctx, message)
	if err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}
	
	return message, nil
}