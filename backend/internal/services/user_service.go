package services

import (
	"context"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"strings"
	"time"

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

	// Only apply language compatibility filtering if specific language filters are provided
	// This allows the Community page to show all users, while search with language criteria shows compatible matches
	if filters.Native != "" || filters.Target != "" {
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

	// Return all users (except current user) when no language filters are applied
	return users, nil
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
	if input.ProfileImage != nil {
		user.ProfileImage = input.ProfileImage
	}
	if input.CoverPhoto != nil {
		user.CoverPhoto = input.CoverPhoto
	}
	if input.Photos != nil {
		user.Photos = input.Photos
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
	if input.Birthday != nil && *input.Birthday != "" {
		// Parse the birthday string
		parsedTime, err := time.Parse(time.RFC3339, *input.Birthday)
		if err == nil {
			user.Birthday = &parsedTime
		}
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

func (s *userService) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, models.ErrUserNotFound
	}
	return user, nil
}

func (s *userService) UpdateProfileImage(ctx context.Context, userID string, imageURL string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	user.ProfileImage = &imageURL

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}

func (s *userService) UpdateCoverPhoto(ctx context.Context, userID string, imageURL string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	user.CoverPhoto = &imageURL

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}

func (s *userService) AddPhoto(ctx context.Context, userID string, photoURL string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return models.ErrUserNotFound
	}

	// Add the photo to the Photos array
	user.Photos = append(user.Photos, photoURL)

	if err := s.userRepo.Update(ctx, user); err != nil {
		return models.ErrInternalServer
	}

	return nil
}