package services

import (
	"context"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
)

type profileVisitService struct {
	profileVisitRepo repository.ProfileVisitRepository
}

func NewProfileVisitService(profileVisitRepo repository.ProfileVisitRepository) ProfileVisitService {
	return &profileVisitService{
		profileVisitRepo: profileVisitRepo,
	}
}

func (s *profileVisitService) RecordVisit(ctx context.Context, visitorID, viewedID string) error {
	// Don't record self-visits
	if visitorID == viewedID {
		return nil
	}

	visit := &models.ProfileVisit{
		VisitorID: visitorID,
		ViewedID:  viewedID,
		IsVisible: true, // By default, visits are visible (can be made configurable later)
	}

	err := s.profileVisitRepo.CreateVisit(ctx, visit)
	if err != nil {
		return fmt.Errorf("failed to record profile visit: %w", err)
	}

	return nil
}

func (s *profileVisitService) GetProfileVisits(ctx context.Context, userID string, filters models.ProfileVisitsFilters) (*models.ProfileVisitsResponse, error) {
	// Set the user ID in filters
	filters.UserID = userID

	// Set default values
	if filters.Limit == 0 {
		filters.Limit = 10 // Default limit
	}

	response, err := s.profileVisitRepo.GetVisitsByUser(ctx, filters)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile visits: %w", err)
	}

	return response, nil
}

func (s *profileVisitService) GetRecentVisitorCount(ctx context.Context, userID string, timeWindow string) (int, error) {
	count, err := s.profileVisitRepo.GetRecentVisitCount(ctx, userID, timeWindow)
	if err != nil {
		return 0, fmt.Errorf("failed to get recent visitor count: %w", err)
	}

	return count, nil
}