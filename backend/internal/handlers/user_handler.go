package handlers

import (
	"language-exchange/internal/models"
	"language-exchange/internal/services"
	"language-exchange/pkg/errors"
	"language-exchange/pkg/validators"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService         services.UserService
	profileVisitService services.ProfileVisitService
}

func NewUserHandler(userService services.UserService, profileVisitService services.ProfileVisitService) *UserHandler {
	return &UserHandler{
		userService:         userService,
		profileVisitService: profileVisitService,
	}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	user, err := h.userService.GetProfile(c.Request.Context(), userID.(string))
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, user)
}

func (h *UserHandler) GetUserByID(c *gin.Context) {
	targetUserID := c.Param("id")
	if targetUserID == "" {
		errors.SendError(c, 400, "INVALID_USER_ID", "User ID is required")
		return
	}

	user, err := h.userService.GetProfile(c.Request.Context(), targetUserID)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	// Record profile visit if there's an authenticated user viewing another user's profile
	if visitorID := c.GetString("userID"); visitorID != "" && visitorID != targetUserID {
		// Record the visit asynchronously to not block the response
		go func() {
			_ = h.profileVisitService.RecordVisit(c.Request.Context(), visitorID, targetUserID)
		}()
	}

	// Don't return sensitive information for other users
	user.PasswordHash = ""
	user.Email = ""

	errors.SendSuccess(c, user)
}

func (h *UserHandler) UpdateLanguages(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	var input models.UpdateLanguagesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	// Validate input
	if validationErrors := validators.ValidateLanguageUpdate(input.Native, input.Target); len(validationErrors) > 0 {
		errors.HandleValidationError(c, validationErrors)
		return
	}

	err := h.userService.UpdateLanguages(c.Request.Context(), userID.(string), input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, gin.H{"message": "Languages updated successfully"})
}

func (h *UserHandler) SearchPartners(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	// Parse query parameters
	filters := models.SearchFilters{
		Native: c.Query("native"),
		Target: c.Query("target"),
		Page:   1,
		Limit:  20,
	}

	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil && page > 0 {
			filters.Page = page
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 50 {
			filters.Limit = limit
		}
	}

	users, err := h.userService.SearchPartners(c.Request.Context(), userID.(string), filters)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, users)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	var input models.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}
	

	err := h.userService.UpdateProfile(c.Request.Context(), userID.(string), input)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	// Get the updated user to return
	user, err := h.userService.GetProfile(c.Request.Context(), userID.(string))
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, user)
}

func (h *UserHandler) UpdatePreferences(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	var input models.UpdatePreferencesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	if err := h.userService.UpdatePreferences(c.Request.Context(), userID.(string), input); err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, gin.H{"message": "Preferences updated successfully"})
}

func (h *UserHandler) UpdateOnboardingStep(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		errors.HandleError(c, models.ErrInvalidToken)
		return
	}

	var input struct {
		Step int `json:"step" binding:"required,min=0,max=5"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		errors.SendError(c, 400, "INVALID_INPUT", "Invalid request body")
		return
	}

	err := h.userService.UpdateOnboardingStep(c.Request.Context(), userID.(string), input.Step)
	if err != nil {
		errors.HandleError(c, err)
		return
	}

	errors.SendSuccess(c, gin.H{"message": "Onboarding step updated successfully"})
}