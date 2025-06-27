package services

import (
	"context"
	"fmt"

	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type ConnectionService interface {
	Follow(ctx context.Context, followerID, followingID string) error
	Unfollow(ctx context.Context, followerID, followingID string) error
	GetFollowing(ctx context.Context, userID string, limit, offset int) (*models.ConnectionsResponse, error)
	GetFollowers(ctx context.Context, userID string, limit, offset int) (*models.ConnectionsResponse, error)
	GetConnectionStatus(ctx context.Context, userID, targetUserID string) (*models.ConnectionStatus, error)
	ToggleFollow(ctx context.Context, followerID, followingID string) (bool, error) // Returns true if now following
}

type connectionService struct {
	connectionRepo repository.ConnectionRepository
	userRepo       repository.UserRepository
}

func NewConnectionService(connectionRepo repository.ConnectionRepository, userRepo repository.UserRepository) ConnectionService {
	return &connectionService{
		connectionRepo: connectionRepo,
		userRepo:       userRepo,
	}
}

func (s *connectionService) Follow(ctx context.Context, followerID, followingID string) error {
	// Prevent self-following
	if followerID == followingID {
		return fmt.Errorf("users cannot follow themselves")
	}

	// Check if target user exists
	_, err := s.userRepo.GetByID(ctx, followingID)
	if err != nil {
		return fmt.Errorf("target user not found: %w", err)
	}

	return s.connectionRepo.Follow(ctx, followerID, followingID)
}

func (s *connectionService) Unfollow(ctx context.Context, followerID, followingID string) error {
	return s.connectionRepo.Unfollow(ctx, followerID, followingID)
}

func (s *connectionService) GetFollowing(ctx context.Context, userID string, limit, offset int) (*models.ConnectionsResponse, error) {
	// Set default limit if not provided
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	connections, err := s.connectionRepo.GetFollowing(ctx, userID, limit+1, offset) // Fetch one extra to check if there are more
	if err != nil {
		return nil, err
	}

	hasMore := len(connections) > limit
	if hasMore {
		connections = connections[:limit] // Remove the extra item
	}

	response := &models.ConnectionsResponse{
		Connections: connections,
		TotalCount:  len(connections), // For simplicity, we're not getting exact total count
		HasMore:     hasMore,
	}

	if hasMore {
		response.NextOffset = offset + limit
	}

	return response, nil
}

func (s *connectionService) GetFollowers(ctx context.Context, userID string, limit, offset int) (*models.ConnectionsResponse, error) {
	// Set default limit if not provided
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	connections, err := s.connectionRepo.GetFollowers(ctx, userID, limit+1, offset) // Fetch one extra to check if there are more
	if err != nil {
		return nil, err
	}

	hasMore := len(connections) > limit
	if hasMore {
		connections = connections[:limit] // Remove the extra item
	}

	response := &models.ConnectionsResponse{
		Connections: connections,
		TotalCount:  len(connections), // For simplicity, we're not getting exact total count
		HasMore:     hasMore,
	}

	if hasMore {
		response.NextOffset = offset + limit
	}

	return response, nil
}

func (s *connectionService) GetConnectionStatus(ctx context.Context, userID, targetUserID string) (*models.ConnectionStatus, error) {
	return s.connectionRepo.GetConnectionStatus(ctx, userID, targetUserID)
}

func (s *connectionService) ToggleFollow(ctx context.Context, followerID, followingID string) (bool, error) {
	// Check current status
	isFollowing, err := s.connectionRepo.IsFollowing(ctx, followerID, followingID)
	if err != nil {
		return false, err
	}

	if isFollowing {
		// Unfollow
		err = s.Unfollow(ctx, followerID, followingID)
		return false, err
	} else {
		// Follow
		err = s.Follow(ctx, followerID, followingID)
		return true, err
	}
}