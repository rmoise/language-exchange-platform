package models

import "time"

type Match struct {
	ID        string    `json:"id" db:"id"`
	User1ID   string    `json:"user1Id" db:"user1_id"`
	User2ID   string    `json:"user2Id" db:"user2_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	
	// Populated via joins
	User1 *User `json:"user1,omitempty"`
	User2 *User `json:"user2,omitempty"`
}

// GetOtherUser returns the other user in the match (not the current user)
func (m *Match) GetOtherUser(currentUserID string) *User {
	if m.User1 != nil && m.User1.ID != currentUserID {
		return m.User1
	}
	if m.User2 != nil && m.User2.ID != currentUserID {
		return m.User2
	}
	return nil
}

// GetOtherUserID returns the other user's ID in the match
func (m *Match) GetOtherUserID(currentUserID string) string {
	if m.User1ID != currentUserID {
		return m.User1ID
	}
	return m.User2ID
}