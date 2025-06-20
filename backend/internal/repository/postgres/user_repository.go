package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/database"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"strings"

	"github.com/lib/pq"
)

type userRepository struct {
	db *database.DB
}

func NewUserRepository(db *database.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (email, password_hash, name, google_id, profile_image, native_languages, target_languages, onboarding_step)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		user.Email,
		user.PasswordHash,
		user.Name,
		user.GoogleID,
		user.ProfileImage,
		pq.Array(user.NativeLanguages),
		pq.Array(user.TargetLanguages),
		user.OnboardingStep,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	return err
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, username, google_id, profile_image, city, country, timezone, 
			   latitude, longitude, bio, interests, native_languages, target_languages, 
			   max_distance, enable_location_matching, preferred_meeting_types,
			   onboarding_step, created_at, updated_at
		FROM users
		WHERE id = $1`

	user := &models.User{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Name,
		&user.Username,
		&user.GoogleID,
		&user.ProfileImage,
		&user.City,
		&user.Country,
		&user.Timezone,
		&user.Latitude,
		&user.Longitude,
		&user.Bio,
		(*pq.StringArray)(&user.Interests),
		(*pq.StringArray)(&user.NativeLanguages),
		(*pq.StringArray)(&user.TargetLanguages),
		&user.MaxDistance,
		&user.EnableLocationMatching,
		(*pq.StringArray)(&user.PreferredMeetingTypes),
		&user.OnboardingStep,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	return user, err
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, username, google_id, profile_image, city, country, timezone, 
			   latitude, longitude, bio, interests, native_languages, target_languages, 
			   max_distance, enable_location_matching, preferred_meeting_types,
			   onboarding_step, created_at, updated_at
		FROM users
		WHERE email = $1`

	user := &models.User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Name,
		&user.Username,
		&user.GoogleID,
		&user.ProfileImage,
		&user.City,
		&user.Country,
		&user.Timezone,
		&user.Latitude,
		&user.Longitude,
		&user.Bio,
		(*pq.StringArray)(&user.Interests),
		(*pq.StringArray)(&user.NativeLanguages),
		(*pq.StringArray)(&user.TargetLanguages),
		&user.MaxDistance,
		&user.EnableLocationMatching,
		(*pq.StringArray)(&user.PreferredMeetingTypes),
		&user.OnboardingStep,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	return user, err
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users
		SET name = $2, username = $3, city = $4, country = $5, timezone = $6, latitude = $7, longitude = $8, 
			bio = $9, interests = $10, native_languages = $11, target_languages = $12, 
			max_distance = $13, enable_location_matching = $14, preferred_meeting_types = $15,
			onboarding_step = $16, updated_at = NOW()
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Name,
		user.Username,
		user.City,
		user.Country,
		user.Timezone,
		user.Latitude,
		user.Longitude,
		user.Bio,
		pq.Array(user.Interests),
		pq.Array(user.NativeLanguages),
		pq.Array(user.TargetLanguages),
		user.MaxDistance,
		user.EnableLocationMatching,
		pq.Array(user.PreferredMeetingTypes),
		user.OnboardingStep,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *userRepository) Search(ctx context.Context, filters models.SearchFilters) ([]*models.User, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Exclude current user
	if filters.UserID != "" {
		conditions = append(conditions, fmt.Sprintf("id != $%d", argIndex))
		args = append(args, filters.UserID)
		argIndex++
	}

	// Filter by native language (user's target should match their native)
	if filters.Native != "" {
		conditions = append(conditions, fmt.Sprintf("$%d = ANY(native_languages)", argIndex))
		args = append(args, filters.Native)
		argIndex++
	}

	// Filter by target language (user's native should match their target)
	if filters.Target != "" {
		conditions = append(conditions, fmt.Sprintf("$%d = ANY(target_languages)", argIndex))
		args = append(args, filters.Target)
		argIndex++
	}

	// Filter by city
	if filters.City != "" {
		conditions = append(conditions, fmt.Sprintf("city ILIKE $%d", argIndex))
		args = append(args, "%"+filters.City+"%")
		argIndex++
	}

	// Filter by country
	if filters.Country != "" {
		conditions = append(conditions, fmt.Sprintf("country ILIKE $%d", argIndex))
		args = append(args, "%"+filters.Country+"%")
		argIndex++
	}

	// Only show users who have set their languages
	conditions = append(conditions, "array_length(native_languages, 1) > 0")
	conditions = append(conditions, "array_length(target_languages, 1) > 0")

	// Build the base query with distance calculation if coordinates are provided
	var selectClause string
	if filters.Latitude != nil && filters.Longitude != nil {
		selectClause = `
			id, email, name, google_id, profile_image, city, country, timezone, 
			latitude, longitude, bio, interests, native_languages, target_languages, 
			onboarding_step, created_at, updated_at,
			(6371 * acos(cos(radians($` + fmt.Sprintf("%d", argIndex) + `)) * cos(radians(latitude)) * 
			cos(radians(longitude) - radians($` + fmt.Sprintf("%d", argIndex+1) + `)) + 
			sin(radians($` + fmt.Sprintf("%d", argIndex) + `)) * sin(radians(latitude)))) AS distance`
		args = append(args, *filters.Latitude, *filters.Longitude)
		argIndex += 2
	} else {
		selectClause = `
			id, email, name, google_id, profile_image, city, country, timezone, 
			latitude, longitude, bio, interests, native_languages, target_languages, 
			onboarding_step, created_at, updated_at`
	}

	query := "SELECT " + selectClause + " FROM users"

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	// Add distance filter if specified
	if filters.MaxDistance != nil && filters.Latitude != nil && filters.Longitude != nil {
		if len(conditions) > 0 {
			query += " AND "
		} else {
			query += " WHERE "
		}
		query += fmt.Sprintf("(6371 * acos(cos(radians($%d)) * cos(radians(latitude)) * cos(radians(longitude) - radians($%d)) + sin(radians($%d)) * sin(radians(latitude)))) <= $%d", 
			argIndex-2, argIndex-1, argIndex-2, argIndex)
		args = append(args, *filters.MaxDistance)
		argIndex++
	}

	// Order by distance if coordinates provided, otherwise by creation date
	if filters.Latitude != nil && filters.Longitude != nil {
		query += " ORDER BY distance ASC"
	} else {
		query += " ORDER BY created_at DESC"
	}

	// Add pagination
	offset := (filters.Page - 1) * filters.Limit
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, filters.Limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		if filters.Latitude != nil && filters.Longitude != nil {
			var distance sql.NullFloat64
			err := rows.Scan(
				&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.ProfileImage,
				&user.City, &user.Country, &user.Timezone, &user.Latitude, &user.Longitude,
				&user.Bio, (*pq.StringArray)(&user.Interests), (*pq.StringArray)(&user.NativeLanguages),
				(*pq.StringArray)(&user.TargetLanguages), &user.OnboardingStep, &user.CreatedAt,
				&user.UpdatedAt, &distance,
			)
			if err != nil {
				return nil, err
			}
		} else {
			err := rows.Scan(
				&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.ProfileImage,
				&user.City, &user.Country, &user.Timezone, &user.Latitude, &user.Longitude,
				&user.Bio, (*pq.StringArray)(&user.Interests), (*pq.StringArray)(&user.NativeLanguages),
				(*pq.StringArray)(&user.TargetLanguages), &user.OnboardingStep, &user.CreatedAt,
				&user.UpdatedAt,
			)
			if err != nil {
				return nil, err
			}
		}
		users = append(users, user)
	}

	return users, rows.Err()
}

func (r *userRepository) GetByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, username, google_id, profile_image, city, country, timezone, 
			   latitude, longitude, bio, interests, native_languages, target_languages, 
			   max_distance, enable_location_matching, preferred_meeting_types,
			   onboarding_step, created_at, updated_at
		FROM users
		WHERE google_id = $1`

	user := &models.User{}
	err := r.db.QueryRowContext(ctx, query, googleID).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Name,
		&user.Username,
		&user.GoogleID,
		&user.ProfileImage,
		&user.City,
		&user.Country,
		&user.Timezone,
		&user.Latitude,
		&user.Longitude,
		&user.Bio,
		(*pq.StringArray)(&user.Interests),
		(*pq.StringArray)(&user.NativeLanguages),
		(*pq.StringArray)(&user.TargetLanguages),
		&user.MaxDistance,
		&user.EnableLocationMatching,
		(*pq.StringArray)(&user.PreferredMeetingTypes),
		&user.OnboardingStep,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	return user, err
}