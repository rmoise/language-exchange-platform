package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"language-exchange/internal/models"
	"language-exchange/internal/repository"
	"time"

	"github.com/google/uuid"
)

type profileVisitRepository struct {
	db *sql.DB
}

func NewProfileVisitRepository(db *sql.DB) repository.ProfileVisitRepository {
	return &profileVisitRepository{db: db}
}

func (r *profileVisitRepository) CreateVisit(ctx context.Context, visit *models.ProfileVisit) error {
	// Check if user has visited this profile recently (within 1 hour)
	hasVisitedRecently, err := r.HasVisitedRecently(ctx, visit.VisitorID, visit.ViewedID)
	if err != nil {
		return fmt.Errorf("failed to check recent visit: %w", err)
	}
	
	if hasVisitedRecently {
		// Don't create duplicate visit, but return success
		return nil
	}

	visit.ID = uuid.New().String()
	visit.ViewedAt = time.Now()

	query := `
		INSERT INTO profile_visits (id, visitor_id, viewed_id, viewed_at, is_visible)
		VALUES ($1, $2, $3, $4, $5)
	`
	
	_, err = r.db.ExecContext(ctx, query, visit.ID, visit.VisitorID, visit.ViewedID, visit.ViewedAt, visit.IsVisible)
	if err != nil {
		return fmt.Errorf("failed to create profile visit: %w", err)
	}

	return nil
}

func (r *profileVisitRepository) GetVisitsByUser(ctx context.Context, filters models.ProfileVisitsFilters) (*models.ProfileVisitsResponse, error) {
	response := &models.ProfileVisitsResponse{}

	// Build time filter
	timeFilter := ""
	args := []interface{}{filters.UserID}
	argIndex := 2

	if filters.TimeWindow != nil {
		switch *filters.TimeWindow {
		case "week":
			timeFilter = " AND viewed_at >= NOW() - INTERVAL '7 days'"
		case "month":
			timeFilter = " AND viewed_at >= NOW() - INTERVAL '30 days'"
		case "all":
			// No time filter
		default:
			timeFilter = " AND viewed_at >= NOW() - INTERVAL '7 days'"
		}
	} else if filters.SinceDate != nil {
		timeFilter = " AND viewed_at >= $" + fmt.Sprintf("%d", argIndex)
		args = append(args, *filters.SinceDate)
		argIndex++
	}

	// Get total count
	countQuery := `
		SELECT COUNT(*) 
		FROM profile_visits 
		WHERE viewed_id = $1` + timeFilter

	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&response.Count)
	if err != nil {
		return nil, fmt.Errorf("failed to get visit count: %w", err)
	}

	// Get visible count
	visibleCountQuery := `
		SELECT COUNT(*) 
		FROM profile_visits 
		WHERE viewed_id = $1 AND is_visible = true` + timeFilter

	err = r.db.QueryRowContext(ctx, visibleCountQuery, args...).Scan(&response.VisibleCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get visible visit count: %w", err)
	}

	// Get recent visits with visitor details if needed
	if filters.Limit > 0 {
		offset := filters.Page * filters.Limit
		visitsQuery := `
			SELECT 
				pv.id, pv.visitor_id, pv.viewed_id, pv.viewed_at, pv.is_visible,
				u.name, u.username, u.profile_image, u.city, u.country
			FROM profile_visits pv
			JOIN users u ON pv.visitor_id = u.id
			WHERE pv.viewed_id = $1 AND pv.is_visible = true` + timeFilter + `
			ORDER BY pv.viewed_at DESC
			LIMIT $` + fmt.Sprintf("%d", argIndex) + ` OFFSET $` + fmt.Sprintf("%d", argIndex+1)

		args = append(args, filters.Limit, offset)

		rows, err := r.db.QueryContext(ctx, visitsQuery, args...)
		if err != nil {
			return nil, fmt.Errorf("failed to get recent visits: %w", err)
		}
		defer rows.Close()

		for rows.Next() {
			var visit models.ProfileVisit
			var user models.User

			err := rows.Scan(
				&visit.ID, &visit.VisitorID, &visit.ViewedID, &visit.ViewedAt, &visit.IsVisible,
				&user.Name, &user.Username, &user.ProfileImage, &user.City, &user.Country,
			)
			if err != nil {
				return nil, fmt.Errorf("failed to scan visit: %w", err)
			}

			user.ID = visit.VisitorID
			response.RecentVisits = append(response.RecentVisits, visit)
			response.Visitors = append(response.Visitors, user)
		}

		if err = rows.Err(); err != nil {
			return nil, fmt.Errorf("failed to iterate visits: %w", err)
		}
	}

	return response, nil
}

func (r *profileVisitRepository) GetRecentVisitCount(ctx context.Context, userID string, timeWindow string) (int, error) {
	timeFilter := ""
	switch timeWindow {
	case "week":
		timeFilter = " AND viewed_at >= NOW() - INTERVAL '7 days'"
	case "month":
		timeFilter = " AND viewed_at >= NOW() - INTERVAL '30 days'"
	default:
		timeFilter = " AND viewed_at >= NOW() - INTERVAL '7 days'"
	}

	query := `
		SELECT COUNT(*) 
		FROM profile_visits 
		WHERE viewed_id = $1 AND is_visible = true` + timeFilter

	var count int
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get recent visit count: %w", err)
	}

	return count, nil
}

func (r *profileVisitRepository) HasVisitedRecently(ctx context.Context, visitorID, viewedID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM profile_visits 
			WHERE visitor_id = $1 AND viewed_id = $2 
			AND viewed_at >= NOW() - INTERVAL '1 hour'
		)
	`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, visitorID, viewedID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check recent visit: %w", err)
	}

	return exists, nil
}