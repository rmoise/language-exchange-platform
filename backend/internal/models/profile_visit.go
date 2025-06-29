package models

import (
	"time"
)

type ProfileVisit struct {
	ID        string    `json:"id" db:"id"`
	VisitorID string    `json:"visitorId" db:"visitor_id"`
	ViewedID  string    `json:"viewedId" db:"viewed_id"`
	ViewedAt  time.Time `json:"viewedAt" db:"viewed_at"`
	IsVisible bool      `json:"isVisible" db:"is_visible"` // Whether the visit should be visible to the viewed user
}

// ProfileVisitsResponse represents the response for profile visitors
type ProfileVisitsResponse struct {
	Count        int            `json:"count"`
	VisibleCount int            `json:"visibleCount"`
	RecentVisits []ProfileVisit `json:"recentVisits,omitempty"`
	Visitors     []User         `json:"visitors,omitempty"`
}

// ProfileVisitsFilters for querying profile visits
type ProfileVisitsFilters struct {
	UserID     string    `json:"userId"`     // The user whose profile was visited
	TimeWindow *string   `json:"timeWindow"` // "week", "month", "all"
	Limit      int       `json:"limit"`
	Page       int       `json:"page"`
	SinceDate  *time.Time `json:"sinceDate"`
}