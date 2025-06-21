package handlers

import (
	"context"
	"net/http"
	"strconv"

	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/internal/websocket"
	"language-exchange/pkg/errors"

	"github.com/gin-gonic/gin"
)

type SessionHandler struct {
	sessionService services.SessionService
	hub            *websocket.Hub
}

func NewSessionHandler(sessionService services.SessionService, hub *websocket.Hub) *SessionHandler {
	return &SessionHandler{
		sessionService: sessionService,
		hub:            hub,
	}
}

// CreateSession creates a new language learning session
// @Summary Create a new session
// @Description Create a new language learning session
// @Tags sessions
// @Accept json
// @Produce json
// @Param session body models.CreateSessionRequest true "Session data"
// @Success 201 {object} models.LanguageSession
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /sessions [post]
func (h *SessionHandler) CreateSession(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	var req models.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request data: "+err.Error())
		return
	}

	// Validate request
	if req.Name == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Session name is required")
		return
	}

	if req.SessionType == "" {
		req.SessionType = "practice" // Default session type
	}

	if req.MaxParticipants <= 0 {
		req.MaxParticipants = 10 // Default max participants
	}

	// Create session
	session, err := h.sessionService.CreateSession(context.Background(), userID.(string), req)
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "SESSION_CREATION_FAILED", "Failed to create session")
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": session})
}

// GetSession retrieves a specific session by ID
// @Summary Get session by ID
// @Description Get details of a specific session
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {object} models.LanguageSession
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId} [get]
func (h *SessionHandler) GetSession(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	session, err := h.sessionService.GetSession(context.Background(), sessionID)
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "SESSION_FETCH_FAILED", "Failed to fetch session")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": session})
}

// GetActiveSessions retrieves active sessions
// @Summary Get active sessions
// @Description Get a list of currently active sessions
// @Tags sessions
// @Accept json
// @Produce json
// @Param limit query int false "Number of sessions to return" default(20)
// @Success 200 {array} models.LanguageSession
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /sessions/active [get]
func (h *SessionHandler) GetActiveSessions(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	sessions, err := h.sessionService.GetActiveSessions(context.Background(), limit)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "SESSIONS_FETCH_FAILED", "Failed to fetch active sessions")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sessions})
}

// GetUserSessions retrieves sessions for a specific user
// @Summary Get user sessions
// @Description Get sessions created by or participated in by the current user
// @Tags sessions
// @Accept json
// @Produce json
// @Success 200 {array} models.LanguageSession
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /sessions/my [get]
func (h *SessionHandler) GetUserSessions(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessions, err := h.sessionService.GetUserSessions(context.Background(), userID.(string))
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "SESSIONS_FETCH_FAILED", "Failed to fetch user sessions")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": sessions})
}

// JoinSession allows a user to join a session
// @Summary Join a session
// @Description Join an existing session as a participant
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {object} models.SessionParticipant
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/join [post]
func (h *SessionHandler) JoinSession(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	participant, err := h.sessionService.JoinSession(context.Background(), sessionID, userID.(string))
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "JOIN_SESSION_FAILED", "Failed to join session")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": participant})
}

// LeaveSession allows a user to leave a session
// @Summary Leave a session
// @Description Leave a session as a participant
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/leave [post]
func (h *SessionHandler) LeaveSession(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	err := h.sessionService.LeaveSession(context.Background(), sessionID, userID.(string))
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "LEAVE_SESSION_FAILED", "Failed to leave session")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully left session"})
}

// EndSession allows the creator to end a session
// @Summary End a session
// @Description End a session (only by creator)
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/end [post]
func (h *SessionHandler) EndSession(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	err := h.sessionService.EndSession(context.Background(), sessionID, userID.(string))
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "END_SESSION_FAILED", "Failed to end session")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Session ended successfully"})
}

// GetSessionParticipants retrieves participants of a session
// @Summary Get session participants
// @Description Get list of participants in a session
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Success 200 {array} models.SessionParticipant
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/participants [get]
func (h *SessionHandler) GetSessionParticipants(c *gin.Context) {
	// Get authenticated user ID from context
	_, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		if appErr, ok := err.(*models.AppError); ok {
			errors.SendError(c, appErr.Status, appErr.Code, appErr.Message)
		} else {
			errors.SendError(c, http.StatusInternalServerError, "PARTICIPANTS_FETCH_FAILED", "Failed to fetch session participants")
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": participants})
}

// GetSessionMessages retrieves messages from a session
// @Summary Get session messages
// @Description Get chat messages from a session
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Param limit query int false "Number of messages to return" default(50)
// @Param offset query int false "Number of messages to skip" default(0)
// @Success 200 {array} models.SessionMessage
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/messages [get]
func (h *SessionHandler) GetSessionMessages(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	// Verify user is a participant
	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "PARTICIPANTS_FETCH_FAILED", "Failed to verify session access")
		return
	}

	isParticipant := false
	for _, participant := range participants {
		if participant.UserID == userID.(string) {
			isParticipant = true
			break
		}
	}

	if !isParticipant {
		errors.SendError(c, http.StatusForbidden, "NOT_PARTICIPANT", "User is not a participant in this session")
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}

	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	messages, err := h.sessionService.GetSessionMessages(context.Background(), sessionID, limit, offset)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "MESSAGES_FETCH_FAILED", "Failed to fetch session messages")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": messages})
}

// SendMessage sends a message to a session
// @Summary Send session message
// @Description Send a chat message to a session
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Param message body models.SendSessionMessageRequest true "Message data"
// @Success 201 {object} models.SessionMessage
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/messages [post]
func (h *SessionHandler) SendMessage(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	var req models.SendSessionMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request data: "+err.Error())
		return
	}

	if req.Content == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Message content is required")
		return
	}

	if req.MessageType == "" {
		req.MessageType = "text"
	}

	// Verify user is a participant
	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "PARTICIPANTS_FETCH_FAILED", "Failed to verify session access")
		return
	}

	isParticipant := false
	for _, participant := range participants {
		if participant.UserID == userID.(string) {
			isParticipant = true
			break
		}
	}

	if !isParticipant {
		errors.SendError(c, http.StatusForbidden, "NOT_PARTICIPANT", "User is not a participant in this session")
		return
	}

	// Create message
	message := &models.SessionMessage{
		SessionID:   sessionID,
		UserID:      userID.(string),
		Content:     req.Content,
		MessageType: req.MessageType,
	}

	savedMessage, err := h.sessionService.SaveMessage(context.Background(), message)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "MESSAGE_SEND_FAILED", "Failed to send message")
		return
	}

	// Broadcast message via WebSocket to all session participants
	messageData := map[string]interface{}{
		"id":           savedMessage.ID,
		"session_id":   savedMessage.SessionID,
		"user_id":      savedMessage.UserID,
		"content":      savedMessage.Content,
		"message_type": savedMessage.MessageType,
		"created_at":   savedMessage.CreatedAt,
	}
	
	wsMessage := models.WebSocketMessage{
		Type: models.WSMessageTypeSessionMessage,
		Data: messageData,
	}
	
	h.hub.SendToSession(sessionID, wsMessage, nil)

	c.JSON(http.StatusCreated, gin.H{"data": savedMessage})
}

// GetCanvasOperations retrieves canvas operations from a session
// @Summary Get canvas operations
// @Description Get canvas operations from a session for replay/sync
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Param limit query int false "Number of operations to return" default(100)
// @Param offset query int false "Number of operations to skip" default(0)
// @Success 200 {array} models.CanvasOperation
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/canvas [get]
func (h *SessionHandler) GetCanvasOperations(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	// Verify user is a participant
	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "PARTICIPANTS_FETCH_FAILED", "Failed to verify session access")
		return
	}

	isParticipant := false
	for _, participant := range participants {
		if participant.UserID == userID.(string) {
			isParticipant = true
			break
		}
	}

	if !isParticipant {
		errors.SendError(c, http.StatusForbidden, "NOT_PARTICIPANT", "User is not a participant in this session")
		return
	}

	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}

	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	operations, err := h.sessionService.GetCanvasOperations(context.Background(), sessionID, limit, offset)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "OPERATIONS_FETCH_FAILED", "Failed to fetch canvas operations")
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": operations})
}

// SaveCanvasOperation saves a canvas operation to a session
// @Summary Save canvas operation
// @Description Save a canvas operation (text, drawing, etc.) to a session
// @Tags sessions
// @Accept json
// @Produce json
// @Param sessionId path string true "Session ID"
// @Param operation body models.CanvasOperationInput true "Canvas operation data"
// @Success 201 {object} models.CanvasOperation
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /sessions/{sessionId}/canvas [post]
func (h *SessionHandler) SaveCanvasOperation(c *gin.Context) {
	// Get authenticated user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		errors.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_PARAMETER", "Session ID is required")
		return
	}

	var req models.CanvasOperationInput
	if err := c.ShouldBindJSON(&req); err != nil {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Invalid request data: "+err.Error())
		return
	}

	if req.OperationType == "" {
		errors.SendError(c, http.StatusBadRequest, "INVALID_INPUT", "Operation type is required")
		return
	}

	// Verify user is a participant
	participants, err := h.sessionService.GetSessionParticipants(context.Background(), sessionID)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "PARTICIPANTS_FETCH_FAILED", "Failed to verify session access")
		return
	}

	isParticipant := false
	for _, participant := range participants {
		if participant.UserID == userID.(string) {
			isParticipant = true
			break
		}
	}

	if !isParticipant {
		errors.SendError(c, http.StatusForbidden, "NOT_PARTICIPANT", "User is not a participant in this session")
		return
	}

	// Create canvas operation
	operation := &models.CanvasOperation{
		SessionID:     sessionID,
		UserID:        userID.(string),
		OperationType: req.OperationType,
		OperationData: req.OperationData,
	}

	err = h.sessionService.SaveCanvasOperation(context.Background(), operation)
	if err != nil {
		errors.SendError(c, http.StatusInternalServerError, "OPERATION_SAVE_FAILED", "Failed to save canvas operation")
		return
	}

	// Broadcast operation via WebSocket to all session participants
	wsMessage := models.WebSocketMessage{
		Type: models.WSMessageTypeCanvasOperation,
		Data: map[string]interface{}{
			"operation_type": operation.OperationType,
			"data":           req.OperationData,
			"user_id":        operation.UserID,
			"session_id":     operation.SessionID,
		},
	}
	
	h.hub.SendToSession(sessionID, wsMessage, nil)

	c.JSON(http.StatusCreated, gin.H{"data": operation})
}