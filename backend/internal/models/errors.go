package models

import "net/http"

type AppError struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Status  int               `json:"-"`
	Details map[string]string `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(code, message string, status int) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Status:  status,
	}
}

// Common errors
var (
	ErrUserNotFound       = NewAppError("USER_NOT_FOUND", "User not found", http.StatusNotFound)
	ErrDuplicateEmail     = NewAppError("DUPLICATE_EMAIL", "Email already exists", http.StatusConflict)
	ErrDuplicateUsername  = NewAppError("DUPLICATE_USERNAME", "Username already taken", http.StatusConflict)
	ErrInvalidCredentials = NewAppError("INVALID_CREDENTIALS", "Invalid email or password", http.StatusUnauthorized)
	ErrInvalidToken       = NewAppError("INVALID_TOKEN", "Invalid or expired token", http.StatusUnauthorized)
	ErrDuplicateRequest   = NewAppError("DUPLICATE_REQUEST", "Match request already exists", http.StatusConflict)
	ErrRequestNotFound    = NewAppError("REQUEST_NOT_FOUND", "Match request not found", http.StatusNotFound)
	ErrInvalidRequestStatus = NewAppError("INVALID_REQUEST_STATUS", "Invalid request status", http.StatusBadRequest)
	ErrCannotMatchSelf    = NewAppError("CANNOT_MATCH_SELF", "Cannot send match request to yourself", http.StatusBadRequest)
	ErrInternalServer     = NewAppError("INTERNAL_SERVER_ERROR", "Internal server error", http.StatusInternalServerError)
	ErrValidation         = NewAppError("VALIDATION_ERROR", "Validation failed", http.StatusBadRequest)
	
	// Session errors
	ErrSessionNotFound      = NewAppError("SESSION_NOT_FOUND", "Session not found", http.StatusNotFound)
	ErrParticipantNotFound  = NewAppError("PARTICIPANT_NOT_FOUND", "Participant not found", http.StatusNotFound)
	ErrSessionFull          = NewAppError("SESSION_FULL", "Session has reached maximum capacity", http.StatusConflict)
	ErrSessionEnded         = NewAppError("SESSION_ENDED", "Session has ended", http.StatusGone)
)