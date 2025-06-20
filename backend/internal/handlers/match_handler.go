package handlers

import (
	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"
	"language-exchange/pkg/validators"

	"github.com/gin-gonic/gin"
)

type MatchHandler struct {
	matchService services.MatchService
}

func NewMatchHandler(matchService services.MatchService) *MatchHandler {
	return &MatchHandler{
		matchService: matchService,
	}
}

func (h *MatchHandler) SendRequest(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	var input models.SendRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Validate recipient ID
	if err := validators.ValidateUUID(input.RecipientID); err != nil {
		errors.HandleValidationError(c, validators.ValidationErrors{*err})
		return
	}

	err := h.matchService.SendRequest(c.Request.Context(), userID.(string), input.RecipientID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendCreated(c, gin.H{"message": "Match request sent successfully"})
}

func (h *MatchHandler) HandleRequest(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	requestID := c.Param("id")
	if err := validators.ValidateUUID(requestID); err != nil {
		errors.HandleValidationError(c, validators.ValidationErrors{*err})
		return
	}

	var input models.HandleRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	err := h.matchService.HandleRequest(c.Request.Context(), requestID, userID.(string), input.Accept)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	message := "Match request declined"
	if input.Accept {
		message = "Match request accepted"
	}

	errors.SendSuccess(c, gin.H{"message": message})
}

func (h *MatchHandler) GetIncomingRequests(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	requests, err := h.matchService.GetIncomingRequests(c.Request.Context(), userID.(string))
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, requests)
}

func (h *MatchHandler) GetOutgoingRequests(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	requests, err := h.matchService.GetOutgoingRequests(c.Request.Context(), userID.(string))
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, requests)
}

func (h *MatchHandler) GetMatches(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	matches, err := h.matchService.GetMatches(c.Request.Context(), userID.(string))
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, matches)
}