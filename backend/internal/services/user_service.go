package services

import (
	"context"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"strings"

	"github.com/lib/pq"
)

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

func (s *userService) GetProfile(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, models.ErrUserNotFound
	}
	return user, nil
}

func (s *userService) UpdateLanguages(ctx context.Context, userID string, languages models.UpdateLanguagesInput) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	// Update languages
	user.NativeLanguages = pq.StringArray(languages.Native)
	user.TargetLanguages = pq.StringArray(languages.Target)

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}

func (s *userService) SearchPartners(ctx context.Context, userID string, filters models.SearchFilters) ([]*models.User, error) {
	// Set default pagination
	if filters.Page <= 0 {
		filters.Page = 1
	}
	if filters.Limit <= 0 || filters.Limit > 50 {
		filters.Limit = 20
	}

	// Exclude current user from results
	filters.UserID = userID

	users, err := s.userRepo.Search(ctx, filters)
	if err != nil {
		return nil, models.ErrInternalServer
	}

	// Filter users based on language compatibility
	currentUser, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return users, nil // Return unfiltered if we can't get current user
	}

	var compatibleUsers []*models.User
	for _, user := range users {
		if currentUser.CanMatchWith(user) {
			compatibleUsers = append(compatibleUsers, user)
		}
	}

	return compatibleUsers, nil
}

func (s *userService) UpdateProfile(ctx context.Context, userID string, input models.UpdateProfileInput) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	// Update profile fields
	if input.Name != nil {
		user.Name = *input.Name
	}
	if input.Username != nil {
		user.Username = input.Username
	}
	if input.City != nil {
		user.City = input.City
	}
	if input.Country != nil {
		user.Country = input.Country
	}
	if input.Timezone != nil {
		user.Timezone = input.Timezone
	}
	if input.Latitude != nil {
		user.Latitude = input.Latitude
	}
	if input.Longitude != nil {
		user.Longitude = input.Longitude
	}
	if input.Bio != nil {
		user.Bio = input.Bio
	}
	if input.Interests != nil {
		user.Interests = input.Interests
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		// Check for username constraint violation
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") && 
		   strings.Contains(err.Error(), "username") {
			return models.ErrDuplicateUsername
		}
		return models.ErrInternalServer
	}

	return nil
}

func (s *userService) UpdatePreferences(ctx context.Context, userID string, input models.UpdatePreferencesInput) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	// Update preferences fields
	if input.MaxDistance != nil {
		user.MaxDistance = input.MaxDistance
	}
	if input.EnableLocationMatching != nil {
		user.EnableLocationMatching = input.EnableLocationMatching
	}
	if input.PreferredMeetingTypes != nil {
		user.PreferredMeetingTypes = input.PreferredMeetingTypes
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}

func (s *userService) UpdateOnboardingStep(ctx context.Context, userID string, step int) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	user.OnboardingStep = step

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}