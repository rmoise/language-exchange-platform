package services

import (
	"context"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type matchService struct {
	matchRepo           repository.MatchRepository
	userRepo            repository.UserRepository
	gamificationService GamificationService
}

func NewMatchService(matchRepo repository.MatchRepository, userRepo repository.UserRepository, gamificationService GamificationService) MatchService {
	return &matchService{
		matchRepo:           matchRepo,
		userRepo:            userRepo,
		gamificationService: gamificationService,
	}
}

func (s *matchService) SendRequest(ctx context.Context, senderID, recipientID string) (*models.MatchRequest, error) {
	// Check if sender and recipient are the same
	if senderID == recipientID {
		return nil, models.ErrCannotMatchSelf
	}

	// Check if recipient exists
	_, err := s.userRepo.GetByID(ctx, recipientID)
	if err != nil {
		return nil, models.ErrUserNotFound
	}

	// Check if request already exists
	existingRequest, err := s.matchRepo.GetRequestBetweenUsers(ctx, senderID, recipientID)
	if err == nil && existingRequest != nil {
		return nil, models.ErrDuplicateRequest
	}

	// Check if reverse request exists
	reverseRequest, err := s.matchRepo.GetRequestBetweenUsers(ctx, recipientID, senderID)
	if err == nil && reverseRequest != nil {
		return nil, models.ErrDuplicateRequest
	}

	// Create new match request
	request := &models.MatchRequest{
		SenderID:    senderID,
		RecipientID: recipientID,
		Status:      models.RequestStatusPending,
	}

	if err := s.matchRepo.CreateRequest(ctx, request); err != nil {
		return nil, err
	}

	// Award XP for sending a match request
	if s.gamificationService != nil {
		go func() {
			_ = s.gamificationService.OnMatchRequestSent(context.Background(), senderID, request.ID)
		}()
	}

	return request, nil
}

func (s *matchService) HandleRequest(ctx context.Context, requestID, userID string, accept bool) error {
	// Get the request
	request, err := s.matchRepo.GetRequestByID(ctx, requestID)
	if err != nil {
		return models.ErrRequestNotFound
	}

	// Check if user is the recipient
	if request.RecipientID != userID {
		return models.ErrRequestNotFound
	}

	// Check if request can be updated
	if !request.CanBeUpdated() {
		return models.ErrInvalidRequestStatus
	}

	if accept {
		// Update request status to accepted
		if err := s.matchRepo.UpdateRequestStatus(ctx, requestID, models.RequestStatusAccepted); err != nil {
			return models.ErrInternalServer
		}

		// Create a match
		match := &models.Match{
			User1ID: request.SenderID,
			User2ID: request.RecipientID,
		}

		if err := s.matchRepo.CreateMatch(ctx, match); err != nil {
			return models.ErrInternalServer
		}

		// Award XP to both users for successful match
		if s.gamificationService != nil {
			go func() {
				// Award XP to the recipient (current user) for accepting
				_ = s.gamificationService.OnMatchRequestAccepted(context.Background(), request.RecipientID, match.ID)
				// Award XP to the sender for having their request accepted
				_ = s.gamificationService.OnMatchRequestAccepted(context.Background(), request.SenderID, match.ID)
			}()
		}

		// Delete the request since it's now a match
		if err := s.matchRepo.DeleteRequest(ctx, requestID); err != nil {
			// Log this error but don't return it as the match was created successfully
		}
	} else {
		// Update request status to declined
		if err := s.matchRepo.UpdateRequestStatus(ctx, requestID, models.RequestStatusDeclined); err != nil {
			return models.ErrInternalServer
		}
	}

	return nil
}

func (s *matchService) GetIncomingRequests(ctx context.Context, userID string) ([]*models.MatchRequest, error) {
	requests, err := s.matchRepo.GetRequestsByUser(ctx, userID, true)
	if err != nil {
		return nil, models.ErrInternalServer
	}
	return requests, nil
}

func (s *matchService) GetOutgoingRequests(ctx context.Context, userID string) ([]*models.MatchRequest, error) {
	requests, err := s.matchRepo.GetRequestsByUser(ctx, userID, false)
	if err != nil {
		return nil, models.ErrInternalServer
	}
	return requests, nil
}

func (s *matchService) GetMatches(ctx context.Context, userID string) ([]*models.Match, error) {
	matches, err := s.matchRepo.GetMatchesByUser(ctx, userID)
	if err != nil {
		return nil, models.ErrInternalServer
	}
	return matches, nil
}

func (s *matchService) CancelRequest(ctx context.Context, requestID, userID string) error {
	// Get the request
	request, err := s.matchRepo.GetRequestByID(ctx, requestID)
	if err != nil {
		return models.ErrRequestNotFound
	}

	// Check if user is the sender
	if request.SenderID != userID {
		return models.ErrRequestNotFound
	}

	// Check if request can be cancelled (only pending requests)
	if request.Status != models.RequestStatusPending {
		return models.ErrInvalidRequestStatus
	}

	// Delete the request
	if err := s.matchRepo.DeleteRequest(ctx, requestID); err != nil {
		return models.ErrInternalServer
	}

	return nil
}

func (s *matchService) GetRequest(ctx context.Context, requestID string) (*models.MatchRequest, error) {
	request, err := s.matchRepo.GetRequestByID(ctx, requestID)
	if err != nil {
		return nil, models.ErrRequestNotFound
	}
	return request, nil
}