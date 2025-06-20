package models

import "time"

type MatchRequest struct {
	ID          string    `json:"id" db:"id"`
	SenderID    string    `json:"senderId" db:"sender_id"`
	RecipientID string    `json:"recipientId" db:"recipient_id"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
	
	// Populated via joins
	Sender    *User `json:"sender,omitempty"`
	Recipient *User `json:"recipient,omitempty"`
}

const (
	RequestStatusPending  = "pending"
	RequestStatusAccepted = "accepted"
	RequestStatusDeclined = "declined"
)

type SendRequestInput struct {
	RecipientID string `json:"recipientId" validate:"required,uuid"`
}

type HandleRequestInput struct {
	Accept bool `json:"accept"`
}

// IsValidStatus checks if the status is valid
func (mr *MatchRequest) IsValidStatus() bool {
	return mr.Status == RequestStatusPending ||
		mr.Status == RequestStatusAccepted ||
		mr.Status == RequestStatusDeclined
}

// CanBeUpdated checks if the request can be updated
func (mr *MatchRequest) CanBeUpdated() bool {
	return mr.Status == RequestStatusPending
}