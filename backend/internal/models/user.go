package models

import (
	"math"
	"time"

	"github.com/lib/pq"
)

type User struct {
	ID                     string         `json:"id" db:"id"`
	Email                  string         `json:"email" db:"email"`
	PasswordHash           string         `json:"-" db:"password_hash"`
	Name                   string         `json:"name" db:"name"`
	Username               *string        `json:"username,omitempty" db:"username"`
	GoogleID               *string        `json:"googleId,omitempty" db:"google_id"`
	ProfileImage           *string        `json:"profileImage,omitempty" db:"profile_image"`
	City                   *string        `json:"city,omitempty" db:"city"`
	Country                *string        `json:"country,omitempty" db:"country"`
	Timezone               *string        `json:"timezone,omitempty" db:"timezone"`
	Latitude               *float64       `json:"latitude,omitempty" db:"latitude"`
	Longitude              *float64       `json:"longitude,omitempty" db:"longitude"`
	Bio                    *string        `json:"bio,omitempty" db:"bio"`
	Interests              pq.StringArray `json:"interests,omitempty" db:"interests"`
	NativeLanguages        pq.StringArray `json:"nativeLanguages" db:"native_languages"`
	TargetLanguages        pq.StringArray `json:"targetLanguages" db:"target_languages"`
	MaxDistance            *float64       `json:"maxDistance,omitempty" db:"max_distance"`
	EnableLocationMatching *bool          `json:"enableLocationMatching,omitempty" db:"enable_location_matching"`
	PreferredMeetingTypes  pq.StringArray `json:"preferredMeetingTypes,omitempty" db:"preferred_meeting_types"`
	OnboardingStep         int            `json:"onboardingStep" db:"onboarding_step"`
	CreatedAt              time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt              time.Time      `json:"updatedAt" db:"updated_at"`
}

type RegisterInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required,min=2"`
}

type GoogleAuthInput struct {
	GoogleID     string  `json:"googleId" validate:"required"`
	Email        string  `json:"email" validate:"required,email"`
	Name         string  `json:"name" validate:"required"`
	ProfileImage *string `json:"profileImage,omitempty"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateLanguagesInput struct {
	Native []string `json:"native" validate:"required,min=1"`
	Target []string `json:"target" validate:"required,min=1"`
}

type SearchFilters struct {
	Native      string   `json:"native"`
	Target      string   `json:"target"`
	City        string   `json:"city"`
	Country     string   `json:"country"`
	MaxDistance *float64 `json:"maxDistance"` // in kilometers
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
	Page        int      `json:"page"`
	Limit       int      `json:"limit"`
	UserID      string   `json:"-"` // Exclude current user from results
}

type UpdateProfileInput struct {
	Name        *string        `json:"name,omitempty"`
	Username    *string        `json:"username,omitempty"`
	City        *string        `json:"city,omitempty"`
	Country     *string        `json:"country,omitempty"`
	Timezone    *string        `json:"timezone,omitempty"`
	Latitude    *float64       `json:"latitude,omitempty"`
	Longitude   *float64       `json:"longitude,omitempty"`
	Bio         *string        `json:"bio,omitempty"`
	Interests   pq.StringArray `json:"interests,omitempty"`
}

type UpdatePreferencesInput struct {
	MaxDistance            *float64       `json:"maxDistance,omitempty"`
	EnableLocationMatching *bool          `json:"enableLocationMatching,omitempty"`
	PreferredMeetingTypes  pq.StringArray `json:"preferredMeetingTypes,omitempty"`
}

// ValidateLanguageMatch checks if two users can be language partners
func (u *User) CanMatchWith(other *User) bool {
	if u.ID == other.ID {
		return false
	}

	// Check if user's target languages include any of other's native languages
	// AND if other's target languages include any of user's native languages
	userTargetMatch := false
	otherTargetMatch := false

	for _, userTarget := range u.TargetLanguages {
		for _, otherNative := range other.NativeLanguages {
			if userTarget == otherNative {
				userTargetMatch = true
				break
			}
		}
		if userTargetMatch {
			break
		}
	}

	for _, otherTarget := range other.TargetLanguages {
		for _, userNative := range u.NativeLanguages {
			if otherTarget == userNative {
				otherTargetMatch = true
				break
			}
		}
		if otherTargetMatch {
			break
		}
	}

	return userTargetMatch && otherTargetMatch
}

// CalculateDistance calculates the distance between two users in kilometers
func (u *User) CalculateDistance(other *User) *float64 {
	if u.Latitude == nil || u.Longitude == nil || other.Latitude == nil || other.Longitude == nil {
		return nil
	}

	const earthRadius = 6371.0 // Earth's radius in kilometers

	lat1Rad := *u.Latitude * math.Pi / 180
	lat2Rad := *other.Latitude * math.Pi / 180
	deltaLatRad := (*other.Latitude - *u.Latitude) * math.Pi / 180
	deltaLonRad := (*other.Longitude - *u.Longitude) * math.Pi / 180

	a := math.Sin(deltaLatRad/2)*math.Sin(deltaLatRad/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLonRad/2)*math.Sin(deltaLonRad/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	distance := earthRadius * c

	return &distance
}

// IsProfileComplete checks if the user has completed their profile
func (u *User) IsProfileComplete() bool {
	return len(u.NativeLanguages) > 0 && 
		   len(u.TargetLanguages) > 0 && 
		   u.City != nil && 
		   u.Country != nil
}

// GetProfileCompletion returns the percentage of profile completion
func (u *User) GetProfileCompletion() int {
	completion := 0
	totalFields := 6

	if u.Name != "" {
		completion++
	}
	if len(u.NativeLanguages) > 0 {
		completion++
	}
	if len(u.TargetLanguages) > 0 {
		completion++
	}
	if u.City != nil && *u.City != "" {
		completion++
	}
	if u.Country != nil && *u.Country != "" {
		completion++
	}
	if u.Bio != nil && *u.Bio != "" {
		completion++
	}

	return (completion * 100) / totalFields
}